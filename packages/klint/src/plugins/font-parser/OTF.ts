// @ts-nocheck -- Parser internals retain the compact upstream data structures.
// OTF (OpenType / CFF) parser — CFF v1 outlines via Type 2 charstrings.
// Reuses Common for everything except glyph extraction.
//
// Public API:
//   parseOTF(arrayBuffer)         → font instance ({ toPaths, toSVG, toPoints, toGlyphPath, … })
//   loadOTF(url)                  → fetch + parse
//   default class { load, loadFromBuffer }
//
// Variable CFF (CFF2) is *not* yet supported here — see TODO at bottom. For static
// OTF (the common case), this is byte-equivalent to TTF in the path-stream sense.

import {
  u16, u32,
  parseCmap, parseFvar, parseAvar, parseHVAR,
  parseHead, parseHhea, parseMaxp, parseHmtx, parseKern,
  makeFont, readSfntDirectory,
} from "./Common";
import type { FontData } from "../FontParser";

// ───────────── CFF INDEX reader ─────────────
// Returns [items: Uint8Array[], endOffset]
function readIndex(b, off) {
  const count = u16(b, off);
  if (count === 0) return [[], off + 2];
  const offSize = b[off + 2];
  let p = off + 3;
  const offs = new Array(count + 1);
  for (let i = 0; i <= count; i++) {
    let v = 0;
    for (let k = 0; k < offSize; k++) v = (v << 8) | b[p++];
    offs[i] = v;
  }
  const dataStart = p - 1; // offsets are 1-based relative to (last offset table byte)
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push(b.subarray(dataStart + offs[i], dataStart + offs[i + 1]));
  }
  return [items, dataStart + offs[count]];
}

// ───────────── CFF DICT reader ─────────────
// Walks operator/operand pairs, returns map { opcode → [operand, …] }.
// Opcodes 12 N are encoded as 1200+N.
function readDict(b) {
  const out = {};
  const stack = [];
  let p = 0;
  while (p < b.length) {
    const v = b[p++];
    if (v <= 21) {
      const op = v === 12 ? 1200 + b[p++] : v;
      out[op] = stack.slice();
      stack.length = 0;
    } else if (v === 28) {
      stack.push((b[p] << 24 >> 16) | b[p + 1]); p += 2;
    } else if (v === 29) {
      stack.push((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]); p += 4;
    } else if (v === 30) {
      // BCD float — read until 0xf nibble; store as Number.
      let s = "";
      outer: while (p < b.length) {
        const byte = b[p++];
        for (const nib of [byte >> 4, byte & 0xf]) {
          if (nib < 10) s += nib;
          else if (nib === 10) s += ".";
          else if (nib === 11) s += "E";
          else if (nib === 12) s += "E-";
          else if (nib === 14) s += "-";
          else if (nib === 15) break outer;
        }
      }
      stack.push(parseFloat(s));
    } else if (v >= 32 && v <= 246)  stack.push(v - 139);
    else if (v >= 247 && v <= 250)   stack.push((v - 247) * 256 + b[p++] + 108);
    else if (v >= 251 && v <= 254)   stack.push(-(v - 251) * 256 - b[p++] - 108);
    else throw new Error("CFF DICT: invalid byte " + v);
  }
  return out;
}

// ───────────── CFF table parse ─────────────
function parseCFF(b, off) {
  const hdrSize = b[off + 2];
  const cffStart = off;
  // Name INDEX
  let p = cffStart + hdrSize;
  const [, after1] = readIndex(b, p); p = after1;
  // Top DICT INDEX (one entry for single-font CFFs)
  const [topDictData, after2] = readIndex(b, p); p = after2;
  if (topDictData.length === 0) throw new Error("CFF: empty Top DICT");
  const topDict = readDict(topDictData[0]);
  // String INDEX
  const [, after3] = readIndex(b, p); p = after3;
  // Global Subrs INDEX
  const [gsubrs, after4] = readIndex(b, p); p = after4;

  // CharStrings
  const csOff = topDict[17]?.[0];
  if (csOff == null) throw new Error("CFF: no CharStrings");
  const [charStrings] = readIndex(b, cffStart + csOff);

  // Local Subrs (default Private DICT path; CID would need FDSelect routing).
  let lsubrs = [];
  if (topDict[18]) {
    const [privSize, privOff] = topDict[18];
    const privDict = readDict(b.subarray(cffStart + privOff, cffStart + privOff + privSize));
    if (privDict[19] != null) {
      [lsubrs] = readIndex(b, cffStart + privOff + privDict[19][0]);
    }
  }

  // CID fonts: FDSelect + FDArray for per-glyph private dicts.
  let fdSelect = null, fdArray = null;
  if (topDict[1236] /* FDArray */ && topDict[1237] /* FDSelect */) {
    const [fdArrIdx] = readIndex(b, cffStart + topDict[1236][0]);
    fdArray = fdArrIdx.map(fontDictBytes => {
      const fd = readDict(fontDictBytes);
      let lsub = [];
      if (fd[18]) {
        const [privSize, privOff] = fd[18];
        const privDict = readDict(b.subarray(cffStart + privOff, cffStart + privOff + privSize));
        if (privDict[19] != null) {
          [lsub] = readIndex(b, cffStart + privOff + privDict[19][0]);
        }
      }
      return { lsub };
    });
    fdSelect = parseFDSelect(b, cffStart + topDict[1237][0], charStrings.length);
  }

  return { charStrings, gsubrs, lsubrs, fdSelect, fdArray };
}

function parseFDSelect(b, off, nGlyphs) {
  const fmt = b[off]; let p = off + 1;
  const out = new Uint8Array(nGlyphs);
  if (fmt === 0) {
    for (let i = 0; i < nGlyphs; i++) out[i] = b[p++];
  } else if (fmt === 3) {
    const nRanges = u16(b, p); p += 2;
    let prevFirst = u16(b, p), prevFD = b[p + 2]; p += 3;
    for (let r = 1; r <= nRanges; r++) {
      const nextFirst = u16(b, p); const nextFD = (r < nRanges) ? b[p + 2] : 0;
      for (let g = prevFirst; g < nextFirst; g++) out[g] = prevFD;
      prevFirst = nextFirst; prevFD = nextFD; p += (r < nRanges) ? 3 : 2;
    }
  }
  return out;
}

// ───────────── Type 2 charstring interpreter ─────────────
// Emits TTF-compatible path commands (0=moveTo, 1=lineTo, 2=quadCurve, 3=closePath).
// Cubic Béziers in CFF are split into two quadratics (midpoint approximation), which
// matches what TTF outlines look like to downstream consumers.

const subrBias = n => n < 1240 ? 107 : n < 33900 ? 1131 : 32768;

// Emit one true cubic into the path stream (opcode 4). x0/y0 are the implicit
// pen position before the curve; only the three remaining points are stored.
function emitCubic(out, x0, y0, x1, y1, x2, y2, x3, y3) {
  out.push(4, x1, y1, x2, y2, x3, y3);
}

function execCharString(cs, gsubrs, lsubrs, out) {
  const stack = [];
  let x = 0, y = 0;
  let stems = 0;        // total stem count (for hintmask byte size)
  let widthRead = false;
  let pathOpen = false;

  const MAX_DEPTH = 10;  // recursion guard
  let depth = 0;

  const gBias = subrBias(gsubrs.length);
  const lBias = subrBias(lsubrs.length);

  function moveStart() {
    if (pathOpen) out.push(3);
    out.push(0, x, y);
    pathOpen = true;
  }

  function ensureWidthDropped() {
    // CFF1: optional initial width if odd args before first move/stem/endchar.
    if (!widthRead) {
      widthRead = true;
      if (stack.length & 1) stack.shift(); // drop width
    }
  }

  function exec(bytes) {
    if (++depth > MAX_DEPTH) throw new Error("CFF: subr recursion too deep");
    let p = 0;
    while (p < bytes.length) {
      const v = bytes[p++];
      if (v >= 32) {
        // operand
        if (v <= 246)        stack.push(v - 139);
        else if (v <= 250)   stack.push((v - 247) * 256 + bytes[p++] + 108);
        else if (v <= 254)   stack.push(-(v - 251) * 256 - bytes[p++] - 108);
        else { // 255 = 16.16 fixed
          const i = (bytes[p] << 24) | (bytes[p+1] << 16) | (bytes[p+2] << 8) | bytes[p+3];
          stack.push(i / 65536);
          p += 4;
        }
        continue;
      }
      if (v === 28) {
        stack.push((bytes[p] << 24 >> 16) | bytes[p+1]); p += 2; continue;
      }
      const op = v === 12 ? 1200 + bytes[p++] : v;
      switch (op) {
        case 1:   // hstem
        case 3:   // vstem
        case 18:  // hstemhm
        case 23:  // vstemhm
          ensureWidthDropped();
          stems += stack.length >> 1;
          stack.length = 0; break;
        case 19:  // hintmask
        case 20:  // cntrmask
          ensureWidthDropped();
          stems += stack.length >> 1;
          stack.length = 0;
          p += (stems + 7) >> 3;
          break;
        case 21:  // rmoveto
          ensureWidthDropped();
          x += stack[0]; y += stack[1];
          moveStart(); stack.length = 0; break;
        case 22:  // hmoveto
          ensureWidthDropped();
          x += stack[0];
          moveStart(); stack.length = 0; break;
        case 4:   // vmoveto
          ensureWidthDropped();
          y += stack[0];
          moveStart(); stack.length = 0; break;
        case 5: { // rlineto: { dxa dya }+
          for (let i = 0; i + 1 < stack.length; i += 2) {
            x += stack[i]; y += stack[i+1];
            out.push(1, x, y);
          }
          stack.length = 0; break;
        }
        case 6:   // hlineto
        case 7: { // vlineto
          // alternating starting on horizontal/vertical
          let horiz = (op === 6);
          for (let i = 0; i < stack.length; i++) {
            if (horiz) x += stack[i]; else y += stack[i];
            out.push(1, x, y); horiz = !horiz;
          }
          stack.length = 0; break;
        }
        case 8: { // rrcurveto
          for (let i = 0; i + 5 < stack.length; i += 6) {
            const x1 = x + stack[i], y1 = y + stack[i+1];
            const x2 = x1 + stack[i+2], y2 = y1 + stack[i+3];
            const x3 = x2 + stack[i+4], y3 = y2 + stack[i+5];
            emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
            x = x3; y = y3;
          }
          stack.length = 0; break;
        }
        case 24: { // rcurveline
          let i = 0;
          while (i + 5 < stack.length - 2) {
            const x1 = x + stack[i], y1 = y + stack[i+1];
            const x2 = x1 + stack[i+2], y2 = y1 + stack[i+3];
            const x3 = x2 + stack[i+4], y3 = y2 + stack[i+5];
            emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
            x = x3; y = y3; i += 6;
          }
          x += stack[i]; y += stack[i+1];
          out.push(1, x, y);
          stack.length = 0; break;
        }
        case 25: { // rlinecurve
          let i = 0;
          while (i + 1 < stack.length - 6) {
            x += stack[i]; y += stack[i+1];
            out.push(1, x, y); i += 2;
          }
          const x1 = x + stack[i], y1 = y + stack[i+1];
          const x2 = x1 + stack[i+2], y2 = y1 + stack[i+3];
          const x3 = x2 + stack[i+4], y3 = y2 + stack[i+5];
          emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
          x = x3; y = y3;
          stack.length = 0; break;
        }
        case 27: { // hhcurveto
          let i = 0;
          if (stack.length & 1) { y += stack[0]; i = 1; } // dy1
          for (; i + 3 < stack.length; i += 4) {
            const x1 = x + stack[i], y1 = y;
            const x2 = x1 + stack[i+1], y2 = y1 + stack[i+2];
            const x3 = x2 + stack[i+3], y3 = y2;
            emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
            x = x3; y = y3;
          }
          stack.length = 0; break;
        }
        case 26: { // vvcurveto
          let i = 0;
          if (stack.length & 1) { x += stack[0]; i = 1; } // dx1
          for (; i + 3 < stack.length; i += 4) {
            const x1 = x, y1 = y + stack[i];
            const x2 = x1 + stack[i+1], y2 = y1 + stack[i+2];
            const x3 = x2, y3 = y2 + stack[i+3];
            emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
            x = x3; y = y3;
          }
          stack.length = 0; break;
        }
        case 30:   // vhcurveto
        case 31: { // hvcurveto
          // Alternating curve series. Each curve is 4 args (deltas) plus an optional
          // 5th "df" (final extra horizontal/vertical delta on last curve).
          let i = 0;
          let horizFirst = (op === 31);
          while (i + 3 < stack.length) {
            const last = (i + 4 === stack.length) || (i + 5 === stack.length);
            const df = (i + 5 === stack.length) ? stack[i + 4] : 0;
            let x1, y1, x2, y2, x3, y3;
            if (horizFirst) {
              x1 = x + stack[i]; y1 = y;
              x2 = x1 + stack[i+1]; y2 = y1 + stack[i+2];
              y3 = y2 + stack[i+3];
              x3 = last ? x2 + df : x2;
            } else {
              x1 = x; y1 = y + stack[i];
              x2 = x1 + stack[i+1]; y2 = y1 + stack[i+2];
              x3 = x2 + stack[i+3];
              y3 = last ? y2 + df : y2;
            }
            emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
            x = x3; y = y3;
            i += last && (i + 5 === stack.length) ? 5 : 4;
            horizFirst = !horizFirst;
          }
          stack.length = 0; break;
        }
        case 10: { // callsubr
          const idx = stack.pop() + lBias;
          if (idx < 0 || idx >= lsubrs.length) throw new Error("CFF: bad local subr " + idx);
          exec(lsubrs[idx]);
          break;
        }
        case 29: { // callgsubr
          const idx = stack.pop() + gBias;
          if (idx < 0 || idx >= gsubrs.length) throw new Error("CFF: bad global subr " + idx);
          exec(gsubrs[idx]);
          break;
        }
        case 11: depth--; return; // return
        case 14: { // endchar
          ensureWidthDropped();
          if (pathOpen) out.push(3);
          depth--; return;
        }
        // flex operators — render as straight cubics (rare; visually fine).
        case 1235: { // flex
          // 6 cubic curves' worth of args + flex depth (12 on stack incl. fd)
          // dx1 dy1 dx2 dy2 dx3 dy3  dx4 dy4 dx5 dy5 dx6 dy6  fd
          const s = stack;
          const x1 = x + s[0], y1 = y + s[1];
          const x2 = x1 + s[2], y2 = y1 + s[3];
          const x3 = x2 + s[4], y3 = y2 + s[5];
          emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
          const x4 = x3 + s[6], y4 = y3 + s[7];
          const x5 = x4 + s[8], y5 = y4 + s[9];
          const x6 = x5 + s[10], y6 = y5 + s[11];
          emitCubic(out, x3, y3, x4, y4, x5, y5, x6, y6);
          x = x6; y = y6;
          stack.length = 0; break;
        }
        case 1234: { // hflex
          const s = stack;
          const x1 = x + s[0], y1 = y;
          const x2 = x1 + s[1], y2 = y1 + s[2];
          const x3 = x2 + s[3], y3 = y2;
          emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
          const x4 = x3 + s[4], y4 = y3;
          const x5 = x4 + s[5], y5 = y; // back to start y
          const x6 = x5 + s[6], y6 = y;
          emitCubic(out, x3, y3, x4, y4, x5, y5, x6, y6);
          x = x6; y = y6;
          stack.length = 0; break;
        }
        case 1236: { // hflex1
          const s = stack;
          const x1 = x + s[0], y1 = y + s[1];
          const x2 = x1 + s[2], y2 = y1 + s[3];
          const x3 = x2 + s[4], y3 = y2;
          emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
          const x4 = x3 + s[5], y4 = y3;
          const x5 = x4 + s[6], y5 = y4 + s[7];
          const x6 = x5 + s[8], y6 = y; // back to start y
          emitCubic(out, x3, y3, x4, y4, x5, y5, x6, y6);
          x = x6; y = y6;
          stack.length = 0; break;
        }
        case 1237: { // flex1
          const s = stack;
          const x1 = x + s[0], y1 = y + s[1];
          const x2 = x1 + s[2], y2 = y1 + s[3];
          const x3 = x2 + s[4], y3 = y2 + s[5];
          emitCubic(out, x, y, x1, y1, x2, y2, x3, y3);
          const x4 = x3 + s[6], y4 = y3 + s[7];
          const x5 = x4 + s[8], y5 = y4 + s[9];
          const dx = x5 - x, dy = y5 - y;
          let x6, y6;
          if (Math.abs(dx) > Math.abs(dy)) { x6 = x5 + s[10]; y6 = y; }
          else                              { x6 = x;        y6 = y5 + s[10]; }
          emitCubic(out, x3, y3, x4, y4, x5, y5, x6, y6);
          x = x6; y = y6;
          stack.length = 0; break;
        }
        default:
          // Unknown operator: clear stack and continue (degrades gracefully).
          stack.length = 0;
      }
    }
    depth--;
  }

  exec(cs);
  if (pathOpen) {
    // ensure terminator if endchar was missing
    if (out[out.length - 1] !== 3) out.push(3);
  }
}

// ───────────── glyph extraction ─────────────
function getGlyph(font, gid /* normCoords ignored — CFF1 is non-variable */) {
  const cached = font._gl[gid];
  if (cached !== undefined) return cached;
  const cff = font._cff;
  const cs = cff.charStrings[gid];
  let lsubrs = cff.lsubrs;
  if (cff.fdSelect && cff.fdArray) {
    const fd = cff.fdSelect[gid];
    lsubrs = cff.fdArray[fd]?.lsub || [];
  }
  const out = [];
  if (cs && cs.length) {
    try {
      execCharString(cs, cff.gsubrs, lsubrs, out);
    } catch (e) {
      // Bad charstring → empty glyph (matches Klint behaviour for missing glyphs).
      out.length = 0;
    }
  }
  font._gl[gid] = out;
  return out;
}

// ───────────── parser entry point ─────────────
export function parseOTF(buffer: ArrayBuffer): FontData {
  const data = new Uint8Array(buffer);
  const sb = new Int8Array(buffer);
  const { tables } = readSfntDirectory(data);
  const font = { _data: data, _ix: 0, _gl: {} };

  let t;
  if ((t = tables.head)) font.head = parseHead(data, t[0]);
  if ((t = tables.maxp)) font._nG = parseMaxp(data, t[0]);
  if ((t = tables.hhea)) font.hhea = parseHhea(data, t[0]);
  if ((t = tables.hmtx)) font.hmtx = parseHmtx(data, t[0], font.hhea.nHM, font._nG);
  if ((t = tables.cmap)) font.cmap = parseCmap(data, t[0], t[1]);
  if ((t = tables.kern)) font.kern = parseKern(data, t[0]);
  if ((t = tables.fvar)) font.fvar = parseFvar(data, t[0]);
  if ((t = tables.avar)) font.avar = parseAvar(data, t[0]);
  if ((t = tables.HVAR)) font.HVAR = parseHVAR(data, t[0], sb);

  const cffTbl = tables["CFF "] || tables["CFF2"];
  if (!cffTbl) throw new Error("OTF: no CFF / CFF2 table");
  if (tables["CFF2"]) throw new Error("OTF: CFF2 (variable) not yet supported");
  font._cff = parseCFF(data, cffTbl[0]);

  return makeFont(font, getGlyph);
}

export const loadOTF = (url: string): Promise<FontData> =>
  fetch(url).then((response) => response.arrayBuffer()).then(parseOTF);

export class FontParserOTF {
  load(url: string): Promise<FontData> {
    return loadOTF(url);
  }

  loadFromBuffer(buffer: ArrayBuffer): FontData {
    return parseOTF(buffer);
  }
}

export default FontParserOTF;

// TODO(CFF2): add `blend` + `vsindex` ops and ItemVariationStore parsing if you ever
// need variable OpenType-CFF outlines. The shaping/cmap/HVAR side is already wired.
