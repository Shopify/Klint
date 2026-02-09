import { describe, it, expect, beforeEach } from "vitest";
import Easing from "../../src/elements/Easing";

describe("Easing", () => {
  let easing: Easing;

  beforeEach(() => {
    easing = new Easing();
  });

  describe("normalize", () => {
    it("should normalize values from [-1, 1] to [0, 1]", () => {
      expect(easing.normalize(-1)).toBe(0);
      expect(easing.normalize(0)).toBe(0.5);
      expect(easing.normalize(1)).toBe(1);
      expect(easing.normalize(-0.5)).toBe(0.25);
      expect(easing.normalize(0.5)).toBe(0.75);
    });
  });

  describe("expand", () => {
    it("should expand values from [0, 1] to [-1, 1]", () => {
      expect(easing.expand(0)).toBe(-1);
      expect(easing.expand(0.5)).toBe(0);
      expect(easing.expand(1)).toBe(1);
      expect(easing.expand(0.25)).toBe(-0.5);
      expect(easing.expand(0.75)).toBe(0.5);
    });
  });

  describe("in", () => {
    it("should apply ease-in with default power of 2", () => {
      expect(easing.in(0)).toBe(0);
      expect(easing.in(0.5)).toBe(0.25);
      expect(easing.in(1)).toBe(1);
    });

    it("should apply ease-in with custom power", () => {
      expect(easing.in(0.5, 3)).toBe(0.125); // 0.5^3
      expect(easing.in(0.5, 4)).toBe(0.0625); // 0.5^4
    });
  });

  describe("out", () => {
    it("should apply ease-out with default power of 2", () => {
      expect(easing.out(0)).toBe(0);
      expect(easing.out(0.5)).toBe(0.75);
      expect(easing.out(1)).toBe(1);
    });

    it("should apply ease-out with even power", () => {
      const val = easing.out(0.5, 2);
      expect(val).toBeCloseTo(0.75, 5);
    });

    it("should apply ease-out with odd power", () => {
      const val = easing.out(0.5, 3);
      expect(val).toBeCloseTo(0.875, 5);
    });
  });

  describe("inout", () => {
    it("should apply ease-in-out with default power of 2", () => {
      expect(easing.inout(0)).toBe(0);
      expect(easing.inout(0.25)).toBe(0.125);
      expect(easing.inout(0.5)).toBe(0.5);
      expect(easing.inout(0.75)).toBe(0.875);
      expect(easing.inout(1)).toBe(1);
    });

    it("should apply ease-in-out with custom power", () => {
      const val = easing.inout(0.25, 3);
      expect(val).toBeCloseTo(0.0625, 5); // in phase

      const val2 = easing.inout(0.75, 3);
      expect(val2).toBeCloseTo(0.9375, 5); // out phase
    });
  });

  describe("overshoot functions", () => {
    it("should apply overshootIn", () => {
      expect(easing.overshootIn(0)).toBe(0);
      expect(easing.overshootIn(1)).toBeCloseTo(1, 5);

      // Should go slightly negative at the beginning
      const mid = easing.overshootIn(0.2);
      expect(mid).toBeLessThan(0);
    });

    it("should apply overshootOut", () => {
      expect(easing.overshootOut(0)).toBe(0);
      expect(easing.overshootOut(1)).toBe(1);

      // Should go slightly above 1 near the end
      const mid = easing.overshootOut(0.8);
      expect(mid).toBeGreaterThan(1);
    });

    it("should apply overshootInOut", () => {
      expect(easing.overshootInOut(0)).toBe(0);
      expect(easing.overshootInOut(0.5)).toBe(0.5);
      expect(easing.overshootInOut(1)).toBe(1);

      // Should have negative overshoot in first half
      const early = easing.overshootInOut(0.1);
      expect(early).toBeLessThan(0);

      // Should have positive overshoot in second half
      const late = easing.overshootInOut(0.9);
      expect(late).toBeGreaterThan(1);
    });
  });

  describe("spring", () => {
    it("should start at 0 and approach 1", () => {
      expect(easing.spring(0)).toBeCloseTo(0, 2);
      expect(easing.spring(1)).toBeCloseTo(1, 1);
    });

    it("should overshoot with high friction (low damping)", () => {
      // With friction=0.8 (bouncy), value should exceed 1 at some point
      let maxVal = 0;
      for (let t = 0; t <= 1; t += 0.01) {
        maxVal = Math.max(maxVal, easing.spring(t, 0.5, 0.8));
      }
      expect(maxVal).toBeGreaterThan(1);
    });

    it("should settle without overshoot at low friction", () => {
      // With friction=0 (critically damped), should not exceed 1
      let maxVal = 0;
      for (let t = 0; t <= 1; t += 0.01) {
        maxVal = Math.max(maxVal, easing.spring(t, 0.5, 0));
      }
      expect(maxVal).toBeLessThanOrEqual(1.01);
    });
  });

  describe("steps", () => {
    it("should quantize to N steps", () => {
      expect(easing.steps(0.0, 4)).toBe(0);
      expect(easing.steps(0.1, 4)).toBe(0);
      expect(easing.steps(0.3, 4)).toBe(0.25);
      expect(easing.steps(0.5, 4)).toBe(0.5);
      expect(easing.steps(0.9, 4)).toBe(0.75);
    });

    it("should handle n=1", () => {
      expect(easing.steps(0.5, 1)).toBe(0);
      expect(easing.steps(0.99, 1)).toBe(0);
    });

    it("should pass through with n<=0", () => {
      expect(easing.steps(0.5, 0)).toBe(0.5);
      expect(easing.steps(0.7, -1)).toBe(0.7);
    });
  });

  describe("damp", () => {
    it("should move toward target", () => {
      const result = easing.damp(0, 100, 5, 1 / 60);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(100);
    });

    it("should converge over time", () => {
      let current = 0;
      for (let i = 0; i < 300; i++) {
        current = easing.damp(current, 100, 5, 1 / 60);
      }
      expect(current).toBeCloseTo(100, 1);
    });

    it("should return current when deltaTime is 0", () => {
      expect(easing.damp(50, 100, 5, 0)).toBeCloseTo(50, 5);
    });

    it("should be frame-rate independent", () => {
      // Running at 60fps vs 30fps should reach similar values over same time period
      let val60 = 0;
      for (let i = 0; i < 60; i++) {
        val60 = easing.damp(val60, 100, 5, 1 / 60);
      }

      let val30 = 0;
      for (let i = 0; i < 30; i++) {
        val30 = easing.damp(val30, 100, 5, 1 / 30);
      }

      // Both should be approximately equal after 1 second
      expect(Math.abs(val60 - val30)).toBeLessThan(1);
    });
  });

  describe("impulse", () => {
    it("should be 0 at start", () => {
      expect(easing.impulse(0)).toBeCloseTo(0, 5);
    });

    it("should peak then decay", () => {
      const early = easing.impulse(0.1);
      const peak = easing.impulse(1 / 6); // peak is at 1/k
      const late = easing.impulse(0.8);

      expect(peak).toBeGreaterThan(early);
      expect(peak).toBeGreaterThan(late);
    });

    it("should approach 0 for large values", () => {
      expect(easing.impulse(5)).toBeLessThan(0.01);
    });
  });

  describe("parabola", () => {
    it("should be 0 at edges and 1 at center (k=1)", () => {
      expect(easing.parabola(0)).toBeCloseTo(0, 5);
      expect(easing.parabola(0.5)).toBeCloseTo(1, 5);
      expect(easing.parabola(1)).toBeCloseTo(0, 5);
    });

    it("should be symmetric", () => {
      expect(easing.parabola(0.3)).toBeCloseTo(easing.parabola(0.7), 5);
    });

    it("should narrow with higher k", () => {
      const k1 = easing.parabola(0.3, 1);
      const k3 = easing.parabola(0.3, 3);
      expect(k3).toBeLessThan(k1);
    });
  });
});
