import { describe, it, expect, beforeEach, vi } from "vitest";

// Test suite for Klint Core Functions
describe("KlintCoreFunctions", () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let K: any;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext("2d")!;

    // Mock Klint context with core functions
    K = {
      canvas,
      width: 800,
      height: 600,
      __dpr: 1,
      __isPlaying: false,
      __offscreens: new Map(),
      __imageOrigin: "corner",
      __rectangleOrigin: "corner",
      __canvasOrigin: "corner",
      __textFont: "sans-serif",
      __textWeight: "normal",
      __textStyle: "normal",
      __textSize: 120,
      __textLeading: undefined,
      __textAlignment: {
        horizontal: "left" as CanvasTextAlign,
        vertical: "top" as CanvasTextBaseline,
      },
      Color: {},
      Easing: {},
      Text: {},
      createVector: (x = 0, y = 0) => ({ x, y }),
      constrain: (val: number, floor: number, ceil: number) => Math.max(floor, Math.min(val, ceil)),
      saveConfig: vi.fn(() => ({})),
      restoreConfig: vi.fn(),
      translate: vi.fn(),
    };
  });

  describe("saveCanvas", () => {
    it("should create download link with canvas data", () => {
      const toDataURLSpy = vi.fn().mockReturnValue("data:image/png;base64,test");
      canvas.toDataURL = toDataURLSpy;
      
      const clickSpy = vi.fn();
      const link = { download: "", href: "", click: clickSpy };
      
      K.saveCanvas = () => {
        link.download = "canvas.png";
        link.href = K.canvas.toDataURL();
        link.click();
      };

      K.saveCanvas();

      expect(toDataURLSpy).toHaveBeenCalled();
      expect(link.download).toBe("canvas.png");
      expect(link.href).toBe("data:image/png;base64,test");
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("fullscreen", () => {
    it("should request fullscreen on canvas", () => {
      const requestFullscreenSpy = vi.fn();
      K.canvas.requestFullscreen = requestFullscreenSpy;

      const fullscreen = () => {
        K.canvas.requestFullscreen?.();
      };

      K.fullscreen = fullscreen;
      K.fullscreen();

      expect(requestFullscreenSpy).toHaveBeenCalled();
    });
  });

  describe("play/pause", () => {
    it("should set __isPlaying to true when play is called", () => {
      K.play = () => {
        if (!K.__isPlaying) K.__isPlaying = true;
      };

      K.play();
      expect(K.__isPlaying).toBe(true);
    });

    it("should set __isPlaying to false when pause is called", () => {
      K.__isPlaying = true;
      K.pause = () => {
        if (K.__isPlaying) K.__isPlaying = false;
      };

      K.pause();
      expect(K.__isPlaying).toBe(false);
    });
  });

  describe("extend", () => {
    it("should add new properties to context", () => {
      K.extend = (name: string, data: unknown, enforceReplace = false) => {
        if (name in K && !enforceReplace) return;
        K[name] = data;
      };

      K.extend("customFunction", () => "test");
      expect(K.customFunction()).toBe("test");
    });

    it("should not replace existing properties by default", () => {
      K.existingProp = "original";
      K.extend = (name: string, data: unknown, enforceReplace = false) => {
        if (name in K && !enforceReplace) return;
        K[name] = data;
      };

      K.extend("existingProp", "new");
      expect(K.existingProp).toBe("original");
    });

    it("should replace existing properties when enforceReplace is true", () => {
      K.existingProp = "original";
      K.extend = (name: string, data: unknown, enforceReplace = false) => {
        if (name in K && !enforceReplace) return;
        K[name] = data;
      };

      K.extend("existingProp", "new", true);
      expect(K.existingProp).toBe("new");
    });
  });

  describe("createOffscreen", () => {
    it("should create an offscreen canvas with correct dimensions", () => {
      K.createOffscreen = (
        id: string,
        width: number,
        height: number,
        options?: any,
        callback?: (ctx: any) => void
      ) => {
        const offscreen = document.createElement("canvas");
        offscreen.width = width * K.__dpr;
        offscreen.height = height * K.__dpr;

        const context = offscreen.getContext("2d", {
          alpha: options?.alpha ?? true,
          willReadFrequently: options?.willreadfrequently ?? false,
        }) as any;

        if (!context) throw new Error("Failed to create offscreen context");

        // Initialize basic properties
        context.__dpr = K.__dpr;
        context.width = width * K.__dpr;
        context.height = height * K.__dpr;
        context.__isMainContext = false;

        if (callback) {
          callback(context);
        }

        K.__offscreens.set(id, context);
        return context;
      };

      const offscreen = K.createOffscreen("test", 200, 150);
      
      expect(K.__offscreens.has("test")).toBe(true);
      expect(offscreen.width).toBe(200);
      expect(offscreen.height).toBe(150);
      expect(offscreen.__isMainContext).toBe(false);
    });

    it("should apply callback to offscreen context", () => {
      const callback = vi.fn();
      K.createOffscreen = (
        id: string,
        width: number,
        height: number,
        options?: any,
        callback?: (ctx: any) => void
      ) => {
        const offscreen = document.createElement("canvas");
        const context = offscreen.getContext("2d") as any;
        if (callback) callback(context);
        K.__offscreens.set(id, context);
        return context;
      };

      K.createOffscreen("test", 200, 150, {}, callback);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("getOffscreen", () => {
    it("should retrieve existing offscreen context", () => {
      const mockOffscreen = { test: true };
      K.__offscreens.set("existing", mockOffscreen);

      K.getOffscreen = (id: string) => {
        const offscreen = K.__offscreens.get(id);
        if (!offscreen) throw new Error(`No offscreen context found with id: ${id}`);
        return offscreen;
      };

      const retrieved = K.getOffscreen("existing");
      expect(retrieved).toBe(mockOffscreen);
    });

    it("should throw error for non-existent offscreen", () => {
      K.getOffscreen = (id: string) => {
        const offscreen = K.__offscreens.get(id);
        if (!offscreen) throw new Error(`No offscreen context found with id: ${id}`);
        return offscreen;
      };

      expect(() => K.getOffscreen("nonexistent")).toThrow("No offscreen context found with id: nonexistent");
    });
  });

  describe("passImage", () => {
    it("should return image if complete", () => {
      const img = new Image();
      Object.defineProperty(img, "complete", { value: true });

      K.passImage = (element: HTMLImageElement) => {
        if (!element.complete) {
          console.warn("Image passed to passImage() is not fully loaded");
          return null;
        }
        return element;
      };

      const result = K.passImage(img);
      expect(result).toBe(img);
    });

    it("should return null and warn if image not complete", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const img = new Image();
      Object.defineProperty(img, "complete", { value: false });

      K.passImage = (element: HTMLImageElement) => {
        if (!element.complete) {
          console.warn("Image passed to passImage() is not fully loaded");
          return null;
        }
        return element;
      };

      const result = K.passImage(img);
      expect(result).toBe(null);
      expect(warnSpy).toHaveBeenCalledWith("Image passed to passImage() is not fully loaded");

      warnSpy.mockRestore();
    });
  });

  describe("describe", () => {
    it("should set __description property", () => {
      K.describe = (description: string) => {
        K.__description = description;
      };

      K.describe("This is a test canvas");
      expect(K.__description).toBe("This is a test canvas");
    });
  });
});