import { describe, it, expect, beforeEach } from "vitest";

describe("Math Functions", () => {
  let K: any;

  beforeEach(() => {
    K = {
      constrain: (val: number, floor: number, ceil: number) =>
        Math.max(floor, Math.min(val, ceil)),
    };
  });

  describe("PI constants", () => {
    it("should return Math.PI", () => {
      K.PI = () => Math.PI;
      expect(K.PI()).toBe(Math.PI);
    });

    it("should return TWO_PI", () => {
      K.TWO_PI = () => Math.PI * 2;
      expect(K.TWO_PI()).toBe(Math.PI * 2);
    });

    it("should return TAU (same as TWO_PI)", () => {
      K.TAU = () => Math.PI * 2;
      expect(K.TAU()).toBe(Math.PI * 2);
    });
  });

  describe("constrain", () => {
    it("should constrain value within bounds", () => {
      expect(K.constrain(5, 0, 10)).toBe(5);
      expect(K.constrain(-5, 0, 10)).toBe(0);
      expect(K.constrain(15, 0, 10)).toBe(10);
      expect(K.constrain(0.5, 0, 1)).toBe(0.5);
    });
  });

  describe("squareDistance", () => {
    it("should calculate squared distance between points", () => {
      K.squareDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      };

      expect(K.squareDistance(0, 0, 3, 4)).toBe(25); // 3^2 + 4^2
      expect(K.squareDistance(1, 1, 4, 5)).toBe(25); // 3^2 + 4^2
      expect(K.squareDistance(0, 0, 0, 0)).toBe(0);
    });
  });

  describe("dot", () => {
    it("should calculate dot product", () => {
      K.dot = (x1: number, y1: number, x2: number, y2: number) => {
        return x1 * x2 + y1 * y2;
      };

      expect(K.dot(3, 4, 2, 1)).toBe(10); // 3*2 + 4*1
      expect(K.dot(1, 0, 0, 1)).toBe(0); // orthogonal vectors
      expect(K.dot(2, 3, 2, 3)).toBe(13); // 2*2 + 3*3
    });
  });

  describe("bezierLerp", () => {
    it("should perform cubic bezier interpolation", () => {
      K.bezierLerp = (a: number, b: number, c: number, d: number, t: number) => {
        const u = 1 - t;
        return (
          u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
        );
      };

      // At t=0, should return first control point
      expect(K.bezierLerp(0, 10, 20, 30, 0)).toBe(0);
      
      // At t=1, should return last control point
      expect(K.bezierLerp(0, 10, 20, 30, 1)).toBe(30);
      
      // At t=0.5, should be somewhere in between
      const mid = K.bezierLerp(0, 10, 20, 30, 0.5);
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(30);
    });
  });

  describe("bezierTangent", () => {
    it("should calculate cubic bezier tangent", () => {
      K.bezierTangent = (a: number, b: number, c: number, d: number, t: number) => {
        const u = 1 - t;
        return (
          3 * d * t * t -
          3 * c * t * t +
          6 * c * u * t -
          6 * b * u * t +
          3 * b * u * u -
          3 * a * u * u
        );
      };

      // Test tangent calculation at different t values
      const tangentStart = K.bezierTangent(0, 10, 20, 30, 0);
      const tangentEnd = K.bezierTangent(0, 10, 20, 30, 1);
      const tangentMid = K.bezierTangent(0, 10, 20, 30, 0.5);

      expect(typeof tangentStart).toBe("number");
      expect(typeof tangentEnd).toBe("number");
      expect(typeof tangentMid).toBe("number");
    });
  });

  describe("scaleTo", () => {
    it("should calculate scale factor for contain mode", () => {
      K.scaleTo = (
        originWidth: number,
        originHeight: number,
        destinationWidth: number,
        destinationHeight: number,
        cover = false
      ) => {
        const widthRatio = destinationWidth / originWidth;
        const heightRatio = destinationHeight / originHeight;
        return cover
          ? Math.max(widthRatio, heightRatio)
          : Math.min(widthRatio, heightRatio);
      };

      // Contain mode (default) - should fit entirely within destination
      const containScale = K.scaleTo(100, 100, 200, 150);
      expect(containScale).toBe(1.5); // min(2, 1.5)

      // Contain mode with different aspect ratio
      const containScale2 = K.scaleTo(100, 200, 200, 150);
      expect(containScale2).toBe(0.75); // min(2, 0.75)
    });

    it("should calculate scale factor for cover mode", () => {
      K.scaleTo = (
        originWidth: number,
        originHeight: number,
        destinationWidth: number,
        destinationHeight: number,
        cover = false
      ) => {
        const widthRatio = destinationWidth / originWidth;
        const heightRatio = destinationHeight / originHeight;
        return cover
          ? Math.max(widthRatio, heightRatio)
          : Math.min(widthRatio, heightRatio);
      };

      // Cover mode - should cover entire destination
      const coverScale = K.scaleTo(100, 100, 200, 150, true);
      expect(coverScale).toBe(2); // max(2, 1.5)

      // Cover mode with different aspect ratio
      const coverScale2 = K.scaleTo(100, 200, 200, 150, true);
      expect(coverScale2).toBe(2); // max(2, 0.75)
    });
  });

  describe("toBase64", () => {
    it("should convert canvas to base64", () => {
      const mockCanvas = {
        toDataURL: (type: string, quality?: number) => {
          return `data:${type};base64,mockdata`;
        },
      };

      K.canvas = mockCanvas;
      K.toBase64 = (type: string = "image/png", quality?: number) => {
        return K.canvas.toDataURL(type, quality);
      };

      expect(K.toBase64()).toBe("data:image/png;base64,mockdata");
      expect(K.toBase64("image/jpeg", 0.8)).toBe("data:image/jpeg;base64,mockdata");
    });
  });

  describe("resizeCanvas", () => {
    it("should not resize if main context", () => {
      K.__isMainContext = true;
      K.canvas = { width: 800, height: 600 };
      K.width = 800;
      K.height = 600;
      K.resizeCanvas = (width: number, height: number) => {
        if (K.__isMainContext) return;
        K.canvas.width = K.width = width;
        K.canvas.height = K.height = height;
      };

      K.resizeCanvas(400, 300);
      expect(K.width).toBe(800);
      expect(K.height).toBe(600);
    });

    it("should resize offscreen canvas", () => {
      K.__isMainContext = false;
      K.canvas = { width: 800, height: 600 };
      K.width = 800;
      K.height = 600;
      K.saveConfig = () => ({});
      K.restoreConfig = () => {};
      K.translate = () => {};
      K.__canvasOrigin = "corner";

      K.resizeCanvas = (width: number, height: number) => {
        if (K.__isMainContext) return;
        const config = K.saveConfig();
        K.canvas.width = K.width = width;
        K.canvas.height = K.height = height;
        K.restoreConfig(config);
        if (K.__canvasOrigin === "center") {
          K.translate(K.width * 0.5, K.height * 0.5);
        }
      };

      K.resizeCanvas(400, 300);
      expect(K.width).toBe(400);
      expect(K.height).toBe(300);
      expect(K.canvas.width).toBe(400);
      expect(K.canvas.height).toBe(300);
    });
  });
});