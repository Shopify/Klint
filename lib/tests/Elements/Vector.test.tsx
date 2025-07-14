import { describe, it, expect, beforeEach } from "vitest";
import Vector from "../../src/elements/Vector";

describe("Vector Element", () => {
  let vec: Vector;

  beforeEach(() => {
    vec = new Vector(10, 20, 30);
  });

  describe("Vector Creation", () => {
    it("should create a vector with default values", () => {
      const v = new Vector();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it("should create a vector with 2D values (z defaults to 0)", () => {
      const v = new Vector(5, 10);
      expect(v.x).toBe(5);
      expect(v.y).toBe(10);
      expect(v.z).toBe(0);
    });

    it("should create a vector with 3D values", () => {
      const v = new Vector(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
  });

  describe("Basic Vector Operations", () => {
    it("should add vectors", () => {
      const v2 = new Vector(5, 10, 15);
      const result = vec.add(v2);
      expect(result.x).toBe(15);
      expect(result.y).toBe(30);
      expect(result.z).toBe(45);
      expect(result).toBe(vec); // Should return same instance
    });

    it("should subtract vectors", () => {
      const v2 = new Vector(5, 10, 15);
      const result = vec.sub(v2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result.z).toBe(15);
      expect(result).toBe(vec); // Should return same instance
    });

    it("should multiply by scalar", () => {
      const result = vec.mult(2);
      expect(result.x).toBe(20);
      expect(result.y).toBe(40);
      expect(result.z).toBe(60);
      expect(result).toBe(vec); // Should return same instance
    });

    it("should divide by scalar", () => {
      const result = vec.div(2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result.z).toBe(15);
      expect(result).toBe(vec); // Should return same instance
    });
  });

  describe("Vector Geometric Operations", () => {
    it("should calculate magnitude", () => {
      const v = new Vector(3, 4, 0);
      expect(v.mag()).toBe(5);
    });

    it("should calculate magnitude with z component", () => {
      const v = new Vector(2, 3, 6);
      expect(v.mag()).toBe(7);
    });

    it("should calculate length (alias for mag)", () => {
      const v = new Vector(3, 4, 0);
      expect(v.length()).toBe(5);
    });

    it("should rotate vector around z-axis", () => {
      const v = new Vector(1, 0, 0);
      v.rotate(Math.PI / 2);
      expect(v.x).toBeCloseTo(0, 10);
      expect(v.y).toBeCloseTo(1, 10);
      expect(v.z).toBe(0);
    });

    it("should normalize vector", () => {
      const v = new Vector(3, 4, 0);
      const result = v.normalize();
      expect(result.mag()).toBeCloseTo(1, 10);
      expect(result.x).toBeCloseTo(0.6, 10);
      expect(result.y).toBeCloseTo(0.8, 10);
      expect(result).toBe(v); // Should return same instance
    });

    it("should handle normalizing zero vector", () => {
      const v = new Vector(0, 0, 0);
      const result = v.normalize();
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe("Vector Calculations", () => {
    it("should calculate dot product", () => {
      const v1 = new Vector(2, 3, 4);
      const v2 = new Vector(5, 6, 7);
      expect(v1.dot(v2)).toBe(56); // 2*5 + 3*6 + 4*7 = 10 + 18 + 28 = 56
    });

    it("should calculate distance between vectors", () => {
      const v1 = new Vector(0, 0, 0);
      const v2 = new Vector(3, 4, 0);
      expect(v1.dist(v2)).toBe(5);
    });

    it("should calculate distance with z component", () => {
      const v1 = new Vector(0, 0, 0);
      const v2 = new Vector(2, 3, 6);
      expect(v1.dist(v2)).toBe(7);
    });

    it("should calculate angle (2D angle ignoring z)", () => {
      const v = new Vector(1, 1, 5);
      const angle = v.angle();
      expect(angle).toBeCloseTo((Math.PI * 3) / 4, 10);
    });
  });

  describe("Vector Utility Methods", () => {
    it("should copy vector", () => {
      const copy = vec.copy();
      expect(copy.x).toBe(vec.x);
      expect(copy.y).toBe(vec.y);
      expect(copy.z).toBe(vec.z);
      expect(copy).not.toBe(vec); // Should be different instance
    });

    it("should set vector coordinates", () => {
      const result = vec.set(100, 200, 300);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
      expect(result.z).toBe(300);
      expect(result).toBe(vec); // Should return same instance
    });

    it("should set vector coordinates with z defaulting to 0", () => {
      const result = vec.set(100, 200);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
      expect(result.z).toBe(0);
    });
  });

  describe("Cross Product", () => {
    it("should calculate cross product", () => {
      const v1 = new Vector(1, 0, 0);
      const v2 = new Vector(0, 1, 0);
      const cross = v1.cross(v2);
      expect(cross.x).toBe(0);
      expect(cross.y).toBe(0);
      expect(cross.z).toBe(1);
    });

    it("should calculate cross product with different vectors", () => {
      const v1 = new Vector(2, 3, 4);
      const v2 = new Vector(5, 6, 7);
      const cross = v1.cross(v2);
      expect(cross.x).toBe(-3); // 3*7 - 4*6 = 21 - 24 = -3
      expect(cross.y).toBe(6); // 4*5 - 2*7 = 20 - 14 = 6
      expect(cross.z).toBe(-3); // 2*6 - 3*5 = 12 - 15 = -3
    });
  });

  describe("New Vector Methods", () => {
    it("should calculate relative position", () => {
      const v1 = new Vector(10, 20, 30);
      const v2 = new Vector(5, 10, 15);
      const result = v1.relativeTo(v2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result.z).toBe(15);
      expect(result).toBe(v1); // Should return same instance
    });

    it("should make vector look at target", () => {
      const v1 = new Vector(0, 0, 0);
      const target = new Vector(3, 4, 0);
      const result = v1.lookAt(target);
      expect(result.mag()).toBeCloseTo(1, 10); // Should be normalized
      expect(result.x).toBeCloseTo(0.6, 10);
      expect(result.y).toBeCloseTo(0.8, 10);
      expect(result.z).toBe(0);
      expect(result).toBe(v1); // Should return same instance
    });

    it("should convert to screen coordinates", () => {
      const v = new Vector(0, 0, 0); // Center of normalized coordinates
      const result = v.toScreen(800, 600);
      expect(result.x).toBe(400); // (0 + 1) * 800 / 2 = 400
      expect(result.y).toBe(300); // (1 - 0) * 600 / 2 = 300
      expect(result).toBe(v); // Should return same instance
    });

    it("should convert edge coordinates to screen", () => {
      const v = new Vector(-1, 1, 0); // Top-left in normalized coordinates
      const result = v.toScreen(800, 600);
      expect(result.x).toBe(0); // (-1 + 1) * 800 / 2 = 0
      expect(result.y).toBe(0); // (1 - 1) * 600 / 2 = 0
    });
  });

  describe("Spherical Linear Interpolation (slerp)", () => {
    it("should return original vector when amount is 0", () => {
      const v1 = new Vector(1, 0, 0);
      const v2 = new Vector(0, 1, 0);
      const result = v1.slerp(v2, 0);
      expect(result.x).toBe(1);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it("should return target vector when amount is 1", () => {
      const v1 = new Vector(1, 0, 0);
      const v2 = new Vector(0, 1, 0);
      const result = v1.slerp(v2, 1);
      expect(result.x).toBe(0);
      expect(result.y).toBe(1);
      expect(result.z).toBe(0);
    });

    it("should interpolate between vectors", () => {
      const v1 = new Vector(1, 0, 0);
      const v2 = new Vector(0, 1, 0);
      const result = v1.slerp(v2, 0.5);
      // Should be roughly halfway between the two vectors
      expect(result.x).toBeCloseTo(0.707, 2);
      expect(result.y).toBeCloseTo(0.707, 2);
      expect(result.z).toBe(0);
    });

    it("should handle zero vectors with linear interpolation", () => {
      const v1 = new Vector(0, 0, 0);
      const v2 = new Vector(2, 4, 6);
      const result = v1.slerp(v2, 0.5);
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
      expect(result.z).toBe(3);
    });
  });

  describe("Static Methods", () => {
    it("should create vector from angle (2D)", () => {
      const center = new Vector(100, 200, 0);
      const angle = Math.PI / 2; // 90 degrees
      const radius = 50;
      const result = Vector.fromAngle(center, angle, radius);

      expect(result.x).toBeCloseTo(100, 10); // cos(90°) = 0
      expect(result.y).toBeCloseTo(250, 10); // sin(90°) = 1
      expect(result.z).toBe(0);
    });

    it("should create vector from angle with z component", () => {
      const center = new Vector(100, 200, 300);
      const angle = 0; // 0 degrees
      const radius = 50;
      const result = Vector.fromAngle(center, angle, radius);

      expect(result.x).toBeCloseTo(150, 10); // cos(0°) = 1
      expect(result.y).toBeCloseTo(200, 10); // sin(0°) = 0
      expect(result.z).toBe(300); // Should preserve z
    });
  });
});
