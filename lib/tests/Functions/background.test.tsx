import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  width: number;
  height: number;
  resetTransform: () => void;
  push: () => void;
  pop: () => void;
  fillStyle: string;
  fillRect: (x: number, y: number, width: number, height: number) => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  translate: (x: number, y: number) => void;
  __canvasOrigin: "center" | "corner";
  background: (color?: string) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("background", () => {
  let K: KlintContext;
  let resetTransformCalled = false;
  let pushCalled = false;
  let popCalled = false;
  let fillRectCalled = false;
  let clearRectCalled = false;
  let translateCalled = false;
  let lastFillStyle = "";
  let lastFillRectArgs: number[] = [];
  let lastClearRectArgs: number[] = [];
  let lastTranslateArgs: number[] = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    resetTransformCalled = false;
    pushCalled = false;
    popCalled = false;
    fillRectCalled = false;
    clearRectCalled = false;
    translateCalled = false;
    lastFillStyle = "";
    lastFillRectArgs = [];
    lastClearRectArgs = [];
    lastTranslateArgs = [];

    // Create minimal mock context
    K = {
      width: 800,
      height: 600,
      resetTransform() {
        resetTransformCalled = true;
      },
      push() {
        pushCalled = true;
      },
      pop() {
        popCalled = true;
      },
      fillStyle: "#000000",
      fillRect(x, y, width, height) {
        fillRectCalled = true;
        lastFillRectArgs = [x, y, width, height];
      },
      clearRect(x, y, width, height) {
        clearRectCalled = true;
        lastClearRectArgs = [x, y, width, height];
      },
      translate(x, y) {
        translateCalled = true;
        lastTranslateArgs = [x, y];
      },
      __canvasOrigin: "corner",
      background(color?: string) {
        this.resetTransform();
        this.push();
        if (color && color !== "transparent") {
          this.fillStyle = color;
          lastFillStyle = color;
          this.fillRect(0, 0, this.width, this.height);
        } else {
          this.clearRect(0, 0, this.width, this.height);
        }
        this.pop();
        if (this.__canvasOrigin === "center")
          this.translate(this.width * 0.5, this.height * 0.5);
      },
      _ctx: ctx,
    };
  });

  it("should call resetTransform, push, and pop", () => {
    K.background("red");
    expect(resetTransformCalled).toBe(true);
    expect(pushCalled).toBe(true);
    expect(popCalled).toBe(true);
  });

  it("should fill with the given color", () => {
    const colors = ["#FF0000", "blue", "rgba(0,255,0,0.5)"];
    colors.forEach((color) => {
      K.background(color);
      expect(lastFillStyle).toBe(color);
      expect(fillRectCalled).toBe(true);
      expect(lastFillRectArgs).toEqual([0, 0, K.width, K.height]);

      // Reset for next test
      fillRectCalled = false;
    });
  });

  it("should clear the canvas when no color is provided", () => {
    K.background();
    expect(clearRectCalled).toBe(true);
    expect(lastClearRectArgs).toEqual([0, 0, K.width, K.height]);
    expect(fillRectCalled).toBe(false);
  });

  it("should clear the canvas when transparent is provided", () => {
    K.background("transparent");
    expect(clearRectCalled).toBe(true);
    expect(lastClearRectArgs).toEqual([0, 0, K.width, K.height]);
    expect(fillRectCalled).toBe(false);
  });

  it("should translate when canvas origin is center", () => {
    K.__canvasOrigin = "center";
    K.background("red");
    expect(translateCalled).toBe(true);
    expect(lastTranslateArgs).toEqual([K.width * 0.5, K.height * 0.5]);
  });

  it("should not translate when canvas origin is corner", () => {
    K.__canvasOrigin = "corner";
    K.background("red");
    expect(translateCalled).toBe(false);
  });
});
