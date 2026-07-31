// @ts-nocheck -- Parser internals retain the compact upstream data structures.
// WOFF2 parser.
//
// Differences from WOFF:
//   • whole-stream brotli compression (vs per-table zlib)
//   • the glyf+loca tables can be replaced by a custom 7-stream "transform"
//     that needs reconstruction.
//
// We expose `decompressWOFF2(buffer)` returning a regular SFNT ArrayBuffer, and
// a high-level `parseWOFF2` that auto-delegates to TTF / OTF.
//
// Brotli decoder, in order:
//   1. globalThis.DecompressionStream('br')   — Chrome 137+ / Safari 18+
//   2. node:zlib.brotliDecompressSync         — Node 11.7+
//   3. throws — caller can pass `{ brotli: fn }` to parseWOFF2()
//
// `parseWOFF2` is async.

import { u16, u32 } from "./Common";
import type { FontData, FontParserOptions } from "../FontParser";

// ───────────── header / signature ─────────────
const WOFF2_SIG  = 0x774f4632; // "wOF2"
const TTF_FLAVOR = 0x00010000;
const OTF_FLAVOR = 0x4f54544f; // "OTTO"

// Known WOFF2 table tags (index 0..62; 63 = full-tag follows).
const KNOWN_TAGS = [
  "cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post",
  "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT",
  "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea",
  "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH",
  "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar",
  "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar",
  "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop",
  "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill",
];

// ───────────── platform brotli ─────────────
// Keep the optional Node fallback opaque to browser bundlers. A literal
// import("node:zlib") makes bundlers try to resolve a Node builtin even though
// this branch never runs in browsers.
const loadNodeZlib = () => {
  // Node 20.16+ exposes built-ins without an import. Keep an opaque dynamic
  // import as the Node 18 fallback so browser bundlers never resolve `zlib`.
  const builtin = process.getBuiltinModule?.("node:zlib");
  if (builtin) return builtin;
  return new Function("return import('node:zlib')")();
};

async function brotliDecompress(bytes, custom) {
  if (custom) return custom(bytes);
  if (typeof DecompressionStream !== "undefined") {
    try {
      const ds = new DecompressionStream("br");
      const stream = new Blob([bytes]).stream().pipeThrough(ds);
      const ab = await new Response(stream).arrayBuffer();
      return new Uint8Array(ab);
    } catch { /* fall through */ }
  }
  if (typeof process !== "undefined" && process.versions?.node) {
    const { brotliDecompressSync } = await loadNodeZlib();
    return brotliDecompressSync(bytes);
  }
  throw new Error(
    "WOFF2: no brotli decoder available. Pass `{ brotli: fn }` to parseWOFF2()"
  );
}

// ───────────── small varint readers ─────────────
class Reader {
  constructor(b, off = 0) { this.b = b; this.p = off; }
  u8()  { return this.b[this.p++]; }
  u16() { const v = u16(this.b, this.p); this.p += 2; return v; }
  u32() { const v = u32(this.b, this.p); this.p += 4; return v; }
  base128() { // 1–5 bytes, MSB = continuation, 7 bits per byte (big-endian).
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = this.b[this.p++];
      v = (v << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) return v >>> 0;
    }
    throw new Error("WOFF2: UIntBase128 too long");
  }
  u255_16() { // 1–3 bytes
    const c = this.b[this.p++];
    if (c === 253)      { const v = u16(this.b, this.p); this.p += 2; return v; }
    else if (c === 254) return this.b[this.p++] + 506;
    else if (c === 255) return this.b[this.p++] + 253;
    return c;
  }
}

// ───────────── triplet table (WOFF2 §5.2 Table 6) ─────────────
// 128 rows: { nBytes, xBits, yBits, deltaX, deltaY, xSign, ySign }.
// nBytes counts the flag byte (so coords use nBytes-1 bytes from glyphStream).
const TRIPLET_TABLE = (() => {
  const rows = [];
  // 0..9: x = 0 bits, y = 8 bits
  for (const dy of [0, 256, 512, 768, 1024])
    for (const ys of [-1, 1])
      rows.push({ nBytes: 2, xBits: 0, yBits: 8, deltaX: 0, deltaY: dy, xSign: 0, ySign: ys });
  // 10..19: x = 8 bits, y = 0 bits
  for (const dx of [0, 256, 512, 768, 1024])
    for (const xs of [-1, 1])
      rows.push({ nBytes: 2, xBits: 8, yBits: 0, deltaX: dx, deltaY: 0, xSign: xs, ySign: 0 });
  // 20..83: 4+4 bits, 4×4×2×2 = 64. Note: ySign is OUTER, xSign is INNER
  // (per Google's reference woff2 table; the encoded code is shaped that way).
  for (const dx of [1, 17, 33, 49])
    for (const dy of [1, 17, 33, 49])
      for (const ys of [-1, 1])
        for (const xs of [-1, 1])
          rows.push({ nBytes: 2, xBits: 4, yBits: 4, deltaX: dx, deltaY: dy, xSign: xs, ySign: ys });
  // 84..119: 8+8 bits, 3×3×2×2 = 36
  for (const dx of [1, 257, 513])
    for (const dy of [1, 257, 513])
      for (const ys of [-1, 1])
        for (const xs of [-1, 1])
          rows.push({ nBytes: 3, xBits: 8, yBits: 8, deltaX: dx, deltaY: dy, xSign: xs, ySign: ys });
  // 120..123: 12+12 bits
  for (const ys of [-1, 1])
    for (const xs of [-1, 1])
      rows.push({ nBytes: 4, xBits: 12, yBits: 12, deltaX: 0, deltaY: 0, xSign: xs, ySign: ys });
  // 124..127: 16+16 bits
  for (const ys of [-1, 1])
    for (const xs of [-1, 1])
      rows.push({ nBytes: 5, xBits: 16, yBits: 16, deltaX: 0, deltaY: 0, xSign: xs, ySign: ys });
  return rows;
})();

function readTriplet(gS, code) {
  const row = TRIPLET_TABLE[code];
  // Read (nBytes - 1) data bytes (flag was already consumed).
  let raw = 0;
  for (let i = 1; i < row.nBytes; i++) raw = raw * 256 + gS.b[gS.p++];
  // y in low bits, x in high bits. (nBits=0 ⇒ that axis is fixed at 0.)
  const yMask = row.yBits ? (1 << row.yBits) - 1 : 0;
  const yRaw = raw & yMask;
  const xRaw = row.yBits ? (raw >>> row.yBits) : raw;
  const dx = row.xSign ? (xRaw + row.deltaX) * row.xSign : 0;
  const dy = row.ySign ? (yRaw + row.deltaY) * row.ySign : 0;
  return [dx, dy];
}

// ───────────── glyf/loca transform reconstructor ─────────────
function reconstructGlyf(transformed) {
  const r = new Reader(transformed);
  /* reserved */ r.u16();
  const _optionFlags    = r.u16();
  const numGlyphs       = r.u16();
  const indexFormat     = r.u16();
  const nContourSize    = r.u32();
  const nPointsSize     = r.u32();
  const flagSize        = r.u32();
  const glyphSize       = r.u32();
  const compositeSize   = r.u32();
  const bboxSize        = r.u32();
  const instrSize       = r.u32();

  let p = r.p;
  const nContourStream  = transformed.subarray(p, p + nContourSize);  p += nContourSize;
  const nPointsStream   = transformed.subarray(p, p + nPointsSize);   p += nPointsSize;
  const flagStream      = transformed.subarray(p, p + flagSize);      p += flagSize;
  const glyphStream     = transformed.subarray(p, p + glyphSize);     p += glyphSize;
  const compositeStream = transformed.subarray(p, p + compositeSize); p += compositeSize;
  const bboxBitmapSize  = ((numGlyphs + 31) >>> 5) * 4;
  const bboxBitmap      = transformed.subarray(p, p + bboxBitmapSize); p += bboxBitmapSize;
  const bboxStream      = transformed.subarray(p, p + bboxSize - bboxBitmapSize); p += bboxSize - bboxBitmapSize;
  const instructionStream = transformed.subarray(p, p + instrSize);   p += instrSize;

  // optionFlags bit 0 = OVERLAP_SIMPLE_BITMAP. Instructions are always present in
  // the stream; their presence per-glyph is signalled by the instruction-length
  // value in glyphStream (which can be 0).

  const nP = new Reader(nPointsStream);
  const gS = new Reader(glyphStream);
  const cS = new Reader(compositeStream);
  let flagP = 0, instrP = 0, bboxP = 0;

  const glyphBytes = []; // Uint8Array per glyph

  const readI16 = (s, o) => (s[o] << 24 >> 16) | s[o + 1];

  for (let gid = 0; gid < numGlyphs; gid++) {
    const nContours = readI16(nContourStream, gid * 2);
    const hasBbox = (bboxBitmap[gid >>> 3] >> (7 - (gid & 7))) & 1;

    if (nContours === 0) {
      glyphBytes.push(new Uint8Array(0));
      continue;
    }

    if (nContours > 0) {
      // Simple glyph
      const endPts = new Uint16Array(nContours);
      let totalPts = 0;
      for (let c = 0; c < nContours; c++) {
        totalPts += nP.u255_16();
        endPts[c] = totalPts - 1;
      }
      const flagsRaw = flagStream.subarray(flagP, flagP + totalPts);
      flagP += totalPts;

      const xs = new Int16Array(totalPts);
      const ys = new Int16Array(totalPts);
      const ttfFlags = new Uint8Array(totalPts);
      for (let i = 0; i < totalPts; i++) {
        const f = flagsRaw[i];
        const onCurve = (f & 0x80) === 0;
        const [dx, dy] = readTriplet(gS, f & 0x7f);
        xs[i] = dx; ys[i] = dy;
        ttfFlags[i] = onCurve ? 1 : 0;
      }
      const instLen = gS.u255_16();
      const instr = instructionStream.subarray(instrP, instrP + instLen);
      instrP += instLen;

      glyphBytes.push(buildSimpleGlyph(
        nContours, endPts, ttfFlags, xs, ys, instLen, instr,
        hasBbox ? bboxStream.subarray(bboxP, bboxP + 8) : null,
      ));
      if (hasBbox) bboxP += 8;
    } else {
      // Composite glyph
      const startP = cS.p;
      let haveInstructions = false;
      while (true) {
        const flags = u16(cS.b, cS.p); cS.p += 2;
        cS.p += 2; // glyphIndex
        cS.p += (flags & 0x0001) ? 4 : 2;
        if      (flags & 0x0008) cS.p += 2;
        else if (flags & 0x0040) cS.p += 4;
        else if (flags & 0x0080) cS.p += 8;
        if (flags & 0x0100) haveInstructions = true;
        if (!(flags & 0x0020)) break;
      }
      const compEnd = cS.p;
      let compInstrLen = 0, compInstrBytes = null;
      if (haveInstructions) {
        compInstrLen = gS.u255_16();
        compInstrBytes = instructionStream.subarray(instrP, instrP + compInstrLen);
        instrP += compInstrLen;
      }
      glyphBytes.push(buildCompositeGlyph(
        compositeStream.subarray(startP, compEnd),
        compInstrLen, compInstrBytes,
        hasBbox ? bboxStream.subarray(bboxP, bboxP + 8) : null,
      ));
      if (hasBbox) bboxP += 8;
    }
  }

  // Concatenate into glyf with 4-byte alignment per glyph; build loca.
  let totalLen = 0;
  const offsets = new Array(numGlyphs + 1);
  for (let i = 0; i < numGlyphs; i++) {
    offsets[i] = totalLen;
    totalLen += (glyphBytes[i].length + 3) & ~3;
  }
  offsets[numGlyphs] = totalLen;
  const glyf = new Uint8Array(totalLen);
  for (let i = 0; i < numGlyphs; i++) glyf.set(glyphBytes[i], offsets[i]);

  let loca;
  if (indexFormat === 0) {
    loca = new Uint8Array((numGlyphs + 1) * 2);
    for (let i = 0; i <= numGlyphs; i++) {
      const v = offsets[i] >>> 1;
      loca[i * 2]     = (v >>> 8) & 0xff;
      loca[i * 2 + 1] =  v        & 0xff;
    }
  } else {
    loca = new Uint8Array((numGlyphs + 1) * 4);
    for (let i = 0; i <= numGlyphs; i++) {
      const v = offsets[i];
      loca[i * 4]     = (v >>> 24) & 0xff;
      loca[i * 4 + 1] = (v >>> 16) & 0xff;
      loca[i * 4 + 2] = (v >>> 8)  & 0xff;
      loca[i * 4 + 3] =  v         & 0xff;
    }
  }
  return { glyf, loca, indexFormat };
}

// ───────────── glyph-byte builders (output is a regular `glyf` entry) ─────────────
function buildSimpleGlyph(nContours, endPts, flags, xs, ys, instLen, instr, bboxBytes) {
  // Bbox: prefer the explicit one from bboxStream when provided.
  let xMin, yMin, xMax, yMax;
  const readI16 = (s, o) => (s[o] << 24 >> 16) | s[o + 1];
  if (bboxBytes) {
    xMin = readI16(bboxBytes, 0); yMin = readI16(bboxBytes, 2);
    xMax = readI16(bboxBytes, 4); yMax = readI16(bboxBytes, 6);
  } else {
    let acc = 0; xMin = +Infinity; xMax = -Infinity;
    for (let i = 0; i < xs.length; i++) {
      acc += xs[i]; if (acc < xMin) xMin = acc; if (acc > xMax) xMax = acc;
    }
    acc = 0; yMin = +Infinity; yMax = -Infinity;
    for (let i = 0; i < ys.length; i++) {
      acc += ys[i]; if (acc < yMin) yMin = acc; if (acc > yMax) yMax = acc;
    }
    if (xs.length === 0) xMin = yMin = xMax = yMax = 0;
  }

  // Encoding strategy: emit flags raw (no repeat compression), x/y as full 16-bit signed
  // deltas. This is valid TTF, slightly larger than optimal, but trivial to write.
  const total = xs.length;
  const size = 10 + nContours * 2 + 2 + instLen + total + total * 2 + total * 2;
  const out = new Uint8Array(size);
  let p = 0;
  const wI16 = v => { out[p++] = (v >>> 8) & 0xff; out[p++] = v & 0xff; };
  wI16(nContours); wI16(xMin); wI16(yMin); wI16(xMax); wI16(yMax);
  for (let i = 0; i < nContours; i++) wI16(endPts[i]);
  wI16(instLen);
  if (instLen) { out.set(instr, p); p += instLen; }
  // Flags: keep only the on-curve bit. Spec for the "flags" field has bit 0 = on-curve.
  for (let i = 0; i < total; i++) out[p++] = flags[i] & 1;
  for (let i = 0; i < total; i++) wI16(xs[i] & 0xffff);
  for (let i = 0; i < total; i++) wI16(ys[i] & 0xffff);
  return out.subarray(0, p);
}

function buildCompositeGlyph(componentBytes, instLen, instrBytes, bboxBytes) {
  let xMin = 0, yMin = 0, xMax = 0, yMax = 0;
  if (bboxBytes) {
    const readI16 = (s, o) => (s[o] << 24 >> 16) | s[o + 1];
    xMin = readI16(bboxBytes, 0); yMin = readI16(bboxBytes, 2);
    xMax = readI16(bboxBytes, 4); yMax = readI16(bboxBytes, 6);
  }
  const totalLen = 10 + componentBytes.length + (instLen ? 2 + instLen : 0);
  const out = new Uint8Array(totalLen);
  let p = 0;
  const wI16 = v => { out[p++] = (v >>> 8) & 0xff; out[p++] = v & 0xff; };
  wI16(-1);
  wI16(xMin); wI16(yMin); wI16(xMax); wI16(yMax);
  out.set(componentBytes, p); p += componentBytes.length;
  if (instLen) {
    wI16(instLen);
    out.set(instrBytes, p); p += instLen;
  }
  return out;
}

// ───────────── WOFF2 → SFNT ─────────────
export async function decompressWOFF2(
  buffer: ArrayBuffer,
  opts: FontParserOptions = {},
): Promise<{ flavor: "ttf" | "otf"; sfnt: ArrayBuffer }> {
  const b = new Uint8Array(buffer);
  if (u32(b, 0) !== WOFF2_SIG) throw new Error("WOFF2: bad signature");
  const flavorRaw = u32(b, 4);
  const numTables = u16(b, 12);
  const totalCompressedSize = u32(b, 20);

  // ── parse table directory ──
  const r = new Reader(b, 48);
  const dir = []; // { tag, origLen, transLen, transformed }
  for (let i = 0; i < numTables; i++) {
    const flags = r.u8();
    const tagIdx = flags & 0x3f;
    const tag = tagIdx === 0x3f
      ? String.fromCharCode(r.u8(), r.u8(), r.u8(), r.u8())
      : KNOWN_TAGS[tagIdx];
    const transformVersion = (flags >> 6) & 0x3;
    const origLen = r.base128();
    let transLen = origLen;
    let transformed;
    if (tag === "glyf" || tag === "loca") {
      transformed = transformVersion === 0;          // 0 = transformed, 3 = identity
    } else {
      transformed = transformVersion !== 0;          // non-glyf default = no transform
    }
    if (transformed) transLen = r.base128();
    dir.push({ tag, origLen, transLen, transformed });
  }

  // ── decompress brotli stream ──
  const compressedBytes = b.subarray(r.p, r.p + totalCompressedSize);
  const decompressed = await brotliDecompress(compressedBytes, opts.brotli);

  // ── slice tables in directory order ──
  const rawTables = {};
  let cursor = 0;
  for (const e of dir) {
    rawTables[e.tag] = {
      data: decompressed.subarray(cursor, cursor + e.transLen),
      transformed: e.transformed,
      origLen: e.origLen,
    };
    cursor += e.transLen;
  }

  // ── un-transform glyf+loca ──
  if (rawTables.glyf?.transformed) {
    const { glyf, loca } = reconstructGlyf(rawTables.glyf.data);
    rawTables.glyf = { data: glyf, transformed: false, origLen: glyf.length };
    rawTables.loca = { data: loca, transformed: false, origLen: loca.length };
  } else if (rawTables.loca?.transformed) {
    rawTables.loca = { ...rawTables.loca, transformed: false };
  }

  // ── build SFNT ──
  const tagsSorted = Object.keys(rawTables).sort();
  const dirSize = 12 + tagsSorted.length * 16;
  let bodySize = 0;
  const padded = tagsSorted.map(t => {
    const d = rawTables[t].data;
    const pad = (4 - (d.length & 3)) & 3;
    bodySize += d.length + pad;
    return { tag: t, data: d, pad };
  });
  const sfnt = new Uint8Array(dirSize + bodySize);
  // header: scaler + numTables (search fields left at 0; our parser ignores them)
  sfnt[0] = (flavorRaw >>> 24) & 0xff;
  sfnt[1] = (flavorRaw >>> 16) & 0xff;
  sfnt[2] = (flavorRaw >>> 8)  & 0xff;
  sfnt[3] =  flavorRaw         & 0xff;
  sfnt[4] = (tagsSorted.length >>> 8) & 0xff;
  sfnt[5] =  tagsSorted.length        & 0xff;

  let cursor2 = dirSize;
  let dp = 12;
  for (const e of padded) {
    sfnt.set([
      e.tag.charCodeAt(0), e.tag.charCodeAt(1),
      e.tag.charCodeAt(2), e.tag.charCodeAt(3),
    ], dp);
    sfnt[dp + 8]  = (cursor2 >>> 24) & 0xff;
    sfnt[dp + 9]  = (cursor2 >>> 16) & 0xff;
    sfnt[dp + 10] = (cursor2 >>> 8)  & 0xff;
    sfnt[dp + 11] =  cursor2         & 0xff;
    sfnt[dp + 12] = (e.data.length >>> 24) & 0xff;
    sfnt[dp + 13] = (e.data.length >>> 16) & 0xff;
    sfnt[dp + 14] = (e.data.length >>> 8)  & 0xff;
    sfnt[dp + 15] =  e.data.length         & 0xff;
    dp += 16;
    sfnt.set(e.data, cursor2);
    cursor2 += e.data.length + e.pad;
  }

  let flavor;
  if      (flavorRaw === TTF_FLAVOR) flavor = "ttf";
  else if (flavorRaw === OTF_FLAVOR) flavor = "otf";
  else                               flavor = "ttf";

  return { flavor, sfnt: sfnt.buffer };
}

export async function parseWOFF2(
  buffer: ArrayBuffer,
  options: FontParserOptions = {},
): Promise<FontData> {
  const { flavor, sfnt } = await decompressWOFF2(buffer, options);
  if (flavor === "otf") {
    const { parseOTF } = await import("./OTF");
    return parseOTF(sfnt);
  }
  const { parseTTF } = await import("./TTF");
  return parseTTF(sfnt);
}

export const loadWOFF2 = (
  url: string,
  options?: FontParserOptions,
): Promise<FontData> =>
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((buffer) => parseWOFF2(buffer, options));

export class FontParserWOFF2 {
  load(url: string, options?: FontParserOptions): Promise<FontData> {
    return loadWOFF2(url, options);
  }

  loadFromBuffer(
    buffer: ArrayBuffer,
    options?: FontParserOptions,
  ): Promise<FontData> {
    return parseWOFF2(buffer, options);
  }
}

export default FontParserWOFF2;
