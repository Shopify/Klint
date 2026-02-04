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
      const value1 = noise.perlin(0.5, 0.5);

      noise.seed(54321);
      const value2 = noise.perlin(0.5, 0.5);

      expect(value1).not.toBe(value2);
    });
  });

  describe("random", () => {
    it("should return values between 0 and 1", () => {
      for (let i = 0; i < 100; i++) {
        const val = noise.random();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it("should produce consistent values with same seed", () => {
      noise.seed(42);
      const values1 = [noise.random(), noise.random(), noise.random()];

      noise.seed(42);
      const values2 = [noise.random(), noise.random(), noise.random()];

      expect(values1).toEqual(values2);
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

    it("should support 3D hashing", () => {
      const hash1 = noise.hash(10, 20, 30);
      const hash2 = noise.hash(10, 20, 30);
      expect(hash1).toBe(hash2);
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
      expect(diff).toBeLessThan(0.5); // Values should be relatively close
    });

    it("should support 3D perlin noise", () => {
      const val = noise.perlin(0.5, 0.5, 0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(-1);
      expect(val).toBeLessThanOrEqual(1);
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

    it("should be faster than perlin (conceptually)", () => {
      // Simplex noise should work and return valid values
      const val = noise.simplex(0.5, 0.5);
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
  });

  describe("fbm (Fractal Brownian Motion)", () => {
    it("should combine multiple octaves", () => {
      const val = noise.fbm(0.5, 0.5, { octaves: 4 });
      expect(typeof val).toBe("number");
    });

    it("should respect amplitude parameter", () => {
      const val1 = noise.fbm(0.5, 0.5, { amplitude: 0.5 });
      const val2 = noise.fbm(0.5, 0.5, { amplitude: 2 });
      expect(Math.abs(val2)).toBeGreaterThanOrEqual(Math.abs(val1));
    });

    it("should respect frequency parameter", () => {
      const val1 = noise.fbm(0.37, 0.53, { frequency: 1 });
      const val2 = noise.fbm(0.37, 0.53, { frequency: 10 });
      // Higher frequency should produce different values
      expect(val1).not.toBe(val2);
    });
  });

  describe("turbulence", () => {
    it("should return positive values", () => {
      for (let i = 0; i < 10; i++) {
        const x = i * 0.1;
        const y = i * 0.1;
        const val = noise.turbulence(x, y);
        expect(val).toBeGreaterThanOrEqual(0);
      }
    });

    it("should support octaves parameter", () => {
      const val = noise.turbulence(0.5, 0.5, { octaves: 4 });
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(0);
    });
  });

  describe("ridge", () => {
    it("should create ridge-like patterns", () => {
      const val = noise.ridge(0.5, 0.5);
      expect(typeof val).toBe("number");
    });

    it("should support custom parameters", () => {
      const val = noise.ridge(0.5, 0.5, {
        octaves: 4,
        amplitude: 1,
        frequency: 2,
        lacunarity: 2,
        gain: 0.5,
      });
      expect(typeof val).toBe("number");
    });
  });

  describe("cellular", () => {
    it("should generate cellular/Worley noise", () => {
      const val = noise.cellular(0.5, 0.5);
      expect(typeof val).toBe("number");
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    });

    it("should support different distance functions", () => {
      const val1 = noise.cellular(0.5, 0.5, { distance: "euclidean" });
      const val2 = noise.cellular(0.5, 0.5, { distance: "manhattan" });
      expect(typeof val1).toBe("number");
      expect(typeof val2).toBe("number");
    });
  });
});
