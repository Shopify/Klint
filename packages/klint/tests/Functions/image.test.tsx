import { describe, it, expect, beforeEach } from "vitest";

// Partial representation of Klint
type KlintContext = {
  drawImage: (...args: any[]) => void;
  __imageOrigin: "corner" | "center";
  image: (
    image: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas | any,
    x: number,
    y: number,
    arg3?: number,
    arg4?: number,
    arg5?: number,
    arg6?: number,
    arg7?: number,
    arg8?: number
  ) => void;
  canvas: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;
};

describe("image", () => {
  let K: KlintContext;
  let drawImageCalled = false;
  let lastDrawImageArgs: any[] = [];

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    drawImageCalled = false;
    lastDrawImageArgs = [];

    // Create minimal mock context
    K = {
      drawImage(...args: any[]) {
        drawImageCalled = true;
        lastDrawImageArgs = [...args];
      },
      __imageOrigin: "corner",
      image(image, x, y, arg3?, arg4?, arg5?, arg6?, arg7?, arg8?) {
        const sourceImage = "canvas" in image ? image.canvas : image;

        // 9-argument syntax: drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        if (arg5 !== undefined) {
          const [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = [
            x,
            y,
            arg3!,
            arg4!,
            arg5,
            arg6!,
            arg7!,
            arg8!,
          ];
          const adjustedX =
            this.__imageOrigin === "center" ? dx - dWidth / 2 : dx;
          const adjustedY =
            this.__imageOrigin === "center" ? dy - dHeight / 2 : dy;
          this.drawImage(
            sourceImage,
            sx,
            sy,
            sWidth,
            sHeight,
            adjustedX,
            adjustedY,
            dWidth,
            dHeight
          );
          return;
        }

        // 5-argument syntax: drawImage(image, dx, dy, dWidth, dHeight)
        if (arg3 !== undefined) {
          const [dx, dy, dWidth, dHeight] = [x, y, arg3, arg4!];
          const adjustedX =
            this.__imageOrigin === "center" ? dx - dWidth / 2 : dx;
          const adjustedY =
            this.__imageOrigin === "center" ? dy - dHeight / 2 : dy;
          this.drawImage(sourceImage, adjustedX, adjustedY, dWidth, dHeight);
          return;
        }

        // 3-argument syntax: drawImage(image, dx, dy)
        const [dx, dy] = [x, y];
        const width =
          sourceImage instanceof HTMLImageElement
            ? sourceImage.naturalWidth
            : sourceImage.width;
        const height =
          sourceImage instanceof HTMLImageElement
            ? sourceImage.naturalHeight
            : sourceImage.height;
        const adjustedX = this.__imageOrigin === "center" ? dx - width / 2 : dx;
        const adjustedY =
          this.__imageOrigin === "center" ? dy - height / 2 : dy;

        this.drawImage(sourceImage, adjustedX, adjustedY);
      },
      canvas,
      _ctx: ctx,
    };
  });

  it("should call drawImage with 3 args when using basic positioning", () => {
    const mockImg = {
      width: 100,
      height: 50,
      naturalWidth: 100,
      naturalHeight: 50,
    };

    K.image(mockImg, 10, 20);

    expect(drawImageCalled).toBe(true);
    expect(lastDrawImageArgs.length).toBe(3);
    expect(lastDrawImageArgs[0]).toBe(mockImg);
    expect(lastDrawImageArgs[1]).toBe(10); // x position (corner origin)
    expect(lastDrawImageArgs[2]).toBe(20); // y position (corner origin)
  });

  it("should call drawImage with 5 args when specifying dimensions", () => {
    const mockImg = { width: 100, height: 100 };

    K.image(mockImg, 10, 20, 50, 40);

    expect(drawImageCalled).toBe(true);
    expect(lastDrawImageArgs.length).toBe(5);
    expect(lastDrawImageArgs[0]).toBe(mockImg);
    expect(lastDrawImageArgs[1]).toBe(10); // x
    expect(lastDrawImageArgs[2]).toBe(20); // y
    expect(lastDrawImageArgs[3]).toBe(50); // width
    expect(lastDrawImageArgs[4]).toBe(40); // height
  });

  it("should call drawImage with 9 args when using source and destination parameters", () => {
    const mockImg = { width: 100, height: 100 };

    K.image(mockImg, 10, 20, 30, 40, 50, 60, 70, 80);

    expect(drawImageCalled).toBe(true);
    expect(lastDrawImageArgs.length).toBe(9);
    expect(lastDrawImageArgs[0]).toBe(mockImg);
    expect(lastDrawImageArgs[1]).toBe(10); // sx
    expect(lastDrawImageArgs[2]).toBe(20); // sy
    expect(lastDrawImageArgs[3]).toBe(30); // sWidth
    expect(lastDrawImageArgs[4]).toBe(40); // sHeight
    expect(lastDrawImageArgs[5]).toBe(50); // dx
    expect(lastDrawImageArgs[6]).toBe(60); // dy
    expect(lastDrawImageArgs[7]).toBe(70); // dWidth
    expect(lastDrawImageArgs[8]).toBe(80); // dHeight
  });

  it("should adjust position for center origin in basic case", () => {
    const mockImg = {
      width: 100,
      height: 50,
      naturalWidth: 100,
      naturalHeight: 50,
    };

    K.__imageOrigin = "center";
    K.image(mockImg, 100, 100);

    expect(drawImageCalled).toBe(true);
    expect(lastDrawImageArgs[1]).toBe(50); // x - width/2
    expect(lastDrawImageArgs[2]).toBe(75); // y - height/2
  });

  it("should adjust position for center origin with explicit dimensions", () => {
    const mockImg = { width: 100, height: 100 };

    K.__imageOrigin = "center";
    K.image(mockImg, 100, 100, 80, 60);

    expect(drawImageCalled).toBe(true);
    expect(lastDrawImageArgs[1]).toBe(60); // x - width/2
    expect(lastDrawImageArgs[2]).toBe(70); // y - height/2
    expect(lastDrawImageArgs[3]).toBe(80); // width unchanged
    expect(lastDrawImageArgs[4]).toBe(60); // height unchanged
  });

  it("should adjust position for center origin with source and destination", () => {
    const mockImg = { width: 100, height: 100 };

    K.__imageOrigin = "center";
    K.image(mockImg, 10, 20, 30, 40, 100, 100, 80, 60);

    expect(drawImageCalled).toBe(true);
    // Source params unchanged
    expect(lastDrawImageArgs[1]).toBe(10);
    expect(lastDrawImageArgs[2]).toBe(20);
    expect(lastDrawImageArgs[3]).toBe(30);
    expect(lastDrawImageArgs[4]).toBe(40);
    // Destination adjusted for center origin
    expect(lastDrawImageArgs[5]).toBe(60); // dx - dWidth/2
    expect(lastDrawImageArgs[6]).toBe(70); // dy - dHeight/2
    expect(lastDrawImageArgs[7]).toBe(80); // dWidth unchanged
    expect(lastDrawImageArgs[8]).toBe(60); // dHeight unchanged
  });

  it("should handle canvas objects correctly", () => {
    const mockCanvas = {
      canvas: document.createElement("canvas"),
      width: 100,
      height: 50,
    };
    mockCanvas.canvas.width = 100;
    mockCanvas.canvas.height = 50;

    K.image(mockCanvas, 10, 20);

    expect(drawImageCalled).toBe(true);
    expect(lastDrawImageArgs[0]).toBe(mockCanvas.canvas); // Should use the canvas property
    expect(lastDrawImageArgs[1]).toBe(10);
    expect(lastDrawImageArgs[2]).toBe(20);
  });
});
