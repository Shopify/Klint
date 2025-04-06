import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  closePath: () => void;
  drawIfVisible: () => void;
  polygon: (
    x: number,
    y: number,
    radius: number,
    sides: number,
    radius2?: number,
    rotation?: number
  ) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("polygon", () => {
  let K: KlintContext;
  let beginPathCalled = false;
  let moveToCount = 0;
  let lineToCount = 0;
  let closePathCalled = false;
  let drawIfVisibleCalled = false;
  let lastMoveTo: [number, number] = [0, 0];
  let lastLineTo: Array<[number, number]> = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    beginPathCalled = false;
    moveToCount = 0;
    lineToCount = 0;
    closePathCalled = false;
    drawIfVisibleCalled = false;
    lastMoveTo = [0, 0];
    lastLineTo = [];

    // Create minimal mock context
    K = {
      beginPath() {
        beginPathCalled = true;
      },
      moveTo(x, y) {
        moveToCount++;
        lastMoveTo = [x, y];
      },
      lineTo(x, y) {
        lineToCount++;
        lastLineTo.push([x, y]);
      },
      closePath() {
        closePathCalled = true;
      },
      drawIfVisible() {
        drawIfVisibleCalled = true;
      },
      polygon(x, y, radius, sides, radius2, rotation = 0) {
        this.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides + rotation;
          const pointX = x + radius * Math.cos(angle);
          const pointY = y + (radius2 ? radius2 : radius) * Math.sin(angle);
          if (i === 0) this.moveTo(pointX, pointY);
          else this.lineTo(pointX, pointY);
        }
        this.closePath();
        this.drawIfVisible();
      },
      _ctx: ctx,
    };
  });

  it("should call beginPath, closePath, and drawIfVisible", () => {
    K.polygon(100, 100, 50, 4);
    expect(beginPathCalled).toBe(true);
    expect(closePathCalled).toBe(true);
    expect(drawIfVisibleCalled).toBe(true);
  });

  it("should call moveTo once and appropriate number of lineTo", () => {
    K.polygon(100, 100, 50, 6);
    expect(moveToCount).toBe(1);
    expect(lineToCount).toBe(5); // For a hexagon: 1 moveTo + 5 lineTo
  });

  it("should create a square (4 sides) correctly", () => {
    K.polygon(100, 100, 50, 4, undefined, 0);

    // For a square with no rotation at (100,100) with radius 50
    // First point (moveTo) should be at x=150, y=100
    expect(lastMoveTo[0]).toBeCloseTo(150);
    expect(lastMoveTo[1]).toBeCloseTo(100);

    // lineTo points should form remaining square corners
    expect(lastLineTo[0][0]).toBeCloseTo(100);
    expect(lastLineTo[0][1]).toBeCloseTo(150);

    expect(lastLineTo[1][0]).toBeCloseTo(50);
    expect(lastLineTo[1][1]).toBeCloseTo(100);

    expect(lastLineTo[2][0]).toBeCloseTo(100);
    expect(lastLineTo[2][1]).toBeCloseTo(50);
  });

  it("should respect rotation parameter", () => {
    // 45 degree rotation (PI/4)
    K.polygon(100, 100, 50, 4, undefined, Math.PI / 4);

    // For a square with 45 degree rotation, first point should be different
    const diagonalDistance = 50 * Math.cos(Math.PI / 4); // ~35.36

    // First point (moveTo) - should be at approximately (135.36, 135.36)
    expect(lastMoveTo[0]).toBeCloseTo(100 + diagonalDistance);
    expect(lastMoveTo[1]).toBeCloseTo(100 + diagonalDistance);
  });

  it("should use different x and y radii when radius2 is provided", () => {
    K.polygon(100, 100, 50, 4, 30, 0);

    // First point (horizontal radius)
    expect(lastMoveTo[0]).toBeCloseTo(150); // x + radius
    expect(lastMoveTo[1]).toBeCloseTo(100); // y

    // Second point (vertical radius2 affects y)
    expect(lastLineTo[0][0]).toBeCloseTo(100); // x
    expect(lastLineTo[0][1]).toBeCloseTo(130); // y + radius2
  });

  it("should handle triangles correctly", () => {
    K.polygon(100, 100, 50, 3);

    expect(moveToCount).toBe(1);
    expect(lineToCount).toBe(2); // For a triangle: 1 moveTo + 2 lineTo

    // Verify basic triangle shape was created
    expect(lastMoveTo[0]).toBeCloseTo(150); // First point of triangle

    // The other two points should complete the triangle
    expect(lastLineTo.length).toBe(2);
  });
});
