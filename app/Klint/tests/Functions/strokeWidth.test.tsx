import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  lineWidth: number;
  strokeWidth: (width: number) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("strokeWidth", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      lineWidth: 0,
      strokeWidth(width: number) {
        this.lineWidth = width;
        this._ctx.lineWidth = width;
      },
      _ctx: ctx,
    };
  });

  it("should set the correct line width", () => {
    const widths = [1, 1, 2, 3, 10, 100];
    widths.forEach((width) => {
      K.strokeWidth(width);
      expect(K.lineWidth).toBe(width);
      expect(K._ctx.lineWidth).toBe(width);
    });
  });
});
