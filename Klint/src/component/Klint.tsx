import { useRef, useEffect, useMemo, useCallback, useState } from "react";

import {
  KlintProps,
  KlintContext,
  KlintCoreContext,
  KlintMouse,
  KlintCanvasOptions,
  KlintConfig,
} from "./KlintTypes";

export type {
  KlintProps,
  KlintContext,
  KlintCoreContext,
  KlintMouse,
  KlintCanvasOptions,
  KlintConfig,
} from "./KlintTypes";

const DEFAULT_FPS = 60;
const DEFAULT_ALT = "A beautiful artwork made with Klint Canvas";

const DEFAULT_OPTIONS: KlintCanvasOptions = {
  alpha: "true",
  ignoremouse: "false",
  ignoreresize: "false",
  noloop: "false",
  ignorefunctions: "false",
  static: "false",
  nocanvas: "false",
  willreadfrequently: "false",
  fps: DEFAULT_FPS,
  origin: "corner",
};

export const CONFIG_PROPS = [
  "lineWidth",
  "strokeStyle",
  "lineJoin",
  "lineCap",
  "fillStyle",
  "font",
  "textAlign",
  "textBaseline",
  "textRendering",
  "globalAlpha",
  "globalCompositeOperation",
  "origin",
  "transform",
  "__imageOrigin",
  "__rectangleOrigin",
  "__textFont",
  "__textWeight",
  "__textStyle",
  "__textSize",
  "__textAlignment",
] as const;

// Klint Functions
export type KlintFunctions = {
  [K in KlintFunctionNames]: ReturnType<(typeof KlintFunctions)[K]>;
};
type KlintFunctionNames = keyof typeof KlintFunctions;

export const KlintFunctions = {
  extend:
    (ctx: KlintContext) =>
    (name: string, data: unknown, enforceReplace = false) => {
      // if (ctx._) {
      //   console.log(`Cannot extend Klint with '${name}' after preload/setup`);
      //   return;
      // }
      if (name in ctx && !enforceReplace) return;
      (ctx as KlintContext)[name] = data;
    },
  background: (ctx: KlintContext) => (color?: string) => {
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
  reset: (ctx: KlintContext) => () => {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.resetTransform();
  },
  clear: (ctx: KlintContext) => () => {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
  },
  fillColor: (ctx: KlintContext) => (color: string) => {
    ctx.fillStyle = color;
  },
  strokeColor: (ctx: KlintContext) => (color: string) => {
    ctx.strokeStyle = color;
  },
  noFill: (ctx: KlintContext) => () => {
    ctx.fillStyle = "transparent";
  },
  noStroke: (ctx: KlintContext) => () => {
    ctx.strokeStyle = "transparent";
  },
  strokeWidth: (ctx: KlintContext) => (width: number) => {
    ctx.lineWidth = width;
  },
  strokeJoin: (ctx: KlintContext) => (join: CanvasLineJoin) => {
    ctx.lineJoin = join;
  },
  strokeCap: (ctx: KlintContext) => (cap: CanvasLineCap) => {
    ctx.lineCap = cap;
  },
  push: (ctx: KlintContext) => () => {
    ctx.save();
  },
  pop: (ctx: KlintContext) => () => {
    ctx.restore();
  },
  point: (ctx: KlintContext) => (x: number, y: number) => {
    if (!ctx.checkTransparency("stroke")) return;
    ctx.beginPath();
    ctx.strokeRect(x, y, 1, 1);
  },
  checkTransparency: (ctx: KlintContext) => (toCheck: string) => {
    if (
      toCheck === "stroke" &&
      (ctx.strokeStyle === "transparent" || ctx.lineWidth === 0)
    )
      return false;
    if (toCheck === "fill" && ctx.fillStyle === "transparent") return false;
    return true;
  },
  drawIfVisible: (ctx: KlintContext) => () => {
    if (ctx.checkTransparency("fill")) ctx.fill();
    if (ctx.checkTransparency("stroke")) ctx.stroke();
  },
  line:
    (ctx: KlintContext) => (x1: number, y1: number, x2: number, y2: number) => {
      if (!ctx.checkTransparency("stroke")) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
  circle:
    (ctx: KlintContext) =>
    (x: number, y: number, radius: number, radius2?: number) => {
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius2 || radius, 0, 0, Math.PI * 2);
      ctx.drawIfVisible();
    },
  rectangle:
    (ctx: KlintContext) =>
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
    (ctx: KlintContext) =>
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
    (ctx: KlintContext) =>
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
  beginShape: (ctx: KlintContext) => () => {
    if (ctx.__startedShape) return;
    ctx.beginPath();
    ctx.__startedShape = true;
    ctx.__currentShape = [];
    ctx.__currentContours = [];
  },
  beginContour: (ctx: KlintContext) => () => {
    if (!ctx.__startedShape) return;
    if (ctx.__startedContour && ctx.__currentContour?.length) {
      ctx.__currentContours?.push([...ctx.__currentContour]);
    }
    ctx.__startedContour = true;
    ctx.__currentContour = [];
  },
  vertex: (ctx: KlintContext) => (x: number, y: number) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push([x, y]);
  },
  endContour:
    (ctx: KlintContext) =>
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
    (ctx: KlintContext) =>
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
    (ctx: KlintContext) =>
    (x1 = 0, y1 = 0, x2 = ctx.width, y2 = ctx.width) => {
      return ctx.createLinearGradient(x1, y1, x2, y2);
    },
  radialGradient:
    (ctx: KlintContext) =>
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
    (ctx: KlintContext) =>
    (angle = 0, x1 = ctx.width / 2, y1 = ctx.height / 2) => {
      return ctx.createConicGradient(angle, x1, y1);
    },
  addColor:
    () =>
    (gradient: CanvasGradient, offset = 0, color = "#000") => {
      return gradient.addColorStop(offset, color);
    },

  textFont: (ctx: KlintContext) => (font: string) => {
    ctx.__textFont = font;
    ctx.computeTextStyle();
  },
  textSize: (ctx: KlintContext) => (size: number) => {
    ctx.__textSize = size * ctx.__dpr || ctx.__textSize;
    ctx.computeTextStyle();
  },
  textStyle: (ctx: KlintContext) => (style: string) => {
    ctx.__textStyle = style || "normal";
    ctx.computeTextStyle();
  },
  textWeight: (ctx: KlintContext) => (weight: string) => {
    ctx.__textWeight = weight || "normal";
    ctx.computeTextStyle();
  },
  textQuality:
    (ctx: KlintContext) =>
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
  // TO DO : add variable axis handling
  computeTextStyle: (ctx: KlintContext) => () => {
    ctx.__computedTextFont = `${ctx.__textWeight} ${ctx.__textStyle} ${ctx.__textSize}px ${ctx.__textFont}`;
  },
  alignText:
    (ctx: KlintContext) =>
    (horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => {
      ctx.__textAlignment.horizontal = horizontal;
      ctx.__textAlignment.vertical = vertical ?? ctx.__textAlignment.vertical;
    },
  textLeading: (ctx: KlintContext) => (spacing: number) => {
    ctx.lineHeight = `${spacing}px`;
  },
  computeFont: (ctx: KlintContext) => () => {
    if (ctx.font !== ctx.__computedTextFont) ctx.font = ctx.__computedTextFont;
  },
  text:
    (ctx: KlintContext) =>
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
    (ctx: KlintContext) =>
    (
      image:
        | HTMLImageElement
        | HTMLCanvasElement
        | OffscreenCanvas
        | KlintContext,
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
  loadPixels: (ctx: KlintContext) => () => {
    return ctx.getImageData(0, 0, ctx.width, ctx.height);
  },
  updatePixels:
    (ctx: KlintContext) => (pixels: Uint8ClampedArray | number[]) => {
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
    (ctx: KlintContext) =>
    (x: number, y: number, w = 1, h = 1) => {
      const imageData = ctx.getImageData(x, y, w, h);
      return Array.from(imageData.data); // Returns [r,g,b,a]
    },

  opacity: (ctx: KlintContext) => (value: number) => {
    ctx.globalAlpha = ctx.constrain(value, 0, 1);
  },
  blend: (ctx: KlintContext) => (blend: GlobalCompositeOperation) => {
    ctx.globalCompositeOperation = blend;
  },
  setCanvasOrigin: (ctx: KlintContext) => (type: "center" | "corner") => {
    ctx.__canvasOrigin = type;
  },
  setImageOrigin: (ctx: KlintContext) => (type: "center" | "corner") => {
    ctx.__imageOrigin = type;
  },
  setRectOrigin: (ctx: KlintContext) => (type: "center" | "corner") => {
    ctx.__rectangleOrigin = type;
  },
  withConfig:
    (ctx: KlintContext) =>
    (config: KlintConfig): void => {
      Object.assign(ctx, config);
    },
  toBase64:
    (ctx: KlintContext) =>
    (type: string = "image/png", quality?: number) => {
      const canvas = ctx.canvas;
      return canvas.toDataURL(type, quality);
    },
  textWidth: (ctx: KlintContext) => (text: string) => {
    if (ctx.font !== ctx.__computedTextFont) {
      ctx.font = ctx.__computedTextFont;
    }
    return ctx.measureText(text).width;
  },
  resizeCanvas: (ctx: KlintContext) => (width: number, height: number) => {
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

// Entry point
export default function Klint({
  context,
  setup,
  draw,
  options = {},
  preload,
}: KlintProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<KlintCoreContext | null>(null); // KlintCoreContext | undefined
  const animationFrameId = useRef<number>();
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const mouseRef = useRef<KlintMouse>({
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    angle: 0,
  });
  const __options = useMemo(() => {
    return {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }, [options]);
  const [isReady, setIsReady] = useState(false);
  const [toStaticImage, setStaticImage] = useState<string | null>(null);
  // from the hook
  let initContext:
    | ((canvas: HTMLCanvasElement) => KlintCoreContext | null)
    | undefined;
  if (context) {
    initContext = context.initCoreContext;
  }
  const updateMousePosition = (
    clientX: number,
    clientY: number,
    containerRef: React.RefObject<HTMLDivElement>,
    contextRef: React.RefObject<KlintContext>,
    mouseRef: React.RefObject<KlintMouse>
  ) => {
    if (!contextRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const context = contextRef.current;
    const dpr = context.__dpr;
    const mouse = mouseRef.current;
    const origin = context.__canvasOrigin;
    if (mouse) {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x =
        origin === "center"
          ? (clientX - rect.left) * dpr - context.canvas.width / 2
          : (clientX - rect.left) * dpr;
      mouse.y =
        origin === "center"
          ? (clientY - rect.top) * dpr - context.canvas.height / 2
          : (clientY - rect.top) * dpr;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.angle = Number(
        ((Math.atan2(mouse.vy, mouse.vx) * 180) / Math.PI).toFixed(4)
      );
      contextRef.current.mouse = mouse;
    }
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (e.type.startsWith("touch")) {
      e.preventDefault();
      const touch = (e as TouchEvent).touches[0];
      updateMousePosition(
        touch.clientX,
        touch.clientY,
        containerRef,
        contextRef,
        mouseRef
      );
    } else {
      updateMousePosition(
        (e as MouseEvent).clientX,
        (e as MouseEvent).clientY,
        containerRef,
        contextRef,
        mouseRef
      );
    }
  }, []);

  useEffect(() => {
    if (__options.ignoremouse === "true") return;

    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("touchmove", handlePointerMove);
    container.addEventListener("touchstart", handlePointerMove);
    return () => {
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("touchmove", handlePointerMove);
      container.removeEventListener("touchstart", handlePointerMove);
    };
  }, [handlePointerMove, __options.ignoremouse]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 3;
    // need to add a fallback
    contextRef.current = initContext ? initContext(canvas) : null;
    const context = contextRef.current;
    if (!context) return;
    context.__dpr = dpr;

    if (__options.origin === "center") {
      context.__imageOrigin = "center";
      context.__rectangleOrigin = "center";
      context.__canvasOrigin = "center";
    }
    if (__options.fps && __options.fps !== context.fps)
      context.fps = __options.fps;

    if (__options.ignorefunctions !== "true") {
      Object.entries(KlintFunctions).forEach(([name, fn]) => {
        contextRef.current![name] = fn(context as KlintContext);
      });
    }

    const updateCanvasSize = (shouldRedraw = false) => {
      const { width, height } = container.getBoundingClientRect();
      if (!context) return;
      const config = context.saveConfig();
      context.dpr = dpr;
      canvas.width = context.width = ~~(width * dpr);
      canvas.height = context.height = ~~(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.restoreConfig(config);
      if (__options.origin === "center")
        context.translate(canvas.width * 0.5, canvas.height * 0.5);
      if (shouldRedraw) draw(context);
    };
    updateCanvasSize();
    if (options.ignoreresize !== "true") {
      resizeObserverRef.current = new ResizeObserver(() =>
        updateCanvasSize(true)
      );
      if (container) {
        resizeObserverRef.current.observe(container);
      }
    }
    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.1, root: null, rootMargin: "50px" }
    );

    if (canvasRef.current) {
      intersectionObserverRef.current.observe(canvas);
    }

    const initializeKlint = async () => {
      if (!context) return;
      if (context.__isReadyToDraw) return;

      try {
        try {
          if (preload && !context.__isPreloaded) {
            await preload(context);
          }
        } catch (error) {
          console.error("Error during preload:", error);
          throw error;
        } finally {
          context.__isPreloaded = true;
        }

        try {
          if (setup && !context.__isSetup) {
            setup(context);
          }
        } catch (error) {
          console.error("Error during setup:", error);
          throw error;
        } finally {
          context.__isSetup = true;
        }
        context.__isReadyToDraw = true;
        if (__options.static === "true") {
          try {
            draw(context);
            const imageUrl = canvas.toDataURL("image/png");
            setStaticImage(imageUrl);
            return;
          } catch (error) {
            console.error("Error in static mode:", error);
            throw error;
          }
        }
        setIsReady(true);
      } catch (error) {
        console.error("Fatal Klint initialization error:", error);
        context.__isReadyToDraw = false;
      }
    };

    initializeKlint();

    return () => {
      resizeObserverRef.current?.disconnect();
      intersectionObserverRef.current?.disconnect();
    };
  });

  const animate = useCallback(() => {
    if (!contextRef.current || !isVisible) return;
    if (!contextRef.current.__isReadyToDraw) return;
    const context = contextRef.current;
    const now = performance.now();
    const target = 1000 / context.fps;
    if (!context.__lastTargetTime) {
      context.__lastTargetTime = now;
      context.__lastRealTime = now;
    }
    const sinceLast = now - context.__lastTargetTime;
    const epsilon = 5;

    if (sinceLast >= target - epsilon) {
      context.deltaTime = now - context.__lastRealTime;
      draw(context);
      if (context.time > 1e7) context.time = 0;
      if (context.frame > 1e7) context.frame = 0;
      context.time += context.deltaTime / DEFAULT_FPS;
      context.frame++;
      context.__lastTargetTime = Math.max(
        context.__lastTargetTime + target,
        now
      );
      context.__lastRealTime = now;
    }
    animationFrameId.current = requestAnimationFrame(animate);
  }, [draw, isVisible]);

  useEffect(() => {
    if (!contextRef.current) return;
    if (!isReady) return;
    draw(contextRef.current);
    if (!isVisible) return;
    if (__options.noloop !== "true") {
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, isVisible, __options.noloop, draw, isReady]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {toStaticImage ? (
        <img
          src={toStaticImage}
          alt={contextRef.current?.__description || DEFAULT_ALT}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            display: __options.nocanvas === "true" ? "none" : "block",
          }}
          aria-label={contextRef.current?.__description || DEFAULT_ALT}
          role="img"
        />
      )}
    </div>
  );
}
