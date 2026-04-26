/**
 * Polyline Plugin for Klint
 *
 * A continuous path composed of Bezier segments (cubic, quadratic, or linear).
 * Provides the same API surface as Bezier but operating over chained segments
 * with arc-length parameterized global t ∈ [0, 1].
 *
 * Includes path smoothing (Hobby-like, from paper.js) and
 * path simplification (Schneider's algorithm, from paper.js).
 *
 * @example
 * ```tsx
 * import { Bezier, Polyline } from "@shopify/klint/plugins";
 *
 * const draw = (K) => {
 *   const pts = [{ x: 50, y: 300 }, { x: 200, y: 50 }, { x: 350, y: 250 }, { x: 500, y: 100 }];
 *   const path = Polyline.fromPoints(pts);
 *   const smooth = path.smooth();
 *   smooth.draw(K);
 *   smooth.drawOutline(K, 8);
 * };
 * ```
 */

import { KlintContext } from "../Klint";
import {
  type Point,
  type BBox,
  type CurvatureResult,
  type Shape,
  dist, mapVal,
  Bezier,
  makeline, findbbox, pairiteration, makeshape,
} from "./Bezier";

const { sqrt, abs } = Math;

// ─── Smooth ──────────────────────────────────────────────────────────────────

export function smoothPath(
  points: Point[],
  closed = false,
  factor = 0.4,
): Bezier[] {
  if (points.length < 2) throw new Error("Need at least 2 points to smooth");
  if (points.length === 2) return [makeline(points[0], points[1])];

  const n = points.length;
  const segments: Bezier[] = [];

  if (closed) {
    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const curr = points[i];
      const next = points[(i + 1) % n];
      const nextNext = points[(i + 2) % n];

      const d1 = dist(prev, curr);
      const d2 = dist(curr, next);
      const d3 = dist(next, nextNext);

      const cp1 = smoothControlPoint(prev, curr, next, d1, d2, factor, false);
      const cp2 = smoothControlPoint(curr, next, nextNext, d2, d3, factor, true);

      segments.push(new Bezier([curr, cp1, cp2, next]));
    }
  } else {
    for (let i = 0; i < n - 1; i++) {
      const prev = i > 0 ? points[i - 1] : reflect(points[1], points[0]);
      const curr = points[i];
      const next = points[i + 1];
      const nextNext =
        i + 2 < n ? points[i + 2] : reflect(points[n - 2], points[n - 1]);

      const d1 = dist(prev, curr);
      const d2 = dist(curr, next);
      const d3 = dist(next, nextNext);

      const cp1 = smoothControlPoint(prev, curr, next, d1, d2, factor, false);
      const cp2 = smoothControlPoint(curr, next, nextNext, d2, d3, factor, true);

      segments.push(new Bezier([curr, cp1, cp2, next]));
    }
  }

  return segments;
}

function reflect(p: Point, around: Point): Point {
  return { x: 2 * around.x - p.x, y: 2 * around.y - p.y };
}

function smoothControlPoint(
  prev: Point, curr: Point, next: Point,
  d1: number, d2: number,
  factor: number, isIncoming: boolean,
): Point {
  if (d1 < 1e-10) d1 = 1;
  if (d2 < 1e-10) d2 = 1;

  const vx = next.x - prev.x;
  const vy = next.y - prev.y;

  if (isIncoming) {
    const ratio = (factor * d2) / (d1 + d2);
    return { x: next.x - vx * ratio, y: next.y - vy * ratio };
  }
  const ratio = (factor * d1) / (d1 + d2);
  return { x: curr.x + vx * ratio, y: curr.y + vy * ratio };
}

// ─── Simplify (Schneider's algorithm) ────────────────────────────────────────

export function simplifyPath(
  points: Point[],
  tolerance = 2.5,
): Bezier[] {
  if (points.length < 2) throw new Error("Need at least 2 points");
  if (points.length === 2) return [makeline(points[0], points[1])];

  const cleaned: Point[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    if (dist(points[i], cleaned[cleaned.length - 1]) > 0.01) {
      cleaned.push(points[i]);
    }
  }
  if (cleaned.length < 2) return [makeline(cleaned[0], cleaned[0])];

  const tan1 = estimateTangent(cleaned, 0, true);
  const tan2 = estimateTangent(cleaned, cleaned.length - 1, false);
  const segments = fitCubic(cleaned, tan1, tan2, tolerance);

  return segments.length === 0
    ? cleaned.slice(0, -1).map((p, i) => makeline(p, cleaned[i + 1]))
    : segments;
}

function estimateTangent(points: Point[], index: number, forward: boolean): Point {
  const n = points.length;
  let dx = 0, dy = 0;
  const span = Math.min(3, forward ? n - 1 - index : index);

  if (forward) {
    for (let i = 1; i <= span; i++) {
      const next = points[Math.min(index + i, n - 1)];
      dx += next.x - points[index].x;
      dy += next.y - points[index].y;
    }
  } else {
    for (let i = 1; i <= span; i++) {
      const prev = points[Math.max(index - i, 0)];
      dx += points[index].x - prev.x;
      dy += points[index].y - prev.y;
    }
  }

  const len = sqrt(dx * dx + dy * dy);
  if (len < 1e-10) return { x: 1, y: 0 };
  return { x: dx / len, y: dy / len };
}

function fitCubic(
  points: Point[], tan1: Point, tan2: Point, tolerance: number,
): Bezier[] {
  const n = points.length;

  if (n === 2) {
    const d = dist(points[0], points[1]) / 3;
    return [
      new Bezier([
        points[0],
        { x: points[0].x + tan1.x * d, y: points[0].y + tan1.y * d },
        { x: points[1].x - tan2.x * d, y: points[1].y - tan2.y * d },
        points[1],
      ]),
    ];
  }

  const u = chordLengthParameterize(points);
  const bez = generateBezier(points, u, tan1, tan2);
  const { maxError, splitIndex } = computeMaxError(points, bez, u);

  if (maxError < tolerance) return [bez];

  if (maxError < tolerance * tolerance) {
    let uPrime = u;
    for (let i = 0; i < 4; i++) {
      uPrime = reparameterize(points, uPrime, bez);
      const bez2 = generateBezier(points, uPrime, tan1, tan2);
      const err2 = computeMaxError(points, bez2, uPrime);
      if (err2.maxError < tolerance) return [bez2];
    }
  }

  const tanCenter = estimateTangent(points, splitIndex, true);
  const left = fitCubic(points.slice(0, splitIndex + 1), tan1, tanCenter, tolerance);
  const tanCenter2 = estimateTangent(points, splitIndex, false);
  const right = fitCubic(points.slice(splitIndex), tanCenter2, tan2, tolerance);

  return [...left, ...right];
}

function chordLengthParameterize(points: Point[]): number[] {
  const u = [0];
  for (let i = 1; i < points.length; i++) {
    u.push(u[i - 1] + dist(points[i], points[i - 1]));
  }
  const total = u[u.length - 1];
  if (total > 0) {
    for (let i = 1; i < u.length; i++) u[i] /= total;
  }
  u[u.length - 1] = 1;
  return u;
}

function generateBezier(
  points: Point[], u: number[], tan1: Point, tan2: Point,
): Bezier {
  const n = points.length;
  const first = points[0], last = points[n - 1];

  const A: [Point, Point][] = [];
  for (let i = 0; i < n; i++) {
    const t = u[i], mt = 1 - t;
    const b1 = 3 * mt * mt * t, b2 = 3 * mt * t * t;
    A.push([
      { x: tan1.x * b1, y: tan1.y * b1 },
      { x: tan2.x * b2, y: tan2.y * b2 },
    ]);
  }

  let C00 = 0, C01 = 0, C11 = 0, X0 = 0, X1 = 0;

  for (let i = 0; i < n; i++) {
    C00 += A[i][0].x * A[i][0].x + A[i][0].y * A[i][0].y;
    C01 += A[i][0].x * A[i][1].x + A[i][0].y * A[i][1].y;
    C11 += A[i][1].x * A[i][1].x + A[i][1].y * A[i][1].y;

    const t = u[i], mt = 1 - t;
    const b0 = mt * mt * mt, b1 = 3 * mt * mt * t,
      b2 = 3 * mt * t * t, b3 = t * t * t;
    const tmp = {
      x: points[i].x - (b0 * first.x + b1 * first.x + b2 * last.x + b3 * last.x),
      y: points[i].y - (b0 * first.y + b1 * first.y + b2 * last.y + b3 * last.y),
    };

    X0 += A[i][0].x * tmp.x + A[i][0].y * tmp.y;
    X1 += A[i][1].x * tmp.x + A[i][1].y * tmp.y;
  }

  const det = C00 * C11 - C01 * C01;
  let alpha1: number, alpha2: number;

  if (abs(det) < 1e-12) {
    const d = dist(first, last) / 3;
    alpha1 = d; alpha2 = d;
  } else {
    alpha1 = (C11 * X0 - C01 * X1) / det;
    alpha2 = (C00 * X1 - C01 * X0) / det;
  }

  const segLength = dist(first, last);
  const eps = 1e-6 * segLength;

  if (alpha1 < eps || alpha2 < eps) {
    const d = segLength / 3;
    alpha1 = d; alpha2 = d;
  }

  return new Bezier([
    first,
    { x: first.x + tan1.x * alpha1, y: first.y + tan1.y * alpha1 },
    { x: last.x + tan2.x * alpha2, y: last.y + tan2.y * alpha2 },
    last,
  ]);
}

function computeMaxError(
  points: Point[], bez: Bezier, u: number[],
): { maxError: number; splitIndex: number } {
  let maxError = 0;
  let splitIndex = Math.floor(points.length / 2);

  for (let i = 1; i < points.length - 1; i++) {
    const p = bez.get(u[i]);
    const dx = p.x - points[i].x;
    const dy = p.y - points[i].y;
    const err = dx * dx + dy * dy;
    if (err > maxError) { maxError = err; splitIndex = i; }
  }

  return { maxError: sqrt(maxError), splitIndex };
}

function reparameterize(points: Point[], u: number[], bez: Bezier): number[] {
  return u.map((t, i) => newtonRaphsonRoot(bez, points[i], t));
}

function newtonRaphsonRoot(bez: Bezier, point: Point, t: number): number {
  const p = bez.get(t);
  const d1 = bez.derivative(t);
  const d2 = bez.dderivative(t);

  const px = p.x - point.x;
  const py = p.y - point.y;

  const numerator = px * d1.x + py * d1.y;
  const denominator = d1.x * d1.x + d1.y * d1.y + px * d2.x + py * d2.y;

  if (abs(denominator) < 1e-12) return t;

  const newT = t - numerator / denominator;
  return newT < 0 ? 0 : newT > 1 ? 1 : newT;
}

// ─── Polyline class ──────────────────────────────────────────────────────────

export class Polyline {
  segments: Bezier[];
  closed: boolean;
  _ctx?: KlintContext;

  private _lengths: number[] | null = null;
  private _totalLength: number | null = null;
  private _cumulative: number[] | null = null;
  private _lut: Point[] = [];

  constructor(segments: Bezier[], closed = false, ctx?: KlintContext) {
    if (segments.length === 0) throw new Error("Polyline requires at least one segment");
    this.segments = segments;
    this.closed = closed;
    this._ctx = ctx;
  }

  private _k(K?: KlintContext): KlintContext {
    const ctx = K ?? this._ctx;
    if (!ctx) throw new Error("No KlintContext — pass to constructor or draw method");
    return ctx;
  }

  // ─── Static constructors ────────────────────────────────────────────────

  static fromPoints(points: Point[], closed = false, ctx?: KlintContext): Polyline {
    if (points.length < 2) throw new Error("Need at least 2 points");
    const segments: Bezier[] = [];
    const n = closed ? points.length : points.length - 1;
    for (let i = 0; i < n; i++) {
      segments.push(makeline(points[i], points[(i + 1) % points.length], ctx));
    }
    return new Polyline(segments, closed, ctx);
  }

  static fromBeziers(curves: Bezier[], closed = false, ctx?: KlintContext): Polyline {
    return new Polyline(curves, closed, ctx);
  }

  // ─── Arc-length parameterization ──────────────────────────────────────

  private _computeLengths(): void {
    if (this._lengths) return;
    this._lengths = this.segments.map((s) => s.length());
    this._totalLength = this._lengths.reduce((a, b) => a + b, 0);
    const cum = [0];
    let acc = 0;
    for (const l of this._lengths) {
      acc += l;
      cum.push(acc / this._totalLength);
    }
    cum[cum.length - 1] = 1;
    this._cumulative = cum;
  }

  private _resolve(t: number): { index: number; localT: number } {
    this._computeLengths();
    const cum = this._cumulative!;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    if (t === 0) return { index: 0, localT: 0 };
    if (t === 1) return { index: this.segments.length - 1, localT: 1 };

    for (let i = 0; i < cum.length - 1; i++) {
      if (t >= cum[i] && t <= cum[i + 1]) {
        const span = cum[i + 1] - cum[i];
        return { index: i, localT: span === 0 ? 0 : (t - cum[i]) / span };
      }
    }
    return { index: this.segments.length - 1, localT: 1 };
  }

  private _toGlobalT(index: number, localT: number): number {
    this._computeLengths();
    const cum = this._cumulative!;
    return cum[index] + (cum[index + 1] - cum[index]) * localT;
  }

  // ─── Core ──────────────────────────────────────────────────────────────

  get(t: number): Point {
    const { index, localT } = this._resolve(t);
    const p = this.segments[index].get(localT);
    p.t = t;
    return p;
  }

  derivative(t: number): Point {
    const { index, localT } = this._resolve(t);
    return this.segments[index].derivative(localT);
  }

  normal(t: number): Point {
    const { index, localT } = this._resolve(t);
    return this.segments[index].normal(localT);
  }

  length(): number {
    this._computeLengths();
    return this._totalLength!;
  }

  segmentLength(i: number): number {
    this._computeLengths();
    return this._lengths![i];
  }

  getLUT(steps = 100): Point[] {
    if (this._lut.length === steps + 1) return this._lut;
    this._lut = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = this.get(t);
      p.t = t;
      this._lut.push(p);
    }
    return this._lut;
  }

  curvature(t: number): CurvatureResult {
    const { index, localT } = this._resolve(t);
    return this.segments[index].curvature(localT);
  }

  // ─── Analysis ──────────────────────────────────────────────────────────

  bbox(): BBox {
    return findbbox(this.segments);
  }

  project(point: Point): Point & { t: number; d: number } {
    this._computeLengths();
    let bestDist = Infinity, bestT = 0, bestPt: Point = { x: 0, y: 0 };

    for (let i = 0; i < this.segments.length; i++) {
      const proj = this.segments[i].project(point);
      if (proj.d < bestDist) {
        bestDist = proj.d;
        bestPt = proj;
        bestT = this._toGlobalT(i, proj.t);
      }
    }
    return { x: bestPt.x, y: bestPt.y, t: bestT, d: bestDist };
  }

  // ─── Splitting ─────────────────────────────────────────────────────────

  split(t: number): { left: Polyline; right: Polyline } {
    const { index, localT } = this._resolve(t);
    const { left: lSeg, right: rSeg } = this.segments[index].split(localT);
    return {
      left: new Polyline([...this.segments.slice(0, index), lSeg], false, this._ctx),
      right: new Polyline([rSeg, ...this.segments.slice(index + 1)], false, this._ctx),
    };
  }

  slice(t1: number, t2: number): Polyline {
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; }
    const { right } = this.split(t1);
    const { left } = right.split((t2 - t1) / (1 - t1));
    return left;
  }

  // ─── Operations ────────────────────────────────────────────────────────

  reduce(): Bezier[] {
    const result: Bezier[] = [];
    for (const seg of this.segments) result.push(...seg.reduce());
    return result;
  }

  offset(d: number): Polyline {
    const offsetSegs: Bezier[] = [];
    for (const seg of this.segments) {
      const off = seg.offset(d);
      offsetSegs.push(...(Array.isArray(off) ? off : [off as unknown as Bezier]));
    }
    return new Polyline(offsetSegs, this.closed, this._ctx);
  }

  scale(d: number): Polyline {
    return new Polyline(this.reduce().map((s) => s.scale(d)), this.closed, this._ctx);
  }

  outline(d1: number, d2?: number, d3?: number, d4?: number): Polyline {
    d2 = d2 ?? d1;
    const reduced = this.reduce();
    if (reduced.length === 0) return new Polyline([this.segments[0]], false);

    const fcurves: Bezier[] = [];
    let bcurves: Bezier[] = [];
    let alen = 0;
    const tlen = this.length();
    const graduated = d3 !== undefined && d4 !== undefined;

    for (const segment of reduced) {
      const slen = segment.length();
      if (graduated) {
        const fDist = (v: number) => {
          const f1 = alen / tlen, f2 = (alen + slen) / tlen;
          return mapVal(v, 0, 1, d1 + f1 * (d3! - d1), d1 + f2 * (d3! - d1));
        };
        const bDist = (v: number) => {
          const f1 = alen / tlen, f2 = (alen + slen) / tlen;
          return mapVal(v, 0, 1, -d2! + f1 * (-d4! + d2!), -d2! + f2 * (-d4! + d2!));
        };
        fcurves.push(segment.scale(fDist));
        bcurves.push(segment.scale(bDist));
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
        return s;
      })
      .reverse();

    const fs = fcurves[0].points[0];
    const fe = fcurves[fcurves.length - 1].points[fcurves[fcurves.length - 1].points.length - 1];
    const bs = bcurves[bcurves.length - 1].points[bcurves[bcurves.length - 1].points.length - 1];
    const be = bcurves[0].points[0];

    return new Polyline(
      [makeline(bs, fs, this._ctx), ...fcurves, makeline(fe, be, this._ctx), ...bcurves],
      true,
      this._ctx,
    );
  }

  outlineshapes(d1: number, d2?: number, threshold?: number): Shape[] {
    d2 = d2 ?? d1;
    const outlineSegs = this.outline(d1, d2).segments;
    const shapes: Shape[] = [];
    const len = outlineSegs.length, half = len / 2;
    for (let i = 1; i < half; i++) {
      const shape = makeshape(outlineSegs[i], outlineSegs[len - i], threshold);
      shape.startcap.virtual = i > 1;
      shape.endcap.virtual = i < half - 1;
      shapes.push(shape);
    }
    return shapes;
  }

  // ─── Intersections ─────────────────────────────────────────────────────

  intersects(
    other?: Bezier | Polyline | { p1: Point; p2: Point },
    threshold?: number,
  ): string[] {
    if (!other) return this._selfIntersects(threshold);
    if ("p1" in other && "p2" in other) return this._lineIntersects(other);
    if (other instanceof Bezier || other instanceof Polyline) {
      return this._curveSetIntersects(this.reduce(), other.reduce(), threshold);
    }
    return [];
  }

  private _selfIntersects(threshold?: number): string[] {
    const reduced = this.reduce();
    const results: string[] = [];
    for (let i = 0; i < reduced.length - 2; i++) {
      results.push(...this._curveSetIntersects(reduced.slice(i, i + 1), reduced.slice(i + 2), threshold));
    }
    return Array.from(new Set(results));
  }

  private _lineIntersects(line: { p1: Point; p2: Point }): string[] {
    const results: string[] = [];
    for (let i = 0; i < this.segments.length; i++) {
      for (const h of this.segments[i].intersects(line)) {
        results.push(`${this._toGlobalT(i, parseFloat(h))}`);
      }
    }
    return results;
  }

  private _curveSetIntersects(c1: Bezier[], c2: Bezier[], threshold?: number): string[] {
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

  // ─── Conversion ────────────────────────────────────────────────────────

  toPath2D(): Path2D {
    return Bezier.toPath2D(this.segments);
  }

  toSVG(): string {
    if (this.segments.length === 0) return "";
    const p0 = this.segments[0].points[0];
    const parts: string[] = [`M ${p0.x} ${p0.y}`];
    for (const c of this.segments) {
      const p = c.points;
      if (c.order === 1 || c._linear) {
        parts.push(`L ${p[p.length - 1].x} ${p[p.length - 1].y}`);
      } else if (c.order === 2) {
        parts.push(`Q ${p[1].x} ${p[1].y} ${p[2].x} ${p[2].y}`);
      } else {
        parts.push(`C ${p[1].x} ${p[1].y} ${p[2].x} ${p[2].y} ${p[3].x} ${p[3].y}`);
      }
    }
    if (this.closed) parts.push("Z");
    return parts.join(" ");
  }

  knots(): Point[] {
    const pts: Point[] = [this.segments[0].points[0]];
    for (const seg of this.segments) pts.push(seg.points[seg.points.length - 1]);
    return pts;
  }

  reverse(): Polyline {
    const reversed = this.segments
      .map((seg) => {
        const p = seg.points;
        const rp = p.length === 4
          ? [p[3], p[2], p[1], p[0]]
          : p.length === 3 ? [p[2], p[1], p[0]] : [...p].reverse();
        return new Bezier(rp, this._ctx);
      })
      .reverse();
    return new Polyline(reversed, this.closed, this._ctx);
  }

  concat(other: Polyline): Polyline {
    return new Polyline([...this.segments, ...other.segments], this.closed, this._ctx);
  }

  // ─── Smooth & Simplify ─────────────────────────────────────────────────

  smooth(factor = 0.4): Polyline {
    return new Polyline(smoothPath(this.knots(), this.closed, factor), this.closed, this._ctx);
  }

  static smooth(points: Point[], closed = false, factor = 0.4, ctx?: KlintContext): Polyline {
    return new Polyline(smoothPath(points, closed, factor), closed, ctx);
  }

  simplify(tolerance = 2.5): Polyline {
    const steps = Math.max(200, this.segments.length * 30);
    const pts: Point[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = this.get(t);
      p.t = t;
      pts.push(p);
    }
    return new Polyline(simplifyPath(pts, tolerance), this.closed, this._ctx);
  }

  static simplify(points: Point[], tolerance = 2.5, closed = false, ctx?: KlintContext): Polyline {
    return new Polyline(simplifyPath(points, tolerance), closed, ctx);
  }

  // ─── Drawing ───────────────────────────────────────────────────────────

  draw(K?: KlintContext): void {
    this._k(K).stroke(this.toPath2D());
  }

  drawFilled(K?: KlintContext): void {
    this._k(K).fill(this.toPath2D());
  }

  drawSkeleton(K: KlintContext, pointSize?: number): void;
  drawSkeleton(pointSize?: number): void;
  drawSkeleton(...args: unknown[]): void {
    let ctx: KlintContext, ps: number;
    if (typeof args[0] === "number" || args[0] == null) {
      ctx = this._k(); ps = (args[0] as number) ?? 3;
    } else {
      ctx = this._k(args[0] as KlintContext); ps = (args[1] as number) ?? 3;
    }
    ctx.push();
    for (const seg of this.segments) seg.drawSkeleton(ctx, ps);
    ctx.pop();
  }

  drawNormals(K: KlintContext, count?: number, length?: number): void;
  drawNormals(count?: number, length?: number): void;
  drawNormals(...args: unknown[]): void {
    let ctx: KlintContext, cnt: number, len: number;
    if (typeof args[0] === "number" || args[0] == null) {
      ctx = this._k(); cnt = (args[0] as number) ?? 20; len = (args[1] as number) ?? 20;
    } else {
      ctx = this._k(args[0] as KlintContext); cnt = (args[1] as number) ?? 20; len = (args[2] as number) ?? 20;
    }
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
    let ctx: KlintContext, d1: number, d2: number | undefined, d3: number | undefined, d4: number | undefined;
    if (typeof args[0] === "number") {
      ctx = this._k(); d1 = args[0]; d2 = args[1] as number; d3 = args[2] as number; d4 = args[3] as number;
    } else {
      ctx = this._k(args[0] as KlintContext); d1 = args[1] as number; d2 = args[2] as number; d3 = args[3] as number; d4 = args[4] as number;
    }
    const path2d = this.outline(d1, d2, d3, d4).toPath2D();
    path2d.closePath();
    ctx.stroke(path2d);
  }

  drawOutlineFilled(K: KlintContext, d1: number, d2?: number, d3?: number, d4?: number): void;
  drawOutlineFilled(d1: number, d2?: number, d3?: number, d4?: number): void;
  drawOutlineFilled(...args: unknown[]): void {
    let ctx: KlintContext, d1: number, d2: number | undefined, d3: number | undefined, d4: number | undefined;
    if (typeof args[0] === "number") {
      ctx = this._k(); d1 = args[0]; d2 = args[1] as number; d3 = args[2] as number; d4 = args[3] as number;
    } else {
      ctx = this._k(args[0] as KlintContext); d1 = args[1] as number; d2 = args[2] as number; d3 = args[3] as number; d4 = args[4] as number;
    }
    const path2d = this.outline(d1, d2, d3, d4).toPath2D();
    path2d.closePath();
    ctx.fill(path2d);
  }

  drawPoints(K: KlintContext, count?: number, radius?: number): void;
  drawPoints(count?: number, radius?: number): void;
  drawPoints(...args: unknown[]): void {
    let ctx: KlintContext, cnt: number, r: number;
    if (typeof args[0] === "number" || args[0] == null) {
      ctx = this._k(); cnt = (args[0] as number) ?? 50; r = (args[1] as number) ?? 2;
    } else {
      ctx = this._k(args[0] as KlintContext); cnt = (args[1] as number) ?? 50; r = (args[2] as number) ?? 2;
    }
    ctx.push();
    for (let i = 0; i <= cnt; i++) {
      const p = this.get(i / cnt);
      ctx.circle(p.x, p.y, r);
    }
    ctx.pop();
  }
}
