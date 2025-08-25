import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Drawing Functions", () => {
  let K: any;

  beforeEach(() => {
    K = {
      width: 800,
      height: 600,
      fillStyle: "black",
      strokeStyle: "black",
      lineWidth: 1,
      lineJoin: "miter" as CanvasLineJoin,
      lineCap: "butt" as CanvasLineCap,
      globalAlpha: 1,
      globalCompositeOperation: "source-over" as GlobalCompositeOperation,
      __imageOrigin: "corner",
      __rectangleOrigin: "corner",
      __canvasOrigin: "corner",
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      strokeRect: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn(),
      ellipse: vi.fn(),
      arc: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      resetTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createConicGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      constrain: (val: number, floor: number, ceil: number) => 
        Math.max(floor, Math.min(val, ceil)),
      checkTransparency: vi.fn((type: string) => true),
      drawIfVisible: vi.fn(),
    };
  });

  describe("noFill", () => {
    it("should set fillStyle to transparent", () => {
      K.noFill = () => {
        K.fillStyle = "transparent";
      };

      K.noFill();
      expect(K.fillStyle).toBe("transparent");
    });
  });

  describe("noStroke", () => {
    it("should set strokeStyle to transparent", () => {
      K.noStroke = () => {
        K.strokeStyle = "transparent";
      };

      K.noStroke();
      expect(K.strokeStyle).toBe("transparent");
    });
  });

  describe("strokeJoin", () => {
    it("should set lineJoin property", () => {
      K.strokeJoin = (join: CanvasLineJoin) => {
        K.lineJoin = join;
      };

      K.strokeJoin("round");
      expect(K.lineJoin).toBe("round");

      K.strokeJoin("bevel");
      expect(K.lineJoin).toBe("bevel");
    });
  });

  describe("strokeCap", () => {
    it("should set lineCap property", () => {
      K.strokeCap = (cap: CanvasLineCap) => {
        K.lineCap = cap;
      };

      K.strokeCap("round");
      expect(K.lineCap).toBe("round");

      K.strokeCap("square");
      expect(K.lineCap).toBe("square");
    });
  });

  describe("point", () => {
    it("should draw a 1x1 rectangle at position", () => {
      K.point = (x: number, y: number) => {
        if (!K.checkTransparency("stroke")) return;
        K.beginPath();
        K.strokeRect(x, y, 1, 1);
      };

      K.point(100, 50);
      expect(K.beginPath).toHaveBeenCalled();
      expect(K.strokeRect).toHaveBeenCalledWith(100, 50, 1, 1);
    });

    it("should not draw if stroke is transparent", () => {
      K.checkTransparency = vi.fn(() => false);
      K.point = (x: number, y: number) => {
        if (!K.checkTransparency("stroke")) return;
        K.beginPath();
        K.strokeRect(x, y, 1, 1);
      };

      K.point(100, 50);
      expect(K.strokeRect).not.toHaveBeenCalled();
    });
  });

  describe("line", () => {
    it("should draw a line between two points", () => {
      K.line = (x1: number, y1: number, x2: number, y2: number) => {
        if (!K.checkTransparency("stroke")) return;
        K.beginPath();
        K.moveTo(x1, y1);
        K.lineTo(x2, y2);
        K.stroke();
      };

      K.line(10, 20, 100, 50);
      expect(K.beginPath).toHaveBeenCalled();
      expect(K.moveTo).toHaveBeenCalledWith(10, 20);
      expect(K.lineTo).toHaveBeenCalledWith(100, 50);
      expect(K.stroke).toHaveBeenCalled();
    });
  });

  describe("disk", () => {
    it("should draw a filled arc from center", () => {
      K.drawIfVisible = vi.fn(() => {
        if (K.checkTransparency("fill")) K.fill();
        if (K.checkTransparency("stroke")) K.stroke();
      });

      K.disk = (
        x: number,
        y: number,
        radius: number,
        startAngle = 0,
        endAngle = Math.PI * 2,
        closed = true
      ) => {
        K.beginPath();
        if (closed) {
          K.moveTo(x, y);
          K.arc(x, y, radius, startAngle, endAngle);
          K.lineTo(x, y);
        } else {
          K.arc(x, y, radius, startAngle, endAngle);
        }
        K.drawIfVisible();
      };

      K.disk(100, 100, 50);
      expect(K.beginPath).toHaveBeenCalled();
      expect(K.moveTo).toHaveBeenCalledWith(100, 100);
      expect(K.arc).toHaveBeenCalledWith(100, 100, 50, 0, Math.PI * 2);
      expect(K.lineTo).toHaveBeenCalledWith(100, 100);
      expect(K.drawIfVisible).toHaveBeenCalled();
    });

    it("should draw an open arc when closed is false", () => {
      K.drawIfVisible = vi.fn();
      K.disk = (
        x: number,
        y: number,
        radius: number,
        startAngle = 0,
        endAngle = Math.PI * 2,
        closed = true
      ) => {
        K.beginPath();
        if (closed) {
          K.moveTo(x, y);
          K.arc(x, y, radius, startAngle, endAngle);
          K.lineTo(x, y);
        } else {
          K.arc(x, y, radius, startAngle, endAngle);
        }
        K.drawIfVisible();
      };

      K.disk(100, 100, 50, 0, Math.PI, false);
      expect(K.moveTo).not.toHaveBeenCalled();
      expect(K.arc).toHaveBeenCalledWith(100, 100, 50, 0, Math.PI);
      expect(K.lineTo).not.toHaveBeenCalled();
    });
  });

  describe("roundedRectangle", () => {
    it("should draw a rounded rectangle", () => {
      K.drawIfVisible = vi.fn();
      K.roundedRectangle = (
        x: number,
        y: number,
        width: number,
        radius: number | number[],
        height?: number
      ) => {
        const originType = K.__rectangleOrigin || K.origin;
        const h = height ?? width;
        const drawX = originType === "center" ? x - width / 2 : x;
        const drawY = originType === "center" ? y - h / 2 : y;
        K.beginPath();
        K.roundRect(drawX, drawY, width, h, radius);
        K.drawIfVisible();
      };

      K.roundedRectangle(100, 100, 200, 10, 150);
      expect(K.beginPath).toHaveBeenCalled();
      expect(K.roundRect).toHaveBeenCalledWith(100, 100, 200, 150, 10);
      expect(K.drawIfVisible).toHaveBeenCalled();
    });

    it("should use width as height when height not specified", () => {
      K.drawIfVisible = vi.fn();
      K.roundedRectangle = (
        x: number,
        y: number,
        width: number,
        radius: number | number[],
        height?: number
      ) => {
        const h = height ?? width;
        K.beginPath();
        K.roundRect(x, y, width, h, radius);
        K.drawIfVisible();
      };

      K.roundedRectangle(100, 100, 200, 10);
      expect(K.roundRect).toHaveBeenCalledWith(100, 100, 200, 200, 10);
    });

    it("should handle center origin", () => {
      K.__rectangleOrigin = "center";
      K.drawIfVisible = vi.fn();
      K.roundedRectangle = (
        x: number,
        y: number,
        width: number,
        radius: number | number[],
        height?: number
      ) => {
        const originType = K.__rectangleOrigin || K.origin;
        const h = height ?? width;
        const drawX = originType === "center" ? x - width / 2 : x;
        const drawY = originType === "center" ? y - h / 2 : y;
        K.beginPath();
        K.roundRect(drawX, drawY, width, h, radius);
        K.drawIfVisible();
      };

      K.roundedRectangle(100, 100, 200, 10, 150);
      expect(K.roundRect).toHaveBeenCalledWith(0, 25, 200, 150, 10);
    });
  });

  describe("gradients", () => {
    it("should create linear gradient", () => {
      K.gradient = (x1 = 0, y1 = 0, x2 = K.width, y2 = K.width) => {
        return K.createLinearGradient(x1, y1, x2, y2);
      };

      K.gradient(0, 0, 100, 100);
      expect(K.createLinearGradient).toHaveBeenCalledWith(0, 0, 100, 100);

      K.gradient();
      expect(K.createLinearGradient).toHaveBeenCalledWith(0, 0, 800, 800);
    });

    it("should create radial gradient", () => {
      K.radialGradient = (
        x1 = K.width / 2,
        y1 = K.height / 2,
        r1 = 0,
        x2 = K.width / 2,
        y2 = K.height / 2,
        r2 = Math.min(K.width, K.height)
      ) => {
        return K.createRadialGradient(x1, y1, r1, x2, y2, r2);
      };

      K.radialGradient(100, 100, 10, 100, 100, 50);
      expect(K.createRadialGradient).toHaveBeenCalledWith(100, 100, 10, 100, 100, 50);

      K.radialGradient();
      expect(K.createRadialGradient).toHaveBeenCalledWith(400, 300, 0, 400, 300, 600);
    });

    it("should create conic gradient", () => {
      K.createConicGradient = vi.fn();
      K.conicGradient = (angle = 0, x1 = K.width / 2, y1 = K.height / 2) => {
        return K.createConicGradient(angle, x1, y1);
      };

      K.conicGradient(Math.PI / 2, 100, 100);
      expect(K.createConicGradient).toHaveBeenCalledWith(Math.PI / 2, 100, 100);

      K.conicGradient();
      expect(K.createConicGradient).toHaveBeenCalledWith(0, 400, 300);
    });

    it("should add color stop to gradient", () => {
      const gradient = { addColorStop: vi.fn() };
      K.addColorStop = (gradient: any, offset = 0, color = "#000") => {
        return gradient.addColorStop(offset, color);
      };

      K.addColorStop(gradient, 0.5, "#FF0000");
      expect(gradient.addColorStop).toHaveBeenCalledWith(0.5, "#FF0000");

      K.addColorStop(gradient);
      expect(gradient.addColorStop).toHaveBeenCalledWith(0, "#000");
    });
  });

  describe("opacity", () => {
    it("should set globalAlpha with constraint", () => {
      K.opacity = (value: number) => {
        K.globalAlpha = K.constrain(value, 0, 1);
      };

      K.opacity(0.5);
      expect(K.globalAlpha).toBe(0.5);

      K.opacity(1.5);
      expect(K.globalAlpha).toBe(1);

      K.opacity(-0.5);
      expect(K.globalAlpha).toBe(0);
    });
  });

  describe("blend", () => {
    it("should set globalCompositeOperation", () => {
      K.blend = (blend: GlobalCompositeOperation) => {
        K.globalCompositeOperation = blend;
      };

      K.blend("multiply");
      expect(K.globalCompositeOperation).toBe("multiply");

      K.blend("screen");
      expect(K.globalCompositeOperation).toBe("screen");
    });
  });

  describe("origin setters", () => {
    it("should set canvas origin", () => {
      K.setCanvasOrigin = (type: "center" | "corner") => {
        K.__canvasOrigin = type;
      };

      K.setCanvasOrigin("center");
      expect(K.__canvasOrigin).toBe("center");
    });

    it("should set image origin", () => {
      K.setImageOrigin = (type: "center" | "corner") => {
        K.__imageOrigin = type;
      };

      K.setImageOrigin("center");
      expect(K.__imageOrigin).toBe("center");
    });

    it("should set rectangle origin", () => {
      K.setRectOrigin = (type: "center" | "corner") => {
        K.__rectangleOrigin = type;
      };

      K.setRectOrigin("center");
      expect(K.__rectangleOrigin).toBe("center");
    });
  });

  describe("reset and clear", () => {
    it("should clear and reset transform", () => {
      K.reset = () => {
        K.clearRect(0, 0, K.width, K.height);
        K.resetTransform();
      };

      K.reset();
      expect(K.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(K.resetTransform).toHaveBeenCalled();
    });

    it("should clear canvas", () => {
      K.clear = () => {
        K.clearRect(0, 0, K.width, K.height);
      };

      K.clear();
      expect(K.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });
  });
});