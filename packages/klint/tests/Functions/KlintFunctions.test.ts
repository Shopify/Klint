import { beforeEach, describe, expect, it, vi } from "vitest";
import { createKlintContext } from "../../src/core/KlintContext";
import { resizeKlintCanvas } from "../../src/core/KlintRuntime";
import {
  normalizeKlintOptions,
  type KlintContext,
} from "../../src/core/KlintTypes";

const createContext = (options = {}): KlintContext => {
  const canvas = document.createElement("canvas");
  return createKlintContext(canvas, options);
};

describe("production Klint functions", () => {
  let K: KlintContext;

  beforeEach(() => {
    K = createContext();
    K.width = 300;
    K.height = 150;
    K.__dpr = K.dpr = 1;
  });

  it("normalizes booleans and keeps legacy string values safe", () => {
    const options = normalizeKlintOptions({
      alpha: "false",
      static: "true",
      willreadfrequently: "false",
    } as never);
    expect(options.alpha).toBe(false);
    expect(options.static).toBe(true);
    expect(options.willreadfrequently).toBe(false);
  });

  it("returns normalized modulo values for exact negative multiples", () => {
    expect(K.fract(-4, 2)).toBe(0);
    expect(K.fract(-3, 2)).toBe(1);
    expect(K.fract(7, -4)).toBe(3);
    expect(K.fract(1, 0)).toBeNaN();
  });

  it("keeps approximate distance modes in distance units", () => {
    expect(K.distance(0, 0, 100, 0, "fast")).toBe(100);
    expect(K.distance(0, 0, 100, 0, "faster")).toBe(100);
    expect(K.distance(0, 0, 3, 4, "fast")).toBeCloseTo(5.2426, 3);
    expect(K.distance(0, 0, 3, 4)).toBe(5);
  });

  it("routes drawing helpers through the production canvas context", () => {
    const ellipse = vi.spyOn(K, "ellipse");
    const fill = vi.spyOn(K, "fill");
    const stroke = vi.spyOn(K, "stroke");
    K.fillStyle = "red";
    K.strokeStyle = "blue";

    K.circle(10, 20, 8);

    expect(ellipse).toHaveBeenCalledWith(10, 20, 8, 8, 0, 0, Math.PI * 2);
    expect(fill).toHaveBeenCalledOnce();
    expect(stroke).toHaveBeenCalledOnce();
  });

  it("always resets shape and contour state, including empty shapes", () => {
    K.beginShape();
    K.beginContour();
    K.endContour();
    K.endShape();
    expect(K.__startedShape).toBe(false);
    expect(K.__startedContour).toBe(false);
    expect(K.__currentShape).toBeNull();
    expect(K.__currentContour).toBeNull();

    K.beginShape();
    K.vertex(0, 0);
    K.vertex(10, 10);
    K.endShape(true);
    expect(K.__startedShape).toBe(false);
    expect(K.__currentContours).toBeNull();
  });

  it("restores patched clip methods when a clip callback throws", () => {
    const beginPath = K.beginPath;
    const fill = K.fill;
    const stroke = K.stroke;
    const drawIfVisible = K.drawIfVisible;

    expect(() =>
      K.clipTo(() => {
        throw new Error("bad path");
      }),
    ).toThrow("bad path");

    expect(K.beginPath).toBe(beginPath);
    expect(K.fill).toBe(fill);
    expect(K.stroke).toBe(stroke);
    expect(K.drawIfVisible).toBe(drawIfVisible);
  });

  it("uses logical dimensions with a DPR-scaled backing store", () => {
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 2,
    });
    const changed = resizeKlintCanvas(K.canvas, K, 320, 180, {
      dpr: "default",
      maxDpr: 3,
    });

    expect(changed).toBe(true);
    expect(K.width).toBe(320);
    expect(K.height).toBe(180);
    expect(K.dpr).toBe(2);
    expect(K.canvas.width).toBe(640);
    expect(K.canvas.height).toBe(360);
    expect(K.canvas.style.width).toBe("320px");
  });

  it("creates complete canvas-backed offscreens without data URL encoding", () => {
    K.__dpr = K.dpr = 2;
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL");
    const offscreen = K.createOffscreen("layer", 40, 20, { static: true });

    expect(offscreen.width).toBe(40);
    expect(offscreen.height).toBe(20);
    expect(offscreen.canvas.width).toBe(80);
    expect(offscreen.canvas.height).toBe(40);
    expect(offscreen.dpr).toBe(2);
    expect(offscreen.Color).toBeDefined();
    expect(offscreen.circle).toBeTypeOf("function");
    const drawImage = vi.spyOn(K, "drawImage");
    K.image(offscreen, 0, 0);
    expect(drawImage).toHaveBeenCalledWith(offscreen.canvas, 0, 0, 40, 20);
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it("keeps text sizes in logical pixels and computes valid font shorthand", () => {
    K.__dpr = K.dpr = 2;
    K.textSize(24);
    K.textStyle("italic");
    K.textWeight("700");
    K.textFont("Inter, sans-serif");
    K.computeFont();

    expect(K.__textSize).toBe(24);
    expect(K.font).toBe("italic 700 24px Inter, sans-serif");
  });

  it("preserves explicit paragraph line breaks", () => {
    const fillText = vi.spyOn(K, "fillText");
    vi.spyOn(K, "measureText").mockImplementation(
      (text: string) => ({ width: text.length * 10 }) as TextMetrics,
    );
    K.fillStyle = "black";
    K.strokeStyle = "transparent";
    K.paragraph("first\nsecond", 0, 0, 200);

    expect(fillText).toHaveBeenCalledTimes(2);
    expect(fillText.mock.calls.map(([text]) => text)).toEqual(["first", "second"]);
  });

  it("reads pixel regions in backing-store coordinates", () => {
    K.__dpr = K.dpr = 2;
    const getImageData = vi.spyOn(K, "getImageData");
    K.Pixels.read(3, 4, 2, 1);
    expect(getImageData).toHaveBeenCalledWith(6, 8, 4, 2);
  });

  it("wires pause, play, and redraw to runtime state", () => {
    const redraw = vi.fn();
    K.__redraw = redraw;
    K.pause();
    expect(K.__isPlaying).toBe(false);
    K.play();
    expect(K.__isPlaying).toBe(true);
    K.redraw();
    expect(redraw).toHaveBeenCalledOnce();
  });
});
