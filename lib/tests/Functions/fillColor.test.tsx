import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  fillStyle: string | CanvasGradient;
  fillColor: (color: string | CanvasGradient) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("fillColor", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      fillStyle: "#000000",
      fillColor(color: string | CanvasGradient) {
        this.fillStyle = color;
      },
      _ctx: ctx,
    };
  });

  it("should set the correct fill color for named colors", () => {
    const colors = ["red", "blue", "green", "yellow", "transparent"];
    colors.forEach((color) => {
      K.fillColor(color);
      expect(K.fillStyle).toBe(color);
    });
  });

  it("should set the correct fill color for hex colors", () => {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF", "#000000"];
    colors.forEach((color) => {
      K.fillColor(color);
      expect(K.fillStyle).toBe(color);
    });
  });

  it("should set the correct fill color for rgba colors", () => {
    const colors = [
      "rgba(255,0,0,1)",
      "rgba(0,255,0,0.5)",
      "rgba(0,0,255,0.1)",
    ];
    colors.forEach((color) => {
      K.fillColor(color);
      expect(K.fillStyle).toBe(color);
    });
  });

  it("should handle gradient objects", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(1, "blue");

    K.fillColor(gradient);
    expect(K.fillStyle).toBe(gradient);
  });
});
