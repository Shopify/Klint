import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  width: number;
  height: number;
  beginPath: () => void;
  ellipse: (
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number
  ) => void;
  drawIfVisible: () => void;
  circle: (x: number, y: number, radius: number, radius2?: number) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("circle", () => {
  let K: KlintContext;
  let beginPathCalled = false;
  let ellipseCalled = false;
  let drawIfVisibleCalled = false;
  let lastEllipseArgs: any[] = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    beginPathCalled = false;
    ellipseCalled = false;
    drawIfVisibleCalled = false;
    lastEllipseArgs = [];

    // Create minimal mock context
    K = {
      width: 500,
      height: 500,
      beginPath() {
        beginPathCalled = true;
      },
      ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle) {
        ellipseCalled = true;
        lastEllipseArgs = [
          x,
          y,
          radiusX,
          radiusY,
          rotation,
          startAngle,
          endAngle,
        ];
      },
      drawIfVisible() {
        drawIfVisibleCalled = true;
      },
      circle(x, y, radius, radius2) {
        this.beginPath();
        this.ellipse(x, y, radius, radius2 || radius, 0, 0, Math.PI * 2);
        this.drawIfVisible();
      },
      _ctx: ctx,
    };
  });

  it("should call beginPath, ellipse, and drawIfVisible", () => {
    K.circle(100, 100, 50);
    expect(beginPathCalled).toBe(true);
    expect(ellipseCalled).toBe(true);
    expect(drawIfVisibleCalled).toBe(true);
  });

  it("should pass correct parameters to ellipse", () => {
    K.circle(100, 100, 50);
    expect(lastEllipseArgs).toEqual([100, 100, 50, 50, 0, 0, Math.PI * 2]);
  });

  it("should handle different radii for x and y", () => {
    K.circle(100, 100, 50, 75);
    expect(lastEllipseArgs).toEqual([100, 100, 50, 75, 0, 0, Math.PI * 2]);
  });
});
