import { KlintOffscreenContext, KlintConfig } from "./KlintTypes";

// Klint Functions
export type KlintFunctions = {
  [K in KlintFunctionNames]: ReturnType<(typeof KlintFunctions)[K]>;
};
type KlintFunctionNames = keyof typeof KlintFunctions;

export const KlintFunctions = {
  extend:
    (ctx: KlintOffscreenContext) =>
    (name: string, data: unknown, enforceReplace = false) => {
      // if (ctx._) {
      //   console.log(`Cannot extend Klint with '${name}' after preload/setup`);
      //   return;
      // }
      if (name in ctx && !enforceReplace) return;
      (ctx as KlintOffscreenContext)[name] = data;
    },
  background: (ctx: KlintOffscreenContext) => (color?: string) => {
    ctx.resetTransform();
    ctx.push();
    if (color && color !== "transparent") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ctx.width, ctx.height);
    } else {
      ctx.clearRect(0, 0, ctx.width, ctx.height);
    }
    ctx.pop();
    if (ctx.__canvasOrigin === "center")
      ctx.translate(ctx.width * 0.5, ctx.height * 0.5);
  },
  reset: (ctx: KlintOffscreenContext) => () => {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.resetTransform();
  },
  clear: (ctx: KlintOffscreenContext) => () => {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
  },
  fillColor: (ctx: KlintOffscreenContext) => (color: string) => {
    ctx.fillStyle = color;
  },
  strokeColor: (ctx: KlintOffscreenContext) => (color: string) => {
    ctx.strokeStyle = color;
  },
  noFill: (ctx: KlintOffscreenContext) => () => {
    ctx.fillStyle = "transparent";
  },
  noStroke: (ctx: KlintOffscreenContext) => () => {
    ctx.strokeStyle = "transparent";
  },
  strokeWidth: (ctx: KlintOffscreenContext) => (width: number) => {
    ctx.lineWidth = width;
  },
  strokeJoin: (ctx: KlintOffscreenContext) => (join: CanvasLineJoin) => {
    ctx.lineJoin = join;
  },
  strokeCap: (ctx: KlintOffscreenContext) => (cap: CanvasLineCap) => {
    ctx.lineCap = cap;
  },
  push: (ctx: KlintOffscreenContext) => () => {
    ctx.save();
  },
  pop: (ctx: KlintOffscreenContext) => () => {
    ctx.restore();
  },
  point: (ctx: KlintOffscreenContext) => (x: number, y: number) => {
    if (!ctx.checkTransparency("stroke")) return;
    ctx.beginPath();
    ctx.strokeRect(x, y, 1, 1);
  },
  checkTransparency: (ctx: KlintOffscreenContext) => (toCheck: string) => {
    if (
      toCheck === "stroke" &&
      (ctx.strokeStyle === "transparent" || ctx.lineWidth === 0)
    )
      return false;
    if (toCheck === "fill" && ctx.fillStyle === "transparent") return false;
    return true;
  },
  drawIfVisible: (ctx: KlintOffscreenContext) => () => {
    if (ctx.checkTransparency("fill")) ctx.fill();
    if (ctx.checkTransparency("stroke")) ctx.stroke();
  },
  line:
    (ctx: KlintOffscreenContext) =>
    (x1: number, y1: number, x2: number, y2: number) => {
      if (!ctx.checkTransparency("stroke")) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
  circle:
    (ctx: KlintOffscreenContext) =>
    (x: number, y: number, radius: number, radius2?: number) => {
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius2 || radius, 0, 0, Math.PI * 2);
      ctx.drawIfVisible();
    },
  disk:
    (ctx: KlintOffscreenContext) =>
    (
      x: number,
      y: number,
      radius: number,
      startAngle = 0,
      endAngle = Math.PI * 2,
      closed = true
    ) => {
      ctx.beginPath();
      if (closed) {
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.lineTo(x, y);
      } else {
        ctx.arc(x, y, radius, startAngle, endAngle);
      }
      ctx.drawIfVisible();
    },

  rectangle:
    (ctx: KlintOffscreenContext) =>
    (x: number, y: number, width: number, height?: number) => {
      const originType = ctx.__rectangleOrigin || ctx.origin;
      const h = height ?? width;
      const drawX = originType === "center" ? x - width / 2 : x;
      const drawY = originType === "center" ? y - h / 2 : y;
      ctx.beginPath();
      ctx.rect(drawX, drawY, width, h);
      ctx.drawIfVisible();
    },
  roundedRectangle:
    (ctx: KlintOffscreenContext) =>
    (
      x: number,
      y: number,
      width: number,
      radius: number | number[],
      height?: number
    ) => {
      const originType = ctx.__rectangleOrigin || ctx.origin;
      const h = height ?? width;
      const drawX = originType === "center" ? x - width / 2 : x;
      const drawY = originType === "center" ? y - h / 2 : y;
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, width, h, radius);
      ctx.drawIfVisible();
    },
  polygon:
    (ctx: KlintOffscreenContext) =>
    (
      x: number,
      y: number,
      radius: number,
      sides: number,
      radius2?: number,
      rotation: number = 0
    ) => {
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides + rotation;
        const pointX = x + radius * Math.cos(angle);
        const pointY = y + (radius2 ? radius2 : radius) * Math.sin(angle);
        if (i === 0) ctx.moveTo(pointX, pointY);
        else ctx.lineTo(pointX, pointY);
      }
      ctx.closePath();
      ctx.drawIfVisible();
    },
  beginShape: (ctx: KlintOffscreenContext) => () => {
    if (ctx.__startedShape) return;
    ctx.beginPath();
    ctx.__startedShape = true;
    ctx.__currentShape = [];
    ctx.__currentContours = [];
  },
  beginContour: (ctx: KlintOffscreenContext) => () => {
    if (!ctx.__startedShape) return;
    if (ctx.__startedContour && ctx.__currentContour?.length) {
      ctx.__currentContours?.push([...ctx.__currentContour]);
    }
    ctx.__startedContour = true;
    ctx.__currentContour = [];
  },
  vertex: (ctx: KlintOffscreenContext) => (x: number, y: number) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push([x, y]);
  },
  endContour:
    (ctx: KlintOffscreenContext) =>
    (forceRevert = true) => {
      if (!ctx.__startedContour || !ctx.__currentContour?.length) return;
      const contourPoints = [...ctx.__currentContour];
      if (forceRevert) {
        contourPoints.reverse();
      }
      ctx.__currentContours?.push(contourPoints);
      ctx.__currentContour = null;
      ctx.__startedContour = false;
    },
  endShape:
    (ctx: KlintOffscreenContext) =>
    (close = false) => {
      if (!ctx.__startedShape) return;
      if (ctx.__startedContour) ctx.endContour();

      const points = ctx.__currentShape;
      if (!points?.length) return;

      const drawPath = (points: number[][], close = false) => {
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        if (close) {
          const [firstX, firstY] = points[0];
          const lastPoint = points[points.length - 1];
          if (lastPoint[0] !== firstX || lastPoint[1] !== firstY) {
            ctx.lineTo(firstX, firstY);
          }
        }
      };
      ctx.beginPath();
      drawPath(points, close);
      ctx.__currentContours?.forEach((contour: number[][]) =>
        drawPath(contour, true)
      );
      ctx.drawIfVisible();
      // and we are out of the shape
      ctx.__currentShape = null;
      ctx.__currentContours = null;
      ctx.__startedShape = false;
    },
  gradient:
    (ctx: KlintOffscreenContext) =>
    (x1 = 0, y1 = 0, x2 = ctx.width, y2 = ctx.width) => {
      return ctx.createLinearGradient(x1, y1, x2, y2);
    },
  radialGradient:
    (ctx: KlintOffscreenContext) =>
    (
      x1 = ctx.width / 2,
      y1 = ctx.height / 2,
      r1 = 0,
      x2 = ctx.width / 2,
      y2 = ctx.height / 2,
      r2 = Math.min(ctx.width, ctx.height)
    ) => {
      return ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    },
  conicGradient:
    (ctx: KlintOffscreenContext) =>
    (angle = 0, x1 = ctx.width / 2, y1 = ctx.height / 2) => {
      return ctx.createConicGradient(angle, x1, y1);
    },
  addColor:
    () =>
    (gradient: CanvasGradient, offset = 0, color = "#000") => {
      return gradient.addColorStop(offset, color);
    },

  textFont: (ctx: KlintOffscreenContext) => (font: string) => {
    ctx.__textFont = font;
  },
  textSize: (ctx: KlintOffscreenContext) => (size: number) => {
    ctx.__textSize = size * ctx.__dpr || ctx.__textSize;
  },
  textStyle: (ctx: KlintOffscreenContext) => (style: string) => {
    ctx.__textStyle = style || "normal";
  },
  textWeight: (ctx: KlintOffscreenContext) => (weight: string) => {
    ctx.__textWeight = weight || "normal";
  },
  textQuality:
    (ctx: KlintOffscreenContext) =>
    (quality: "speed" | "auto" | "legibility" | "precision" = "auto") => {
      if (quality === "speed") {
        ctx.textRendering = "optimizeSpeed";
      } else if (quality === "auto") {
        ctx.textRendering = "auto";
      } else if (quality === "legibility") {
        ctx.textRendering = "optimizeLegibility";
      } else if (quality === "precision") {
        ctx.textRendering = "geometricPrecision";
      }
    },
  textSpacing:
    (ctx: KlintOffscreenContext) =>
    (kind: "letter" | "word", value: number) => {
      ctx[`${kind}Spacing`] = `${value}px`;
    },
  // TO DO : add variable axis handling
  computeTextStyle: (ctx: KlintOffscreenContext) => () => {
    ctx.__computedTextFont = `${ctx.__textWeight} ${ctx.__textStyle} ${ctx.__textSize}px ${ctx.__textFont}`;
  },
  alignText:
    (ctx: KlintOffscreenContext) =>
    (horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => {
      ctx.__textAlignment.horizontal = horizontal;
      ctx.__textAlignment.vertical = vertical ?? ctx.__textAlignment.vertical;
    },
  textLeading: (ctx: KlintOffscreenContext) => (spacing: number) => {
    ctx.lineHeight = `${spacing}px`;
  },
  computeFont: (ctx: KlintOffscreenContext) => () => {
    ctx.computeTextStyle();
    if (ctx.font !== ctx.__computedTextFont) ctx.font = ctx.__computedTextFont;
  },
  textWidth: (ctx: KlintOffscreenContext) => (text: string) => {
    ctx.computeFont();
    return ctx.measureText(text).width;
  },
  text:
    (ctx: KlintOffscreenContext) =>
    (
      text: string,
      x: number,
      y: number,
      maxWidth: number | undefined = undefined
    ) => {
      ctx.computeFont();

      if (ctx.textAlign !== ctx.__textAlignment.horizontal) {
        ctx.textAlign = ctx.__textAlignment.horizontal;
      }
      if (ctx.textBaseline !== ctx.__textAlignment.vertical) {
        ctx.textBaseline = ctx.__textAlignment.vertical;
      }
      if (ctx.checkTransparency("fill")) ctx.fillText(text, x, y, maxWidth);
      if (ctx.checkTransparency("stroke")) ctx.strokeText(text, x, y, maxWidth);
    },

  // DO NOT use putImageData for images you can draw : https://www.measurethat.net/Benchmarks/Show/9510/0/putimagedata-vs-drawimage
  image:
    (ctx: KlintOffscreenContext) =>
    (
      image:
        | HTMLImageElement
        | HTMLCanvasElement
        | OffscreenCanvas
        | KlintOffscreenContext,
      x: number,
      y: number,
      arg3?: number,
      arg4?: number,
      arg5?: number,
      arg6?: number,
      arg7?: number,
      arg8?: number
    ) => {
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
        const adjustedX = ctx.__imageOrigin === "center" ? dx - dWidth / 2 : dx;
        const adjustedY =
          ctx.__imageOrigin === "center" ? dy - dHeight / 2 : dy;
        ctx.drawImage(
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
        const adjustedX = ctx.__imageOrigin === "center" ? dx - dWidth / 2 : dx;
        const adjustedY =
          ctx.__imageOrigin === "center" ? dy - dHeight / 2 : dy;
        ctx.drawImage(sourceImage, adjustedX, adjustedY, dWidth, dHeight);
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
      const adjustedX = ctx.__imageOrigin === "center" ? dx - width / 2 : dx;
      const adjustedY = ctx.__imageOrigin === "center" ? dy - height / 2 : dy;

      ctx.drawImage(sourceImage, adjustedX, adjustedY);
    },
  // unsure about keeping those next two, maybe a shader plugin would be better
  loadPixels: (ctx: KlintOffscreenContext) => () => {
    return ctx.getImageData(0, 0, ctx.width, ctx.height);
  },
  updatePixels:
    (ctx: KlintOffscreenContext) => (pixels: Uint8ClampedArray | number[]) => {
      const imageData = new ImageData(
        pixels instanceof Uint8ClampedArray
          ? pixels
          : new Uint8ClampedArray(pixels),
        ctx.width,
        ctx.height
      );
      ctx.putImageData(imageData, 0, 0);
    },
  readPixels:
    (ctx: KlintOffscreenContext) =>
    (x: number, y: number, w = 1, h = 1) => {
      const imageData = ctx.getImageData(x, y, w, h);
      return Array.from(imageData.data); // Returns [r,g,b,a]
    },

  opacity: (ctx: KlintOffscreenContext) => (value: number) => {
    ctx.globalAlpha = ctx.constrain(value, 0, 1);
  },
  blend: (ctx: KlintOffscreenContext) => (blend: GlobalCompositeOperation) => {
    ctx.globalCompositeOperation = blend;
  },
  setCanvasOrigin:
    (ctx: KlintOffscreenContext) => (type: "center" | "corner") => {
      ctx.__canvasOrigin = type;
    },
  setImageOrigin:
    (ctx: KlintOffscreenContext) => (type: "center" | "corner") => {
      ctx.__imageOrigin = type;
    },
  setRectOrigin:
    (ctx: KlintOffscreenContext) => (type: "center" | "corner") => {
      ctx.__rectangleOrigin = type;
    },
  withConfig:
    (ctx: KlintOffscreenContext) =>
    (config: KlintConfig): void => {
      Object.assign(ctx, config);
    },
  toBase64:
    (ctx: KlintOffscreenContext) =>
    (type: string = "image/png", quality?: number) => {
      const canvas = ctx.canvas;
      return canvas.toDataURL(type, quality);
    },

  resizeCanvas:
    (ctx: KlintOffscreenContext) => (width: number, height: number) => {
      // Ignore if this is the main canvas
      if (ctx.__isMainContext) return;

      const config = ctx.saveConfig();
      ctx.canvas.width = ctx.width = width;
      ctx.canvas.height = ctx.height = height;
      ctx.restoreConfig(config);
      if (ctx.__canvasOrigin === "center") {
        ctx.translate(ctx.width * 0.5, ctx.height * 0.5);
      }
    },
} as const;
