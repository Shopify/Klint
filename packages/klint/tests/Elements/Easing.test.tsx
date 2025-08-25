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
});