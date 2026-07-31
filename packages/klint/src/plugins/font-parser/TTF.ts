// @ts-nocheck -- Parser internals retain the compact upstream data structures.
// TTF (TrueType) parser — glyf/loca outlines, gvar variations.
// Port of Shopify/Klint FontParser, structured as a tree-shakeable ES module.
//
// Public API:
//   parseTTF(arrayBuffer)         → font instance ({ toPaths, toSVG, toPoints, toGlyphPath, … })
//   loadTTF(url)                  → fetch + parse
//   default class { load, loadFromBuffer } (drop-in compatible with Klint)

import {
  u16, i16, u32, f2dot14,
  parseCmap, parseFvar, parseAvar, parseHVAR,
  parseHead, parseHhea, parseMaxp, parseHmtx, parseKern,
  regionScalar, makeFont, readSfntDirectory,
} from "./Common";
import type { FontData } from "../FontParser";

// ───────────── glyf — single glyph parse ─────────────
// Parses the simple/composite glyph at loca[idx] and returns either:
//   { noc>0, ep, fl, xs, ys }   — simple
//   { noc:-1, parts: [[gid, m11, m12, m21, m22, dx, dy], ...] }   — composite
function parseGlyfEntry(b, loca, glyfOff, idx) {
  if (loca[idx] === loca[idx + 1]) return null;
  let p = glyfOff + loca[idx];
  const noc = i16(b, p); p += 2;
  // skip xMin, yMin, xMax, yMax
  const xMin = i16(b, p); p += 2;
  const yMin = i16(b, p); p += 2;
  const xMax = i16(b, p); p += 2;
  const yMax = i16(b, p); p += 2;
  if (xMin >= xMax || yMin >= yMax) return null;

  if (noc > 0) {
    // Simple glyph
    const ep = [];
    for (let i = 0; i < noc; i++) { ep.push(u16(b, p)); p += 2; }
    const instLen = u16(b, p); p += 2;
    if (p + instLen > b.length) return null;
    p += instLen;
    const numPoints = ep[noc - 1] + 1;

    // flags (with repeat byte)
    const fl = [];
    for (let i = 0; i < numPoints; i++) {
      const f = b[p++];
      fl.push(f);
      if (f & 8) {
        const r = b[p++];
        for (let k = 0; k < r; k++) { fl.push(f); i++; }
      }
    }

    const readCoords = (shortBit, sameBit) => {
      const out = [];
      for (let i = 0; i < numPoints; i++) {
        if (fl[i] & shortBit) {
          out.push(fl[i] & sameBit ? b[p] : -b[p]);
          p++;
        } else if (fl[i] & sameBit) {
          out.push(0);
        } else {
          out.push(i16(b, p));
          p += 2;
        }
      }
      // delta → absolute
      let acc = 0;
      for (let i = 0; i < numPoints; i++) { acc += out[i]; out[i] = acc; }
      return out;
    };
    const xs = readCoords(2, 16);
    const ys = readCoords(4, 32);
    return { noc, ep, fl, xs, ys };
  }

  // Composite
  const parts = [];
  let flags;
  do {
    flags = u16(b, p); p += 2;
    const part = [u16(b, p), 1, 0, 0, 1, 0, 0]; // [gid, m11, m12, m21, m22, dx, dy]
    p += 2;
    parts.push(part);
    let arg1, arg2;
    if (flags & 1) {
      arg1 = i16(b, p); p += 2;
      arg2 = i16(b, p); p += 2;
    } else {
      arg1 = (b[p] << 24) >> 24; p++;
      arg2 = (b[p] << 24) >> 24; p++;
    }
    if (flags & 2) { part[5] = arg1; part[6] = arg2; }
    if (flags & 8) { // single scale
      part[1] = part[4] = f2dot14(b, p); p += 2;
    } else if (flags & 64) { // x/y scale
      part[1] = f2dot14(b, p); p += 2;
      part[4] = f2dot14(b, p); p += 2;
    } else if (flags & 128) { // 2x2 matrix
      part[1] = f2dot14(b, p); p += 2;
      part[2] = f2dot14(b, p); p += 2;
      part[3] = f2dot14(b, p); p += 2;
      part[4] = f2dot14(b, p); p += 2;
    }
  } while (flags & 32); // MORE_COMPONENTS
  return { noc: -1, parts };
}

// ───────────── gvar — glyph variation deltas ─────────────
function parseGvar(b, off, sb /* signed bytes view */) {
  const readF2dot14Vec = (p, n) => {
    const v = [];
    for (let i = 0; i < n; i++) v.push(f2dot14(b, p + i * 2));
    return v;
  };
  // packed point numbers
  const readPackedPoints = (p) => {
    let n = b[p++];
    if (!n) return [[], p];
    if (n & 0x80) n = ((n & 0x7f) << 8) | b[p++];
    const points = [];
    let acc = 0;
    while (points.length < n) {
      const ctrl = b[p++];
      const wordsAreLong = !!(ctrl & 0x80);
      const runLen = (ctrl & 0x7f) + 1;
      for (let k = 0; k < runLen; k++) {
        const inc = wordsAreLong ? (p += 2, u16(b, p - 2)) : b[p++];
        acc += inc; points.push(acc);
      }
    }
    return [points, p];
  };

  let p = off + 4;
  const axisCount = u16(b, p); p += 2;
  const sharedCount = u16(b, p); p += 2;
  const sharedOff = u32(b, p); p += 4;
  const glyphCount = u16(b, p); p += 2;
  p += 2; // flags
  const dataOff = u32(b, p); p += 4;
  const offsets = [];
  for (let i = 0; i <= glyphCount; i++) offsets.push(u32(b, p + i * 4));

  // shared tuples
  const sharedTuples = [], sharedMin = [], sharedMax = [];
  p = off + sharedOff;
  for (let i = 0; i < sharedCount; i++) {
    const peak = readF2dot14Vec(p + i * axisCount * 2, axisCount);
    const start = [], end = [];
    for (let k = 0; k < axisCount; k++) {
      start.push(Math.min(peak[k], 0));
      end.push(Math.max(peak[k], 0));
    }
    sharedTuples.push(peak);
    sharedMin.push(start);
    sharedMax.push(end);
  }

  // per-glyph
  const out = [];
  for (let g = 0; g < glyphCount; g++) {
    const glyphBase = off + dataOff + offsets[g];
    p = glyphBase;
    const header = u16(b, p); p += 2;
    const hasSharedPoints = header & 0x8000;
    const tupleCount = header & 0x0fff;
    const dataStart = u16(b, p); p += 2;
    // tuple variation headers
    const headers = [];
    for (let t = 0; t < tupleCount; t++) {
      const variationDataSize = u16(b, p); p += 2;
      const tupleIndex = u16(b, p); p += 2;
      const flags = tupleIndex & 0xf000;
      const idx = tupleIndex & 0x0fff;
      const h = [variationDataSize, idx, flags];
      if (flags & 0x8000) { h[4] = readF2dot14Vec(p, axisCount); p += axisCount * 2; }
      if (flags & 0x4000) {
        h[3] = readF2dot14Vec(p, axisCount); p += axisCount * 2;
        h[5] = readF2dot14Vec(p, axisCount); p += axisCount * 2;
      }
      headers.push(h);
    }
    const tuples = [];
    out.push(tuples);
    p = glyphBase + dataStart;
    let sharedPoints = [];
    if (hasSharedPoints) {
      const r = readPackedPoints(p);
      sharedPoints = r[0]; p = r[1];
    }
    for (let t = 0; t < tupleCount; t++) {
      const h = headers[t];
      const dataEnd = p + h[0];
      let points = sharedPoints;
      if (h[2] & 0x2000) { // PRIVATE_POINT_NUMBERS
        const r = readPackedPoints(p);
        points = r[0]; p = r[1];
      }
      // packed deltas (until dataEnd)
      const deltas = [];
      while (p < dataEnd) {
        const ctrl = b[p++];
        const runLen = (ctrl & 0x3f) + 1;
        if (ctrl & 0x80) {
          for (let k = 0; k < runLen; k++) deltas.push(0);
        } else if (ctrl & 0x40) {
          for (let k = 0; k < runLen; k++) deltas.push(i16(b, p + k * 2));
          p += runLen * 2;
        } else {
          for (let k = 0; k < runLen; k++) deltas.push(sb[p + k]);
          p += runLen;
        }
      }
      const idx = h[1];
      const region = [
        h[3] || sharedMin[idx],
        h[4] || sharedTuples[idx],
        h[5] || sharedMax[idx],
      ];
      tuples.push([region, deltas, points.length ? points : null]);
    }
  }
  return out;
}

// IUP — infer untouched-point deltas. Maps `deltas` over `touched` indices,
// linearly interpolating uncovered points within each contour (delimited by `endPts`).
function inferDeltas(deltas, touched, baseX, baseY, endPts) {
  const numPoints = baseX.length;
  const merged = new Array(numPoints * 2 + 8).fill(0);
  const T = touched.length;
  for (let i = 0; i < numPoints; i++) {
    const t = touched.indexOf(i);
    if (t !== -1) {
      merged[i] = deltas[t];
      merged[numPoints + 4 + i] = deltas[T + t];
      continue;
    }
    // find contour bounds
    let c = 0;
    while (endPts[c] < i) c++;
    const lo = c ? endPts[c - 1] + 1 : 0;
    const hi = endPts[c];
    let prev = -1, next = -1;
    for (let k = 0; k < T; k++) {
      const tp = touched[k];
      if (tp >= lo && tp <= hi && tp < numPoints) {
        if (tp < i) prev = k;
        else if (i < tp && next < 0) next = k;
        if (prev < 0) prev = k;
        if (next < 0) next = k;
      }
    }
    for (let axis = 0; axis < 2; axis++) {
      const coords = axis ? baseY : baseX;
      const off = axis * T;
      const a = coords[touched[prev]];
      const b = coords[touched[next]];
      const v = coords[i];
      const da = deltas[off + prev];
      const db = deltas[off + next];
      let d;
      if (a === b)             d = da === db ? da : 0;
      else if (v <= Math.min(a, b))  d = a < b ? da : db;
      else if (Math.max(a, b) <= v)  d = a < b ? db : da;
      else { const t = (v - a) / (b - a); d = t * db + (1 - t) * da; }
      merged[axis ? numPoints + 4 + i : i] = d;
    }
  }
  return merged;
}

// ───────────── recursive glyph builder (composites) ─────────────
function buildGlyph(gid, font, out, normCoords) {
  let g = font._gl[gid];
  if (g === undefined) g = font._gl[gid] = parseGlyfEntry(font._data, font.loca, font._goff, gid);
  if (!g) return;

  if (g.noc > 0) {
    let xs = g.xs, ys = g.ys;
    if (font.fvar && normCoords) {
      xs = xs.slice(); ys = ys.slice();
      const tuples = font.gvar?.[gid];
      if (tuples) for (let i = 0; i < tuples.length; i++) {
        const s = regionScalar(tuples[i][0], normCoords);
        if (s < 1e-9) continue;
        let deltas = tuples[i][1];
        const points = tuples[i][2];
        if (points) {
          deltas = tuples[i][1] = inferDeltas(deltas, points, xs, ys, g.ep);
          tuples[i][2] = null;
        }
        if (deltas.length === xs.length * 2 + 8) {
          for (let k = 0; k < xs.length; k++) {
            xs[k] += s * deltas[k];
            ys[k] += s * deltas[k + xs.length + 4];
          }
        }
      }
    }
    // emit path commands per contour
    for (let c = 0; c < g.noc; c++) {
      const start = c ? g.ep[c - 1] + 1 : 0;
      const end = g.ep[c];
      for (let i = start; i <= end; i++) {
        const prev = i === start ? end : i - 1;
        const next = i === end ? start : i + 1;
        const onCurve = g.fl[i] & 1;
        const prevOn = g.fl[prev] & 1;
        const x = xs[i], y = ys[i];
        if (i === start) {
          if (onCurve && !prevOn) { out.push(0, x, y); continue; }
          out.push(0,
            prevOn ? xs[prev] : ((xs[prev] + x) * 0.5) | 0,
            prevOn ? ys[prev] : ((ys[prev] + y) * 0.5) | 0);
        }
        if (onCurve) {
          if (prevOn) out.push(1, x, y);
        } else {
          const nextOn = g.fl[next] & 1;
          out.push(2, x, y,
            nextOn ? xs[next] : ((x + xs[next]) * 0.5) | 0,
            nextOn ? ys[next] : ((y + ys[next]) * 0.5) | 0);
        }
      }
      out.push(3);
    }
  } else {
    // composite
    const parts = g.parts;
    const dx = new Array(parts.length).fill(0);
    const dy = new Array(parts.length).fill(0);
    if (font.fvar && normCoords) {
      const tuples = font.gvar?.[gid];
      if (tuples) for (let i = 0; i < tuples.length; i++) {
        const s = regionScalar(tuples[i][0], normCoords);
        if (s < 1e-6) continue;
        const deltas = tuples[i][1];
        const points = tuples[i][2];
        if (points) {
          for (let k = 0; k < points.length; k++) {
            dx[points[k]] += s * deltas[0];
            dy[points[k]] += s * deltas[parts.length];
          }
        } else {
          for (let k = 0; k < parts.length; k++) {
            dx[k] += s * deltas[k];
            dy[k] += s * deltas[k + parts.length + 4];
          }
        }
      }
    }
    for (let i = 0; i < parts.length; i++) {
      const sub = [];
      const part = parts[i];
      buildGlyph(part[0], font, sub, normCoords);
      const m11 = part[1], m12 = part[2], m21 = part[3], m22 = part[4];
      const tx = part[5] + dx[i], ty = part[6] + dy[i];
      let k = 0;
      while (k < sub.length) {
        const op = sub[k];
        if (op === 3)      { out.push(3); k++; }
        else if (op < 2)   { out.push(op,
          sub[k+1] * m11 + sub[k+2] * m21 + tx,
          sub[k+1] * m12 + sub[k+2] * m22 + ty); k += 3; }
        else               { out.push(2,
          sub[k+1] * m11 + sub[k+2] * m21 + tx,
          sub[k+1] * m12 + sub[k+2] * m22 + ty,
          sub[k+3] * m11 + sub[k+4] * m21 + tx,
          sub[k+3] * m12 + sub[k+4] * m22 + ty); k += 5; }
      }
    }
  }
}

function getGlyph(font, gid, normCoords) {
  const out = [];
  buildGlyph(gid, font, out, normCoords);
  return out;
}

// ───────────── parser entry point ─────────────
export function parseTTF(buffer: ArrayBuffer): FontData {
  const data = new Uint8Array(buffer);
  const sb = new Int8Array(buffer);
  const { tables } = readSfntDirectory(data);
  const font = { _data: data, _ix: 0, _gl: {} };

  let t;
  if ((t = tables.head)) font.head = parseHead(data, t[0]);
  if ((t = tables.maxp)) font._nG = parseMaxp(data, t[0]);
  if ((t = tables.hhea)) font.hhea = parseHhea(data, t[0]);
  if ((t = tables.hmtx)) font.hmtx = parseHmtx(data, t[0], font.hhea.nHM, font._nG);
  if ((t = tables.loca)) {
    const out = [], n = font._nG + 1;
    if (font.head.locFmt) for (let i = 0; i < n; i++) out.push(u32(data, t[0] + (i << 2)));
    else                  for (let i = 0; i < n; i++) out.push(u16(data, t[0] + (i << 1)) << 1);
    font.loca = out;
  }
  if ((t = tables.cmap)) font.cmap = parseCmap(data, t[0], t[1]);
  if ((t = tables.kern)) font.kern = parseKern(data, t[0]);
  if ((t = tables.glyf)) font._goff = t[0];
  if ((t = tables.fvar)) font.fvar = parseFvar(data, t[0]);
  if ((t = tables.avar)) font.avar = parseAvar(data, t[0]);
  if ((t = tables.gvar)) font.gvar = parseGvar(data, t[0], sb);
  if ((t = tables.HVAR)) font.HVAR = parseHVAR(data, t[0], sb);

  return makeFont(font, getGlyph);
}

export const loadTTF = (url: string): Promise<FontData> =>
  fetch(url).then((response) => response.arrayBuffer()).then(parseTTF);

export class FontParserTTF {
  load(url: string): Promise<FontData> {
    return loadTTF(url);
  }

  loadFromBuffer(buffer: ArrayBuffer): FontData {
    return parseTTF(buffer);
  }
}

export default FontParserTTF;
