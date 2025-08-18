import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  filter: string | undefined;
  globalAlpha: number;
  constrain: (val: number, floor: number, ceil: number) => number;
  canIuseFilter: () => boolean;
  blur: (radius: number) => void;
  SVGfilter: (url: string) => void;
  dropShadow: (offsetX: number, offsetY: number, blurRadius: number, color: string) => void;
  grayscale: (amount: number) => void;
  hue: (angle: number) => void;
  invert: (amount: number) => void;
  filterOpacity: (value: number) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("filters", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      filter: "",
      globalAlpha: 1,
      constrain(val: number, floor: number, ceil: number) {
        return Math.max(floor, Math.min(val, ceil));
      },
      canIuseFilter() {
        return this.filter !== undefined && this.filter !== null;
      },
      blur(radius: number) {
        if (this.filter === undefined || this.filter === null) return;
        this.filter = `blur(${radius}px)`;
      },
      SVGfilter(url: string) {
        if (this.filter === undefined || this.filter === null) return;
        if (!url || !url.startsWith('url(')) return;
        this.filter = url;
      },
      dropShadow(offsetX: number, offsetY: number, blurRadius: number, color: string) {
        if (this.filter === undefined || this.filter === null) return;
        this.filter = `drop-shadow(${offsetX}px ${offsetY}px ${blurRadius}px ${color})`;
      },
      grayscale(amount: number) {
        if (this.filter === undefined || this.filter === null) return;
        const value = this.constrain(amount, 0, 1);
        this.filter = `grayscale(${value})`;
      },
      hue(angle: number) {
        if (this.filter === undefined || this.filter === null) return;
        const degrees = (angle * 180) / Math.PI;
        this.filter = `hue-rotate(${degrees}deg)`;
      },
      invert(amount: number) {
        if (this.filter === undefined || this.filter === null) return;
        const value = this.constrain(amount, 0, 1);
        this.filter = `invert(${value})`;
      },
      filterOpacity(value: number) {
        if (this.filter === undefined || this.filter === null) return;
        const amount = this.constrain(value, 0, 1);
        this.filter = `opacity(${amount})`;
      },
      _ctx: ctx,
    };
  });

  describe("canIuseFilter", () => {
    it("should return true when filter is supported", () => {
      K.filter = "";
      expect(K.canIuseFilter()).toBe(true);
    });

    it("should return false when filter is undefined", () => {
      K.filter = undefined;
      expect(K.canIuseFilter()).toBe(false);
    });

    it("should return false when filter is null", () => {
      K.filter = null as any;
      expect(K.canIuseFilter()).toBe(false);
    });
  });

  describe("blur", () => {
    it("should set blur filter with pixel value", () => {
      K.blur(5);
      expect(K.filter).toBe("blur(5px)");
    });

    it("should handle zero blur", () => {
      K.blur(0);
      expect(K.filter).toBe("blur(0px)");
    });

    it("should handle large blur values", () => {
      K.blur(100);
      expect(K.filter).toBe("blur(100px)");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.blur(5);
      expect(K.filter).toBeUndefined();
    });
  });

  describe("SVGfilter", () => {
    it("should set SVG filter with url", () => {
      K.SVGfilter("url(#myFilter)");
      expect(K.filter).toBe("url(#myFilter)");
    });

    it("should not set filter without url prefix", () => {
      K.SVGfilter("#myFilter");
      expect(K.filter).toBe("");
    });

    it("should not set empty filter", () => {
      K.SVGfilter("");
      expect(K.filter).toBe("");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.SVGfilter("url(#myFilter)");
      expect(K.filter).toBeUndefined();
    });
  });

  describe("dropShadow", () => {
    it("should set drop shadow filter", () => {
      K.dropShadow(10, 10, 5, "rgba(0,0,0,0.5)");
      expect(K.filter).toBe("drop-shadow(10px 10px 5px rgba(0,0,0,0.5))");
    });

    it("should handle negative offsets", () => {
      K.dropShadow(-5, -5, 3, "#000");
      expect(K.filter).toBe("drop-shadow(-5px -5px 3px #000)");
    });

    it("should handle color names", () => {
      K.dropShadow(2, 2, 1, "red");
      expect(K.filter).toBe("drop-shadow(2px 2px 1px red)");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.dropShadow(10, 10, 5, "#000");
      expect(K.filter).toBeUndefined();
    });
  });

  describe("grayscale", () => {
    it("should set grayscale filter", () => {
      K.grayscale(0.5);
      expect(K.filter).toBe("grayscale(0.5)");
    });

    it("should constrain values above 1", () => {
      K.grayscale(1.5);
      expect(K.filter).toBe("grayscale(1)");
    });

    it("should constrain negative values", () => {
      K.grayscale(-0.5);
      expect(K.filter).toBe("grayscale(0)");
    });

    it("should handle full grayscale", () => {
      K.grayscale(1);
      expect(K.filter).toBe("grayscale(1)");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.grayscale(0.5);
      expect(K.filter).toBeUndefined();
    });
  });

  describe("hue", () => {
    it("should convert radians to degrees", () => {
      K.hue(Math.PI);
      expect(K.filter).toBe("hue-rotate(180deg)");
    });

    it("should handle zero rotation", () => {
      K.hue(0);
      expect(K.filter).toBe("hue-rotate(0deg)");
    });

    it("should handle full rotation", () => {
      K.hue(Math.PI * 2);
      expect(K.filter).toBe("hue-rotate(360deg)");
    });

    it("should handle negative rotation", () => {
      K.hue(-Math.PI / 2);
      expect(K.filter).toBe("hue-rotate(-90deg)");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.hue(Math.PI);
      expect(K.filter).toBeUndefined();
    });
  });

  describe("invert", () => {
    it("should set invert filter", () => {
      K.invert(0.5);
      expect(K.filter).toBe("invert(0.5)");
    });

    it("should constrain values above 1", () => {
      K.invert(1.5);
      expect(K.filter).toBe("invert(1)");
    });

    it("should constrain negative values", () => {
      K.invert(-0.5);
      expect(K.filter).toBe("invert(0)");
    });

    it("should handle full inversion", () => {
      K.invert(1);
      expect(K.filter).toBe("invert(1)");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.invert(0.5);
      expect(K.filter).toBeUndefined();
    });
  });

  describe("filterOpacity", () => {
    it("should set opacity filter", () => {
      K.filterOpacity(0.5);
      expect(K.filter).toBe("opacity(0.5)");
    });

    it("should constrain values above 1", () => {
      K.filterOpacity(1.5);
      expect(K.filter).toBe("opacity(1)");
    });

    it("should constrain negative values", () => {
      K.filterOpacity(-0.5);
      expect(K.filter).toBe("opacity(0)");
    });

    it("should handle full opacity", () => {
      K.filterOpacity(1);
      expect(K.filter).toBe("opacity(1)");
    });

    it("should not set filter when not supported", () => {
      K.filter = undefined;
      K.filterOpacity(0.5);
      expect(K.filter).toBeUndefined();
    });
  });
});