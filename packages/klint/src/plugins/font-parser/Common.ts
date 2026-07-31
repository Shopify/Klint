// @ts-nocheck -- Parser internals retain the compact upstream data structures.
// Public parser entry points are strictly typed in the format-specific modules.
// Shared helpers for TTF / OTF / WOFF / WOFF2 parsers.
// Format-agnostic: binary IO, cmap, fvar/avar/HVAR, hmtx, kern, layout, paths.
// Path command stream encoding (used by both TTF and OTF glyph builders):
//   0, x, y                  → moveTo
//   1, x, y                  → lineTo
//   2, cx, cy, x, y          → quadraticCurveTo
//   3                        → closePath

// ───────────── binary IO ─────────────
const _buf = new ArrayBuffer(4);
const _i16 = new Int16Array(_buf);
const _u16 = new Uint16Array(_buf);

export const u16 = (b, o) => (b[o] << 8) | b[o + 1];
export const i16 = (b, o) => { _u16[0] = u16(b, o); return _i16[0]; };
export const u32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
export const i32 = (b, o) => (b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3];
export const f2dot14 = (b, o) => i16(b, o) / 16384;
// 16.16 Fixed (used in fvar). Klint uses 65540 — keep parity.
export const fixed = (b, o) => (b[o] << 8 | b[o + 1]) + (b[o + 2] << 8 | b[o + 3]) / 65540;

// Binary search a sorted typed/array `a` of stride `stride` for the largest index
// where a[i*stride] <= v. Returns i*stride.
export const bsearch = (a, stride, v) => {
  let lo = 0, hi = (a.length / stride) | 0;
  while (lo + 1 !== hi) {
    const mid = lo + ((hi - lo) >>> 1);
    if (a[mid * stride] <= v) lo = mid; else hi = mid;
  }
  return lo * stride;
};

// ───────────── cmap ─────────────
export function parseCmap(view, off, len) {
  const b = new Uint8Array(view.buffer, off, len);
  const tabs = [], ids = {}, seen = [];
  const numSub = u16(b, 2);
  let p = 4;
  for (let i = 0; i < numSub; i++) {
    const platform = u16(b, p);
    const encoding = u16(b, p + 2);
    const subOff = u32(b, p + 4);
    p += 8;
    const key = "p" + platform + "e" + encoding;
    let idx = seen.indexOf(subOff);
    if (idx < 0) {
      idx = tabs.length;
      seen.push(subOff);
      const fmt = u16(b, subOff);
      const t = { f: fmt };
      if (fmt === 0) {
        t.m = [];
        for (let k = 0; k < 256; k++) t.m.push(b[subOff + 6 + k]);
      } else if (fmt === 4) {
        const length = u16(b, subOff + 2);
        const segCount = u16(b, subOff + 6) >>> 1;
        let q = subOff + 14;
        t.ec = []; t.sc = []; t.id = []; t.ir = []; t.ga = [];
        for (let k = 0; k < segCount; k++) { t.ec.push(u16(b, q)); q += 2; }
        q += 2; // reservedPad
        for (let k = 0; k < segCount; k++) { t.sc.push(u16(b, q)); q += 2; }
        for (let k = 0; k < segCount; k++) { t.id.push(i16(b, q)); q += 2; }
        for (let k = 0; k < segCount; k++) { t.ir.push(u16(b, q)); q += 2; }
        for (let k = q; k < subOff + length; k += 2) t.ga.push(u16(b, k));
      } else if (fmt === 6) {
        t.fc = u16(b, subOff + 6);
        const ec = u16(b, subOff + 8);
        t.ga = [];
        for (let k = 0; k < ec; k++) t.ga.push(u16(b, subOff + 10 + k * 2));
      } else if (fmt === 12) {
        const numGroups = u32(b, subOff + 12) * 3;
        t.g = new Uint32Array(numGroups);
        for (let k = 0; k < numGroups; k += 3) {
          const base = subOff + 16 + (k << 2);
          t.g[k] = u32(b, base);
          t.g[k + 1] = u32(b, base + 4);
          t.g[k + 2] = u32(b, base + 8);
        }
      }
      tabs.push(t);
    }
    ids[key] = idx;
  }
  return { tabs, ids };
}

// Look up a codepoint → glyph id, picking the best subtable on first call.
export function cmapLookup(font, cp) {
  if (!font._ct) {
    const order = ["p3e10", "p0e4", "p3e1", "p1e0", "p0e3", "p0e1", "p3e0", "p3e5"];
    for (const k of order) if (font.cmap.ids[k] != null) {
      font._ct = font.cmap.tabs[font.cmap.ids[k]];
      break;
    }
  }
  const t = font._ct, f = t.f;
  if (f === 0) return cp < t.m.length ? t.m[cp] : 0;
  if (f === 4) {
    const ec = t.ec;
    if (cp > ec[ec.length - 1]) return 0;
    let i = bsearch(ec, 1, cp);
    if (ec[i] < cp) i++;
    if (cp < t.sc[i]) return 0;
    return t.ir[i]
      ? t.ga[cp - t.sc[i] + (t.ir[i] >> 1) - (t.ir.length - i)] & 0xffff
      : (cp + t.id[i]) & 0xffff;
  }
  if (f === 6) {
    const k = cp - t.fc;
    return k < 0 || k >= t.ga.length ? 0 : t.ga[k];
  }
  if (f === 12) {
    const g = t.g;
    if (cp > g[g.length - 2]) return 0;
    const i = bsearch(g, 3, cp);
    return g[i] <= cp && cp <= g[i + 1] ? g[i + 2] + (cp - g[i]) : 0;
  }
  return 0;
}

// ───────────── fvar / avar / HVAR ─────────────
export function parseFvar(b, off) {
  let p = off + 8;
  const axisCount = u16(b, p); p += 4;
  const instCount = u16(b, p); p += 2;
  const instSize = u16(b, p); p += 2;
  const axes = [];
  for (let i = 0; i < axisCount; i++) {
    axes.push([0, fixed(b, p + 4), fixed(b, p + 8), fixed(b, p + 12)]);
    p += 20;
  }
  const inst = [];
  for (let i = 0; i < instCount; i++) {
    const v = [];
    for (let k = 0; k < axisCount; k++) v.push(fixed(b, p + 4 + k * 4));
    inst.push(v);
    p += 4 + axisCount * 4;
    if ((instSize & 3) === 2) p += 2; // postScriptNameID
  }
  return { axes, inst };
}

export function parseAvar(b, off) {
  let p = off + 6;
  const axisCount = u16(b, p); p += 2;
  const out = [];
  for (let i = 0; i < axisCount; i++) {
    const n = u16(b, p); p += 2;
    const segs = [];
    for (let k = 0; k < n; k++) {
      segs.push(f2dot14(b, p), f2dot14(b, p + 2));
      p += 4;
    }
    out.push(segs);
  }
  return out;
}

// Item Variation Store + advance-width mapping (HVAR table).
export function parseHVAR(b, off, sb) {
  const base = off;
  let p = base + 4;
  const ivsOff = u32(b, p); p += 4;
  const advMapOff = u32(b, p); p += 12;
  // VariationStore
  p = base + ivsOff;
  const ivsBase = p;
  p += 2;
  const regsOff = u32(b, p); p += 4;
  const subCount = u16(b, p); p += 2;
  const subOffs = [];
  for (let i = 0; i < subCount; i++) subOffs.push(u32(b, p + i * 4));
  p += subCount * 4;
  // VariationRegionList
  p = ivsBase + regsOff;
  const axisCount = u16(b, p); p += 2;
  const regCount = u16(b, p); p += 2;
  const regs = [];
  for (let i = 0; i < regCount; i++) {
    const r = [[], [], []];
    regs.push(r);
    for (let k = 0; k < axisCount; k++) {
      r[0].push(f2dot14(b, p));
      r[1].push(f2dot14(b, p + 2));
      r[2].push(f2dot14(b, p + 4));
      p += 6;
    }
  }
  // Per-subtable delta sets
  const subs = [];
  for (let i = 0; i < subOffs.length; i++) {
    p = ivsBase + subOffs[i];
    const rows = [];
    subs.push(rows);
    const itemCount = u16(b, p); p += 2;
    const shortDeltaCount = u16(b, p); p += 2;
    const regIdxCount = u16(b, p); p += 2;
    const regIdx = [];
    for (let k = 0; k < regIdxCount; k++) regIdx.push(u16(b, p + k * 2));
    p += regIdxCount * 2;
    for (let k = 0; k < itemCount; k++) {
      const raw = [];
      for (let j = 0; j < regIdxCount; j++) {
        raw.push(j < shortDeltaCount ? i16(b, p) : sb[p]);
        p += j < shortDeltaCount ? 2 : 1;
      }
      const row = new Array(regs.length).fill(0);
      rows.push(row);
      for (let j = 0; j < regIdx.length; j++) row[regIdx[j]] = raw[j];
    }
  }
  // DeltaSetIndexMap → per-glyph (subtable, row)
  p = base + advMapOff;
  p++; // reserved byte
  const fmt = b[p++];
  const mapCount = u16(b, p); p += 2;
  const entrySize = ((fmt & 0x30) >> 4) + 1;
  const innerBits = (fmt & 0x0f) + 1;
  const innerMask = (1 << innerBits) - 1;
  const dfs = [];
  for (let i = 0; i < mapCount; i++) {
    let v;
    if (entrySize === 1) v = b[p++];
    else if (entrySize === 2) { v = u16(b, p); p += 2; }
    else if (entrySize === 3) { v = (b[p] << 16) | (b[p + 1] << 8) | b[p + 2]; p += 3; }
    else { v = u32(b, p); p += 4; }
    dfs.push(subs[v >> innerBits][v & innerMask]);
  }
  return { regs, dfs };
}

// Apply avar segment maps to user-space axis values → normalized [-1..1].
export function normalizeAxes(axes, avar, user) {
  const out = [];
  for (let i = 0; i < axes.length; i++) {
    const [, min, def, max] = axes[i];
    const v = Math.max(min, Math.min(max, user[i]));
    let n = v < def ? (def - v) / (min - def) : v > def ? (v - def) / (max - def) : 0;
    if (avar && n !== -1) {
      const seg = avar[i];
      let k = 0;
      while (k < seg.length && seg[k] < n) k += 2;
      // 'while < n' breaks out so seg[k] >= n; previous pair is seg[k-2]/seg[k-1].
      // Klint condition is `seg[c] >= h[t]` — replicate exactly:
      // (kept as `while(c<u.length && !(u[c] >= h[t])) c+=2;`)
      // Then linearly interpolate between (seg[k-2], seg[k-1]) and (seg[k], seg[k+1]).
      const t = (n - seg[k - 2]) / (seg[k] - seg[k - 2]);
      n = t * seg[k + 1] + (1 - t) * seg[k - 1];
    }
    out[i] = n;
  }
  return out;
}

// Compute a region scalar for a normalized coord vector.
export function regionScalar(region, coords) {
  let s = 1;
  const [start, peak, end] = region;
  for (let i = 0; i < coords.length; i++) {
    let f = 1;
    if (start[i] > peak[i] || peak[i] > end[i]) f = 1;
    else if (start[i] < 0 && end[i] > 0 && peak[i] !== 0) f = 1;
    else if (peak[i] === 0) f = 1;
    else if (coords[i] < start[i] || coords[i] > end[i]) f = 0;
    else if (coords[i] !== peak[i]) {
      f = coords[i] < peak[i]
        ? (coords[i] - start[i]) / (peak[i] - start[i])
        : (end[i] - coords[i]) / (end[i] - peak[i]);
    }
    s *= f;
  }
  return s;
}

// ───────────── kern (subtable format 0 only; matches Klint) ─────────────
export function parseKern(b, off) {
  const map = new Map();
  let p = off + 4;
  let nTables = u16(b, off + 2);
  const v1 = u16(b, off) === 1; // mac/aat
  if (v1) { nTables = u32(b, off + 4); p = off + 8; }
  for (let i = 0; i < nTables; i++) {
    let coverage;
    if (v1) { p += 4; coverage = u16(b, p) & 0xff; p += 4; }
    else    { p += 4; coverage = (u16(b, p) >>> 8) & 0x0f; p += 2; }
    if (coverage !== 0) continue;
    const nPairs = u16(b, p); p += 8;
    for (let k = 0; k < nPairs; k++) {
      const left = u16(b, p); p += 2;
      const right = u16(b, p); p += 2;
      const value = i16(b, p); p += 2;
      let inner = map.get(left);
      if (!inner) { inner = new Map(); map.set(left, inner); }
      inner.set(right, value);
    }
  }
  return map;
}

// ───────────── shaping (text → [{ glyphId, advance }]) ─────────────
export function shape(font, text, axisValues) {
  if (font.fvar && !axisValues) axisValues = font.fvar.inst[font._ix || 0];
  let normCoords = axisValues;
  if (axisValues && font.HVAR) normCoords = normalizeAxes(font.fvar.axes, font.avar, axisValues);
  const gids = [];
  for (let i = 0; i < text.length; i++) {
    const cp = text.codePointAt(i);
    if (cp > 0xffff) i++;
    gids.push(cmapLookup(font, cp));
  }
  const out = [];
  for (let i = 0; i < gids.length; i++) {
    const g = gids[i];
    let ax = font.hmtx[g];
    if (font.kern) {
      const k = font.kern.get(g)?.get(gids[i + 1]);
      if (k) ax += k;
    }
    if (font.HVAR && normCoords && font.HVAR.dfs[g]) {
      const row = font.HVAR.dfs[g];
      for (let r = 0; r < font.HVAR.regs.length; r++) {
        ax += regionScalar(font.HVAR.regs[r], normCoords) * row[r];
      }
    }
    out.push({ g, ax });
  }
  return out;
}

// ───────────── core table parsers used by all formats ─────────────
export function parseHead(b, off) {
  return { unitsPerEm: u16(b, off + 18), locFmt: i16(b, off + 50) };
}
export function parseHhea(b, off) {
  return { asc: i16(b, off + 4), desc: i16(b, off + 6), nHM: u16(b, off + 34) };
}
export function parseMaxp(b, off) { return u16(b, off + 4); }
export function parseHmtx(b, off, numHM, numGlyphs) {
  const out = [];
  let aw = 0, i = 0;
  for (; i < numHM; i++) { aw = u16(b, off + (i << 2)); out.push(aw); }
  for (; i < numGlyphs; i++) out.push(aw);
  return out;
}

// ───────────── layout (string → positioned letters) ─────────────
export function layout(font, text, fontSize, opts = {}) {
  const scale = fontSize / font.head.unitsPerEm;
  const letterSpacing = opts.letterSpacing || 0;
  const wordSpacing = opts.wordSpacing || 0;
  const axisValues = opts.axisValues || (font.fvar ? font.fvar.inst[font._ix || 0] : null);
  const lineHeight = fontSize * 1.2 + (opts.lineSpacing || 0);
  const center = opts.align === "center";
  const right = opts.align === "right";
  const anchorCenter = opts.anchor === "center";
  const baselineCenter = opts.baseline === "center";

  const lines = text.split(/\r?\n/);
  const shaped = lines.map(l => shape(font, l, axisValues));
  const widths = shaped.map((row, li) => {
    let w = 0;
    const line = lines[li];
    for (let i = 0; i < row.length; i++) {
      w += (row[i].ax || 0) * scale;
      if (line[i] === " ") w += wordSpacing;
      else if (i < row.length - 1) w += letterSpacing;
    }
    return w;
  });
  const blockW = Math.max(...widths, 0);
  const blockH = lineHeight * lines.length;
  const letters = [];
  let li = 0, wi = 0;
  const baselineOffset = (font.hhea.asc + font.hhea.desc) * scale / 2;

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    const row = shaped[l];
    let x = center
      ? (anchorCenter ? -widths[l] / 2 : (blockW - widths[l]) / 2)
      : right ? blockW - widths[l] : 0;
    const y = (baselineCenter
      ? (lines.length < 2 ? 0 : -blockH / 2 + lineHeight / 2 + l * lineHeight)
      : -lineHeight / 2 + l * lineHeight) + baselineOffset;
    for (let i = 0; i < row.length; i++) {
      const w = (row[i].ax || 0) * scale;
      letters.push({
        gl: row[i], x, y, li: li++, wi, ln: l, w, h: fontSize,
      });
      x += w;
      if (line[i] === " ") { x += wordSpacing; wi++; }
      else if (i < row.length - 1) x += letterSpacing;
    }
    if (line.includes(" ")) wi++;
  }
  if (anchorCenter) {
    const dx = center ? 0 : -blockW / 2;
    const dy = baselineCenter ? 0 : -blockH / 2;
    if (dx || dy) for (const L of letters) { L.x += dx; L.y += dy; }
  }
  return { letters, block: { width: blockW, height: blockH } };
}

// ───────────── path stream → Path2D / SVG / Points ─────────────
// Path command stream opcodes:
//   0 = moveTo  (x, y)
//   1 = lineTo  (x, y)
//   2 = quadTo  (cx, cy, x, y)
//   3 = closePath
//   4 = cubicTo (c1x, c1y, c2x, c2y, x, y)   ← used by CFF (OTF/WOFF/WOFF2-CFF)
export function pathToPath2D(cmds, scale) {
  const p = new Path2D();
  for (let i = 0; i < cmds.length;) {
    const op = cmds[i];
    if (op === 0)      { p.moveTo(cmds[i + 1] * scale, -cmds[i + 2] * scale); i += 3; }
    else if (op === 1) { p.lineTo(cmds[i + 1] * scale, -cmds[i + 2] * scale); i += 3; }
    else if (op === 2) { p.quadraticCurveTo(cmds[i + 1] * scale, -cmds[i + 2] * scale, cmds[i + 3] * scale, -cmds[i + 4] * scale); i += 5; }
    else if (op === 4) { p.bezierCurveTo(cmds[i + 1] * scale, -cmds[i + 2] * scale, cmds[i + 3] * scale, -cmds[i + 4] * scale, cmds[i + 5] * scale, -cmds[i + 6] * scale); i += 7; }
    else               { p.closePath(); i++; }
  }
  return p;
}
export function pathToSVG(cmds, scale) {
  const r = v => Math.round(v * 100) / 100;
  let d = "";
  for (let i = 0; i < cmds.length;) {
    const op = cmds[i];
    if (op === 0)      { d += `M${r(cmds[i + 1] * scale)} ${r(-cmds[i + 2] * scale)}`; i += 3; }
    else if (op === 1) { d += `L${r(cmds[i + 1] * scale)} ${r(-cmds[i + 2] * scale)}`; i += 3; }
    else if (op === 2) { d += `Q${r(cmds[i + 1] * scale)} ${r(-cmds[i + 2] * scale)} ${r(cmds[i + 3] * scale)} ${r(-cmds[i + 4] * scale)}`; i += 5; }
    else if (op === 4) { d += `C${r(cmds[i + 1] * scale)} ${r(-cmds[i + 2] * scale)} ${r(cmds[i + 3] * scale)} ${r(-cmds[i + 4] * scale)} ${r(cmds[i + 5] * scale)} ${r(-cmds[i + 6] * scale)}`; i += 7; }
    else               { d += "Z"; i++; }
  }
  return d;
}

// Sample a path stream to a list of {x, y, contour}.
export function samplePath(cmds, density) {
  const contours = [], lengths = [];
  let cur = null, len = 0, x = 0, y = 0, i = 0;
  while (i < cmds.length) {
    const op = cmds[i];
    if (op === 0) {
      if (cur) { contours.push(cur); lengths.push(len); }
      cur = []; len = 0; x = cmds[i + 1]; y = cmds[i + 2]; i += 3;
    } else if (op === 1) {
      const nx = cmds[i + 1], ny = cmds[i + 2];
      const d = Math.hypot(nx - x, ny - y);
      cur.push(0, x, y, nx, ny, d, len);
      len += d; x = nx; y = ny; i += 3;
    } else if (op === 2) {
      const cx = cmds[i + 1], cy = cmds[i + 2];
      const nx = cmds[i + 3], ny = cmds[i + 4];
      // approximation: avg of chord lengths (matches Klint)
      const d = (Math.hypot(nx - x, ny - y) + Math.hypot(cx - x, cy - y) + Math.hypot(nx - cx, ny - cy)) / 2;
      cur.push(1, x, y, cx, cy, nx, ny, d, len);
      len += d; x = nx; y = ny; i += 5;
    } else if (op === 4) {
      const c1x = cmds[i + 1], c1y = cmds[i + 2];
      const c2x = cmds[i + 3], c2y = cmds[i + 4];
      const nx  = cmds[i + 5], ny  = cmds[i + 6];
      // length approx: avg of chord & control polygon perimeter
      const chord = Math.hypot(nx - x, ny - y);
      const poly  = Math.hypot(c1x - x, c1y - y)
                  + Math.hypot(c2x - c1x, c2y - c1y)
                  + Math.hypot(nx - c2x, ny - c2y);
      const d = (chord + poly) / 2;
      cur.push(2, x, y, c1x, c1y, c2x, c2y, nx, ny, d, len);
      len += d; x = nx; y = ny; i += 7;
    } else {
      if (cur) { contours.push(cur); lengths.push(len); }
      cur = null; len = 0; i++;
    }
  }
  if (cur) { contours.push(cur); lengths.push(len); }
  const pts = [];
  for (let c = 0; c < contours.length; c++) {
    const seg = contours[c], total = lengths[c];
    const samples = Math.max(5, (total * density * 0.1) | 0);
    for (let s = 0; s <= samples; s++) {
      const target = s / samples * total;
      let k = 0;
      while (k < seg.length) {
        if (seg[k] === 0) {
          const start = seg[k + 6], segLen = seg[k + 5];
          if (target >= start && target <= start + segLen) {
            const t = (target - start) / segLen;
            pts.push({
              x: seg[k + 1] + (seg[k + 3] - seg[k + 1]) * t,
              y: seg[k + 2] + (seg[k + 4] - seg[k + 2]) * t,
              c,
            });
            break;
          }
          k += 7;
        } else if (seg[k] === 1) {
          const start = seg[k + 8], segLen = seg[k + 7];
          if (target >= start && target <= start + segLen) {
            const t = (target - start) / segLen, u = 1 - t;
            pts.push({
              x: u * u * seg[k + 1] + 2 * u * t * seg[k + 3] + t * t * seg[k + 5],
              y: u * u * seg[k + 2] + 2 * u * t * seg[k + 4] + t * t * seg[k + 6],
              c,
            });
            break;
          }
          k += 9;
        } else { // cubic
          const start = seg[k + 10], segLen = seg[k + 9];
          if (target >= start && target <= start + segLen) {
            const t = (target - start) / segLen, u = 1 - t;
            const u2 = u * u, t2 = t * t;
            pts.push({
              x: u2*u*seg[k+1] + 3*u2*t*seg[k+3] + 3*u*t2*seg[k+5] + t2*t*seg[k+7],
              y: u2*u*seg[k+2] + 3*u2*t*seg[k+4] + 3*u*t2*seg[k+6] + t2*t*seg[k+8],
              c,
            });
            break;
          }
          k += 11;
        }
      }
    }
  }
  return pts;
}

// ───────────── makeFont: shared API surface (toPaths/toSVG/toPoints) ─────────────
// `getGlyph(font, glyphId, normCoords) → cmds[]` is provided by the format-specific parser.
export function makeFont(parsed, getGlyph) {
  const f = parsed;
  const upemInv = 1 / f.head.unitsPerEm;
  const resolveAxis = opts =>
    opts.axisValues || (f.fvar ? f.fvar.inst[f._ix || 0] : null);
  const norm = a => a && f.fvar ? normalizeAxes(f.fvar.axes, f.avar, a) : null;

  const letterInfo = (L, extra) => ({
    ...extra,
    letterIndex: L.li,
    wordIndex: L.wi,
    lineIndex: L.ln,
    width: L.w,
    height: L.h,
    center: { x: L.x, y: L.y },
    gid: L.gl.g,
  });

  return {
    head: f.head,
    hhea: f.hhea,
    fvar: f.fvar
      ? [f.fvar.axes, [f.fvar.inst.map(t => [null, 0, t, null])]]
      : undefined,
    _index: f._ix,
    toPaths(text, fontSize = 100, opts = {}) {
      const { letters, block } = layout(f, text, fontSize, opts);
      const scale = fontSize * upemInv;
      const nc = norm(resolveAxis(opts));
      return {
        letters: letters.map(L => letterInfo(L, {
          path: pathToPath2D(getGlyph(f, L.gl.g, nc), scale),
        })),
        block,
      };
    },
    toSVG(text, fontSize = 100, opts = {}) {
      const { letters, block } = layout(f, text, fontSize, opts);
      const scale = fontSize * upemInv;
      const nc = norm(resolveAxis(opts));
      return {
        letters: letters.map(L => letterInfo(L, {
          d: pathToSVG(getGlyph(f, L.gl.g, nc), scale),
        })),
        block,
      };
    },
    toPoints(text, fontSize = 100, opts = {}) {
      const { letters, block } = layout(f, text, fontSize, opts);
      const scale = fontSize * upemInv;
      const nc = norm(resolveAxis(opts));
      const density = opts.sampling || 0.25;
      return {
        letters: letters.map(L => {
          const pts = samplePath(getGlyph(f, L.gl.g, nc), density);
          return letterInfo(L, {
            shape: pts.map(p => ({ x: p.x * scale, y: -p.y * scale, contour: p.c })),
          });
        }),
        block,
      };
    },
    toGlyphPath(glyphId, axisValues) {
      return getGlyph(f, glyphId, norm(axisValues ?? resolveAxis({})));
    },
  };
}

// Shared sfnt directory walker. Returns { tables: { TAG: [off, len] }, numTables }.
// `bytes` is a Uint8Array starting at the sfnt header (offset 0).
export function readSfntDirectory(bytes) {
  const numTables = u16(bytes, 4);
  const tables = {};
  let p = 12;
  for (let i = 0; i < numTables; i++) {
    const tag = String.fromCharCode(bytes[p], bytes[p + 1], bytes[p + 2], bytes[p + 3]);
    tables[tag] = [u32(bytes, p + 8), u32(bytes, p + 12)];
    p += 16;
  }
  return { tables, numTables };
}
