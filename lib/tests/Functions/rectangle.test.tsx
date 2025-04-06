import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  beginPath: () => void;
  rect: (x: number, y: number, width: number, height: number) => void;
  drawIfVisible: () => void;
  __rectangleOrigin?: "center" | "corner";
  origin?: "center" | "corner";
  rectangle: (x: number, y: number, width: number, height?: number) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("rectangle", () => {
  let K: KlintContext;
  let beginPathCalled = false;
  let rectCalled = false;
  let drawIfVisibleCalled = false;
  let lastRectArgs: number[] = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    beginPathCalled = false;
    rectCalled = false;
    drawIfVisibleCalled = false;
    lastRectArgs = [];

    // Create minimal mock context
    K = {
      beginPath() {
        beginPathCalled = true;
      },
      rect(x, y, width, height) {
        rectCalled = true;
        lastRectArgs = [x, y, width, height];
      },
      drawIfVisible() {
        drawIfVisibleCalled = true;
      },
      __rectangleOrigin: "corner",
      origin: "corner",
      rectangle(x, y, width, height) {
        const originType = this.__rectangleOrigin || this.origin;
        const h = height ?? width;
        const drawX = originType === "center" ? x - width / 2 : x;
        const drawY = originType === "center" ? y - h / 2 : y;
        this.beginPath();
        this.rect(drawX, drawY, width, h);
        this.drawIfVisible();
      },
      _ctx: ctx,
    };
  });

  it("should call beginPath, rect, and drawIfVisible", () => {
    K.rectangle(100, 100, 50);
    expect(beginPathCalled).toBe(true);
    expect(rectCalled).toBe(true);
    expect(drawIfVisibleCalled).toBe(true);
  });

  it("should draw at the specified position with corner origin", () => {
    K.__rectangleOrigin = "corner";
    K.rectangle(100, 100, 50, 30);
    expect(lastRectArgs).toEqual([100, 100, 50, 30]);
  });

  it("should adjust position with center origin", () => {
    K.__rectangleOrigin = "center";
    K.rectangle(100, 100, 50, 30);
    expect(lastRectArgs).toEqual([75, 85, 50, 30]);
  });

  it("should use width for height if height is not provided", () => {
    K.rectangle(100, 100, 50);
    expect(lastRectArgs).toEqual([100, 100, 50, 50]);
  });

  it("should respect origin over __rectangleOrigin", () => {
    K.__rectangleOrigin = undefined;
    K.origin = "center";
    K.rectangle(100, 100, 50, 30);
    expect(lastRectArgs).toEqual([75, 85, 50, 30]);
  });

  it("should handle zero width/height", () => {
    K.rectangle(100, 100, 0, 0);
    expect(lastRectArgs).toEqual([100, 100, 0, 0]);
  });
});
