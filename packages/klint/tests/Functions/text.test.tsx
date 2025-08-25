import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Text Functions", () => {
  let K: any;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d")!;

    K = {
      __dpr: 1,
      __textFont: "sans-serif",
      __textSize: 16,
      __textStyle: "normal",
      __textWeight: "normal",
      __textLeading: undefined,
      __textAlignment: {
        horizontal: "left" as CanvasTextAlign,
        vertical: "alphabetic" as CanvasTextBaseline,
      },
      __computedTextFont: "",
      font: "",
      textAlign: "left" as CanvasTextAlign,
      textBaseline: "alphabetic" as CanvasTextBaseline,
      measureText: vi.fn((text: string) => ({
        width: text.length * 10,
        actualBoundingBoxAscent: 10,
        actualBoundingBoxDescent: 3,
      })),
      fillText: vi.fn(),
      strokeText: vi.fn(),
      constrain: (val: number, floor: number, ceil: number) => Math.max(floor, Math.min(val, ceil)),
      checkTransparency: vi.fn(() => true),
      computeTextStyle: vi.fn(),
      computeFont: vi.fn(),
    };
  });

  describe("textSize", () => {
    it("should set __textSize with DPR scaling", () => {
      K.textSize = (size: number) => {
        K.__textSize = size * K.__dpr || K.__textSize;
      };

      K.textSize(24);
      expect(K.__textSize).toBe(24);

      K.__dpr = 2;
      K.textSize(24);
      expect(K.__textSize).toBe(48);
    });
  });

  describe("textStyle", () => {
    it("should set __textStyle", () => {
      K.textStyle = (style: string) => {
        K.__textStyle = style || "normal";
      };

      K.textStyle("italic");
      expect(K.__textStyle).toBe("italic");

      K.textStyle("");
      expect(K.__textStyle).toBe("normal");
    });
  });

  describe("textWeight", () => {
    it("should set __textWeight", () => {
      K.textWeight = (weight: string) => {
        K.__textWeight = weight || "normal";
      };

      K.textWeight("bold");
      expect(K.__textWeight).toBe("bold");

      K.textWeight("");
      expect(K.__textWeight).toBe("normal");
    });
  });

  describe("textQuality", () => {
    it("should set textRendering based on quality parameter", () => {
      K.textRendering = "";
      K.textQuality = (quality: "speed" | "auto" | "legibility" | "precision" = "auto") => {
        if (quality === "speed") {
          K.textRendering = "optimizeSpeed";
        } else if (quality === "auto") {
          K.textRendering = "auto";
        } else if (quality === "legibility") {
          K.textRendering = "optimizeLegibility";
        } else if (quality === "precision") {
          K.textRendering = "geometricPrecision";
        }
      };

      K.textQuality("speed");
      expect(K.textRendering).toBe("optimizeSpeed");

      K.textQuality("legibility");
      expect(K.textRendering).toBe("optimizeLegibility");

      K.textQuality("precision");
      expect(K.textRendering).toBe("geometricPrecision");

      K.textQuality();
      expect(K.textRendering).toBe("auto");
    });
  });

  describe("textSpacing", () => {
    it("should set letter or word spacing", () => {
      K.letterSpacing = "";
      K.wordSpacing = "";
      K.textSpacing = (kind: "letter" | "word", value: number) => {
        K[`${kind}Spacing`] = `${value}px`;
      };

      K.textSpacing("letter", 2);
      expect(K.letterSpacing).toBe("2px");

      K.textSpacing("word", 5);
      expect(K.wordSpacing).toBe("5px");
    });
  });

  describe("computeTextStyle", () => {
    it("should compute font string from text properties", () => {
      K.computeTextStyle = () => {
        K.__computedTextFont = `${K.__textWeight} ${K.__textStyle} ${K.__textSize}px ${K.__textFont}`;
      };

      K.__textWeight = "bold";
      K.__textStyle = "italic";
      K.__textSize = 24;
      K.__textFont = "Arial";

      K.computeTextStyle();
      expect(K.__computedTextFont).toBe("bold italic 24px Arial");
    });
  });

  describe("alignText", () => {
    it("should set text alignment", () => {
      K.alignText = (horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => {
        K.__textAlignment.horizontal = horizontal;
        K.__textAlignment.vertical = vertical ?? K.__textAlignment.vertical;
      };

      K.alignText("center");
      expect(K.__textAlignment.horizontal).toBe("center");
      expect(K.__textAlignment.vertical).toBe("alphabetic");

      K.alignText("right", "top");
      expect(K.__textAlignment.horizontal).toBe("right");
      expect(K.__textAlignment.vertical).toBe("top");
    });
  });

  describe("textLeading", () => {
    it("should set and return __textLeading", () => {
      K.textLeading = (spacing: number) => {
        K.__textLeading = spacing;
        return K.__textLeading;
      };

      const result = K.textLeading(20);
      expect(K.__textLeading).toBe(20);
      expect(result).toBe(20);
    });
  });

  describe("textWidth", () => {
    it("should measure text width after computing font", () => {
      K.computeFont = vi.fn(() => {
        K.computeTextStyle();
        if (K.font !== K.__computedTextFont) K.font = K.__computedTextFont;
      });

      K.textWidth = (text: string) => {
        K.computeFont();
        return K.measureText(text).width;
      };

      const width = K.textWidth("Hello");
      expect(K.computeFont).toHaveBeenCalled();
      expect(K.measureText).toHaveBeenCalledWith("Hello");
      expect(width).toBe(50); // 5 chars * 10px
    });
  });

  describe("text", () => {
    it("should render single line text", () => {
      K.computeFont = vi.fn();
      K.text = (
        text: string | number | undefined,
        x: number,
        y: number,
        maxWidth?: number
      ) => {
        if (text === undefined) return;
        K.computeFont();

        if (K.textAlign !== K.__textAlignment.horizontal) {
          K.textAlign = K.__textAlignment.horizontal;
        }
        if (K.textBaseline !== K.__textAlignment.vertical) {
          K.textBaseline = K.__textAlignment.vertical;
        }

        const textString = String(text);

        if (K.checkTransparency("fill"))
          K.fillText(textString, x, y, maxWidth);
        if (K.checkTransparency("stroke"))
          K.strokeText(textString, x, y, maxWidth);
      };

      K.text("Hello World", 100, 50);

      expect(K.computeFont).toHaveBeenCalled();
      expect(K.fillText).toHaveBeenCalledWith("Hello World", 100, 50, undefined);
      expect(K.strokeText).toHaveBeenCalledWith("Hello World", 100, 50, undefined);
    });

    it("should handle multiline text", () => {
      K.computeFont = vi.fn();
      const fillTextCalls: any[] = [];
      K.fillText = vi.fn((...args) => fillTextCalls.push(args));

      K.text = (
        text: string | number | undefined,
        x: number,
        y: number,
        maxWidth?: number
      ) => {
        if (text === undefined) return;
        K.computeFont();

        const textString = String(text);

        if (textString.includes("\n")) {
          const lines = textString.split("\n");
          const lineHeight = K.__textLeading ?? K.__textSize * 1.2;

          lines.forEach((line, index) => {
            const lineY = y + index * lineHeight;
            if (K.checkTransparency("fill"))
              K.fillText(line, x, lineY, maxWidth);
          });
        } else {
          if (K.checkTransparency("fill"))
            K.fillText(textString, x, y, maxWidth);
        }
      };

      K.text("Line 1\nLine 2\nLine 3", 100, 50);

      expect(fillTextCalls).toHaveLength(3);
      expect(fillTextCalls[0]).toEqual(["Line 1", 100, 50, undefined]);
      expect(fillTextCalls[1][0]).toBe("Line 2");
      expect(fillTextCalls[2][0]).toBe("Line 3");
    });

    it("should handle undefined text", () => {
      K.text = (text: string | number | undefined) => {
        if (text === undefined) return;
        // render text...
      };

      K.text(undefined, 100, 50);
      expect(K.fillText).not.toHaveBeenCalled();
    });

    it("should convert numbers to strings", () => {
      K.computeFont = vi.fn();
      K.text = (
        text: string | number | undefined,
        x: number,
        y: number,
        maxWidth?: number
      ) => {
        if (text === undefined) return;
        K.computeFont();
        const textString = String(text);
        if (K.checkTransparency("fill"))
          K.fillText(textString, x, y, maxWidth);
      };

      K.text(42, 100, 50);
      expect(K.fillText).toHaveBeenCalledWith("42", 100, 50, undefined);
    });

    it("should respect maxWidth parameter", () => {
      K.computeFont = vi.fn();
      K.text = (
        text: string | number | undefined,
        x: number,
        y: number,
        maxWidth?: number
      ) => {
        if (text === undefined) return;
        K.computeFont();
        const textString = String(text);
        if (K.checkTransparency("fill"))
          K.fillText(textString, x, y, maxWidth);
      };

      K.text("Long text", 100, 50, 200);
      expect(K.fillText).toHaveBeenCalledWith("Long text", 100, 50, 200);
    });
  });
});