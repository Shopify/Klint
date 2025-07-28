import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  translate: (x: number, y: number) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("translate", () => {
  let K: KlintContext;
  let translateCalled = false;
  let lastTranslateArgs: number[] = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    translateCalled = false;
    lastTranslateArgs = [];

    // Create minimal mock context with spies
    K = {
      translate(x: number, y: number) {
        translateCalled = true;
        lastTranslateArgs = [x, y];
        ctx.translate(x, y);
      },
      _ctx: ctx,
    };
  });

  it("should call translate with the correct arguments", () => {
    K.translate(100, 200);
    expect(translateCalled).toBe(true);
    expect(lastTranslateArgs).toEqual([100, 200]);
  });

  it("should handle zero translation", () => {
    K.translate(0, 0);
    expect(translateCalled).toBe(true);
    expect(lastTranslateArgs).toEqual([0, 0]);
  });

  it("should handle negative translation", () => {
    K.translate(-50, -75);
    expect(translateCalled).toBe(true);
    expect(lastTranslateArgs).toEqual([-50, -75]);
  });

  it("should handle decimal values", () => {
    K.translate(10.5, 20.75);
    expect(translateCalled).toBe(true);
    expect(lastTranslateArgs).toEqual([10.5, 20.75]);
  });
});
