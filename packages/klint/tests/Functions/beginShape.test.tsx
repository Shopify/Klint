import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  closePath: () => void;
  drawIfVisible: () => void;

  __startedShape: boolean;
  __currentShape: Array<{ type: "line"; x: number; y: number }> | null;
  __startedContour: boolean;
  __currentContours: Array<{ type: "line"; x: number; y: number }>[][] | null;
  __currentContour: Array<{ type: "line"; x: number; y: number }> | null;

  beginShape: () => void;
  endShape: (close?: boolean) => void;
  beginContour: () => void;
  endContour: (forceRevert?: boolean) => void;
  vertex: (x: number, y: number) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("beginShape/endShape System", () => {
  let K: KlintContext;
  let beginPathCalled = false;
  let moveToCount = 0;
  let lineToCount = 0;
  let closePathCalled = false;
  let drawIfVisibleCalled = false;
  let moveToPoints: Array<[number, number]> = [];
  let lineToPoints: Array<[number, number]> = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Reset counters
    beginPathCalled = false;
    moveToCount = 0;
    lineToCount = 0;
    closePathCalled = false;
    drawIfVisibleCalled = false;
    moveToPoints = [];
    lineToPoints = [];

    // Create mock context with shape functionality
    K = {
      __startedShape: false,
      __currentShape: null,
      __startedContour: false,
      __currentContours: null,
      __currentContour: null,

      beginPath() {
        beginPathCalled = true;
      },
      moveTo(x, y) {
        moveToCount++;
        moveToPoints.push([x, y]);
      },
      lineTo(x, y) {
        lineToCount++;
        lineToPoints.push([x, y]);
      },
      closePath() {
        closePathCalled = true;
      },
      drawIfVisible() {
        drawIfVisibleCalled = true;
      },

      beginShape() {
        if (this.__startedShape) return;
        this.beginPath();
        this.__startedShape = true;
        this.__currentShape = [];
        this.__currentContours = [];
      },

      endShape(close = false) {
        if (!this.__startedShape) return;
        if (this.__startedContour) this.endContour();

        const points = this.__currentShape;
        if (points?.length) {
          const drawPath = (
            points: Array<{ type: "line"; x: number; y: number }>,
            close = false
          ) => {
            if (points.length === 0) return;

            const firstPoint = points[0];
            this.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < points.length; i++) {
              const point = points[i];
              this.lineTo(point.x, point.y);
            }

            if (close && points.length > 1) {
              this.closePath();
            }
          };

          this.beginPath();
          drawPath(points, close);
          this.__currentContours?.forEach((contour) => drawPath(contour, true));
          this.drawIfVisible();
        }

        // Cleanup always happens
        this.__currentShape = null;
        this.__currentContours = null;
        this.__startedShape = false;
      },

      beginContour() {
        if (!this.__startedShape || this.__startedContour) return;
        this.__startedContour = true;
        this.__currentContour = [];
      },

      endContour(forceRevert = true) {
        if (!this.__startedContour || !this.__currentContour?.length) return;
        const contourPoints = [...this.__currentContour];
        if (forceRevert) {
          contourPoints.reverse();
        }
        this.__currentContours?.push(contourPoints);
        this.__currentContour = null;
        this.__startedContour = false;
      },

      vertex(x, y) {
        if (!this.__startedShape) return;
        const points = this.__startedContour
          ? this.__currentContour
          : this.__currentShape;
        points?.push({ type: "line", x, y });
      },

      _ctx: ctx,
    };
  });

  describe("Basic shape functionality", () => {
    it("should initialize shape state correctly", () => {
      expect(K.__startedShape).toBe(false);
      expect(K.__currentShape).toBeNull();

      K.beginShape();

      expect(K.__startedShape).toBe(true);
      expect(K.__currentShape).toEqual([]);
      expect(K.__currentContours).toEqual([]);
      expect(beginPathCalled).toBe(true);
    });

    it("should create simple triangle shape", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(100, 0);
      K.vertex(50, 100);
      K.endShape(true);

      expect(moveToCount).toBe(1);
      expect(lineToCount).toBe(2);
      expect(closePathCalled).toBe(true);
      expect(drawIfVisibleCalled).toBe(true);

      expect(moveToPoints[0]).toEqual([0, 0]);
      expect(lineToPoints[0]).toEqual([100, 0]);
      expect(lineToPoints[1]).toEqual([50, 100]);
    });

    it("should create open shape when close=false", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(100, 100);
      K.endShape(false);

      expect(closePathCalled).toBe(false);
      expect(drawIfVisibleCalled).toBe(true);
    });

    it("should not start shape if already started", () => {
      K.beginShape();
      const originalShape = K.__currentShape;

      K.beginShape(); // Should be ignored

      expect(K.__currentShape).toBe(originalShape);
    });

    it("should handle empty shape gracefully", () => {
      K.beginShape();
      K.endShape();

      expect(drawIfVisibleCalled).toBe(false);
      expect(K.__startedShape).toBe(false);
    });
  });

  describe("Contour functionality", () => {
    it("should create shape with single contour (hole)", () => {
      K.beginShape();

      // Outer shape
      K.vertex(0, 0);
      K.vertex(200, 0);
      K.vertex(200, 200);
      K.vertex(0, 200);

      // Inner contour (hole)
      K.beginContour();
      K.vertex(50, 50);
      K.vertex(150, 50);
      K.vertex(150, 150);
      K.vertex(50, 150);
      K.endContour();

      K.endShape(true);

      expect(K.__currentContours).toBeNull(); // Should be cleared
      expect(K.__startedContour).toBe(false);
      expect(moveToCount).toBe(2); // One for main shape, one for contour
      expect(drawIfVisibleCalled).toBe(true);
    });

    it("should reverse contour points by default", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(100, 100);

      K.beginContour();
      K.vertex(25, 25);
      K.vertex(75, 25);
      K.vertex(75, 75);

      // Before endContour, points are in original order
      expect(K.__currentContour![0]).toEqual({ type: "line", x: 25, y: 25 });
      expect(K.__currentContour![1]).toEqual({ type: "line", x: 75, y: 25 });
      expect(K.__currentContour![2]).toEqual({ type: "line", x: 75, y: 75 });

      K.endContour();

      // After endContour, points should be reversed
      expect(K.__currentContours![0][0]).toEqual({
        type: "line",
        x: 75,
        y: 75,
      });
      expect(K.__currentContours![0][1]).toEqual({
        type: "line",
        x: 75,
        y: 25,
      });
      expect(K.__currentContours![0][2]).toEqual({
        type: "line",
        x: 25,
        y: 25,
      });
    });

    it("should not reverse contour points when forceRevert=false", () => {
      K.beginShape();
      K.vertex(0, 0);

      K.beginContour();
      K.vertex(25, 25);
      K.vertex(75, 25);
      K.endContour(false);

      // Points should maintain original order
      expect(K.__currentContours![0][0]).toEqual({
        type: "line",
        x: 25,
        y: 25,
      });
      expect(K.__currentContours![0][1]).toEqual({
        type: "line",
        x: 75,
        y: 25,
      });
    });

    it("should handle multiple contours", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(300, 300);

      // First contour
      K.beginContour();
      K.vertex(50, 50);
      K.vertex(100, 100);
      K.endContour();

      // Second contour
      K.beginContour();
      K.vertex(200, 200);
      K.vertex(250, 250);
      K.endContour();

      K.endShape(true);

      expect(K.__currentContours).toBeNull(); // Cleared after endShape
      expect(moveToCount).toBe(3); // Main + 2 contours
    });

    it("should not start contour if shape not started", () => {
      K.beginContour();
      expect(K.__startedContour).toBe(false);
      expect(K.__currentContour).toBeNull();
    });

    it("should not start contour if already in contour", () => {
      K.beginShape();
      K.beginContour();
      expect(K.__startedContour).toBe(true);

      const originalContour = K.__currentContour;
      K.beginContour(); // Should be ignored

      expect(K.__currentContour).toBe(originalContour);
    });

    it("should auto-end contour when ending shape", () => {
      K.beginShape();
      K.vertex(0, 0);

      K.beginContour();
      K.vertex(25, 25);
      K.vertex(75, 75);
      // Don't explicitly call endContour

      K.endShape();

      expect(K.__startedContour).toBe(false);
      expect(K.__currentContour).toBeNull();
    });

    it("should not add contour if empty", () => {
      K.beginShape();
      K.vertex(0, 0);

      K.beginContour();
      // Don't add any vertices
      K.endContour();

      expect(K.__currentContours).toHaveLength(0);
    });
  });

  describe("Vertex functionality", () => {
    it("should store vertices in main shape", () => {
      K.beginShape();
      K.vertex(10, 20);
      K.vertex(30, 40);

      expect(K.__currentShape).toHaveLength(2);
      expect(K.__currentShape![0]).toEqual({ type: "line", x: 10, y: 20 });
      expect(K.__currentShape![1]).toEqual({ type: "line", x: 30, y: 40 });
    });

    it("should store vertices in contour when in contour mode", () => {
      K.beginShape();
      K.vertex(0, 0);

      K.beginContour();
      K.vertex(10, 20);
      K.vertex(30, 40);

      expect(K.__currentShape).toHaveLength(1); // Only main shape vertex
      expect(K.__currentContour).toHaveLength(2);
      expect(K.__currentContour![0]).toEqual({ type: "line", x: 10, y: 20 });
      expect(K.__currentContour![1]).toEqual({ type: "line", x: 30, y: 40 });
    });

    it("should not add vertex if shape not started", () => {
      K.vertex(10, 20);
      expect(K.__currentShape).toBeNull();
    });
  });

  describe("State cleanup", () => {
    it("should clean up all state after endShape", () => {
      K.beginShape();
      K.vertex(0, 0);

      K.beginContour();
      K.vertex(25, 25);
      K.endContour();

      K.endShape();

      expect(K.__startedShape).toBe(false);
      expect(K.__currentShape).toBeNull();
      expect(K.__currentContours).toBeNull();
      expect(K.__startedContour).toBe(false);
      expect(K.__currentContour).toBeNull();
    });
  });
});
