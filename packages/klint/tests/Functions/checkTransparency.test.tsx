import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  fillStyle: string | CanvasGradient;
  strokeStyle: string | CanvasGradient;
  checkTransparency: (toCheck: string) => boolean;
  _ctx: CanvasRenderingContext2D;
};

describe("checkTransparency", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      fillStyle: "#000000",
      strokeStyle: "#000000",
      checkTransparency(toCheck: string) {
        if (toCheck === "stroke" && this.strokeStyle === "transparent")
          return false;
        if (toCheck === "fill" && this.fillStyle === "transparent")
          return false;
        return true;
      },
      _ctx: ctx,
    };
  });

  it("should return true for non-transparent fill styles", () => {
    const styles = ["#000000", "red", "rgba(0,0,0,1)", "rgba(255,0,0,0.5)"];

    styles.forEach((style) => {
      K.fillStyle = style;
      expect(K.checkTransparency("fill")).toBe(true);
    });
  });

  it("should return false for transparent fill style", () => {
    K.fillStyle = "transparent";
    expect(K.checkTransparency("fill")).toBe(false);
  });

  it("should return true for non-transparent stroke styles", () => {
    const styles = ["#000000", "blue", "rgba(0,0,0,1)", "rgba(0,0,255,0.5)"];

    styles.forEach((style) => {
      K.strokeStyle = style;
      expect(K.checkTransparency("stroke")).toBe(true);
    });
  });

  it("should return false for transparent stroke style", () => {
    K.strokeStyle = "transparent";
    expect(K.checkTransparency("stroke")).toBe(false);
  });

  it("should not affect fill check when stroke is transparent", () => {
    K.fillStyle = "red";
    K.strokeStyle = "transparent";

    expect(K.checkTransparency("fill")).toBe(true);
    expect(K.checkTransparency("stroke")).toBe(false);
  });

  it("should not affect stroke check when fill is transparent", () => {
    K.fillStyle = "transparent";
    K.strokeStyle = "blue";

    expect(K.checkTransparency("fill")).toBe(false);
    expect(K.checkTransparency("stroke")).toBe(true);
  });

  it("should return true for anything other than 'fill' or 'stroke'", () => {
    K.fillStyle = "transparent";
    K.strokeStyle = "transparent";

    expect(K.checkTransparency("other")).toBe(true);
    expect(K.checkTransparency("")).toBe(true);
  });

  it("should handle case sensitivity", () => {
    K.fillStyle = "transparent";
    K.strokeStyle = "transparent";

    // Should be case-sensitive, so these should return true
    expect(K.checkTransparency("FILL")).toBe(true);
    expect(K.checkTransparency("STROKE")).toBe(true);
    expect(K.checkTransparency("Fill")).toBe(true);
    expect(K.checkTransparency("Stroke")).toBe(true);
  });
});
