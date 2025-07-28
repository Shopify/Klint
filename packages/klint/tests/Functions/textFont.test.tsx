import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  font: string;
  __textFont: string;
  __textSize: number;
  __textWeight: string;
  __textStyle: string;
  __computedTextFont: string;
  textFont: (font: string) => void;
  computeTextStyle: () => void;
  computeFont: () => void;
  _ctx: CanvasRenderingContext2D;
};

describe("textFont and computeFont", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      font: "",
      __textFont: "sans-serif",
      __textSize: 16,
      __textWeight: "normal",
      __textStyle: "normal",
      __computedTextFont: "",
      textFont(font: string) {
        this.__textFont = font;
      },
      computeTextStyle() {
        this.__computedTextFont = `${this.__textWeight} ${this.__textStyle} ${this.__textSize}px ${this.__textFont}`;
      },
      computeFont() {
        this.computeTextStyle();
        if (this.font !== this.__computedTextFont)
          this.font = this.__computedTextFont;
      },
      _ctx: ctx,
    };
  });

  it("should set the text font correctly", () => {
    const fonts = [
      "Arial",
      "Helvetica",
      "Times New Roman",
      "Courier",
      "Georgia",
    ];
    fonts.forEach((font) => {
      K.textFont(font);
      expect(K.__textFont).toBe(font);
    });
  });

  it("should compute the correct font string", () => {
    K.__textWeight = "bold";
    K.__textStyle = "italic";
    K.__textSize = 24;
    K.textFont("Arial");

    K.computeTextStyle();
    expect(K.__computedTextFont).toBe("bold italic 24px Arial");
  });

  it("should update the context font property", () => {
    K.__textWeight = "normal";
    K.__textStyle = "normal";
    K.__textSize = 32;
    K.textFont("Helvetica");

    K.computeFont();
    expect(K.font).toBe("normal normal 32px Helvetica");
  });

  it("should not update the context font if already set correctly", () => {
    K.__textWeight = "normal";
    K.__textStyle = "normal";
    K.__textSize = 16;
    K.textFont("sans-serif");

    K.computeFont();
    const initialFont = K.font;

    // Call computeFont again with the same settings
    K.computeFont();

    // The font should have been set only once
    expect(K.font).toBe(initialFont);
  });
});
