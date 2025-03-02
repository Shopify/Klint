import { describe, it, expect, beforeEach } from "vitest";
import Color from "../../Klint/dist/plugins/Color";
import { KlintContext } from "../../Klint/component/useKlint";

describe("Color Plugin", () => {
  let C: Color;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    // Mock minimal context required by Color
    C = new Color({ ctx } as unknown as KlintContext);
  });

  describe("Color Properties", () => {
    it("should provide named color properties", () => {
      expect(C.coral).toBe("#E84D37");
      expect(C.brown).toBe("#7F4C2F");
      expect(C.mustard).toBe("#EDBC2F");
      expect(C.navy).toBe("#18599D");
      expect(C.slate).toBe("#404757");
    });
  });

  describe("Color Formats", () => {
    it("should create hex colors", () => {
      expect(C.hex("FFF")).toBe("#FFF");
      expect(C.hex("#123")).toBe("#123");
    });

    it("should create RGB colors", () => {
      expect(C.rgb(255, 128, 64)).toBe("rgb(255, 128, 64)");
      expect(C.rgb(0, 0, 0)).toBe("rgb(0, 0, 0)");
    });

    it("should create RGBA colors", () => {
      expect(C.rgba(255, 128, 64, 0.5)).toBe("rgba(255, 128, 64, 0.5)");
      expect(C.rgba(0, 0, 0, 1)).toBe("rgba(0, 0, 0, 1)");
    });

    it("should create gray colors", () => {
      expect(C.gray(128)).toBe("rgb(128, 128, 128)");
      expect(C.gray(200, 0.5)).toBe("rgba(200, 200, 200, 0.5)");
    });

    it("should create HSL colors", () => {
      expect(C.hsl(120, 50, 50)).toBe("hsl(120, 50%, 50%)");
      expect(C.hsl(370, 100, 75)).toBe("hsl(10, 100%, 75%)"); // wraps > 360
    });

    it("should create HSLA colors", () => {
      expect(C.hsla(120, 50, 50, 0.75)).toBe("hsla(120, 50%, 50%, 0.75)");
    });

    it("should create LCH colors", () => {
      expect(C.lch(50, 60, 120)).toBe("lch(50% 60 120)");
      expect(C.lcha(50, 60, 120, 0.8)).toBe("lch(50% 60 120 / 0.8)");
    });

    it("should create LAB colors", () => {
      expect(C.lab(50, 20, -30)).toBe("lab(50% 20 -30)");
      expect(C.laba(50, 20, -30, 0.5)).toBe("lab(50% 20 -30 / 0.5)");
    });

    it("should create OKLCH colors", () => {
      expect(C.oklch(0.5, 0.2, 120)).toBe("oklch(0.5 0.2 120)");
      expect(C.oklcha(0.5, 0.2, 120, 0.7)).toBe("oklch(0.5 0.2 120 / 0.7)");
    });

    it("should create OKLAB colors", () => {
      expect(C.oklab(0.5, 0.1, -0.1)).toBe("oklab(0.5 0.1 -0.1)");
      expect(C.oklaba(0.5, 0.1, -0.1, 0.6)).toBe("oklab(0.5 0.1 -0.1 / 0.6)");
    });
  });

  describe("Color Transformations", () => {
    it("should blend colors", () => {
      expect(C.blendColors("#FF0000", "#0000FF", 0.5, "rgb")).toBe(
        "color-mix(in rgb, #FF0000, #0000FF 50%)"
      );

      expect(C.blendColors("#FF0000", "#0000FF", 0, "rgb")).toBe(
        "color-mix(in rgb, #FF0000, #0000FF 0%)"
      );

      expect(C.blendColors("#FF0000", "#0000FF", 1, "oklch")).toBe(
        "color-mix(in oklch, #FF0000, #0000FF 100%)"
      );
    });

    it("should create a palette", () => {
      const palette = C.createPalette("#FF0000", 3);
      expect(palette.length).toBe(5); // base + 2 lighter + 2 darker
      expect(palette[2]).toBe("#FF0000"); // middle is the base color
    });

    it("should create complementary colors", () => {
      const complement = C.complementary("hsl(0, 100%, 50%)"); // Red
      expect(complement).toBe(
        "color-mix(in hsl, hsl(0, 100%, 50%), hsl(180deg 100% 50%) 100%)"
      );
    });

    it("should create analogous colors", () => {
      const [color1, color2] = C.analogous("hsl(120, 100%, 50%)", 30);
      expect(color1).toBe(
        "color-mix(in hsl, hsl(120, 100%, 50%), hsl(-30deg 100% 50%) 100%)"
      );
      expect(color2).toBe(
        "color-mix(in hsl, hsl(120, 100%, 50%), hsl(30deg 100% 50%) 100%)"
      );
    });

    it("should modify colors", () => {
      const lightened = C.lighten("#FF0000", 20);
      expect(lightened).toBe("color-mix(in hsl, #FF0000, white 20%)");

      const darkened = C.darken("#FF0000", 30);
      expect(darkened).toBe("color-mix(in hsl, #FF0000, black 30%)");
    });
  });
});
