import { describe, it, expect } from "vitest";
import {
  Bezier,
  makeline,
  findbbox,
  pairiteration,
  dist,
  approximately,
  between,
  lerpPt,
  mapVal,
  bboxoverlap,
  type Point,
} from "../../src/plugins/Bezier";

// ─── Helper math ─────────────────────────────────────────────────────────────

describe("math helpers", () => {
  it("dist computes euclidean distance", () => {
    expect(dist({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5);
    expect(dist({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });

  it("approximately compares floats", () => {
    expect(approximately(1.0000001, 1.0000002)).toBe(true);
    expect(approximately(1, 2)).toBe(false);
  });

  it("between checks range inclusively", () => {
    expect(between(0.5, 0, 1)).toBe(true);
    expect(between(0, 0, 1)).toBe(true);
    expect(between(1, 0, 1)).toBe(true);
    expect(between(-0.1, 0, 1)).toBe(false);
  });

  it("lerpPt interpolates points", () => {
    const a: Point = { x: 0, y: 0 };
    const b: Point = { x: 10, y: 20 };
    const mid = lerpPt(0.5, a, b);
    expect(mid.x).toBeCloseTo(5);
    expect(mid.y).toBeCloseTo(10);
  });

  it("mapVal maps values between ranges", () => {
    expect(mapVal(5, 0, 10, 0, 100)).toBeCloseTo(50);
    expect(mapVal(0, 0, 10, 100, 200)).toBeCloseTo(100);
  });

  it("bboxoverlap detects overlap", () => {
    const b1 = { x: { min: 0, mid: 5, max: 10, size: 10 }, y: { min: 0, mid: 5, max: 10, size: 10 } };
    const b2 = { x: { min: 5, mid: 10, max: 15, size: 10 }, y: { min: 5, mid: 10, max: 15, size: 10 } };
    const b3 = { x: { min: 20, mid: 25, max: 30, size: 10 }, y: { min: 20, mid: 25, max: 30, size: 10 } };
    expect(bboxoverlap(b1, b2)).toBe(true);
    expect(bboxoverlap(b1, b3)).toBe(false);
  });
});

// ─── Construction ────────────────────────────────────────────────────────────

describe("Bezier construction", () => {
  it("creates from point array", () => {
    const b = new Bezier([{ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 }]);
    expect(b.order).toBe(2);
    expect(b.points).toHaveLength(3);
  });

  it("creates from flat number array", () => {
    const b = new Bezier([0, 0, 50, 100, 100, 0]);
    expect(b.order).toBe(2);
    expect(b.points[1]).toEqual({ x: 50, y: 100 });
  });

  it("static quadratic constructor", () => {
    const b = Bezier.quadratic({ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 });
    expect(b.order).toBe(2);
  });

  it("static cubic constructor", () => {
    const b = Bezier.cubic(
      { x: 0, y: 0 }, { x: 30, y: 100 }, { x: 70, y: 100 }, { x: 100, y: 0 },
    );
    expect(b.order).toBe(3);
  });
});

// ─── Core evaluation ─────────────────────────────────────────────────────────

describe("Bezier core", () => {
  const cubic = Bezier.cubic(
    { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 },
  );

  it("get(0) returns start", () => {
    const p = cubic.get(0);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("get(1) returns end", () => {
    const p = cubic.get(1);
    expect(p.x).toBeCloseTo(100);
    expect(p.y).toBeCloseTo(0);
  });

  it("get(0.5) returns midpoint on curve", () => {
    const p = cubic.get(0.5);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(75);
  });

  it("derivative returns tangent", () => {
    const d = cubic.derivative(0);
    expect(d.x).toBeCloseTo(0);
    expect(d.y).toBeGreaterThan(0);
  });

  it("normal returns perpendicular", () => {
    const n = cubic.normal(0.5);
    const d = cubic.derivative(0.5);
    const dot = n.x * d.x + n.y * d.y;
    expect(dot).toBeCloseTo(0, 5);
  });

  it("length returns positive value", () => {
    const len = cubic.length();
    expect(len).toBeGreaterThan(0);
    expect(len).toBeGreaterThan(100);
  });

  it("getLUT returns requested number of points", () => {
    const lut = cubic.getLUT(50);
    expect(lut).toHaveLength(51);
    expect(lut[0].t).toBe(0);
    expect(lut[50].t).toBe(1);
  });

  it("getLUT caches results", () => {
    const lut1 = cubic.getLUT(50);
    const lut2 = cubic.getLUT(50);
    expect(lut1).toBe(lut2);
  });
});

// ─── Analysis ────────────────────────────────────────────────────────────────

describe("Bezier analysis", () => {
  const cubic = Bezier.cubic(
    { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 },
  );

  it("curvature returns k and r", () => {
    const c = cubic.curvature(0.5);
    expect(c.k).toBeDefined();
    expect(c.r).toBeDefined();
  });

  it("bbox contains endpoints", () => {
    const bb = cubic.bbox();
    expect(bb.x.min).toBeLessThanOrEqual(0);
    expect(bb.x.max).toBeGreaterThanOrEqual(100);
    expect(bb.y.min).toBeLessThanOrEqual(0);
    expect(bb.y.max).toBeGreaterThan(0);
  });

  it("extrema returns sorted values", () => {
    const ext = cubic.extrema();
    expect(ext.values.length).toBeGreaterThan(0);
    for (let i = 1; i < ext.values.length; i++) {
      expect(ext.values[i]).toBeGreaterThanOrEqual(ext.values[i - 1]);
    }
  });

  it("project finds closest point", () => {
    const proj = cubic.project({ x: 50, y: 100 });
    expect(proj.t).toBeGreaterThan(0);
    expect(proj.t).toBeLessThan(1);
    expect(proj.d).toBeLessThan(30);
  });

  it("simple returns boolean", () => {
    expect(typeof cubic.simple()).toBe("boolean");
  });

  it("overlaps detects bbox collision", () => {
    const other = Bezier.cubic(
      { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 150, y: 100 }, { x: 150, y: 0 },
    );
    expect(cubic.overlaps(other)).toBe(true);
  });
});

// ─── Splitting & reducing ────────────────────────────────────────────────────

describe("Bezier splitting", () => {
  const cubic = Bezier.cubic(
    { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 },
  );

  it("split at 0.5 produces left and right", () => {
    const { left, right } = cubic.split(0.5);
    expect(left.get(0).x).toBeCloseTo(0);
    expect(left.get(1).x).toBeCloseTo(50);
    expect(right.get(0).x).toBeCloseTo(50);
    expect(right.get(1).x).toBeCloseTo(100);
  });

  it("split with range produces sub-curve", () => {
    const sub = cubic.split(0.25, 0.75) as unknown as Bezier;
    const p0 = sub.get(0);
    const p1 = sub.get(1);
    const expected0 = cubic.get(0.25);
    const expected1 = cubic.get(0.75);
    expect(p0.x).toBeCloseTo(expected0.x, 0);
    expect(p1.x).toBeCloseTo(expected1.x, 0);
  });

  it("hull returns correct number of points for cubic", () => {
    const h = cubic.hull(0.5);
    expect(h).toHaveLength(10);
  });

  it("reduce returns simple segments", () => {
    const reduced = cubic.reduce();
    expect(reduced.length).toBeGreaterThan(0);
    for (const seg of reduced) {
      expect(seg).toBeInstanceOf(Bezier);
    }
  });

  it("raise increases order", () => {
    const quad = Bezier.quadratic({ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 0 });
    const raised = quad.raise();
    expect(raised.order).toBe(3);
    const p1 = quad.get(0.5);
    const p2 = raised.get(0.5);
    expect(p1.x).toBeCloseTo(p2.x, 1);
    expect(p1.y).toBeCloseTo(p2.y, 1);
  });
});

// ─── Offset, Scale & Outline ─────────────────────────────────────────────────

describe("Bezier offset/scale/outline", () => {
  const cubic = Bezier.cubic(
    { x: 100, y: 300 }, { x: 150, y: 50 }, { x: 350, y: 50 }, { x: 400, y: 300 },
  );

  it("offset returns array of Beziers", () => {
    const off = cubic.offset(10);
    expect(Array.isArray(off)).toBe(true);
    expect(off.length).toBeGreaterThan(0);
    for (const b of off) expect(b).toBeInstanceOf(Bezier);
  });

  it("offset with two args returns OffsetPoint", () => {
    const op = cubic.offset(0.5, 10);
    expect(op).toHaveProperty("c");
    expect(op).toHaveProperty("n");
    expect(op).toHaveProperty("x");
    expect(op).toHaveProperty("y");
  });

  it("scale moves curve away from center", () => {
    const scaled = cubic.scale(10);
    expect(scaled).toBeInstanceOf(Bezier);
    const origMid = cubic.get(0.5);
    const scaledMid = scaled.get(0.5);
    expect(dist(origMid, scaledMid)).toBeGreaterThan(0);
  });

  it("outline returns segments forming a closed shape", () => {
    const out = cubic.outline(10);
    expect(out.length).toBeGreaterThan(2);
  });

  it("outlineshapes returns Shape objects", () => {
    const shapes = cubic.outlineshapes(10);
    expect(shapes.length).toBeGreaterThan(0);
    for (const s of shapes) {
      expect(s).toHaveProperty("forward");
      expect(s).toHaveProperty("back");
      expect(s).toHaveProperty("bbox");
    }
  });
});

// ─── Intersections ───────────────────────────────────────────────────────────

describe("Bezier intersections", () => {
  it("detects line intersection", () => {
    const cubic = Bezier.cubic(
      { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 },
    );
    const line = { p1: { x: 0, y: 50 }, p2: { x: 100, y: 50 } };
    const hits = cubic.intersects(line);
    expect(hits.length).toBeGreaterThan(0);
  });

  it("intersects with another curve returns array", () => {
    const c1 = Bezier.cubic(
      { x: 0, y: 0 }, { x: 0, y: 100 }, { x: 100, y: 100 }, { x: 100, y: 0 },
    );
    const c2 = Bezier.cubic(
      { x: 50, y: 50 }, { x: 50, y: 150 }, { x: 150, y: 150 }, { x: 150, y: 50 },
    );
    const hits = c1.intersects(c2);
    expect(Array.isArray(hits)).toBe(true);
  });
});

// ─── Arc approximation ──────────────────────────────────────────────────────

describe("Bezier arcs", () => {
  it("arcs returns Arc objects", () => {
    const cubic = Bezier.cubic(
      { x: 100, y: 300 }, { x: 150, y: 50 }, { x: 350, y: 50 }, { x: 400, y: 300 },
    );
    const arcs = cubic.arcs();
    expect(arcs.length).toBeGreaterThan(0);
    for (const a of arcs) {
      expect(a).toHaveProperty("r");
      expect(a).toHaveProperty("s");
      expect(a).toHaveProperty("e");
      expect(a).toHaveProperty("interval");
    }
  });
});

// ─── Conversion ──────────────────────────────────────────────────────────────

describe("Bezier conversion", () => {
  const cubic = Bezier.cubic(
    { x: 0, y: 0 }, { x: 30, y: 100 }, { x: 70, y: 100 }, { x: 100, y: 0 },
  );

  it("toSVG returns valid path string", () => {
    const svg = cubic.toSVG();
    expect(svg).toContain("M");
    expect(svg).toContain("C");
  });

  it("toPath2D returns Path2D", () => {
    const p = cubic.toPath2D();
    expect(p).toBeInstanceOf(Path2D);
  });

  it("static toPath2D combines curves", () => {
    const { left, right } = cubic.split(0.5);
    const p = Bezier.toPath2D([left, right]);
    expect(p).toBeInstanceOf(Path2D);
  });
});

// ─── Utility functions ───────────────────────────────────────────────────────

describe("utility functions", () => {
  it("makeline creates quadratic line segment", () => {
    const line = makeline({ x: 0, y: 0 }, { x: 100, y: 100 });
    expect(line.order).toBe(2);
    expect(line._linear).toBe(true);
  });

  it("findbbox encompasses all segments", () => {
    const b1 = Bezier.cubic({ x: 0, y: 0 }, { x: 10, y: 50 }, { x: 90, y: 50 }, { x: 100, y: 0 });
    const b2 = Bezier.cubic({ x: 100, y: 0 }, { x: 110, y: 50 }, { x: 190, y: 50 }, { x: 200, y: 0 });
    const bb = findbbox([b1, b2]);
    expect(bb.x.min).toBeLessThanOrEqual(0);
    expect(bb.x.max).toBeGreaterThanOrEqual(200);
  });

  it("pairiteration finds intersection between overlapping pairs", () => {
    const c1 = Bezier.cubic({ x: 0, y: 50 }, { x: 50, y: 0 }, { x: 50, y: 100 }, { x: 100, y: 50 });
    const c2 = Bezier.cubic({ x: 0, y: 0 }, { x: 50, y: 100 }, { x: 50, y: 0 }, { x: 100, y: 100 });
    const results = pairiteration(c1, c2);
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── Inflections ─────────────────────────────────────────────────────────────

describe("Bezier inflections", () => {
  it("S-curve has inflection points", () => {
    const s = Bezier.cubic(
      { x: 0, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }, { x: 100, y: 0 },
    );
    const inf = s.inflections();
    expect(inf.length).toBeGreaterThan(0);
    for (const t of inf) {
      expect(t).toBeGreaterThanOrEqual(0);
      expect(t).toBeLessThanOrEqual(1);
    }
  });

  it("simple arch has no inflection", () => {
    const arch = Bezier.cubic(
      { x: 0, y: 0 }, { x: 30, y: 100 }, { x: 70, y: 100 }, { x: 100, y: 0 },
    );
    const inf = arch.inflections();
    expect(inf.length).toBe(0);
  });
});
