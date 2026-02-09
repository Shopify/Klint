import { describe, it, expect, beforeEach } from "vitest";
import Quadtree, { Rectangle } from "../../src/elements/Quadtree";

describe("Quadtree Element", () => {
  let qt: Quadtree;

  beforeEach(() => {
    qt = Quadtree.create(0, 0, 100, 100);
  });

  describe("create", () => {
    it("should start empty", () => {
      expect(qt.size).toBe(0);
    });
  });

  describe("insert", () => {
    it("should insert a point within bounds", () => {
      const result = qt.insert({ x: 50, y: 50 });
      expect(result).toBe(true);
      expect(qt.size).toBe(1);
    });

    it("should reject points outside bounds", () => {
      const result = qt.insert({ x: 150, y: 50 });
      expect(result).toBe(false);
      expect(qt.size).toBe(0);
    });

    it("should handle multiple insertions", () => {
      for (let i = 0; i < 20; i++) {
        qt.insert({ x: Math.random() * 99, y: Math.random() * 99 });
      }
      expect(qt.size).toBe(20);
    });

    it("should handle edge points", () => {
      expect(qt.insert({ x: 0, y: 0 })).toBe(true);
      // x=100 is outside (exclusive upper bound)
      expect(qt.insert({ x: 100, y: 100 })).toBe(false);
      expect(qt.insert({ x: 99, y: 99 })).toBe(true);
    });
  });

  describe("query", () => {
    it("should find points in query range", () => {
      qt.insert({ x: 10, y: 10 });
      qt.insert({ x: 50, y: 50 });
      qt.insert({ x: 90, y: 90 });

      const found = qt.query(new Rectangle(15, 15, 15, 15));
      expect(found).toHaveLength(1);
      expect(found[0].x).toBe(10);
    });

    it("should return empty for non-overlapping range", () => {
      qt.insert({ x: 10, y: 10 });
      const found = qt.query(new Rectangle(200, 200, 25, 25));
      expect(found).toHaveLength(0);
    });

    it("should find all points when range covers full tree", () => {
      qt.insert({ x: 10, y: 10 });
      qt.insert({ x: 50, y: 50 });
      qt.insert({ x: 90, y: 90 });

      const found = qt.query(new Rectangle(50, 50, 50, 50));
      expect(found).toHaveLength(3);
    });
  });

  describe("queryRadius", () => {
    it("should find points within radius", () => {
      qt.insert({ x: 50, y: 50 });
      qt.insert({ x: 55, y: 50 });
      qt.insert({ x: 90, y: 90 });

      const found = qt.queryRadius(50, 50, 10);
      expect(found).toHaveLength(2);
    });

    it("should not include distant points", () => {
      qt.insert({ x: 10, y: 10 });
      qt.insert({ x: 90, y: 90 });

      const found = qt.queryRadius(10, 10, 5);
      expect(found).toHaveLength(1);
      expect(found[0].x).toBe(10);
    });
  });

  describe("clear", () => {
    it("should remove all points", () => {
      qt.insert({ x: 10, y: 10 });
      qt.insert({ x: 50, y: 50 });
      qt.clear();
      expect(qt.size).toBe(0);
    });
  });

  describe("custom data", () => {
    it("should preserve extra properties on points", () => {
      qt.insert({ x: 50, y: 50, color: "red", id: 42 });
      const found = qt.queryRadius(50, 50, 10);
      expect(found[0].color).toBe("red");
      expect(found[0].id).toBe(42);
    });
  });

  describe("subdivision", () => {
    it("should handle many points in the same region via subdivision", () => {
      for (let i = 0; i < 50; i++) {
        qt.insert({ x: 10 + Math.random() * 5, y: 10 + Math.random() * 5 });
      }
      expect(qt.size).toBe(50);

      const found = qt.queryRadius(12, 12, 10);
      expect(found.length).toBeGreaterThan(0);
    });
  });

  describe("Rectangle", () => {
    it("should correctly test containment", () => {
      const r = new Rectangle(50, 50, 50, 50); // center 50,50 half-extents 50,50 → covers 0-100
      expect(r.contains({ x: 0, y: 0 })).toBe(true);
      expect(r.contains({ x: 99, y: 99 })).toBe(true);
      expect(r.contains({ x: 100, y: 100 })).toBe(false); // exclusive
    });

    it("should correctly test rectangle intersection", () => {
      const a = new Rectangle(25, 25, 25, 25); // 0-50
      const b = new Rectangle(40, 40, 25, 25); // 15-65 — overlaps
      const c = new Rectangle(80, 80, 10, 10); // 70-90 — no overlap
      expect(a.intersects(b)).toBe(true);
      expect(a.intersects(c)).toBe(false);
    });

    it("should correctly test circle intersection", () => {
      const r = new Rectangle(50, 50, 50, 50);
      expect(r.intersectsCircle(50, 50, 10)).toBe(true); // inside
      expect(r.intersectsCircle(110, 50, 15)).toBe(true); // touching edge
      expect(r.intersectsCircle(200, 200, 10)).toBe(false); // far away
    });
  });
});
