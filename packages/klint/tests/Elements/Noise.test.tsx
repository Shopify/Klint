import { describe, it, expect, beforeEach } from "vitest";
import Noise from "../../src/elements/Noise";

describe("Noise", () => {
  let noise: Noise;
  let mockContext: any;

  beforeEach(() => {
    mockContext = {
      width: 800,
      height: 600,
    };
    noise = new Noise(mockContext);
  });

  describe("seed", () => {
    it("should set the random seed", () => {
      noise.seed(12345);
      const value1 = noise.perlin(0.5, 0.5);

      noise.seed(12345);
      const value2 = noise.perlin(0.5, 0.5);

      expect(value1).toBe(value2);
    });

    it("should produce different values with different seeds", () => {
      noise.seed(12345);
      const value1 = noise.perlin(1.37, 2.84);

      noise.seed(54321);
      const value2 = noise.perlin(1.37, 2.84);

      expect(value1).not.toBe(value2);
    });
  });

  describe("hash", () => {
    it("should return consistent hash values", () => {
      const hash1 = noise.hash(10, 20);
      const hash2 = noise.hash(10, 20);
      expect(hash1).toBe(hash2);
    });

    it("should return different hashes for different inputs", () => {
      const hash1 = noise.hash(10, 20);
      const hash2 = noise.hash(20, 10);
      expect(hash1).not.toBe(hash2);
    });

    it("should support 1D hashing", () => {
      const hash1 = noise.hash(42);
      const hash2 = noise.hash(42);
      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash1).toBeLessThan(1);
    });

    it("should support 3D hashing", () => {
      const hash1 = noise.hash(10, 20, 30);
      const hash2 = noise.hash(10, 20, 30);
      expect(hash1).toBe(hash2);
    });

    it("should support 4D hashing", () => {
      const hash1 = noise.hash(10, 20, 30, 40);
      const hash2 = noise.hash(10, 20, 30, 40);
      expect(hash1).toBe(hash2);
      expect(hash1).toBeGreaterThanOrEqual(0);
      expect(hash1).toBeLessThan(1);
    });
  });

  describe("perlin", () => {
    it("should return values roughly between -1 and 1", () => {
      for (let i = 0; i < 10; i++) {
        const x = i * 0.1;
        const y = i * 0.1;
        const val = noise.perlin(x, y);
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    it("should return smooth gradients", () => {
      const val1 = noise.perlin(0.1, 0.1);
      const val2 = noise.perlin(0.11, 0.11);
      const diff = Math.abs(val1 - val2);
      expect(diff).toBeLessThan(0.5);
    });

    it("should support 1D perlin noise", () => {
      const val = noise.perlin(0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    });

    it("should support 3D perlin noise", () => {
      const val = noise.perlin(0.5, 0.5, 0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    });

    it("should support 4D perlin noise", () => {
      const val = noise.perlin(0.5, 0.5, 0.5, 0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    });

    it("should be deterministic with same seed", () => {
      noise.seed(42);
      const v1 = noise.perlin(1.23, 4.56, 7.89, 0.12);
      noise.seed(42);
      const v2 = noise.perlin(1.23, 4.56, 7.89, 0.12);
      expect(v1).toBe(v2);
    });
  });

  describe("simplex", () => {
    it("should return values roughly between -1 and 1", () => {
      for (let i = 0; i < 10; i++) {
        const x = i * 0.1;
        const y = i * 0.1;
        const val = noise.simplex(x, y);
        expect(val).toBeGreaterThanOrEqual(-1);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    it("should support 1D simplex noise", () => {
      const val = noise.simplex(0.5);
      expect(typeof val).toBe("number");
    });

    it("should support 3D simplex noise", () => {
      const val = noise.simplex(0.5, 0.5, 0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    });

    it("should support 4D simplex noise", () => {
      const val = noise.simplex(0.5, 0.5, 0.5, 0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
    });

    it("should be deterministic with same seed", () => {
      noise.seed(42);
      const v1 = noise.simplex(1.23, 4.56, 7.89, 0.12);
      noise.seed(42);
      const v2 = noise.simplex(1.23, 4.56, 7.89, 0.12);
      expect(v1).toBe(v2);
    });
  });

  describe("gaussianRandom", () => {
    it("should return a number", () => {
      const val = noise.gaussianRandom();
      expect(typeof val).toBe("number");
      expect(isNaN(val)).toBe(false);
    });

    it("should respect mean and stddev", () => {
      noise.seed(42);
      const samples = Array.from({ length: 1000 }, () =>
        noise.gaussianRandom(100, 10),
      );
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(mean).toBeGreaterThan(90);
      expect(mean).toBeLessThan(110);
    });

    it("should be deterministic with same seed", () => {
      noise.seed(42);
      const v1 = noise.gaussianRandom();
      noise.seed(42);
      const v2 = noise.gaussianRandom();
      expect(v1).toBe(v2);
    });
  });
});
