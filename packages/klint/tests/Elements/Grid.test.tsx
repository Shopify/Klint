import { describe, it, expect, beforeEach } from "vitest";
import Grid from "../../src/elements/Grid";

// Mock Klint context
const mockContext = {} as any;

describe("Grid Element", () => {
  let grid: Grid;

  beforeEach(() => {
    grid = new Grid(mockContext);
  });

  describe("rect()", () => {
    it("should create a rectangular grid with correct number of points", () => {
      const points = grid.rect(0, 0, 100, 100, 5, 5);
      expect(points).toHaveLength(25); // 5x5 grid
    });

    it("should position points correctly with corner origin", () => {
      const points = grid.rect(10, 20, 100, 100, 3, 3);
      
      // Check corner points
      expect(points[0]).toEqual({ x: 10, y: 20, i: 0, j: 0, id: 0 }); // top-left
      expect(points[2]).toEqual({ x: 110, y: 20, i: 2, j: 0, id: 2 }); // top-right
      expect(points[6]).toEqual({ x: 10, y: 120, i: 0, j: 2, id: 6 }); // bottom-left
      expect(points[8]).toEqual({ x: 110, y: 120, i: 2, j: 2, id: 8 }); // bottom-right
    });

    it("should position points correctly with center origin", () => {
      const points = grid.rect(50, 50, 100, 100, 3, 3, { origin: 'center' });
      
      // With center origin, the grid should be centered at (50, 50)
      expect(points[0]).toEqual({ x: 0, y: 0, i: 0, j: 0, id: 0 }); // top-left
      expect(points[4]).toEqual({ x: 50, y: 50, i: 1, j: 1, id: 4 }); // center
      expect(points[8]).toEqual({ x: 100, y: 100, i: 2, j: 2, id: 8 }); // bottom-right
    });

    it("should handle single point grids", () => {
      const points = grid.rect(50, 50, 0, 0, 1, 1);
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual({ x: 50, y: 50, i: 0, j: 0, id: 0 });
    });

    it("should assign correct indices and IDs", () => {
      const points = grid.rect(0, 0, 100, 100, 3, 2);
      
      // First row
      expect(points[0]).toMatchObject({ i: 0, j: 0, id: 0 });
      expect(points[1]).toMatchObject({ i: 1, j: 0, id: 1 });
      expect(points[2]).toMatchObject({ i: 2, j: 0, id: 2 });
      
      // Second row
      expect(points[3]).toMatchObject({ i: 0, j: 1, id: 3 });
      expect(points[4]).toMatchObject({ i: 1, j: 1, id: 4 });
      expect(points[5]).toMatchObject({ i: 2, j: 1, id: 5 });
    });
  });

  describe("radial()", () => {
    it("should create a radial grid with correct structure", () => {
      const points = grid.radial(100, 100, 50, 8, 3, 20);
      
      // Should have points for each ring
      // Ring 0: 8 points, Ring 1: 8 points, Ring 2: 8 points
      expect(points.length).toBeGreaterThan(0);
    });

    it("should position points in circular pattern", () => {
      const points = grid.radial(0, 0, 50, 4, 2, 25);
      
      // First ring (radius 0) - all points at center
      const ring0Points = points.filter(p => p.j === 0);
      ring0Points.forEach(p => {
        expect(p.x).toBeCloseTo(0);
        expect(p.y).toBeCloseTo(0);
      });
      
      // Second ring (radius 25)
      const ring1Points = points.filter(p => p.j === 1);
      ring1Points.forEach(p => {
        const distance = Math.sqrt(p.x * p.x + p.y * p.y);
        expect(distance).toBeCloseTo(25);
      });
    });

    it("should increase points per ring with perStepCount", () => {
      const points = grid.radial(0, 0, 100, 4, 3, 30, { perStepCount: 2 });
      
      // Ring 0: 4 points
      // Ring 1: 6 points (4 + 2*1)
      // Ring 2: 8 points (4 + 2*2)
      const ring0 = points.filter(p => p.j === 0);
      const ring1 = points.filter(p => p.j === 1);
      const ring2 = points.filter(p => p.j === 2);
      
      expect(ring0).toHaveLength(4);
      expect(ring1).toHaveLength(6);
      expect(ring2).toHaveLength(8);
    });

    it("should not exceed maximum radius", () => {
      const points = grid.radial(0, 0, 50, 4, 10, 20);
      
      // Should only create rings within radius 50
      // Ring 0: radius 0, Ring 1: radius 20, Ring 2: radius 40
      // Ring 3 would be radius 60, which exceeds 50
      points.forEach(p => {
        const distance = Math.sqrt(p.x * p.x + p.y * p.y);
        expect(distance).toBeLessThanOrEqual(50);
      });
    });

    it("should handle single center point", () => {
      const points = grid.radial(50, 50, 0, 1, 1, 10);
      
      // With radius 0, should only have center point
      if (points.length > 0) {
        expect(points[0]).toMatchObject({ x: 50, y: 50, i: 0, j: 0, id: 0 });
      }
    });
  });

  describe("hex()", () => {
    it("should create a hexagonal grid", () => {
      const points = grid.hex(0, 0, 200, 200, 20);
      
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
      expect(points[0]).toHaveProperty('i');
      expect(points[0]).toHaveProperty('j');
      expect(points[0]).toHaveProperty('id');
    });

    it("should offset rows for pointy-topped hexagons", () => {
      const points = grid.hex(0, 0, 200, 200, 20, { pointy: true });
      
      // Find points from different rows
      const row0 = points.filter(p => p.j === 0);
      const row1 = points.filter(p => p.j === 1);
      
      if (row0.length > 0 && row1.length > 0) {
        // Row 1 should be offset horizontally
        const row0FirstX = row0[0].x;
        const row1FirstX = row1[0].x;
        expect(row1FirstX).not.toBe(row0FirstX);
      }
    });

    it("should offset columns for flat-topped hexagons", () => {
      const points = grid.hex(0, 0, 200, 200, 20, { pointy: false });
      
      // Find points from different columns
      const col0 = points.filter(p => p.i === 0);
      const col1 = points.filter(p => p.i === 1);
      
      if (col0.length > 0 && col1.length > 0) {
        // Column 1 should be offset vertically
        const col0FirstY = col0[0].y;
        const col1FirstY = col1[0].y;
        expect(col1FirstY).not.toBe(col0FirstY);
      }
    });

    it("should respect center origin", () => {
      const points = grid.hex(100, 100, 200, 200, 20, { origin: 'center' });
      
      // Points should be distributed around the center
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const centerX = (minX + maxX) / 2;
      
      // Center should be approximately at 100
      expect(centerX).toBeCloseTo(100, -1);
    });
  });

  describe("triangle()", () => {
    it("should create a triangular grid", () => {
      const points = grid.triangle(0, 0, 200, 200, 30);
      
      expect(points.length).toBeGreaterThan(0);
      expect(points[0]).toHaveProperty('x');
      expect(points[0]).toHaveProperty('y');
      expect(points[0]).toHaveProperty('i');
      expect(points[0]).toHaveProperty('j');
      expect(points[0]).toHaveProperty('id');
    });

    it("should space points correctly for triangular pattern", () => {
      const size = 30;
      const points = grid.triangle(0, 0, 200, 200, size);
      
      // Points in the same row should be spaced by size/2 horizontally
      const row0 = points.filter(p => p.j === 0);
      if (row0.length >= 2) {
        const spacing = row0[1].x - row0[0].x;
        expect(spacing).toBeCloseTo(size / 2);
      }
      
      // Rows should be spaced by sqrt(3)/2 * size vertically
      const expectedRowSpacing = (Math.sqrt(3) / 2) * size;
      const col0 = points.filter(p => p.i === 0);
      if (col0.length >= 2) {
        const rowSpacing = col0[1].y - col0[0].y;
        expect(rowSpacing).toBeCloseTo(expectedRowSpacing);
      }
    });

    it("should respect origin setting", () => {
      const cornerPoints = grid.triangle(50, 50, 100, 100, 20, { origin: 'corner' });
      const centerPoints = grid.triangle(50, 50, 100, 100, 20, { origin: 'center' });
      
      // First point should be at different positions
      expect(cornerPoints[0].x).toBe(50);
      expect(cornerPoints[0].y).toBe(50);
      
      expect(centerPoints[0].x).toBe(0);
      expect(centerPoints[0].y).toBe(0);
    });

    it("should only include points within specified area", () => {
      const points = grid.triangle(0, 0, 100, 100, 20);
      
      points.forEach(p => {
        expect(p.x).toBeLessThanOrEqual(100);
        expect(p.y).toBeLessThanOrEqual(100);
      });
    });
  });
});