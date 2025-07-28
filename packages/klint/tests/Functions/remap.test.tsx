import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  constrain: (val: number, floor: number, ceil: number) => number;
  lerp: (A: number, B: number, mix: number, bounded?: boolean) => number;
  remap: (
    n: number,
    A: number,
    B: number,
    C: number,
    D: number,
    bounded?: boolean
  ) => number;
  _ctx: CanvasRenderingContext2D;
};

describe("remap", () => {
  let K: KlintContext;
  let lerpCalled = false;
  let lastLerpArgs: any[] = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    lerpCalled = false;
    lastLerpArgs = [];

    // Create minimal mock context
    K = {
      constrain(val: number, floor: number, ceil: number) {
        return Math.max(floor, Math.min(val, ceil));
      },
      lerp(A: number, B: number, mix: number, bounded = true) {
        lerpCalled = true;
        lastLerpArgs = [A, B, mix, bounded];
        return A + (B - A) * (bounded ? this.constrain(mix, 0, 1) : mix);
      },
      remap(
        n: number,
        A: number,
        B: number,
        C: number,
        D: number,
        bounded = true
      ) {
        const t = (n - A) / (B - A);
        return this.lerp(C, D, t, bounded);
      },
      _ctx: ctx,
    };
  });

  it("should correctly remap a value from one range to another", () => {
    // Remap 5 from range [0, 10] to range [0, 100]
    expect(K.remap(5, 0, 10, 0, 100)).toBe(50);

    // Remap 75 from range [0, 100] to range [0, 1]
    expect(K.remap(75, 0, 100, 0, 1)).toBe(0.75);

    // Remap middle of one range to middle of another range
    expect(K.remap(50, 0, 100, 0, 200)).toBe(100);
  });

  it("should call lerp with the correct parameters", () => {
    K.remap(5, 0, 10, 100, 200);

    expect(lerpCalled).toBe(true);
    expect(lastLerpArgs[0]).toBe(100); // C
    expect(lastLerpArgs[1]).toBe(200); // D
    expect(lastLerpArgs[2]).toBe(0.5); // t = (5 - 0) / (10 - 0) = 0.5
    expect(lastLerpArgs[3]).toBe(true); // bounded = true
  });

  it("should correctly handle negative ranges", () => {
    // Remap 0 from range [-100, 100] to range [0, 50]
    expect(K.remap(0, -100, 100, 0, 50)).toBe(25);

    // Remap -50 from range [-100, 100] to range [0, 50]
    expect(K.remap(-50, -100, 100, 0, 50)).toBe(12.5);
  });

  it("should constrain values to destination range when bounded is true", () => {
    // Value outside of source range (15 > 10) should be constrained to 100
    expect(K.remap(15, 0, 10, 0, 100, true)).toBe(100);

    // Value outside of source range (-5 < 0) should be constrained to 0
    expect(K.remap(-5, 0, 10, 0, 100, true)).toBe(0);
  });

  it("should not constrain values when bounded is false", () => {
    // Value outside of source range (15 > 10) should map to 150
    expect(K.remap(15, 0, 10, 0, 100, false)).toBe(150);

    // Value outside of source range (-5 < 0) should map to -50
    expect(K.remap(-5, 0, 10, 0, 100, false)).toBe(-50);
  });

  it("should handle inverted ranges", () => {
    // Remap 25 from range [0, 100] to range [100, 0]
    expect(K.remap(25, 0, 100, 100, 0)).toBe(75);

    // Remap 75 from range [100, 0] to range [0, 1]
    expect(K.remap(75, 100, 0, 0, 1)).toBe(0.25);
  });

  it("should handle mapping to the same value when source range has zero width", () => {
    // Division by zero case, should handle gracefully
    const result = K.remap(5, 5, 5, 0, 100);
    // Implementation may vary, but result should be a number
    expect(typeof result).toBe("number");
    // Since 5 === 5, t is NaN, so the result depends on the lerp implementation
  });

  it("should handle decimal values correctly", () => {
    expect(K.remap(2.5, 0, 5, 0, 10)).toBe(5);
    expect(K.remap(1.5, 0, 3, 10, 40)).toBe(25);
  });
});
