import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  constrain: (val: number, floor: number, ceil: number) => number;
  lerp: (A: number, B: number, mix: number, bounded?: boolean) => number;
  _ctx: CanvasRenderingContext2D;
};

describe("lerp", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      constrain(val: number, floor: number, ceil: number) {
        return Math.max(floor, Math.min(val, ceil));
      },
      lerp(A: number, B: number, mix: number, bounded = true) {
        return A + (B - A) * (bounded ? this.constrain(mix, 0, 1) : mix);
      },
      _ctx: ctx,
    };
  });

  it("should correctly interpolate between two values", () => {
    expect(K.lerp(0, 10, 0)).toBe(0);
    expect(K.lerp(0, 10, 0.5)).toBe(5);
    expect(K.lerp(0, 10, 1)).toBe(10);

    expect(K.lerp(100, 200, 0)).toBe(100);
    expect(K.lerp(100, 200, 0.25)).toBe(125);
    expect(K.lerp(100, 200, 0.75)).toBe(175);
    expect(K.lerp(100, 200, 1)).toBe(200);
  });

  it("should constrain mix value between 0 and 1 when bounded is true", () => {
    expect(K.lerp(0, 10, -1)).toBe(0);
    expect(K.lerp(0, 10, 2)).toBe(10);

    expect(K.lerp(100, 200, -0.5)).toBe(100);
    expect(K.lerp(100, 200, 1.5)).toBe(200);
  });

  it("should allow mix value outside 0-1 range when bounded is false", () => {
    expect(K.lerp(0, 10, -1, false)).toBe(-10);
    expect(K.lerp(0, 10, 2, false)).toBe(20);

    expect(K.lerp(100, 200, -0.5, false)).toBe(50);
    expect(K.lerp(100, 200, 1.5, false)).toBe(250);
  });

  it("should handle negative values correctly", () => {
    expect(K.lerp(-10, 10, 0.5)).toBe(0);
    expect(K.lerp(-100, -50, 0.5)).toBe(-75);
  });
});
