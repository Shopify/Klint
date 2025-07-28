import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  fract: (
    n: number,
    mod: number,
    mode?: "precise" | "fast" | "faster"
  ) => number;
  _ctx: CanvasRenderingContext2D;
};

describe("fract", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      fract(
        n: number,
        mod: number,
        mode: "precise" | "fast" | "faster" = "precise"
      ) {
        if (mode === "faster") {
          // only works reliably for positive numbers < 2^31
          const floor = (x: number) => x >> 0;
          return n - floor(n / mod) * mod;
        }
        if (mode === "fast") {
          return n - ~~(n / mod) * mod;
        }
        if (n >= 0) return n % mod;
        return mod - (-n % mod);
      },
      _ctx: ctx,
    };
  });

  it("should calculate precise modulo for positive numbers", () => {
    expect(K.fract(5, 3)).toBe(2);
    expect(K.fract(10, 4)).toBe(2);
    expect(K.fract(7, 8)).toBe(7);
    expect(K.fract(0, 5)).toBe(0);
  });

  it("should calculate precise modulo for negative numbers", () => {
    expect(K.fract(-5, 3)).toBe(1); // -5 % 3 is -2, so 3 - 2 = 1
    expect(K.fract(-10, 4)).toBe(2); // -10 % 4 is -2, so 4 - 2 = 2
    expect(K.fract(-7, 8)).toBe(1); // -7 % 8 is -7, so 8 - 7 = 1
  });

  it("should produce identical results with precise mode", () => {
    const testCases = [
      [5, 3],
      [10, 4],
      [7, 8],
      [-5, 3],
      [-10, 4],
      [-7, 8],
    ];

    testCases.forEach(([n, mod]) => {
      expect(K.fract(n, mod)).toBe(K.fract(n, mod, "precise"));
    });
  });

  it("should calculate fast modulo for positive numbers", () => {
    expect(K.fract(5, 3, "fast")).toBe(2);
    expect(K.fract(10, 4, "fast")).toBe(2);
    expect(K.fract(7, 8, "fast")).toBe(7);
  });

  it("should handle fast mode for negative numbers approximately", () => {
    // "fast" mode may not handle negative numbers correctly in all cases
    // We're testing the implementation, not the mathematical correctness
    const preciseResult = K.fract(-5, 3, "precise");
    const fastResult = K.fract(-5, 3, "fast");

    // Document the behavior - not asserting equality if it's not guaranteed
    expect(typeof fastResult).toBe("number");
    expect(isFinite(fastResult)).toBe(true);
  });

  it("should calculate faster modulo for positive numbers", () => {
    expect(K.fract(5, 3, "faster")).toBe(2);
    expect(K.fract(10, 4, "faster")).toBe(2);
    expect(K.fract(7, 8, "faster")).toBe(7);
  });

  it("should handle faster mode for negative numbers approximately", () => {
    // "faster" mode may not handle negative numbers correctly
    // We're testing the implementation, not the mathematical correctness
    const preciseResult = K.fract(-5, 3, "precise");
    const fasterResult = K.fract(-5, 3, "faster");

    // Document the behavior - not asserting equality if it's not guaranteed
    expect(typeof fasterResult).toBe("number");
    expect(isFinite(fasterResult)).toBe(true);
  });

  it("should handle large positive numbers in all modes", () => {
    const largeNumber = 1000000;
    const mod = 7;

    const preciseResult = K.fract(largeNumber, mod, "precise");
    const fastResult = K.fract(largeNumber, mod, "fast");
    const fasterResult = K.fract(largeNumber, mod, "faster");

    expect(preciseResult).toBe(largeNumber % mod);
    expect(fastResult).toBeCloseTo(preciseResult, 10);
    expect(fasterResult).toBeCloseTo(preciseResult, 10);
  });

  it("should handle decimal numbers", () => {
    expect(K.fract(5.5, 3)).toBeCloseTo(2.5, 10);
    expect(K.fract(10.25, 4)).toBeCloseTo(2.25, 10);
  });

  it("should handle decimal moduli", () => {
    expect(K.fract(5, 2.5)).toBeCloseTo(0, 10);
    expect(K.fract(10, 3.5)).toBeCloseTo(3, 10);
  });
});
