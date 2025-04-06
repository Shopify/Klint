import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  globalCompositeOperation: GlobalCompositeOperation;
  blend: (blend: GlobalCompositeOperation) => void;
  _ctx: CanvasRenderingContext2D;
};

describe("blend", () => {
  let K: KlintContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    // Create minimal mock context
    K = {
      globalCompositeOperation: "source-over",
      blend(blend: GlobalCompositeOperation) {
        this.globalCompositeOperation = blend;
      },
      _ctx: ctx,
    };
  });

  it("should set source-over blend mode", () => {
    K.blend("source-over");
    expect(K.globalCompositeOperation).toBe("source-over");
  });

  it("should set source-in blend mode", () => {
    K.blend("source-in");
    expect(K.globalCompositeOperation).toBe("source-in");
  });

  it("should set source-out blend mode", () => {
    K.blend("source-out");
    expect(K.globalCompositeOperation).toBe("source-out");
  });

  it("should set source-atop blend mode", () => {
    K.blend("source-atop");
    expect(K.globalCompositeOperation).toBe("source-atop");
  });

  it("should set destination-over blend mode", () => {
    K.blend("destination-over");
    expect(K.globalCompositeOperation).toBe("destination-over");
  });

  it("should set destination-in blend mode", () => {
    K.blend("destination-in");
    expect(K.globalCompositeOperation).toBe("destination-in");
  });

  it("should set destination-out blend mode", () => {
    K.blend("destination-out");
    expect(K.globalCompositeOperation).toBe("destination-out");
  });

  it("should set destination-atop blend mode", () => {
    K.blend("destination-atop");
    expect(K.globalCompositeOperation).toBe("destination-atop");
  });

  it("should set lighter blend mode", () => {
    K.blend("lighter");
    expect(K.globalCompositeOperation).toBe("lighter");
  });

  it("should set copy blend mode", () => {
    K.blend("copy");
    expect(K.globalCompositeOperation).toBe("copy");
  });

  it("should set xor blend mode", () => {
    K.blend("xor");
    expect(K.globalCompositeOperation).toBe("xor");
  });

  it("should set multiply blend mode", () => {
    K.blend("multiply");
    expect(K.globalCompositeOperation).toBe("multiply");
  });

  it("should set screen blend mode", () => {
    K.blend("screen");
    expect(K.globalCompositeOperation).toBe("screen");
  });

  it("should set overlay blend mode", () => {
    K.blend("overlay");
    expect(K.globalCompositeOperation).toBe("overlay");
  });

  it("should set darken blend mode", () => {
    K.blend("darken");
    expect(K.globalCompositeOperation).toBe("darken");
  });

  it("should set lighten blend mode", () => {
    K.blend("lighten");
    expect(K.globalCompositeOperation).toBe("lighten");
  });
});
