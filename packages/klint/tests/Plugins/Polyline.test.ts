import { describe, it, expect } from "vitest";
import { Bezier, dist, type Point } from "../../src/plugins/Bezier";
import { Polyline, smoothPath, simplifyPath } from "../../src/plugins/Polyline";

// ─── Construction ────────────────────────────────────────────────────────────

describe("Polyline construction", () => {
  it("fromPoints creates linear segments", () => {
    const pts: Point[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
    const poly = Polyline.fromPoints(pts);
    expect(poly.segments).toHaveLength(2);
  });

  it("fromPoints closed creates N segments", () => {
    const pts: Point[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }];
    const poly = Polyline.fromPoints(pts, true);
    expect(poly.segments).toHaveLength(3);
    expect(poly.closed).toBe(true);
  });

  it("fromBeziers wraps existing curves", () => {
    const b1 = Bezier.cubic({ x: 0, y: 0 }, { x: 30, y: 100 }, { x: 70, y: 100 }, { x: 100, y: 0 });
    const b2 = Bezier.cubic({ x: 100, y: 0 }, { x: 130, y: 100 }, { x: 170, y: 100 }, { x: 200, y: 0 });
    const poly = Polyline.fromBeziers([b1, b2]);
    expect(poly.segments).toHaveLength(2);
  });

  it("throws on empty segments", () => {
    expect(() => new Polyline([])).toThrow();
  });

  it("throws on < 2 points", () => {
    expect(() => Polyline.fromPoints([{ x: 0, y: 0 }])).toThrow();
  });
});

// ─── Core evaluation ─────────────────────────────────────────────────────────

describe("Polyline core", () => {
  const b1 = Bezier.cubic({ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 });
  const b2 = Bezier.cubic({ x: 100, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 0 });
  const poly = Polyline.fromBeziers([b1, b2]);

  it("get(0) returns start", () => {
    const p = poly.get(0);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("get(1) returns end", () => {
    const p = poly.get(1);
    expect(p.x).toBeCloseTo(200);
    expect(p.y).toBeCloseTo(0);
  });

  it("get(0.5) returns midpoint of path", () => {
    const p = poly.get(0.5);
    expect(p.x).toBeCloseTo(100, 0);
  });

  it("derivative returns tangent", () => {
    const d = poly.derivative(0.5);
    expect(typeof d.x).toBe("number");
    expect(typeof d.y).toBe("number");
  });

  it("normal is perpendicular to derivative", () => {
    const t = 0.3;
    const d = poly.derivative(t);
    const n = poly.normal(t);
    const dot = d.x * n.x + d.y * n.y;
    expect(dot).toBeCloseTo(0, 4);
  });

  it("length is positive", () => {
    expect(poly.length()).toBeGreaterThan(0);
  });

  it("segmentLength matches segment", () => {
    const len0 = poly.segmentLength(0);
    const directLen = b1.length();
    expect(len0).toBeCloseTo(directLen);
  });

  it("getLUT returns correct count", () => {
    const lut = poly.getLUT(40);
    expect(lut).toHaveLength(41);
  });

  it("curvature returns k and r", () => {
    const c = poly.curvature(0.5);
    expect(c).toHaveProperty("k");
    expect(c).toHaveProperty("r");
  });
});

// ─── Analysis ────────────────────────────────────────────────────────────────

describe("Polyline analysis", () => {
  const poly = Polyline.fromBeziers([
    Bezier.cubic({ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }),
    Bezier.cubic({ x: 100, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 0 }),
  ]);

  it("bbox contains all points", () => {
    const bb = poly.bbox();
    expect(bb.x.min).toBeLessThanOrEqual(0);
    expect(bb.x.max).toBeGreaterThanOrEqual(200);
    expect(bb.y.min).toBeLessThanOrEqual(0);
    expect(bb.y.max).toBeGreaterThan(0);
  });

  it("project finds nearest point", () => {
    const proj = poly.project({ x: 50, y: 75 });
    expect(proj.d).toBeLessThan(15);
    expect(proj.t).toBeGreaterThan(0);
    expect(proj.t).toBeLessThan(1);
  });

  it("knots returns start + all endpoints", () => {
    const k = poly.knots();
    expect(k).toHaveLength(3);
    expect(k[0].x).toBeCloseTo(0);
    expect(k[2].x).toBeCloseTo(200);
  });
});

// ─── Splitting ───────────────────────────────────────────────────────────────

describe("Polyline splitting", () => {
  const b1 = Bezier.cubic({ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 });
  const b2 = Bezier.cubic({ x: 100, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 0 });
  const poly = Polyline.fromBeziers([b1, b2]);

  it("split produces left and right", () => {
    const { left, right } = poly.split(0.5);
    expect(left).toBeInstanceOf(Polyline);
    expect(right).toBeInstanceOf(Polyline);
    expect(left.get(0).x).toBeCloseTo(0);
    expect(right.get(1).x).toBeCloseTo(200);
  });

  it("slice extracts a sub-path", () => {
    const sub = poly.slice(0.25, 0.75);
    expect(sub).toBeInstanceOf(Polyline);
    expect(sub.length()).toBeLessThan(poly.length());
  });
});

// ─── Operations ──────────────────────────────────────────────────────────────

describe("Polyline operations", () => {
  const b1 = Bezier.cubic({ x: 100, y: 300 }, { x: 150, y: 50 }, { x: 350, y: 50 }, { x: 400, y: 300 });
  const poly = Polyline.fromBeziers([b1]);

  it("reduce returns Bezier array", () => {
    const reduced = poly.reduce();
    expect(reduced.length).toBeGreaterThan(0);
    for (const seg of reduced) expect(seg).toBeInstanceOf(Bezier);
  });

  it("offset returns new Polyline", () => {
    const off = poly.offset(5);
    expect(off).toBeInstanceOf(Polyline);
    expect(off.segments.length).toBeGreaterThan(0);
  });

  it("outline returns closed Polyline", () => {
    const out = poly.outline(10);
    expect(out).toBeInstanceOf(Polyline);
    expect(out.closed).toBe(true);
  });

  it("reverse flips direction", () => {
    const rev = poly.reverse();
    const origStart = poly.get(0);
    const revEnd = rev.get(1);
    expect(revEnd.x).toBeCloseTo(origStart.x, 0);
    expect(revEnd.y).toBeCloseTo(origStart.y, 0);
  });

  it("concat joins two polylines", () => {
    const p2 = Polyline.fromBeziers([
      Bezier.cubic({ x: 400, y: 300 }, { x: 450, y: 50 }, { x: 550, y: 50 }, { x: 600, y: 300 }),
    ]);
    const joined = poly.concat(p2);
    expect(joined.segments.length).toBe(poly.segments.length + p2.segments.length);
  });
});

// ─── Intersections ───────────────────────────────────────────────────────────

describe("Polyline intersections", () => {
  it("detects line intersection", () => {
    const poly = Polyline.fromBeziers([
      Bezier.cubic({ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }),
    ]);
    const line = { p1: { x: 0, y: 50 }, p2: { x: 100, y: 50 } };
    const hits = poly.intersects(line);
    expect(hits.length).toBeGreaterThan(0);
  });

  it("intersects with Bezier returns array", () => {
    const poly = Polyline.fromBeziers([
      Bezier.cubic({ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }),
    ]);
    const other = Bezier.cubic(
      { x: 50, y: 50 }, { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 150, y: 50 },
    );
    const hits = poly.intersects(other);
    expect(Array.isArray(hits)).toBe(true);
  });

  it("intersects with Polyline returns array", () => {
    const p1 = Polyline.fromBeziers([
      Bezier.cubic({ x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 }),
    ]);
    const p2 = Polyline.fromBeziers([
      Bezier.cubic({ x: 50, y: 50 }, { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 150, y: 50 }),
    ]);
    const hits = p1.intersects(p2);
    expect(Array.isArray(hits)).toBe(true);
  });
});

// ─── Conversion ──────────────────────────────────────────────────────────────

describe("Polyline conversion", () => {
  const poly = Polyline.fromBeziers([
    Bezier.cubic({ x: 0, y: 0 }, { x: 30, y: 100 }, { x: 70, y: 100 }, { x: 100, y: 0 }),
  ]);

  it("toSVG produces valid path", () => {
    const svg = poly.toSVG();
    expect(svg).toContain("M");
    expect(svg).toContain("C");
  });

  it("toPath2D returns Path2D", () => {
    expect(poly.toPath2D()).toBeInstanceOf(Path2D);
  });
});

// ─── Smooth ──────────────────────────────────────────────────────────────────

describe("smoothPath", () => {
  const pts: Point[] = [
    { x: 0, y: 0 }, { x: 100, y: 100 }, { x: 200, y: 0 },
    { x: 300, y: 100 }, { x: 400, y: 0 },
  ];

  it("returns cubic Bezier segments", () => {
    const segs = smoothPath(pts);
    expect(segs.length).toBe(pts.length - 1);
    for (const s of segs) {
      expect(s).toBeInstanceOf(Bezier);
      expect(s.order).toBe(3);
    }
  });

  it("segments pass through original points", () => {
    const segs = smoothPath(pts);
    for (let i = 0; i < segs.length; i++) {
      const start = segs[i].get(0);
      expect(start.x).toBeCloseTo(pts[i].x, 1);
      expect(start.y).toBeCloseTo(pts[i].y, 1);
    }
    const lastEnd = segs[segs.length - 1].get(1);
    expect(lastEnd.x).toBeCloseTo(pts[pts.length - 1].x, 1);
    expect(lastEnd.y).toBeCloseTo(pts[pts.length - 1].y, 1);
  });

  it("handles closed paths", () => {
    const segs = smoothPath(pts, true);
    expect(segs.length).toBe(pts.length);
  });

  it("throws on < 2 points", () => {
    expect(() => smoothPath([{ x: 0, y: 0 }])).toThrow();
  });

  it("2 points returns a line", () => {
    const segs = smoothPath([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
    expect(segs).toHaveLength(1);
    expect(segs[0]._linear).toBe(true);
  });

  it("Polyline.smooth() returns a Polyline", () => {
    const poly = Polyline.fromPoints(pts);
    const smoothed = poly.smooth();
    expect(smoothed).toBeInstanceOf(Polyline);
    expect(smoothed.segments.length).toBe(pts.length - 1);
  });

  it("static Polyline.smooth() works", () => {
    const smoothed = Polyline.smooth(pts);
    expect(smoothed).toBeInstanceOf(Polyline);
  });
});

// ─── Simplify ────────────────────────────────────────────────────────────────

describe("simplifyPath", () => {
  it("reduces dense points to fewer cubic segments", () => {
    const dense: Point[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      dense.push({ x: t * 400, y: 100 * Math.sin(t * Math.PI * 2) });
    }
    const segs = simplifyPath(dense, 5);
    expect(segs.length).toBeLessThan(dense.length);
    expect(segs.length).toBeGreaterThan(0);
  });

  it("simplified path stays close to original", () => {
    const dense: Point[] = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      dense.push({ x: t * 200, y: 50 * Math.sin(t * Math.PI) });
    }
    const segs = simplifyPath(dense, 2);
    const poly = Polyline.fromBeziers(segs);

    for (const pt of dense) {
      const proj = poly.project(pt);
      expect(proj.d).toBeLessThan(10);
    }
  });

  it("throws on < 2 points", () => {
    expect(() => simplifyPath([{ x: 0, y: 0 }])).toThrow();
  });

  it("2 points returns a line", () => {
    const segs = simplifyPath([{ x: 0, y: 0 }, { x: 100, y: 100 }]);
    expect(segs).toHaveLength(1);
  });

  it("Polyline.simplify() returns a Polyline", () => {
    const dense: Point[] = [];
    for (let i = 0; i <= 50; i++) {
      dense.push({ x: i * 4, y: 50 * Math.sin((i / 50) * Math.PI) });
    }
    const poly = Polyline.fromPoints(dense);
    const simplified = poly.simplify(5);
    expect(simplified).toBeInstanceOf(Polyline);
    expect(simplified.segments.length).toBeLessThan(dense.length);
  });

  it("static Polyline.simplify() works", () => {
    const dense: Point[] = [];
    for (let i = 0; i <= 20; i++) {
      dense.push({ x: i * 10, y: i * 5 });
    }
    const simplified = Polyline.simplify(dense, 5);
    expect(simplified).toBeInstanceOf(Polyline);
  });
});
