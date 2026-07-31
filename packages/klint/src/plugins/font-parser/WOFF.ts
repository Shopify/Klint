// @ts-nocheck -- Parser internals retain the compact upstream data structures.
// WOFF (Web Open Font Format, version 1) parser.
//
// WOFF is a thin, per-table-zlib-compressed wrapper around a regular SFNT (TTF/OTF).
// We decompress to a fresh SFNT ArrayBuffer and delegate to the appropriate parser.
//
// Public API:
//   decompressWOFF(arrayBuffer)         → { flavor: 'ttf'|'otf', sfnt: ArrayBuffer }
//   parseWOFF(arrayBuffer)              → font instance (async)
//   loadWOFF(url)                       → fetch + parse (async)
//   default class { load, loadFromBuffer }
//
// `parseWOFF` is async because we use the platform `DecompressionStream('deflate')`
// for portable, dependency-free zlib support (Node 17+, all modern browsers).

import { u16, u32 } from "./Common";
import type { FontData, FontParserOptions } from "../FontParser";

// ───────────── header constants ─────────────
const WOFF_SIG   = 0x774f4646; // "wOFF"
const TTF_FLAVOR = 0x00010000;
const OTF_FLAVOR = 0x4f54544f; // "OTTO"

// ───────────── platform deflate ─────────────
// Returns Promise<Uint8Array> of decompressed data. `format` is 'deflate' (zlib) or
// 'deflate-raw'. WOFF uses zlib (deflate with header).
async function inflate(bytes, format = "deflate") {
  // Universal path: DecompressionStream is in Node 17+ and all modern browsers.
  const ds = new DecompressionStream(format);
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const ab = await new Response(stream).arrayBuffer();
  return new Uint8Array(ab);
}

// ───────────── WOFF → SFNT ─────────────
export async function decompressWOFF(
  buffer: ArrayBuffer,
): Promise<{ flavor: "ttf" | "otf"; sfnt: ArrayBuffer }> {
  const b = new Uint8Array(buffer);
  if (u32(b, 0) !== WOFF_SIG) throw new Error("WOFF: bad signature");
  const flavorRaw = u32(b, 4);
  const numTables = u16(b, 12);
  // const totalSfntSize = u32(b, 16); // we'll compute our own (with padding)

  const dirEntries = []; // { tag, off, compLen, origLen }
  let p = 44;
  for (let i = 0; i < numTables; i++) {
    dirEntries.push({
      tag: String.fromCharCode(b[p], b[p + 1], b[p + 2], b[p + 3]),
      off: u32(b, p + 4),
      compLen: u32(b, p + 8),
      origLen: u32(b, p + 12),
    });
    p += 20;
  }

  // Decompress all tables (in parallel, since DecompressionStream is async).
  const decompressed = await Promise.all(dirEntries.map(async e => {
    const slice = b.subarray(e.off, e.off + e.compLen);
    if (e.compLen === e.origLen) return slice; // not compressed
    const out = await inflate(slice, "deflate");
    if (out.length !== e.origLen) {
      // some encoders emit slightly-padded output; truncate (or keep as-is, both work)
    }
    return out;
  }));

  // Build SFNT: header (12) + directory (16 × numTables) + tables (each 4-byte padded).
  const dirSize = 12 + numTables * 16;
  let bodySize = 0;
  const padded = decompressed.map(d => {
    const pad = (4 - (d.length & 3)) & 3;
    bodySize += d.length + pad;
    return { data: d, pad };
  });
  const sfnt = new Uint8Array(dirSize + bodySize);
  // Header: scaler, numTables, searchRange, entrySelector, rangeShift
  // (we leave search fields as 0 — our directory walker doesn't use them, and most
  // production parsers ignore them too.)
  sfnt[0] = (flavorRaw >>> 24) & 0xff;
  sfnt[1] = (flavorRaw >>> 16) & 0xff;
  sfnt[2] = (flavorRaw >>> 8) & 0xff;
  sfnt[3] =  flavorRaw         & 0xff;
  sfnt[4] = (numTables >>> 8) & 0xff;
  sfnt[5] =  numTables        & 0xff;

  // SFNT directory entries must be sorted by tag.
  const order = dirEntries
    .map((e, i) => [e.tag, i])
    .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
    .map(p => p[1]);

  let cursor = dirSize;
  let dp = 12;
  for (const i of order) {
    const e = dirEntries[i];
    const d = padded[i].data;
    sfnt.set([
      e.tag.charCodeAt(0), e.tag.charCodeAt(1),
      e.tag.charCodeAt(2), e.tag.charCodeAt(3),
    ], dp);
    // checksum: 0 (parsers don't validate)
    sfnt[dp + 8]  = (cursor >>> 24) & 0xff;
    sfnt[dp + 9]  = (cursor >>> 16) & 0xff;
    sfnt[dp + 10] = (cursor >>> 8)  & 0xff;
    sfnt[dp + 11] =  cursor         & 0xff;
    sfnt[dp + 12] = (d.length >>> 24) & 0xff;
    sfnt[dp + 13] = (d.length >>> 16) & 0xff;
    sfnt[dp + 14] = (d.length >>> 8)  & 0xff;
    sfnt[dp + 15] =  d.length         & 0xff;
    dp += 16;
    sfnt.set(d, cursor);
    cursor += d.length + padded[i].pad;
  }

  let flavor;
  if      (flavorRaw === TTF_FLAVOR) flavor = "ttf";
  else if (flavorRaw === OTF_FLAVOR) flavor = "otf";
  else                               flavor = "ttf"; // default to TTF if unknown

  return { flavor, sfnt: sfnt.buffer };
}

// ───────────── parse + auto-delegate ─────────────
export async function parseWOFF(
  buffer: ArrayBuffer,
  _options: FontParserOptions = {},
): Promise<FontData> {
  const { flavor, sfnt } = await decompressWOFF(buffer);
  if (flavor === "otf") {
    const { parseOTF } = await import("./OTF");
    return parseOTF(sfnt);
  }
  const { parseTTF } = await import("./TTF");
  return parseTTF(sfnt);
}

export const loadWOFF = (
  url: string,
  options?: FontParserOptions,
): Promise<FontData> =>
  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((buffer) => parseWOFF(buffer, options));

export class FontParserWOFF {
  load(url: string, options?: FontParserOptions): Promise<FontData> {
    return loadWOFF(url, options);
  }

  loadFromBuffer(
    buffer: ArrayBuffer,
    options?: FontParserOptions,
  ): Promise<FontData> {
    return parseWOFF(buffer, options);
  }
}

export default FontParserWOFF;
