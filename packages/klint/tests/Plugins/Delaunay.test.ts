import { describe, it, expect } from "vitest";
import { Delaunay, type Triangle } from "../../src/plugins/Delaunay";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function triangleArea(t: Triangle): number {
  return (
    Math.abs(
      (t.p2.x - t.p1.x) * (t.p3.y - t.p1.y) -
        (t.p3.x - t.p1.x) * (t.p2.y - t.p1.y),
    ) / 2
  );
}

function polygonArea(pts: { x: number; y: number }[]): number {
  let sum = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    sum += (pts[j].x - pts[i].x) * (pts[i].y + pts[j].y);
  }
  return Math.abs(sum) / 2;
}

// ─── Earcut: basic polygons ─────────────────────────────────────────────────

describe("earcut basic", () => {
  it("triangulates a square", () => {
    const verts = [0, 0, 100, 0, 100, 100, 0, 100];
    const indices = Delaunay.earcut(verts);
    expect(indices.length).toBe(6); // 2 triangles × 3
    for (const i of indices) {
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(4);
    }
  });

  it("triangulates a triangle (no-op)", () => {
    const verts = [0, 0, 100, 0, 50, 100];
    const indices = Delaunay.earcut(verts);
    expect(indices.length).toBe(3);
  });

  it("triangulates a convex pentagon", () => {
    const verts: number[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      verts.push(Math.cos(a) * 100, Math.sin(a) * 100);
    }
    const indices = Delaunay.earcut(verts);
    expect(indices.length).toBe(9); // 3 triangles × 3
  });

  it("handles concave L-shape", () => {
    const verts = [0, 0, 100, 0, 100, 50, 50, 50, 50, 100, 0, 100];
    const indices = Delaunay.earcut(verts);
    expect(indices.length).toBe(12); // 4 triangles
  });

  it("returns empty for degenerate input", () => {
    expect(Delaunay.earcut([])).toEqual([]);
    expect(Delaunay.earcut([0, 0])).toEqual([]);
    expect(Delaunay.earcut([0, 0, 1, 1])).toEqual([]);
  });

  it("total triangle area matches polygon area", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 150 },
      { x: 100, y: 100 },
      { x: 0, y: 150 },
    ];
    const flat = pts.flatMap((p) => [p.x, p.y]);
    const indices = Delaunay.earcut(flat);

    let triAreaSum = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const a = pts[indices[i]];
      const b = pts[indices[i + 1]];
      const c = pts[indices[i + 2]];
      triAreaSum += triangleArea({ p1: a, p2: b, p3: c });
    }
    expect(triAreaSum).toBeCloseTo(polygonArea(pts), 2);
  });
});

// ─── Earcut: polygons with holes ────────────────────────────────────────────

describe("earcut with holes", () => {
  it("triangulates a square with a square hole", () => {
    const verts = [
      // outer (CCW)
      0, 0, 100, 0, 100, 100, 0, 100,
      // hole (CW)
      25, 25, 75, 25, 75, 75, 25, 75,
    ];
    const holes = [4]; // hole starts at vertex index 4
    const indices = Delaunay.earcut(verts, holes);
    expect(indices.length).toBeGreaterThan(0);
    expect(indices.length % 3).toBe(0);

    let areaSum = 0;
    for (let i = 0; i < indices.length; i += 3) {
      const ax = verts[indices[i] * 2],
        ay = verts[indices[i] * 2 + 1];
      const bx = verts[indices[i + 1] * 2],
        by = verts[indices[i + 1] * 2 + 1];
      const cx = verts[indices[i + 2] * 2],
        cy = verts[indices[i + 2] * 2 + 1];
      areaSum += Math.abs((bx - ax) * (cy - ay) - (cx - ax) * (by - ay)) / 2;
    }
    const outerArea = 100 * 100;
    const holeArea = 50 * 50;
    expect(areaSum).toBeCloseTo(outerArea - holeArea, 1);
  });

  it("handles multiple holes", () => {
    const verts = [
      // outer
      0, 0, 200, 0, 200, 200, 0, 200,
      // hole 1
      20, 20, 80, 20, 80, 80, 20, 80,
      // hole 2
      120, 120, 180, 120, 180, 180, 120, 180,
    ];
    const holes = [4, 8];
    const indices = Delaunay.earcut(verts, holes);
    expect(indices.length).toBeGreaterThan(0);
    expect(indices.length % 3).toBe(0);
  });

  it("handles circular hole in circle", () => {
    const outerPts: number[] = [];
    const holePts: number[] = [];
    const n = 32;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      outerPts.push(Math.cos(a) * 100, Math.sin(a) * 100);
      holePts.push(Math.cos(-a) * 40, Math.sin(-a) * 40);
    }
    const verts = [...outerPts, ...holePts];
    const holes = [n];
    const indices = Delaunay.earcut(verts, holes);
    expect(indices.length).toBeGreaterThan(0);
    expect(indices.length % 3).toBe(0);
  });
});

// ─── Flatten utility ────────────────────────────────────────────────────────

describe("flatten", () => {
  it("converts point arrays to flat format", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const { vertices, holes, dimensions } = Delaunay.flatten([outer]);
    expect(vertices).toEqual([0, 0, 100, 0, 100, 100, 0, 100]);
    expect(holes).toEqual([]);
    expect(dimensions).toBe(2);
  });

  it("includes hole indices", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
    ];
    const hole = [
      { x: 25, y: 25 },
      { x: 50, y: 25 },
      { x: 50, y: 50 },
    ];
    const { vertices, holes } = Delaunay.flatten([outer, hole]);
    expect(vertices).toHaveLength(12);
    expect(holes).toEqual([3]);
  });

  it("handles multiple holes", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const h1 = [
      { x: 10, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 20 },
    ];
    const h2 = [
      { x: 50, y: 50 },
      { x: 60, y: 50 },
      { x: 60, y: 60 },
    ];
    const { holes } = Delaunay.flatten([outer, h1, h2]);
    expect(holes).toEqual([4, 7]);
  });
});

// ─── Deviation ──────────────────────────────────────────────────────────────

describe("deviation", () => {
  it("returns 0 for perfect triangulation", () => {
    const verts = [0, 0, 100, 0, 100, 100, 0, 100];
    const indices = Delaunay.earcut(verts);
    const dev = Delaunay.deviation(verts, null, 2, indices);
    expect(dev).toBeCloseTo(0, 5);
  });

  it("returns 0 for polygon with hole", () => {
    const verts = [
      0, 0, 100, 0, 100, 100, 0, 100, 25, 25, 75, 25, 75, 75, 25, 75,
    ];
    const holes = [4];
    const indices = Delaunay.earcut(verts, holes);
    const dev = Delaunay.deviation(verts, holes, 2, indices);
    expect(dev).toBeCloseTo(0, 5);
  });
});

// ─── triangulatePolygon (high-level) ────────────────────────────────────────

describe("triangulatePolygon", () => {
  it("triangulates a simple polygon", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ];
    const tris = Delaunay.triangulatePolygon(outer);
    expect(tris.length).toBe(2);
    for (const t of tris) {
      expect(t).toHaveProperty("p1");
      expect(t).toHaveProperty("p2");
      expect(t).toHaveProperty("p3");
    }
  });

  it("triangulates polygon with hole", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 200 },
      { x: 0, y: 200 },
    ];
    const hole = [
      { x: 50, y: 50 },
      { x: 150, y: 50 },
      { x: 150, y: 150 },
      { x: 50, y: 150 },
    ];
    const tris = Delaunay.triangulatePolygon(outer, [hole]);
    expect(tris.length).toBeGreaterThan(0);

    let areaSum = 0;
    for (const t of tris) areaSum += triangleArea(t);
    const expectedArea = 200 * 200 - 100 * 100;
    expect(areaSum).toBeCloseTo(expectedArea, 1);
  });

  it("returns Triangle objects with correct point references", () => {
    const outer = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ];
    const tris = Delaunay.triangulatePolygon(outer);
    expect(tris).toHaveLength(1);
    const t = tris[0];
    const allPts = [t.p1, t.p2, t.p3];
    for (const p of allPts) {
      expect(typeof p.x).toBe("number");
      expect(typeof p.y).toBe("number");
    }
  });
});

// ─── Delaunay triangulation (Bowyer-Watson) ─────────────────────────────────

describe("triangulate (Bowyer-Watson)", () => {
  it("triangulates a simple point set", () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 50, y: 50 },
    ];
    const tris = Delaunay.triangulate(points);
    expect(tris.length).toBeGreaterThan(0);
    for (const t of tris) {
      expect(triangleArea(t)).toBeGreaterThan(0);
    }
  });

  it("returns empty for < 3 points", () => {
    expect(Delaunay.triangulate([])).toEqual([]);
    expect(Delaunay.triangulate([{ x: 0, y: 0 }])).toEqual([]);
    expect(
      Delaunay.triangulate([
        { x: 0, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([]);
  });

  it("exactly 3 points returns 1 triangle", () => {
    const tris = Delaunay.triangulate([
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 },
    ]);
    expect(tris).toHaveLength(1);
  });

  it("satisfies Delaunay condition (no point inside circumcircle)", () => {
    const points = [
      { x: 10, y: 10 },
      { x: 90, y: 20 },
      { x: 80, y: 90 },
      { x: 20, y: 80 },
      { x: 50, y: 50 },
      { x: 30, y: 40 },
      { x: 70, y: 60 },
    ];
    const tris = Delaunay.triangulate(points);

    for (const tri of tris) {
      const triVerts = [tri.p1, tri.p2, tri.p3];
      for (const pt of points) {
        if (triVerts.includes(pt)) continue;
        expect(Delaunay.inCircumcircle(pt, tri)).toBe(false);
      }
    }
  });

  it("handles grid of points", () => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        pts.push({ x: i * 20, y: j * 20 });
      }
    }
    const tris = Delaunay.triangulate(pts);
    expect(tris.length).toBeGreaterThan(0);
  });

  it("handles random point cloud", () => {
    const pts: { x: number; y: number }[] = [];
    const rng = (seed: number) => {
      let s = seed;
      return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };
    };
    const rand = rng(42);
    for (let i = 0; i < 50; i++) {
      pts.push({ x: rand() * 500, y: rand() * 500 });
    }
    const tris = Delaunay.triangulate(pts);
    expect(tris.length).toBeGreaterThan(0);
  });
});

// ─── Circumcenter ───────────────────────────────────────────────────────────

describe("circumcenter", () => {
  it("returns center equidistant from all vertices", () => {
    const tri: Triangle = {
      p1: { x: 0, y: 0 },
      p2: { x: 100, y: 0 },
      p3: { x: 50, y: 80 },
    };
    const cc = Delaunay.circumcenter(tri);
    const d1 = Math.hypot(cc.x - tri.p1.x, cc.y - tri.p1.y);
    const d2 = Math.hypot(cc.x - tri.p2.x, cc.y - tri.p2.y);
    const d3 = Math.hypot(cc.x - tri.p3.x, cc.y - tri.p3.y);
    expect(d1).toBeCloseTo(d2, 5);
    expect(d2).toBeCloseTo(d3, 5);
  });

  it("returns centroid for right triangle", () => {
    const tri: Triangle = {
      p1: { x: 0, y: 0 },
      p2: { x: 100, y: 0 },
      p3: { x: 0, y: 100 },
    };
    const cc = Delaunay.circumcenter(tri);
    expect(cc.x).toBeCloseTo(50);
    expect(cc.y).toBeCloseTo(50);
  });

  it("handles collinear points gracefully", () => {
    const tri: Triangle = {
      p1: { x: 0, y: 0 },
      p2: { x: 50, y: 0 },
      p3: { x: 100, y: 0 },
    };
    const cc = Delaunay.circumcenter(tri);
    expect(typeof cc.x).toBe("number");
    expect(typeof cc.y).toBe("number");
    expect(isFinite(cc.x)).toBe(true);
  });
});

// ─── inCircumcircle ─────────────────────────────────────────────────────────

describe("inCircumcircle", () => {
  const tri: Triangle = {
    p1: { x: 0, y: 0 },
    p2: { x: 100, y: 0 },
    p3: { x: 50, y: 80 },
  };

  it("returns true for point inside", () => {
    expect(Delaunay.inCircumcircle({ x: 50, y: 30 }, tri)).toBe(true);
  });

  it("returns false for point far outside", () => {
    expect(Delaunay.inCircumcircle({ x: 500, y: 500 }, tri)).toBe(false);
  });

  it("returns true for centroid", () => {
    const cx = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
    const cy = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;
    expect(Delaunay.inCircumcircle({ x: cx, y: cy }, tri)).toBe(true);
  });
});

// ─── Voronoi ────────────────────────────────────────────────────────────────

describe("voronoi", () => {
  it("generates edges from Delaunay triangulation", () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
      { x: 50, y: 50 },
    ];
    const tris = Delaunay.triangulate(pts);
    const edges = Delaunay.voronoi(tris);
    expect(edges.length).toBeGreaterThan(0);
    for (const e of edges) {
      expect(e).toHaveProperty("x1");
      expect(e).toHaveProperty("y1");
      expect(e).toHaveProperty("x2");
      expect(e).toHaveProperty("y2");
      expect(isFinite(e.x1)).toBe(true);
      expect(isFinite(e.y1)).toBe(true);
    }
  });

  it("returns empty for single triangle", () => {
    const tris: Triangle[] = [
      {
        p1: { x: 0, y: 0 },
        p2: { x: 100, y: 0 },
        p3: { x: 50, y: 100 },
      },
    ];
    const edges = Delaunay.voronoi(tris);
    expect(edges).toEqual([]);
  });
});
