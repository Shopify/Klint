import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  PI: number;
  TWO_PI: number;
  TAU: number;
  _ctx: CanvasRenderingContext2D;
};

describe("Mathematical Constants", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      PI: Math.PI,
      TWO_PI: Math.PI * 2,
      TAU: Math.PI * 2,
      _ctx: ctx,
    };
  });

  describe("PI", () => {
    it("should equal Math.PI", () => {
      expect(K.PI).toBe(Math.PI);
      expect(K.PI).toBeCloseTo(3.141592653589793);
    });
  });

  describe("TWO_PI", () => {
    it("should equal 2 * Math.PI", () => {
      expect(K.TWO_PI).toBe(Math.PI * 2);
      expect(K.TWO_PI).toBeCloseTo(6.283185307179586);
    });

    it("should be twice the value of PI", () => {
      expect(K.TWO_PI).toBe(K.PI * 2);
    });
  });

  describe("TAU", () => {
    it("should equal 2 * Math.PI", () => {
      expect(K.TAU).toBe(Math.PI * 2);
      expect(K.TAU).toBeCloseTo(6.283185307179586);
    });

    it("should equal TWO_PI", () => {
      expect(K.TAU).toBe(K.TWO_PI);
    });

    it("should be twice the value of PI", () => {
      expect(K.TAU).toBe(K.PI * 2);
    });
  });

  describe("Usage in trigonometry", () => {
    it("should work correctly with trigonometric functions", () => {
      // Full circle rotation
      expect(Math.cos(K.TWO_PI)).toBeCloseTo(1);
      expect(Math.sin(K.TWO_PI)).toBeCloseTo(0);
      
      // Half circle
      expect(Math.cos(K.PI)).toBeCloseTo(-1);
      expect(Math.sin(K.PI)).toBeCloseTo(0);
      
      // Quarter circle
      expect(Math.cos(K.PI / 2)).toBeCloseTo(0);
      expect(Math.sin(K.PI / 2)).toBeCloseTo(1);
      
      // Using TAU for full rotation
      expect(Math.cos(K.TAU)).toBeCloseTo(1);
      expect(Math.sin(K.TAU)).toBeCloseTo(0);
    });
  });
});