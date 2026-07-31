// Bezier curve operations ported from bezier.js by Pomax (MIT).
// https://github.com/Pomax/bezierjs

import type { KlintContext } from "../core/KlintTypes";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
  t?: number;
  d?: number;
}

export interface MinMax {
  min: number;
  mid: number;
  max: number;
  size: number;
}

export interface BBox {
  x: MinMax;
  y: MinMax;
}

export interface CurvatureResult {
  k: number;
  r: number;
  dk?: number;
  adk?: number;
}

export interface OffsetPoint extends Point {
  c: Point;
  n: Point;
}

export interface Arc {
  x: number;
  y: number;
  r: number;
  s: number;
  e: number;
  interval: { start: number; end: number };
}

export type ShapeSegment = Bezier & { virtual?: boolean };

export interface Shape {
  startcap: ShapeSegment;
  forward: ShapeSegment;
  back: ShapeSegment;
  endcap: ShapeSegment;
  bbox: BBox;
  virtual?: boolean;
  intersections: (s2: Shape) => ShapeIntersection[];
}

export interface ShapeIntersection extends Array<string> {
  c1: Bezier;
  c2: Bezier;
  s1: Shape;
  s2: Shape;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const { abs, cos, sin, acos, atan2, sqrt, pow, min, max, PI } = Math;
const tau = 2 * PI;
const quart = PI / 2;
const epsilon = 0.000001;
const nMax = Number.MAX_SAFE_INTEGER;
const nMin = Number.MIN_SAFE_INTEGER;

const Tvalues = [
  -0.0640568928626056, 0.0640568928626056, -0.1911188674736163,
  0.1911188674736163, -0.3150426796961634, 0.3150426796961634,
  -0.4337935076260451, 0.4337935076260451, -0.5454214713888396,
  0.5454214713888396, -0.6480936519369756, 0.6480936519369756,
  -0.7401241915785544, 0.7401241915785544, -0.8200019859739029,
  0.8200019859739029, -0.8864155270044011, 0.8864155270044011,
  -0.9382745520027328, 0.9382745520027328, -0.9747285559713095,
  0.9747285559713095, -0.9951872199970214, 0.9951872199970214,
];

const Cvalues = [
  0.1279381953467522, 0.1279381953467522, 0.1258374563468283,
  0.1258374563468283, 0.1216704729278034, 0.1216704729278034,
  0.1155056680537256, 0.1155056680537256, 0.1074442701159656,
  0.1074442701159656, 0.0976186521041139, 0.0976186521041139,
  0.0861901615319533, 0.0861901615319533, 0.0733464814110803,
  0.0733464814110803, 0.0592985849154368, 0.0592985849154368,
  0.0442774388174198, 0.0442774388174198, 0.0285313886289337,
  0.0285313886289337, 0.0123412297999872, 0.0123412297999872,
];

// ─── Small helpers ───────────────────────────────────────────────────────────

function crt(v: number): number {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}

export function approximately(a: number, b: number, precision = epsilon): boolean {
  return abs(a - b) <= precision;
}

export function between(v: number, m: number, M: number): boolean {
  return (m <= v && v <= M) || approximately(v, m) || approximately(v, M);
}

export function dist(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return sqrt(dx * dx + dy * dy);
}

export function lerpPt(r: number, v1: Point, v2: Point): Point {
  return { x: v1.x + r * (v2.x - v1.x), y: v1.y + r * (v2.y - v1.y) };
}

export function mapVal(v: number, ds: number, de: number, ts: number, te: number): number {
  return ts + ((v - ds) / (de - ds)) * (te - ts);
}

function angle(o: Point, v1: Point, v2: Point): number {
  const dx1 = v1.x - o.x, dy1 = v1.y - o.y,
    dx2 = v2.x - o.x, dy2 = v2.y - o.y;
  return atan2(dx1 * dy2 - dy1 * dx2, dx1 * dx2 + dy1 * dy2);
}

function numberSort(a: number, b: number) {
  return a - b;
}

// ─── Arc-length integration ──────────────────────────────────────────────────

function arcfn(t: number, derivativeFn: (t: number) => Point): number {
  const d = derivativeFn(t);
  return sqrt(d.x * d.x + d.y * d.y);
}

function arcLength(derivativeFn: (t: number) => Point): number {
  const z = 0.5;
  let sum = 0;
  for (let i = 0; i < Tvalues.length; i++) {
    sum += Cvalues[i] * arcfn(z * Tvalues[i] + z, derivativeFn);
  }
  return z * sum;
}

// ─── Curve evaluation (de Casteljau) ─────────────────────────────────────────

function compute(t: number, points: Point[]): Point {
  if (t === 0) return { ...points[0], t: 0 };
  const order = points.length - 1;
  if (t === 1) return { ...points[order], t: 1 };

  const mt = 1 - t;
  const p = points;

  if (order === 0) return { ...p[0], t };

  if (order === 1) {
    return { x: mt * p[0].x + t * p[1].x, y: mt * p[0].y + t * p[1].y, t };
  }

  if (order === 2) {
    const mt2 = mt * mt, t2 = t * t;
    return {
      x: mt2 * p[0].x + mt * t * 2 * p[1].x + t2 * p[2].x,
      y: mt2 * p[0].y + mt * t * 2 * p[1].y + t2 * p[2].y,
      t,
    };
  }

  if (order === 3) {
    const mt2 = mt * mt, t2 = t * t;
    const a = mt2 * mt, b = mt2 * t * 3, c = mt * t2 * 3, d = t * t2;
    return {
      x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
      y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
      t,
    };
  }

  const dCpts = points.map((pt) => ({ ...pt }));
  let len = dCpts.length;
  while (len > 1) {
    for (let i = 0; i < len - 1; i++) {
      dCpts[i] = {
        x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t,
        y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t,
      };
    }
    len--;
  }
  return { ...dCpts[0], t };
}

function derive(points: Point[]): Point[][] {
  const dpoints: Point[][] = [];
  let p = points;
  let d = p.length;
  let c = d - 1;
  while (d > 1) {
    const list: Point[] = [];
    for (let j = 0; j < c; j++) {
      list.push({
        x: c * (p[j + 1].x - p[j].x),
        y: c * (p[j + 1].y - p[j].y),
      });
    }
    dpoints.push(list);
    p = list;
    d--;
    c--;
  }
  return dpoints;
}

// ─── Root finding ────────────────────────────────────────────────────────────

function droots(p: number[]): number[] {
  if (p.length === 3) {
    const a = p[0], b = p[1], c = p[2], d = a - 2 * b + c;
    if (d !== 0) {
      const m1 = -sqrt(b * b - a * c), m2 = -a + b;
      return [-(m1 + m2) / d, -(-m1 + m2) / d];
    }
    if (b !== c && d === 0) return [(2 * b - c) / (2 * (b - c))];
    return [];
  }
  if (p.length === 2) {
    const a = p[0], b = p[1];
    if (a !== b) return [a / (a - b)];
    return [];
  }
  return [];
}

function align(points: Point[], line: { p1: Point; p2: Point }): Point[] {
  const tx = line.p1.x, ty = line.p1.y,
    a = -atan2(line.p2.y - ty, line.p2.x - tx);
  return points.map((v) => ({
    x: (v.x - tx) * cos(a) - (v.y - ty) * sin(a),
    y: (v.x - tx) * sin(a) + (v.y - ty) * cos(a),
  }));
}

function roots(points: Point[], line?: { p1: Point; p2: Point }): number[] {
  line = line || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
  const order = points.length - 1;
  const al = align(points, line);
  const reduce = (t: number) => 0 <= t && t <= 1;

  if (order === 2) {
    const a = al[0].y, b = al[1].y, c = al[2].y, d = a - 2 * b + c;
    if (d !== 0) {
      const m1 = -sqrt(b * b - a * c), m2 = -a + b;
      return [-(m1 + m2) / d, -(-m1 + m2) / d].filter(reduce);
    }
    if (b !== c && d === 0) return [(2 * b - c) / (2 * b - 2 * c)].filter(reduce);
    return [];
  }

  const pa = al[0].y, pb = al[1].y, pc = al[2].y, pd = al[3].y;
  const d = -pa + 3 * pb - 3 * pc + pd;
  let a = 3 * pa - 6 * pb + 3 * pc,
    b = -3 * pa + 3 * pb,
    c = pa;

  if (approximately(d, 0)) {
    if (approximately(a, 0)) {
      if (approximately(b, 0)) return [];
      return [-c / b].filter(reduce);
    }
    const q = sqrt(b * b - 4 * a * c), a2 = 2 * a;
    return [(q - b) / a2, (-b - q) / a2].filter(reduce);
  }

  a /= d; b /= d; c /= d;
  const p = (3 * b - a * a) / 3, p3 = p / 3,
    q = (2 * a * a * a - 9 * a * b + 27 * c) / 27, q2 = q / 2,
    discriminant = q2 * q2 + p3 * p3 * p3;

  if (discriminant < 0) {
    const mp3 = -p / 3, r = sqrt(mp3 * mp3 * mp3),
      t = -q / (2 * r),
      cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
      phi = acos(cosphi), crtr = crt(r), t1 = 2 * crtr;
    return [
      t1 * cos(phi / 3) - a / 3,
      t1 * cos((phi + tau) / 3) - a / 3,
      t1 * cos((phi + 2 * tau) / 3) - a / 3,
    ].filter(reduce);
  }

  if (discriminant === 0) {
    const u1 = q2 < 0 ? crt(-q2) : -crt(q2);
    return [2 * u1 - a / 3, -u1 - a / 3].filter(reduce);
  }

  const sd = sqrt(discriminant);
  return [crt(-q2 + sd) - crt(q2 + sd) - a / 3].filter(reduce);
}

function inflections(points: Point[]): number[] {
  if (points.length < 4) return [];
  const p = align(points, { p1: points[0], p2: points[points.length - 1] });
  const a = p[2].x * p[1].y, b = p[3].x * p[1].y,
    c = p[1].x * p[2].y, d = p[3].x * p[2].y;
  const v1 = 18 * (-3 * a + 2 * b + 3 * c - d),
    v2 = 18 * (3 * a - b - 3 * c),
    v3 = 18 * (c - a);

  if (approximately(v1, 0)) {
    if (!approximately(v2, 0)) {
      const t = -v3 / v2;
      if (0 <= t && t <= 1) return [t];
    }
    return [];
  }

  const d2 = 2 * v1;
  if (approximately(d2, 0)) return [];
  const trm = v2 * v2 - 4 * v1 * v3;
  if (trm < 0) return [];
  const sq = sqrt(trm);
  return [(sq - v2) / d2, -(v2 + sq) / d2].filter((r) => 0 <= r && r <= 1);
}

// ─── Curvature ───────────────────────────────────────────────────────────────

function curvatureAt(
  t: number, d1: Point[], d2: Point[], kOnly = false,
): CurvatureResult {
  const d = compute(t, d1);
  const dd = compute(t, d2);
  const num = d.x * dd.y - d.y * dd.x;
  const dnm = pow(d.x * d.x + d.y * d.y, 3 / 2);

  if (num === 0 || dnm === 0) return { k: 0, r: 0 };

  const k = num / dnm;
  const r = dnm / num;
  if (kOnly) return { k, r };

  const pk = curvatureAt(t - 0.001, d1, d2, true).k;
  const nk = curvatureAt(t + 0.001, d1, d2, true).k;
  return { k, r, dk: (nk - k + (k - pk)) / 2, adk: (abs(nk - k) + abs(k - pk)) / 2 };
}

// ─── Line-line intersection ──────────────────────────────────────────────────

function lli8(
  x1: number, y1: number, x2: number, y2: number,
  x3: number, y3: number, x4: number, y4: number,
): Point | false {
  const nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
  const d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (d === 0) return false;
  return { x: nx / d, y: ny / d };
}

function lli4(p1: Point, p2: Point, p3: Point, p4: Point): Point | false {
  return lli8(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
}

// ─── Bounding box helpers ────────────────────────────────────────────────────

export function bboxoverlap(b1: BBox, b2: BBox): boolean {
  for (const dim of ["x", "y"] as const) {
    const d = (b1[dim].size + b2[dim].size) / 2;
    if (abs(b1[dim].mid - b2[dim].mid) >= d) return false;
  }
  return true;
}

// ─── Arc center ──────────────────────────────────────────────────────────────

function getccenter(p1: Point, p2: Point, p3: Point) {
  const dx1 = p2.x - p1.x, dy1 = p2.y - p1.y,
    dx2 = p3.x - p2.x, dy2 = p3.y - p2.y;
  const dx1p = dx1 * cos(quart) - dy1 * sin(quart),
    dy1p = dx1 * sin(quart) + dy1 * cos(quart),
    dx2p = dx2 * cos(quart) - dy2 * sin(quart),
    dy2p = dx2 * sin(quart) + dy2 * cos(quart);
  const mx1 = (p1.x + p2.x) / 2, my1 = (p1.y + p2.y) / 2,
    mx2 = (p2.x + p3.x) / 2, my2 = (p2.y + p3.y) / 2;
  const arc = lli8(mx1, my1, mx1 + dx1p, my1 + dy1p, mx2, my2, mx2 + dx2p, my2 + dy2p);
  if (!arc) return { x: 0, y: 0, r: 0, s: 0, m: 0, e: 0 };
  const r = dist(arc, p1);
  let s = atan2(p1.y - arc.y, p1.x - arc.x);
  const m = atan2(p2.y - arc.y, p2.x - arc.x);
  let e = atan2(p3.y - arc.y, p3.x - arc.x);

  if (s < e) {
    if (s > m || m > e) s += tau;
    if (s > e) { const tmp = e; e = s; s = tmp; }
  } else {
    if (e < m && m < s) { const tmp = e; e = s; s = tmp; }
    else e += tau;
  }

  return { x: arc.x, y: arc.y, r, s, m, e };
}

// ─── Projection / ABC helpers ────────────────────────────────────────────────

function abcratio(t: number, n: number): number | false {
  if (n !== 2 && n !== 3) return false;
  if (t === 0 || t === 1) return t;
  const bottom = pow(t, n) + pow(1 - t, n);
  return abs((bottom - 1) / bottom);
}

function projectionratio(t: number, n: number): number | false {
  if (n !== 2 && n !== 3) return false;
  if (t === 0 || t === 1) return t;
  const top = pow(1 - t, n);
  return top / (pow(t, n) + top);
}

// ─── Bezier-dependent utility functions ──────────────────────────────────────

function getminmax(curve: Bezier, d: "x" | "y", list: number[]): MinMax {
  if (!list || list.length === 0) return { min: 0, mid: 0, max: 0, size: 0 };
  let lo = nMax, hi = nMin;
  const values = [...list];
  if (!values.includes(0)) values.unshift(0);
  if (!values.includes(1)) values.push(1);
  for (const t of values) {
    const c = curve.get(t);
    if (c[d] < lo) lo = c[d];
    if (c[d] > hi) hi = c[d];
  }
  return { min: lo, mid: (lo + hi) / 2, max: hi, size: hi - lo };
}

export function makeline(p1: Point, p2: Point, ctx?: KlintContext): Bezier {
  return new Bezier([p1, { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 }, p2], ctx);
}

export function findbbox(sections: Bezier[]): BBox {
  let mx = nMax, my = nMax, MX = nMin, MY = nMin;
  for (const s of sections) {
    const bb = s.bbox();
    if (mx > bb.x.min) mx = bb.x.min;
    if (my > bb.y.min) my = bb.y.min;
    if (MX < bb.x.max) MX = bb.x.max;
    if (MY < bb.y.max) MY = bb.y.max;
  }
  return {
    x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
    y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my },
  };
}

export function pairiteration(c1: Bezier, c2: Bezier, threshold = 0.5): string[] {
  const c1b = c1.bbox(), c2b = c2.bbox(), r = 100000;

  if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
    return [
      (((r * (c1._t1 + c1._t2)) / 2) | 0) / r +
      "/" +
      (((r * (c2._t1 + c2._t2)) / 2) | 0) / r,
    ];
  }

  const cc1 = c1.split(0.5);
  const cc2 = c2.split(0.5);
  const pairs = [
    { left: cc1.left, right: cc2.left },
    { left: cc1.left, right: cc2.right },
    { left: cc1.right, right: cc2.right },
    { left: cc1.right, right: cc2.left },
  ].filter((pair) => bboxoverlap(pair.left.bbox(), pair.right.bbox()));

  if (pairs.length === 0) return [];

  const results: string[] = [];
  for (const pair of pairs) {
    results.push(...pairiteration(pair.left, pair.right, threshold));
  }
  return Array.from(new Set(results));
}

export function makeshape(forward: Bezier, back: Bezier, threshold?: number): Shape {
  const ctx = forward._ctx;
  const start = makeline(back.points[back.points.length - 1], forward.points[0], ctx);
  const end = makeline(forward.points[forward.points.length - 1], back.points[0], ctx);
  const bbox = findbbox([start, forward, back, end]);
  const shape: Shape = {
    startcap: start,
    forward,
    back,
    endcap: end,
    bbox,
    intersections: (s2: Shape) =>
      shapeintersections(shape, shape.bbox, s2, s2.bbox, threshold),
  };
  return shape;
}

function shapeintersections(
  s1: Shape, bbox1: BBox, s2: Shape, bbox2: BBox, threshold?: number,
): ShapeIntersection[] {
  if (!bboxoverlap(bbox1, bbox2)) return [];
  const intersections: ShapeIntersection[] = [];
  const a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
  const a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
  for (const l1 of a1) {
    if (l1.virtual) continue;
    for (const l2 of a2) {
      if (l2.virtual) continue;
      const iss = l1.intersects(l2, threshold) as ShapeIntersection;
      if (iss.length > 0) {
        iss.c1 = l1;
        iss.c2 = l2;
        iss.s1 = s1;
        iss.s2 = s2;
        intersections.push(iss);
      }
    }
  }
  return intersections;
}

// ─── Bezier class ────────────────────────────────────────────────────────────

export class Bezier {
  points: Point[];
  order: number;
  clockwise: boolean;
  _lut: Point[];
  _t1: number;
  _t2: number;
  _linear: boolean;
  _ctx?: KlintContext;

  private dpoints: Point[][];
  private _bboxCache?: BBox;
  private _extremaCache?: { x: number[]; y: number[]; values: number[] };

  constructor(coords: Point[] | number[], ctx?: KlintContext) {
    let points: Point[];
    if (typeof coords[0] === "object") {
      points = (coords as Point[]).map((p) => ({ x: p.x, y: p.y }));
    } else {
      const args = coords as number[];
      points = [];
      for (let i = 0; i < args.length; i += 2) {
        points.push({ x: args[i], y: args[i + 1] });
      }
    }

    this.points = points;
    this.order = points.length - 1;
    this._t1 = 0;
    this._t2 = 1;
    this._lut = [];
    this._ctx = ctx;

    const al = align(points, { p1: points[0], p2: points[this.order] });
    const baseline = dist(points[0], points[this.order]);
    this._linear = al.reduce((t, p) => t + abs(p.y), 0) < baseline / 50;

    this.dpoints = derive(this.points);
    this.clockwise = angle(points[0], points[this.order], points[1]) > 0;
  }

  private _make(coords: Point[]): Bezier {
    return new Bezier(coords, this._ctx);
  }

  private _k(K?: KlintContext): KlintContext {
    const ctx = K ?? this._ctx;
    if (!ctx) throw new Error("No KlintContext — pass to constructor or draw method");
    return ctx;
  }

  private _resolveDraw(args: unknown[]): [KlintContext, unknown[]] {
    const first = args[0];
    if (first != null && typeof first === "object") {
      return [this._k(first as KlintContext), args.slice(1)];
    }
    return [this._k(), args];
  }

  // ─── Static constructors ──────────────────────────────────────────────

  static quadratic(p1: Point, cp: Point, p2: Point, ctx?: KlintContext): Bezier {
    return new Bezier([p1, cp, p2], ctx);
  }

  static cubic(p1: Point, cp1: Point, cp2: Point, p2: Point, ctx?: KlintContext): Bezier {
    return new Bezier([p1, cp1, cp2, p2], ctx);
  }

  static quadraticFromPoints(p1: Point, p2: Point, p3: Point, t = 0.5, ctx?: KlintContext): Bezier {
    if (t === 0) return new Bezier([p2, p2, p3], ctx);
    if (t === 1) return new Bezier([p1, p2, p2], ctx);
    const abc = Bezier.getABC(2, p1, p2, p3, t);
    return new Bezier([p1, abc.A, p3], ctx);
  }

  static cubicFromPoints(S: Point, B: Point, E: Point, t = 0.5, d1?: number, ctx?: KlintContext): Bezier {
    const abc = Bezier.getABC(3, S, B, E, t);
    if (d1 === undefined) d1 = dist(B, abc.C);
    const d2 = (d1 * (1 - t)) / t;
    const selen = dist(S, E), lx = (E.x - S.x) / selen, ly = (E.y - S.y) / selen;
    const e1 = { x: B.x - d1 * lx, y: B.y - d1 * ly },
      e2 = { x: B.x + d2 * lx, y: B.y + d2 * ly }, A = abc.A;
    const v1 = { x: A.x + (e1.x - A.x) / (1 - t), y: A.y + (e1.y - A.y) / (1 - t) },
      v2 = { x: A.x + (e2.x - A.x) / t, y: A.y + (e2.y - A.y) / t };
    const nc1 = { x: S.x + (v1.x - S.x) / t, y: S.y + (v1.y - S.y) / t },
      nc2 = { x: E.x + (v2.x - E.x) / (1 - t), y: E.y + (v2.y - E.y) / (1 - t) };
    return new Bezier([S, nc1, nc2, E], ctx);
  }

  static getABC(order: number, S: Point, B: Point, E: Point, t = 0.5) {
    const u = projectionratio(t, order) as number, um = 1 - u,
      C = { x: u * S.x + um * E.x, y: u * S.y + um * E.y },
      s = abcratio(t, order) as number,
      A = { x: B.x + (B.x - C.x) / s, y: B.y + (B.y - C.y) / s };
    return { A, B, C, S, E };
  }

  // ─── Core ─────────────────────────────────────────────────────────────

  update(): void {
    this._lut = [];
    this._bboxCache = undefined;
    this._extremaCache = undefined;
    this.dpoints = derive(this.points);
    this.clockwise = angle(this.points[0], this.points[this.order], this.points[1]) > 0;
  }

  get(t: number): Point {
    return compute(t, this.points);
  }

  derivative(t: number): Point {
    return compute(t, this.dpoints[0]);
  }

  dderivative(t: number): Point {
    return compute(t, this.dpoints[1]);
  }

  normal(t: number): Point {
    const d = this.derivative(t);
    const q = sqrt(d.x * d.x + d.y * d.y);
    return { t, x: -d.y / q, y: d.x / q };
  }

  length(): number {
    return arcLength(this.derivative.bind(this));
  }

  getLUT(steps = 100): Point[] {
    if (this._lut.length === steps + 1) return this._lut;
    this._lut = [];
    for (let i = 0; i <= steps; i++) {
      this._lut.push(this.get(i / steps));
    }
    return this._lut;
  }

  // ─── Analysis ─────────────────────────────────────────────────────────

  curvature(t: number): CurvatureResult {
    return curvatureAt(t, this.dpoints[0], this.dpoints[1]);
  }

  inflections(): number[] {
    return inflections(this.points);
  }

  extrema(): { x: number[]; y: number[]; values: number[] } {
    if (this._extremaCache) return this._extremaCache;
    const result: { x: number[]; y: number[]; values: number[] } = { x: [], y: [], values: [] };
    let allRoots: number[] = [];
    for (const dim of ["x", "y"] as const) {
      let p = this.dpoints[0].map((v) => v[dim]);
      result[dim] = droots(p);
      if (this.order === 3) {
        p = this.dpoints[1].map((v) => v[dim]);
        result[dim] = result[dim].concat(droots(p));
      }
      result[dim] = result[dim].filter((t) => t >= 0 && t <= 1);
      allRoots = allRoots.concat(result[dim].sort(numberSort));
    }
    result.values = Array.from(new Set(allRoots.sort(numberSort)));
    this._extremaCache = result;
    return result;
  }

  bbox(): BBox {
    if (this._bboxCache) return this._bboxCache;
    const ext = this.extrema();
    this._bboxCache = { x: getminmax(this, "x", ext.x), y: getminmax(this, "y", ext.y) };
    return this._bboxCache;
  }

  overlaps(curve: Bezier): boolean {
    return bboxoverlap(this.bbox(), curve.bbox());
  }

  simple(): boolean {
    if (this.order === 3) {
      const a1 = angle(this.points[0], this.points[3], this.points[1]);
      const a2 = angle(this.points[0], this.points[3], this.points[2]);
      if ((a1 > 0 && a2 < 0) || (a1 < 0 && a2 > 0)) return false;
    }
    const n1 = this.normal(0);
    const n2 = this.normal(1);
    return abs(acos(n1.x * n2.x + n1.y * n2.y)) < PI / 3;
  }

  project(point: Point): Point & { t: number; d: number } {
    const LUT = this.getLUT();
    const l = LUT.length - 1;
    let mdist = Infinity, mpos = 0;
    for (let i = 0; i < LUT.length; i++) {
      const d = dist(LUT[i], point);
      if (d < mdist) { mdist = d; mpos = i; }
    }
    const t1 = max(0, (mpos - 1) / l);
    const t2 = min(1, (mpos + 1) / l);
    const step = 0.1 / l;

    let ft = t1;
    mdist += 1;
    for (let t = t1; t < t2 + step; t += step) {
      const p = this.get(t);
      const d = dist(point, p);
      if (d < mdist) { mdist = d; ft = t; }
    }
    ft = ft < 0 ? 0 : ft > 1 ? 1 : ft;
    const p = this.get(ft);
    return { x: p.x, y: p.y, t: ft, d: mdist };
  }

  // ─── Splitting & reducing ─────────────────────────────────────────────

  hull(t: number): Point[] {
    let p = this.points;
    const q: Point[] = [...p];
    while (p.length > 1) {
      const _p: Point[] = [];
      for (let i = 0; i < p.length - 1; i++) {
        const pt = lerpPt(t, p[i], p[i + 1]);
        q.push(pt);
        _p.push(pt);
      }
      p = _p;
    }
    return q;
  }

  split(t1: number, t2?: number): { left: Bezier; right: Bezier; span: Point[] } {
    if (t1 === 0 && t2 !== undefined) return this.split(t2).left as any;
    if (t2 === 1) return this.split(t1).right as any;

    const q = this.hull(t1);
    const result = {
      left:
        this.order === 2
          ? this._make([q[0], q[3], q[5]])
          : this._make([q[0], q[4], q[7], q[9]]),
      right:
        this.order === 2
          ? this._make([q[5], q[4], q[2]])
          : this._make([q[9], q[8], q[6], q[3]]),
      span: q,
    };

    result.left._t1 = mapVal(0, 0, 1, this._t1, this._t2);
    result.left._t2 = mapVal(t1, 0, 1, this._t1, this._t2);
    result.right._t1 = mapVal(t1, 0, 1, this._t1, this._t2);
    result.right._t2 = mapVal(1, 0, 1, this._t1, this._t2);

    if (t2 === undefined) return result;
    const mapped = mapVal(t2, t1, 1, 0, 1);
    return result.right.split(mapped).left as any;
  }

  raise(): Bezier {
    const p = this.points, np: Point[] = [p[0]], k = p.length;
    for (let i = 1; i < k; i++) {
      np[i] = {
        x: ((k - i) / k) * p[i].x + (i / k) * p[i - 1].x,
        y: ((k - i) / k) * p[i].y + (i / k) * p[i - 1].y,
      };
    }
    np[k] = p[k - 1];
    return this._make(np);
  }

  reduce(): Bezier[] {
    let t1 = 0, t2 = 0;
    const step = 0.01;
    const pass1: Bezier[] = [];
    const pass2: Bezier[] = [];

    let ext = this.extrema().values;
    if (!ext.includes(0)) ext = [0, ...ext];
    if (!ext.includes(1)) ext.push(1);

    for (let i = 0; i < ext.length - 1; i++) {
      t1 = ext[i]; t2 = ext[i + 1];
      const segment = this.split(t1, t2) as unknown as Bezier;
      segment._t1 = t1; segment._t2 = t2;
      pass1.push(segment);
    }

    for (const p1 of pass1) {
      t1 = 0; t2 = 0;
      while (t2 <= 1) {
        for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
          const segment = p1.split(t1, t2) as unknown as Bezier;
          if (!segment.simple()) {
            t2 -= step;
            if (abs(t1 - t2) < step) return [];
            const seg = p1.split(t1, t2) as unknown as Bezier;
            seg._t1 = mapVal(t1, 0, 1, p1._t1, p1._t2);
            seg._t2 = mapVal(t2, 0, 1, p1._t1, p1._t2);
            pass2.push(seg);
            t1 = t2;
            break;
          }
        }
      }
      if (t1 < 1) {
        const seg = p1.split(t1, 1) as unknown as Bezier;
        seg._t1 = mapVal(t1, 0, 1, p1._t1, p1._t2);
        seg._t2 = p1._t2;
        pass2.push(seg);
      }
    }
    return pass2;
  }

  // ─── Offset, Scale & Outline ──────────────────────────────────────────

  private translate(v: Point, d1: number, d2: number): Bezier {
    const o = this.order;
    return this._make(
      this.points.map((p, i) => {
        const d = (1 - i / o) * d1 + (i / o) * d2;
        return { x: p.x + v.x * d, y: p.y + v.y * d };
      }),
    );
  }

  scale(d: number | ((t: number) => number)): Bezier {
    const order = this.order;
    let distanceFn: ((t: number) => number) | false = false;

    if (typeof d === "function") {
      distanceFn = d;
      if (order === 2) return this.raise().scale(distanceFn);
    }

    if (this._linear) {
      return this.translate(
        this.normal(0),
        distanceFn ? distanceFn(0) : (d as number),
        distanceFn ? distanceFn(1) : (d as number),
      );
    }

    const r1 = distanceFn ? distanceFn(0) : (d as number);
    const r2 = distanceFn ? distanceFn(1) : (d as number);
    const v: OffsetPoint[] = [this._offset(0, 10), this._offset(1, 10)];
    const np: Point[] = [];
    const o = lli4(v[0], v[0].c, v[1], v[1].c);
    if (!o) throw new Error("Cannot scale this curve. Try reducing it first.");

    const points = this.points;
    [0, 1].forEach((t) => {
      np[t * order] = {
        x: points[t * order].x + (t ? r2 : r1) * v[t].n.x,
        y: points[t * order].y + (t ? r2 : r1) * v[t].n.y,
      };
    });

    if (!distanceFn) {
      [0, 1].forEach((t) => {
        if (order === 2 && t) return;
        const p = np[t * order];
        const dv = this.derivative(t);
        const p2 = { x: p.x + dv.x, y: p.y + dv.y };
        const intersection = lli4(p, p2, o as Point, points[t + 1]);
        if (intersection) np[t + 1] = intersection;
      });
      return this._make(np);
    }

    const cw = this.clockwise;
    const fn = distanceFn as (t: number) => number;
    [0, 1].forEach((t) => {
      if (order === 2 && t) return;
      const p = points[t + 1];
      const ov = { x: p.x - (o as Point).x, y: p.y - (o as Point).y };
      let rc = fn((t + 1) / order);
      if (!cw) rc = -rc;
      const m = sqrt(ov.x * ov.x + ov.y * ov.y);
      np[t + 1] = { x: p.x + (rc * ov.x) / m, y: p.y + (rc * ov.y) / m };
    });
    return this._make(np);
  }

  private _offset(t: number, d: number): OffsetPoint {
    const c = this.get(t);
    const n = this.normal(t);
    return { c, n, x: c.x + n.x * d, y: c.y + n.y * d };
  }

  offset(d: number): Bezier[];
  offset(t: number, d: number): OffsetPoint;
  offset(t: number, d?: number): Bezier[] | OffsetPoint {
    if (d !== undefined) return this._offset(t, d);
    if (this._linear) {
      const nv = this.normal(0);
      return [this._make(this.points.map((p) => ({ x: p.x + t * nv.x, y: p.y + t * nv.y })))];
    }
    return this.reduce().map((s) => (s._linear ? s.offset(t)[0] : s.scale(t)));
  }

  outline(d1: number, d2?: number, d3?: number, d4?: number): Bezier[] {
    d2 = d2 === undefined ? d1 : d2;

    if (this._linear) {
      const n = this.normal(0);
      const start = this.points[0], end = this.points[this.points.length - 1];
      if (d3 === undefined) { d3 = d1; d4 = d2; }
      const fs = { x: start.x + n.x * d1, y: start.y + n.y * d1 };
      const fe = { x: end.x + n.x * d3, y: end.y + n.y * d3 };
      const fmid = { x: (fs.x + fe.x) / 2, y: (fs.y + fe.y) / 2 };
      const bs = { x: start.x - n.x * d2, y: start.y - n.y * d2 };
      const be = { x: end.x - n.x * d4!, y: end.y - n.y * d4! };
      const bmid = { x: (bs.x + be.x) / 2, y: (bs.y + be.y) / 2 };
      return [makeline(bs, fs, this._ctx), this._make([fs, fmid, fe]), makeline(fe, be, this._ctx), this._make([be, bmid, bs])];
    }

    const reduced = this.reduce();
    const len = reduced.length;
    const fcurves: Bezier[] = [];
    let bcurves: Bezier[] = [];
    let alen = 0;
    const tlen = this.length();
    const graduated = d3 !== undefined && d4 !== undefined;

    function linearDist(s: number, e: number, tl: number, al: number, sl: number) {
      const dd = e - s;
      const lo = s + (al / tl) * dd;
      const hi = s + ((al + sl) / tl) * dd;
      return (v: number) => mapVal(v, 0, 1, lo, hi);
    }

    for (const segment of reduced) {
      const slen = segment.length();
      if (graduated) {
        fcurves.push(segment.scale(linearDist(d1, d3!, tlen, alen, slen)));
        bcurves.push(segment.scale(linearDist(-d2, -d4!, tlen, alen, slen)));
      } else {
        fcurves.push(segment.scale(d1));
        bcurves.push(segment.scale(-d2));
      }
      alen += slen;
    }

    bcurves = bcurves
      .map((s) => {
        const p = s.points;
        s.points = p.length === 4 ? [p[3], p[2], p[1], p[0]] : [p[2], p[1], p[0]];
        s.update();
        return s;
      })
      .reverse();

    const fs = fcurves[0].points[0];
    const fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1];
    const bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1];
    const be = bcurves[0].points[0];

    return [makeline(bs, fs, this._ctx), ...fcurves, makeline(fe, be, this._ctx), ...bcurves];
  }

  outlineshapes(d1: number, d2?: number, threshold?: number): Shape[] {
    d2 = d2 ?? d1;
    const outlineSegments = this.outline(d1, d2);
    const shapes: Shape[] = [];
    const len = outlineSegments.length;
    const half = len / 2;
    for (let i = 1; i < half; i++) {
      const shape = makeshape(outlineSegments[i], outlineSegments[len - i], threshold);
      shape.startcap.virtual = i > 1;
      shape.endcap.virtual = i < half - 1;
      shapes.push(shape);
    }
    return shapes;
  }

  // ─── Intersections ────────────────────────────────────────────────────

  intersects(curve?: Bezier | { p1: Point; p2: Point }, threshold?: number): string[] {
    if (!curve) return this.selfintersects(threshold);
    if ("p1" in curve && "p2" in curve) return this.lineIntersects(curve);
    return this.curveIntersects(this.reduce(), (curve as Bezier).reduce(), threshold);
  }

  private lineIntersects(line: { p1: Point; p2: Point }): string[] {
    const mx = min(line.p1.x, line.p2.x), my = min(line.p1.y, line.p2.y),
      MX = max(line.p1.x, line.p2.x), MY = max(line.p1.y, line.p2.y);
    return roots(this.points, line)
      .filter((t) => {
        const p = this.get(t);
        return between(p.x, mx, MX) && between(p.y, my, MY);
      })
      .map((t) => `${t}`);
  }

  private selfintersects(threshold?: number): string[] {
    const reduced = this.reduce();
    const results: string[] = [];
    for (let i = 0; i < reduced.length - 2; i++) {
      const left = reduced.slice(i, i + 1);
      const right = reduced.slice(i + 2);
      results.push(...this.curveIntersects(left, right, threshold));
    }
    return results;
  }

  private curveIntersects(c1: Bezier[], c2: Bezier[], threshold?: number): string[] {
    const pairs: { left: Bezier; right: Bezier }[] = [];
    for (const l of c1) {
      for (const r of c2) {
        if (l.overlaps(r)) pairs.push({ left: l, right: r });
      }
    }
    const results: string[] = [];
    for (const pair of pairs) {
      results.push(...pairiteration(pair.left, pair.right, threshold));
    }
    return Array.from(new Set(results));
  }

  // ─── Arc approximation ────────────────────────────────────────────────

  arcs(errorThreshold = 0.5): Arc[] {
    return this._iterateArcs(errorThreshold, []);
  }

  private _arcError(pc: Point, np1: Point, s: number, e: number): number {
    const q = (e - s) / 4;
    const c1 = this.get(s + q);
    const c2 = this.get(e - q);
    const ref = dist(pc, np1);
    return abs(dist(pc, c1) - ref) + abs(dist(pc, c2) - ref);
  }

  private _iterateArcs(errorThreshold: number, circles: Arc[]): Arc[] {
    let t_s = 0, t_e = 1, safety: number;

    do {
      safety = 0;
      t_e = 1;
      const np1 = this.get(t_s);
      let np2: Point, np3: Point;
      let arc: any, prev_arc: any;
      let curr_good = false, prev_good = false, done: boolean;
      let t_m: number, prev_e = 1;

      do {
        prev_good = curr_good;
        prev_arc = arc;
        t_m = (t_s + t_e) / 2;
        safety++;
        np2 = this.get(t_m);
        np3 = this.get(t_e);
        arc = getccenter(np1, np2, np3);
        arc.interval = { start: t_s, end: t_e };
        curr_good = this._arcError(arc, np1, t_s, t_e) <= errorThreshold;
        done = prev_good && !curr_good;
        if (!done) prev_e = t_e;
        if (curr_good) {
          if (t_e >= 1) { arc.interval.end = prev_e = 1; prev_arc = arc; break; }
          t_e = t_e + (t_e - t_s) / 2;
        } else {
          t_e = t_m;
        }
      } while (!done && safety < 100);

      if (safety >= 100) break;
      prev_arc = prev_arc || arc;
      circles.push(prev_arc);
      t_s = prev_e;
    } while (t_e < 1);

    return circles;
  }

  // ─── Conversion ───────────────────────────────────────────────────────

  toSVG(): string {
    const p = this.points;
    const parts = ["M", p[0].x, p[0].y, this.order === 2 ? "Q" : "C"];
    for (let i = 1; i < p.length; i++) parts.push(p[i].x as any, p[i].y as any);
    return parts.join(" ");
  }

  toPath2D(): Path2D {
    const path = new Path2D();
    const p = this.points;
    path.moveTo(p[0].x, p[0].y);
    if (this.order === 2) {
      path.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
    } else {
      path.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
    }
    return path;
  }

  static toPath2D(curves: Bezier[]): Path2D {
    const path = new Path2D();
    if (curves.length === 0) return path;
    path.moveTo(curves[0].points[0].x, curves[0].points[0].y);
    for (const c of curves) {
      const p = c.points;
      if (c.order === 1 || c._linear) {
        path.lineTo(p[p.length - 1].x, p[p.length - 1].y);
      } else if (c.order === 2) {
        path.quadraticCurveTo(p[1].x, p[1].y, p[2].x, p[2].y);
      } else {
        path.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
      }
    }
    return path;
  }

  // ─── Klint drawing helpers ────────────────────────────────────────────

  draw(K?: KlintContext): void {
    this._k(K).stroke(this.toPath2D());
  }

  drawFilled(K?: KlintContext): void {
    this._k(K).fill(this.toPath2D());
  }

  drawSkeleton(K: KlintContext, pointSize?: number): void;
  drawSkeleton(pointSize?: number): void;
  drawSkeleton(...args: unknown[]): void {
    const [ctx, rest] = this._resolveDraw(args);
    const ps = (rest[0] as number) ?? 3;
    const p = this.points;
    ctx.push();
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y);
    ctx.stroke();
    for (const pt of p) ctx.circle(pt.x, pt.y, ps);
    ctx.pop();
  }

  drawNormals(K: KlintContext, count?: number, length?: number): void;
  drawNormals(count?: number, length?: number): void;
  drawNormals(...args: unknown[]): void {
    const [ctx, rest] = this._resolveDraw(args);
    const cnt = (rest[0] as number) ?? 10;
    const len = (rest[1] as number) ?? 20;
    ctx.push();
    for (let i = 0; i <= cnt; i++) {
      const t = i / cnt;
      const p = this.get(t);
      const n = this.normal(t);
      ctx.line(p.x, p.y, p.x + n.x * len, p.y + n.y * len);
    }
    ctx.pop();
  }

  drawOutline(K: KlintContext, d1: number, d2?: number, d3?: number, d4?: number): void;
  drawOutline(d1: number, d2?: number, d3?: number, d4?: number): void;
  drawOutline(...args: unknown[]): void {
    const [ctx, rest] = this._resolveDraw(args);
    const path = Bezier.toPath2D(
      this.outline(rest[0] as number, rest[1] as number, rest[2] as number, rest[3] as number),
    );
    path.closePath();
    ctx.stroke(path);
  }

  drawOutlineFilled(K: KlintContext, d1: number, d2?: number, d3?: number, d4?: number): void;
  drawOutlineFilled(d1: number, d2?: number, d3?: number, d4?: number): void;
  drawOutlineFilled(...args: unknown[]): void {
    const [ctx, rest] = this._resolveDraw(args);
    const path = Bezier.toPath2D(
      this.outline(rest[0] as number, rest[1] as number, rest[2] as number, rest[3] as number),
    );
    path.closePath();
    ctx.fill(path);
  }

  drawArcs(K: KlintContext, errorThreshold?: number): void;
  drawArcs(errorThreshold?: number): void;
  drawArcs(...args: unknown[]): void {
    const [ctx, rest] = this._resolveDraw(args);
    const threshold = (rest[0] as number) ?? 0.5;
    ctx.push();
    for (const arc of this.arcs(threshold)) {
      ctx.disk(arc.x, arc.y, arc.r, arc.s, arc.e, false);
    }
    ctx.pop();
  }
}
