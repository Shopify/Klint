import { describe, it, expect, beforeEach } from "vitest";
import { CurveVertex } from "../../src/Klint";

// Partial representation of Klint
type KlintContext = {
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  bezierCurveTo: (
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ) => void;
  quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => void;
  arcTo: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number
  ) => void;
  closePath: () => void;
  drawIfVisible: () => void;
  checkTransparency: (type: string) => boolean;

  __startedShape: boolean;
  __currentShape: CurveVertex[] | null;
  __startedContour: boolean;
  __currentContours: CurveVertex[][] | null;
  __currentContour: CurveVertex[] | null;

  beginShape: () => void;
  endShape: (close?: boolean) => void;
  beginContour: () => void;
  endContour: (forceRevert?: boolean) => void;
  vertex: (x: number, y: number) => void;
  bezierVertex: (
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ) => void;
  quadraticVertex: (cpx: number, cpy: number, x: number, y: number) => void;
  arcVertex: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number
  ) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("Curve Vertex Functions", () => {
  let K: KlintContext;
  let beginPathCalled = false;
  let moveToCount = 0;
  let lineToCount = 0;
  let bezierCurveToCount = 0;
  let quadraticCurveToCount = 0;
  let arcToCount = 0;
  let closePathCalled = false;
  let drawIfVisibleCalled = false;
  let lastBezierParams:
    | [number, number, number, number, number, number]
    | null = null;
  let lastQuadraticParams: [number, number, number, number] | null = null;
  let lastArcParams: [number, number, number, number, number] | null = null;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Reset counters
    beginPathCalled = false;
    moveToCount = 0;
    lineToCount = 0;
    bezierCurveToCount = 0;
    quadraticCurveToCount = 0;
    arcToCount = 0;
    closePathCalled = false;
    drawIfVisibleCalled = false;
    lastBezierParams = null;
    lastQuadraticParams = null;
    lastArcParams = null;

    // Create mock context
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
      },
      lineTo(x, y) {
        lineToCount++;
      },
      bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
        bezierCurveToCount++;
        lastBezierParams = [cp1x, cp1y, cp2x, cp2y, x, y];
      },
      quadraticCurveTo(cpx, cpy, x, y) {
        quadraticCurveToCount++;
        lastQuadraticParams = [cpx, cpy, x, y];
      },
      arcTo(x1, y1, x2, y2, radius) {
        arcToCount++;
        lastArcParams = [x1, y1, x2, y2, radius];
      },
      closePath() {
        closePathCalled = true;
      },
      drawIfVisible() {
        drawIfVisibleCalled = true;
      },
      checkTransparency() {
        return true;
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
        if (!points?.length) return;

        const drawPath = (points: CurveVertex[], close = false) => {
          if (points.length === 0) return;

          const firstPoint = points[0];
          const startX =
            firstPoint.type === "line"
              ? firstPoint.x
              : firstPoint.type === "bezier"
              ? firstPoint.x
              : firstPoint.type === "quadratic"
              ? firstPoint.x
              : firstPoint.x2;
          const startY =
            firstPoint.type === "line"
              ? firstPoint.y
              : firstPoint.type === "bezier"
              ? firstPoint.y
              : firstPoint.type === "quadratic"
              ? firstPoint.y
              : firstPoint.y2;
          this.moveTo(startX, startY);

          for (let i = 0; i < points.length; i++) {
            const point = points[i];

            switch (point.type) {
              case "line":
                if (i > 0) this.lineTo(point.x, point.y);
                break;
              case "bezier":
                this.bezierCurveTo(
                  point.cp1x,
                  point.cp1y,
                  point.cp2x,
                  point.cp2y,
                  point.x,
                  point.y
                );
                break;
              case "quadratic":
                this.quadraticCurveTo(point.cpx, point.cpy, point.x, point.y);
                break;
              case "arc":
                this.arcTo(
                  point.x1,
                  point.y1,
                  point.x2,
                  point.y2,
                  point.radius
                );
                break;
            }
          }

          if (close && points.length > 1) {
            this.closePath();
          }
        };

        this.beginPath();
        drawPath(points, close);
        this.__currentContours?.forEach((contour: CurveVertex[]) =>
          drawPath(contour, true)
        );
        this.drawIfVisible();

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

      bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y) {
        if (!this.__startedShape) return;
        const points = this.__startedContour
          ? this.__currentContour
          : this.__currentShape;
        points?.push({ type: "bezier", cp1x, cp1y, cp2x, cp2y, x, y });
      },

      quadraticVertex(cpx, cpy, x, y) {
        if (!this.__startedShape) return;
        const points = this.__startedContour
          ? this.__currentContour
          : this.__currentShape;
        points?.push({ type: "quadratic", cpx, cpy, x, y });
      },

      arcVertex(x1, y1, x2, y2, radius) {
        if (!this.__startedShape) return;
        const points = this.__startedContour
          ? this.__currentContour
          : this.__currentShape;
        points?.push({ type: "arc", x1, y1, x2, y2, radius });
      },

      _ctx: ctx,
    };
  });

  describe("bezierVertex", () => {
    it("should store bezier vertex data correctly", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.bezierVertex(10, 20, 30, 40, 50, 60);

      expect(K.__currentShape).toHaveLength(2);
      expect(K.__currentShape![1]).toEqual({
        type: "bezier",
        cp1x: 10,
        cp1y: 20,
        cp2x: 30,
        cp2y: 40,
        x: 50,
        y: 60,
      });
    });

    it("should call bezierCurveTo when endShape is called", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.bezierVertex(10, 20, 30, 40, 50, 60);
      K.endShape();

      expect(bezierCurveToCount).toBe(1);
      expect(lastBezierParams).toEqual([10, 20, 30, 40, 50, 60]);
    });

    it("should not add vertex if shape not started", () => {
      K.bezierVertex(10, 20, 30, 40, 50, 60);
      expect(K.__currentShape).toBeNull();
    });
  });

  describe("quadraticVertex", () => {
    it("should store quadratic vertex data correctly", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.quadraticVertex(10, 20, 30, 40);

      expect(K.__currentShape).toHaveLength(2);
      expect(K.__currentShape![1]).toEqual({
        type: "quadratic",
        cpx: 10,
        cpy: 20,
        x: 30,
        y: 40,
      });
    });

    it("should call quadraticCurveTo when endShape is called", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.quadraticVertex(10, 20, 30, 40);
      K.endShape();

      expect(quadraticCurveToCount).toBe(1);
      expect(lastQuadraticParams).toEqual([10, 20, 30, 40]);
    });
  });

  describe("arcVertex", () => {
    it("should store arc vertex data correctly", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.arcVertex(10, 20, 30, 40, 15);

      expect(K.__currentShape).toHaveLength(2);
      expect(K.__currentShape![1]).toEqual({
        type: "arc",
        x1: 10,
        y1: 20,
        x2: 30,
        y2: 40,
        radius: 15,
      });
    });

    it("should call arcTo when endShape is called", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.arcVertex(10, 20, 30, 40, 15);
      K.endShape();

      expect(arcToCount).toBe(1);
      expect(lastArcParams).toEqual([10, 20, 30, 40, 15]);
    });
  });

  describe("Mixed curve types", () => {
    it("should handle multiple curve types in one shape", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.bezierVertex(10, 10, 20, 20, 30, 30);
      K.quadraticVertex(40, 40, 50, 50);
      K.arcVertex(60, 60, 70, 70, 10);
      K.vertex(80, 80);
      K.endShape();

      expect(K.__currentShape).toBeNull(); // Should be cleared after endShape
      expect(bezierCurveToCount).toBe(1);
      expect(quadraticCurveToCount).toBe(1);
      expect(arcToCount).toBe(1);
      expect(lineToCount).toBe(1); // Only the second vertex() creates a lineTo
    });
  });

  describe("Contour system with curves", () => {
    it("should handle curves in main shape and contours", () => {
      K.beginShape();

      // Main shape with curves
      K.vertex(0, 0);
      K.bezierVertex(50, 0, 100, 50, 100, 100);
      K.vertex(0, 100);

      // Contour with curves
      K.beginContour();
      K.vertex(25, 25);
      K.quadraticVertex(50, 25, 75, 25);
      K.vertex(75, 75);
      K.quadraticVertex(50, 75, 25, 75);
      K.endContour();

      K.endShape(true);

      expect(bezierCurveToCount).toBe(1);
      expect(quadraticCurveToCount).toBe(2); // Both contour curves
    });

    it("should store contour curves correctly", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(100, 100);

      K.beginContour();
      K.vertex(25, 25);
      K.bezierVertex(30, 20, 40, 30, 50, 25);

      expect(K.__currentContour).toHaveLength(2);
      expect(K.__currentContour![1]).toEqual({
        type: "bezier",
        cp1x: 30,
        cp1y: 20,
        cp2x: 40,
        cp2y: 30,
        x: 50,
        y: 25,
      });

      K.endContour();
      expect(K.__currentContours).toHaveLength(1);
      expect(K.__currentContours![0]).toHaveLength(2);
    });

    it("should handle multiple contours with different curve types", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(200, 200);

      // First contour with bezier
      K.beginContour();
      K.vertex(25, 25);
      K.bezierVertex(50, 25, 75, 50, 75, 75);
      K.endContour();

      // Second contour with quadratic
      K.beginContour();
      K.vertex(125, 125);
      K.quadraticVertex(150, 125, 175, 125);
      K.endContour();

      K.endShape(true);

      expect(K.__currentContours).toBeNull(); // Cleared after endShape
      expect(bezierCurveToCount).toBe(1);
      expect(quadraticCurveToCount).toBe(1);
    });

    it("should not start contour if shape not started", () => {
      K.beginContour();
      expect(K.__startedContour).toBe(false);
    });

    it("should not start contour if already in contour", () => {
      K.beginShape();
      K.beginContour();
      expect(K.__startedContour).toBe(true);

      K.beginContour(); // Should be ignored
      expect(K.__currentContour).toHaveLength(0);
    });
  });

  describe("Shape lifecycle", () => {
    it("should properly initialize shape state", () => {
      expect(K.__startedShape).toBe(false);
      expect(K.__currentShape).toBeNull();

      K.beginShape();

      expect(K.__startedShape).toBe(true);
      expect(K.__currentShape).toEqual([]);
      expect(K.__currentContours).toEqual([]);
    });

    it("should not start shape if already started", () => {
      K.beginShape();
      const firstShape = K.__currentShape;

      K.beginShape(); // Should be ignored

      expect(K.__currentShape).toBe(firstShape);
    });

    it("should clean up state after endShape", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.endShape();

      expect(K.__startedShape).toBe(false);
      expect(K.__currentShape).toBeNull();
      expect(K.__currentContours).toBeNull();
    });

    it("should call drawIfVisible in endShape", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.endShape();

      expect(drawIfVisibleCalled).toBe(true);
    });

    it("should handle closePath when close=true", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.vertex(100, 100);
      K.endShape(true);

      expect(closePathCalled).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty shape", () => {
      K.beginShape();
      K.endShape();

      expect(drawIfVisibleCalled).toBe(false);
    });

    it("should handle shape with only one vertex", () => {
      K.beginShape();
      K.vertex(50, 50);
      K.endShape();

      expect(moveToCount).toBe(1);
      expect(drawIfVisibleCalled).toBe(true);
    });

    it("should auto-end contour when ending shape", () => {
      K.beginShape();
      K.vertex(0, 0);
      K.beginContour();
      K.vertex(25, 25);
      // Don't explicitly call endContour
      K.endShape();

      expect(K.__currentContour).toBeNull();
      expect(K.__startedContour).toBe(false);
    });
  });
});
