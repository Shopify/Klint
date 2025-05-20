// src/Klint.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
var DEFAULT_FPS = 60;
var DEFAULT_ALT = "A beautiful artwork made with Klint Canvas";
var EPSILON = 1e-4;
var DEFAULT_OPTIONS = {
  alpha: "true",
  ignoreResize: "false",
  noloop: "false",
  static: "false",
  nocanvas: "false",
  unsafemode: "false",
  willreadfrequently: "false",
  fps: DEFAULT_FPS,
  origin: "corner"
};
var CONFIG_PROPS = [
  "lineWidth",
  "strokeStyle",
  "lineJoin",
  "lineCap",
  "fillStyle",
  "font",
  "textAlign",
  "textBaseline",
  "textRendering",
  "wordSpacing",
  "letterSpacing",
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
  "__isPlaying"
];
function useAnimate(contextRef, draw, isVisible) {
  const animationFrameId = useRef(0);
  const animate = useCallback(
    (timestamp = 0) => {
      if (!contextRef.current || !isVisible) return;
      if (!contextRef.current.__isReadyToDraw) return;
      if (!contextRef.current.__isPlaying) {
        return;
      }
      const context = contextRef.current;
      const now = timestamp;
      const target = 1e3 / context.fps;
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
        context.__lastTargetTime = now;
        context.__lastRealTime = now;
      }
      animationFrameId.current = requestAnimationFrame(animate);
    },
    [draw, isVisible, contextRef]
  );
  return {
    animate,
    animationFrameId
  };
}
function Klint({
  context,
  setup,
  draw,
  options = {},
  preload,
  onVisible
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const contextRef = useRef(null);
  const intersectionObserverRef = useRef(null);
  const resizeCallbackRef = useRef(
    null
  );
  const [isVisible, setIsVisible] = useState(true);
  const __options = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  const [toStaticImage, setStaticImage] = useState(null);
  const initContext = context?.initCoreContext;
  const { animate, animationFrameId } = useAnimate(contextRef, draw, isVisible);
  const updateCanvasSize = (shouldRedraw = false) => {
    if (!containerRef.current || !contextRef.current || !canvasRef.current)
      return;
    const container = containerRef.current;
    const context2 = contextRef.current;
    const canvas = canvasRef.current;
    const { width, height } = container.getBoundingClientRect();
    const config = context2.saveConfig();
    context2.dpr = context2.__dpr;
    canvas.width = context2.width = ~~(width * context2.__dpr);
    canvas.height = context2.height = ~~(height * context2.__dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context2.restoreConfig(config);
    if (__options.origin === "center") {
      context2.translate(canvas.width * 0.5, canvas.height * 0.5);
    }
    if (shouldRedraw) draw(context2);
  };
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 3;
    contextRef.current = initContext ? initContext(canvas, __options) : null;
    const context2 = contextRef.current;
    if (!context2) return;
    context2.__dpr = dpr;
    if (__options.fps && __options.fps !== context2.fps) {
      context2.fps = __options.fps;
    }
    updateCanvasSize();
    if (__options.ignoreResize !== "true") {
      const handleResize = () => {
        updateCanvasSize(context2.__isReadyToDraw);
      };
      window.addEventListener("resize", handleResize);
      resizeCallbackRef.current = handleResize;
    }
    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          onVisible?.(context2);
        });
      },
      { threshold: 0.1, root: null, rootMargin: "50px" }
    );
    intersectionObserverRef.current.observe(container);
    const initializeKlint = async () => {
      if (!context2) return;
      const handleStaticMode = () => {
        try {
          const imageUrl = canvas.toDataURL("image/png");
          setStaticImage(imageUrl);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`Klint draw error in static mode: ${message}`);
        }
      };
      const initializeContext = async (unsafeReset = false) => {
        if (preload && (unsafeReset || !context2.__isPreloaded)) {
          try {
            await preload(context2);
            if (!unsafeReset) context2.__isPreloaded = true;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Klint error in the preload: ${message}`);
          }
        }
        if (setup && (unsafeReset || !context2.__isSetup)) {
          try {
            setup(context2);
            if (!unsafeReset) context2.__isSetup = true;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Klint error in the setup: ${message}`);
          }
        }
        if (draw && !context2.__isReadyToDraw) {
          try {
            draw(context2);
            context2.__isReadyToDraw = true;
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            throw new Error(`Klint error in the draw: ${message}`);
          }
        }
      };
      const unsafeMode = __options.unsafemode === "true";
      if (!unsafeMode && context2.__isReadyToDraw) return;
      await initializeContext(unsafeMode);
      if (__options.static === "true") {
        handleStaticMode();
      } else {
        if (__options.noloop !== "true") animate();
      }
    };
    initializeKlint();
    return () => {
      if (resizeCallbackRef.current) {
        window.removeEventListener("resize", resizeCallbackRef.current);
      }
      intersectionObserverRef.current?.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);
  return /* @__PURE__ */ React.createElement("div", { ref: containerRef, style: { width: "100%", height: "100%" } }, toStaticImage ? /* @__PURE__ */ React.createElement(
    "img",
    {
      src: toStaticImage,
      alt: contextRef.current?.__description || DEFAULT_ALT,
      style: {
        display: "block",
        width: "100%",
        height: "100%",
        objectFit: "contain"
      }
    }
  ) : /* @__PURE__ */ React.createElement(
    "canvas",
    {
      ref: canvasRef,
      style: {
        display: __options.nocanvas === "true" ? "none" : "block"
      },
      "aria-label": contextRef.current?.__description || DEFAULT_ALT,
      role: "img"
    }
  ));
}

// src/useKlint.tsx
import { useRef as useRef2, useCallback as useCallback2, useEffect as useEffect2, useMemo } from "react";

// src/KlintFunctions.tsx
var KlintCoreFunctions = {
  saveCanvas: (ctx) => () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = ctx.canvas.toDataURL();
    link.click();
  },
  fullscreen: (ctx) => () => {
    ctx.canvas.requestFullscreen?.();
  },
  play: (ctx) => () => {
    if (!ctx.__isPlaying) ctx.__isPlaying = true;
  },
  pause: (ctx) => () => {
    if (ctx.__isPlaying) ctx.__isPlaying = false;
  },
  // to do
  redraw: () => () => {
  },
  extend: (ctx) => (name, data, enforceReplace = false) => {
    if (name in ctx && !enforceReplace) return;
    ctx[name] = data;
  },
  passImage: () => (element) => {
    if (!element.complete) {
      console.warn("Image passed to passImage() is not fully loaded");
      return null;
    }
    return element;
  },
  passImages: () => (elements) => {
    return elements.map((element) => {
      if (!element.complete) {
        console.warn("Image passed to passImages() is not fully loaded");
        return null;
      }
      return element;
    });
  },
  saveConfig: (ctx) => (from) => {
    return Object.fromEntries(
      CONFIG_PROPS.map((key) => [
        key,
        from?.[key] ?? ctx[key]
      ])
    );
  },
  restoreConfig: (ctx) => (config) => {
    Object.assign(ctx, config);
  },
  describe: (ctx) => (description) => {
    ctx.__description = description;
  },
  createOffscreen: (ctx) => (id, width, height, options, callback) => {
    const offscreen = document.createElement("canvas");
    offscreen.width = width * ctx.__dpr;
    offscreen.height = height * ctx.__dpr;
    const context = offscreen.getContext("2d", {
      alpha: options?.alpha ?? true,
      willReadFrequently: options?.willreadfrequently ?? false
    });
    if (!context) throw new Error("Failed to create offscreen context");
    context.__dpr = ctx.__dpr;
    context.width = width * ctx.__dpr;
    context.height = height * ctx.__dpr;
    context.__isMainContext = false;
    context.__imageOrigin = "corner";
    context.__rectangleOrigin = "corner";
    context.__canvasOrigin = "corner";
    context.__textFont = "sans-serif";
    context.__textWeight = "normal";
    context.__textStyle = "normal";
    context.__textSize = 120;
    context.__textAlignment = {
      horizontal: "left",
      vertical: "top"
    };
    if (!options?.ignoreFunctions) {
      Object.entries(KlintFunctions).forEach(([name, fn]) => {
        context[name] = fn(context);
      });
    }
    if (options?.origin) {
      context.__canvasOrigin = options.origin;
      if (options.origin === "center") {
        context.translate(context.width * 0.5, context.height * 0.5);
      }
    }
    if (callback) {
      callback(context);
    }
    if (options?.static === "true") {
      const base64 = offscreen.toDataURL();
      const img = new Image();
      img.src = base64;
      ctx.__offscreens.set(id, img);
      return img;
    }
    ctx.__offscreens.set(id, context);
    return context;
  },
  getOffscreen: (ctx) => (id) => {
    const offscreen = ctx.__offscreens.get(id);
    if (!offscreen)
      throw new Error(`No offscreen context found with id: ${id}`);
    return offscreen;
  }
};
var KlintFunctions = {
  extend: (ctx) => (name, data, enforceReplace = false) => {
    if (name in ctx && !enforceReplace) return;
    ctx[name] = data;
  },
  background: (ctx) => (color) => {
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
  reset: (ctx) => () => {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.resetTransform();
  },
  clear: (ctx) => () => {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
  },
  fillColor: (ctx) => (color) => {
    ctx.fillStyle = color;
  },
  strokeColor: (ctx) => (color) => {
    ctx.strokeStyle = color;
  },
  noFill: (ctx) => () => {
    ctx.fillStyle = "transparent";
  },
  noStroke: (ctx) => () => {
    ctx.strokeStyle = "transparent";
  },
  strokeWidth: (ctx) => (width) => {
    if (width <= 0) {
      ctx.lineWidth = EPSILON;
    }
    ctx.lineWidth = width;
  },
  strokeJoin: (ctx) => (join) => {
    ctx.lineJoin = join;
  },
  strokeCap: (ctx) => (cap) => {
    ctx.lineCap = cap;
  },
  push: (ctx) => () => {
    ctx.save();
  },
  pop: (ctx) => () => {
    ctx.restore();
  },
  point: (ctx) => (x, y) => {
    if (!ctx.checkTransparency("stroke")) return;
    ctx.beginPath();
    ctx.strokeRect(x, y, 1, 1);
  },
  checkTransparency: (ctx) => (toCheck) => {
    if (toCheck === "stroke" && ctx.strokeStyle === "transparent") return false;
    if (toCheck === "fill" && ctx.fillStyle === "transparent") return false;
    return true;
  },
  drawIfVisible: (ctx) => () => {
    if (ctx.checkTransparency("fill")) ctx.fill();
    if (ctx.checkTransparency("stroke")) ctx.stroke();
  },
  line: (ctx) => (x1, y1, x2, y2) => {
    if (!ctx.checkTransparency("stroke")) return;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },
  circle: (ctx) => (x, y, radius, radius2) => {
    ctx.beginPath();
    ctx.ellipse(x, y, radius, radius2 || radius, 0, 0, Math.PI * 2);
    ctx.drawIfVisible();
  },
  disk: (ctx) => (x, y, radius, startAngle = 0, endAngle = Math.PI * 2, closed = true) => {
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
  rectangle: (ctx) => (x, y, width, height) => {
    const originType = ctx.__rectangleOrigin || ctx.origin;
    const h = height ?? width;
    const drawX = originType === "center" ? x - width / 2 : x;
    const drawY = originType === "center" ? y - h / 2 : y;
    ctx.beginPath();
    ctx.rect(drawX, drawY, width, h);
    ctx.drawIfVisible();
  },
  roundedRectangle: (ctx) => (x, y, width, radius, height) => {
    const originType = ctx.__rectangleOrigin || ctx.origin;
    const h = height ?? width;
    const drawX = originType === "center" ? x - width / 2 : x;
    const drawY = originType === "center" ? y - h / 2 : y;
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, width, h, radius);
    ctx.drawIfVisible();
  },
  polygon: (ctx) => (x, y, radius, sides, radius2, rotation = 0) => {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = i * 2 * Math.PI / sides + rotation;
      const pointX = x + radius * Math.cos(angle);
      const pointY = y + (radius2 ? radius2 : radius) * Math.sin(angle);
      if (i === 0) ctx.moveTo(pointX, pointY);
      else ctx.lineTo(pointX, pointY);
    }
    ctx.closePath();
    ctx.drawIfVisible();
  },
  beginShape: (ctx) => () => {
    if (ctx.__startedShape) return;
    ctx.beginPath();
    ctx.__startedShape = true;
    ctx.__currentShape = [];
    ctx.__currentContours = [];
  },
  beginContour: (ctx) => () => {
    if (!ctx.__startedShape) return;
    if (ctx.__startedContour && ctx.__currentContour?.length) {
      ctx.__currentContours?.push([...ctx.__currentContour]);
    }
    ctx.__startedContour = true;
    ctx.__currentContour = [];
  },
  vertex: (ctx) => (x, y) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour ? ctx.__currentContour : ctx.__currentShape;
    points?.push([x, y]);
  },
  endContour: (ctx) => (forceRevert = true) => {
    if (!ctx.__startedContour || !ctx.__currentContour?.length) return;
    const contourPoints = [...ctx.__currentContour];
    if (forceRevert) {
      contourPoints.reverse();
    }
    ctx.__currentContours?.push(contourPoints);
    ctx.__currentContour = null;
    ctx.__startedContour = false;
  },
  endShape: (ctx) => (close = false) => {
    if (!ctx.__startedShape) return;
    if (ctx.__startedContour) ctx.endContour();
    const points = ctx.__currentShape;
    if (!points?.length) return;
    const drawPath = (points2, close2 = false) => {
      ctx.moveTo(points2[0][0], points2[0][1]);
      for (let i = 1; i < points2.length; i++) {
        ctx.lineTo(points2[i][0], points2[i][1]);
      }
      if (close2) {
        const [firstX, firstY] = points2[0];
        const lastPoint = points2[points2.length - 1];
        if (lastPoint[0] !== firstX || lastPoint[1] !== firstY) {
          ctx.lineTo(firstX, firstY);
        }
      }
    };
    ctx.beginPath();
    drawPath(points, close);
    ctx.__currentContours?.forEach(
      (contour) => drawPath(contour, true)
    );
    ctx.drawIfVisible();
    ctx.__currentShape = null;
    ctx.__currentContours = null;
    ctx.__startedShape = false;
  },
  gradient: (ctx) => (x1 = 0, y1 = 0, x2 = ctx.width, y2 = ctx.width) => {
    return ctx.createLinearGradient(x1, y1, x2, y2);
  },
  radialGradient: (ctx) => (x1 = ctx.width / 2, y1 = ctx.height / 2, r1 = 0, x2 = ctx.width / 2, y2 = ctx.height / 2, r2 = Math.min(ctx.width, ctx.height)) => {
    return ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
  },
  conicGradient: (ctx) => (angle = 0, x1 = ctx.width / 2, y1 = ctx.height / 2) => {
    return ctx.createConicGradient(angle, x1, y1);
  },
  addColorStop: () => (gradient, offset = 0, color = "#000") => {
    return gradient.addColorStop(offset, color);
  },
  constrain: () => (val, floor, ceil) => {
    return Math.max(floor, Math.min(val, ceil));
  },
  lerp: (ctx) => (A, B, mix, bounded = true) => {
    return A + (B - A) * (bounded ? ctx.constrain(mix, 0, 1) : mix);
  },
  fract: () => (n, mod, mode = "precise") => {
    if (mode === "faster") {
      const floor = (x) => x >> 0;
      return n - floor(n / mod) * mod;
    }
    if (mode === "fast") {
      return n - ~~(n / mod) * mod;
    }
    if (n >= 0) return n % mod;
    return mod - -n % mod;
  },
  distance: (ctx) => (x1, y1, x2, y2, mode = "precise") => {
    if (mode === "faster") {
      const dx = Math.abs(x2 - x1);
      const dy = Math.abs(y2 - y1);
      return dx + dy - Math.min(dx, dy) * 0.3;
    }
    if (mode === "fast")
      return ctx.squareDistance(x1, y1, x2, y2) * Math.SQRT1_2;
    return Math.hypot(x2 - x1, y2 - y1);
  },
  squareDistance: () => (x1, y1, x2, y2) => {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  },
  dot: () => (x1, y1, x2, y2) => {
    return x1 * x2 + y1 * y2;
  },
  remap: (ctx) => (n, A, B, C, D, bounded = true) => {
    const t = (n - A) / (B - A);
    return ctx.lerp(C, D, t, bounded);
  },
  textFont: (ctx) => (font) => {
    ctx.__textFont = font;
  },
  textSize: (ctx) => (size) => {
    ctx.__textSize = size * ctx.__dpr || ctx.__textSize;
  },
  textStyle: (ctx) => (style) => {
    ctx.__textStyle = style || "normal";
  },
  textWeight: (ctx) => (weight) => {
    ctx.__textWeight = weight || "normal";
  },
  textQuality: (ctx) => (quality = "auto") => {
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
  textSpacing: (ctx) => (kind, value) => {
    ctx[`${kind}Spacing`] = `${value}px`;
  },
  // TO DO : add variable axis handling
  computeTextStyle: (ctx) => () => {
    ctx.__computedTextFont = `${ctx.__textWeight} ${ctx.__textStyle} ${ctx.__textSize}px ${ctx.__textFont}`;
  },
  alignText: (ctx) => (horizontal, vertical) => {
    ctx.__textAlignment.horizontal = horizontal;
    ctx.__textAlignment.vertical = vertical ?? ctx.__textAlignment.vertical;
  },
  textLeading: (ctx) => (spacing) => {
    ctx.lineHeight = `${spacing}px`;
  },
  computeFont: (ctx) => () => {
    ctx.computeTextStyle();
    if (ctx.font !== ctx.__computedTextFont) ctx.font = ctx.__computedTextFont;
  },
  textWidth: (ctx) => (text) => {
    ctx.computeFont();
    return ctx.measureText(text).width;
  },
  text: (ctx) => (text, x, y, maxWidth = void 0) => {
    if (text === void 0) return;
    ctx.computeFont();
    if (ctx.textAlign !== ctx.__textAlignment.horizontal) {
      ctx.textAlign = ctx.__textAlignment.horizontal;
    }
    if (ctx.textBaseline !== ctx.__textAlignment.vertical) {
      ctx.textBaseline = ctx.__textAlignment.vertical;
    }
    if (ctx.checkTransparency("fill"))
      ctx.fillText(String(text), x, y, maxWidth);
    if (ctx.checkTransparency("stroke"))
      ctx.strokeText(String(text), x, y, maxWidth);
  },
  // DO NOT use putImageData for images you can draw : https://www.measurethat.net/Benchmarks/Show/9510/0/putimagedata-vs-drawimage
  image: (ctx) => (image, x, y, arg3, arg4, arg5, arg6, arg7, arg8) => {
    const sourceImage = "canvas" in image ? image.canvas : image;
    if (arg5 !== void 0) {
      const [sx, sy, sWidth, sHeight, dx2, dy2, dWidth, dHeight] = [
        x,
        y,
        arg3,
        arg4,
        arg5,
        arg6,
        arg7,
        arg8
      ];
      const adjustedX2 = ctx.__imageOrigin === "center" ? dx2 - dWidth / 2 : dx2;
      const adjustedY2 = ctx.__imageOrigin === "center" ? dy2 - dHeight / 2 : dy2;
      ctx.drawImage(
        sourceImage,
        sx,
        sy,
        sWidth,
        sHeight,
        adjustedX2,
        adjustedY2,
        dWidth,
        dHeight
      );
      return;
    }
    if (arg3 !== void 0) {
      const [dx2, dy2, dWidth, dHeight] = [x, y, arg3, arg4];
      const adjustedX2 = ctx.__imageOrigin === "center" ? dx2 - dWidth / 2 : dx2;
      const adjustedY2 = ctx.__imageOrigin === "center" ? dy2 - dHeight / 2 : dy2;
      ctx.drawImage(sourceImage, adjustedX2, adjustedY2, dWidth, dHeight);
      return;
    }
    const [dx, dy] = [x, y];
    const width = sourceImage instanceof HTMLImageElement ? sourceImage.naturalWidth : sourceImage.width;
    const height = sourceImage instanceof HTMLImageElement ? sourceImage.naturalHeight : sourceImage.height;
    const adjustedX = ctx.__imageOrigin === "center" ? dx - width / 2 : dx;
    const adjustedY = ctx.__imageOrigin === "center" ? dy - height / 2 : dy;
    ctx.drawImage(sourceImage, adjustedX, adjustedY);
  },
  // unsure about keeping those next two, maybe a shader plugin would be better
  loadPixels: (ctx) => () => {
    return ctx.getImageData(0, 0, ctx.width, ctx.height);
  },
  updatePixels: (ctx) => (pixels) => {
    const imageData = new ImageData(
      pixels instanceof Uint8ClampedArray ? pixels : new Uint8ClampedArray(pixels),
      ctx.width,
      ctx.height
    );
    ctx.putImageData(imageData, 0, 0);
  },
  readPixels: (ctx) => (x, y, w = 1, h = 1) => {
    const imageData = ctx.getImageData(x, y, w, h);
    return Array.from(imageData.data);
  },
  scaleTo: () => (originWidth, originHeight, destinationWidth, destinationHeight, cover = false) => {
    const widthRatio = destinationWidth / originWidth;
    const heightRatio = destinationHeight / originHeight;
    return cover ? Math.max(widthRatio, heightRatio) : Math.min(widthRatio, heightRatio);
  },
  opacity: (ctx) => (value) => {
    ctx.globalAlpha = ctx.constrain(value, 0, 1);
  },
  blend: (ctx) => (blend) => {
    ctx.globalCompositeOperation = blend;
  },
  setCanvasOrigin: (ctx) => (type) => {
    ctx.__canvasOrigin = type;
  },
  setImageOrigin: (ctx) => (type) => {
    ctx.__imageOrigin = type;
  },
  setRectOrigin: (ctx) => (type) => {
    ctx.__rectangleOrigin = type;
  },
  withConfig: (ctx) => (config) => {
    Object.assign(ctx, config);
  },
  toBase64: (ctx) => (type = "image/png", quality) => {
    const canvas = ctx.canvas;
    return canvas.toDataURL(type, quality);
  },
  saveConfig: (ctx) => (from) => {
    return Object.fromEntries(
      CONFIG_PROPS.map((key) => [
        key,
        from?.[key] ?? ctx[key]
      ])
    );
  },
  restoreConfig: (ctx) => (config) => {
    Object.assign(ctx, config);
  },
  resizeCanvas: (ctx) => (width, height) => {
    if (ctx.__isMainContext) return;
    const config = ctx.saveConfig();
    ctx.canvas.width = ctx.width = width;
    ctx.canvas.height = ctx.height = height;
    ctx.restoreConfig(config);
    if (ctx.__canvasOrigin === "center") {
      ctx.translate(ctx.width * 0.5, ctx.height * 0.5);
    }
  }
};

// src/useKlint.tsx
var DEFAULT_MOUSE_STATE = {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  isPressed: false,
  isHover: false
};
var DEFAULT_SCROLL_STATE = {
  distance: 0,
  velocity: 0,
  lastTime: 0
};
function useKlint() {
  const contextRef = useRef2(null);
  const mouseRef = useRef2(null);
  const scrollRef = useRef2(null);
  const useDev = () => {
    return;
  };
  const KlintImage = () => {
    const imagesRef = useRef2(/* @__PURE__ */ new Map());
    const loadImage = useCallback2(
      async (key, url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            imagesRef.current.set(key, img);
            resolve(img);
          };
          img.onerror = reject;
          img.src = url;
        });
      },
      []
    );
    const loadImages = useCallback2(
      async (imageMap) => {
        const promises = Object.entries(imageMap).map(
          ([key, url]) => loadImage(key, url).then(
            (img) => [key, img]
          )
        );
        const results = await Promise.all(promises);
        return new Map(results);
      },
      [loadImage]
    );
    const imagesProxy = useMemo(() => {
      return new Proxy({}, {
        get: (_, prop) => {
          if (prop === "get") {
            return (key) => imagesRef.current.get(key);
          }
          if (typeof prop === "string") {
            return imagesRef.current.get(prop);
          }
          return void 0;
        },
        has: (_, prop) => {
          if (typeof prop === "string") {
            return imagesRef.current.has(prop);
          }
          return false;
        }
      });
    }, []);
    return {
      images: imagesProxy,
      loadImage,
      loadImages,
      getImage: useCallback2((key) => imagesRef.current.get(key), []),
      hasImage: useCallback2((key) => imagesRef.current.has(key), []),
      clearImages: useCallback2(() => imagesRef.current.clear(), [])
    };
  };
  const KlintMouse = () => {
    if (!mouseRef.current) {
      mouseRef.current = { ...DEFAULT_MOUSE_STATE };
    }
    const clickCallbackRef = useRef2(null);
    const mouseInCallbackRef = useRef2(null);
    const mouseOutCallbackRef = useRef2(null);
    const mouseDownCallbackRef = useRef2(null);
    const mouseUpCallbackRef = useRef2(null);
    useEffect2(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;
      const updateMousePosition = (e) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const origin = contextRef.current?.__canvasOrigin || "corner";
        const x = origin === "center" ? (e.clientX - rect.left) * dpr - canvas.width / 2 : (e.clientX - rect.left) * dpr;
        const y = origin === "center" ? (e.clientY - rect.top) * dpr - canvas.height / 2 : (e.clientY - rect.top) * dpr;
        if (mouseRef.current) {
          mouseRef.current.px = mouseRef.current.x;
          mouseRef.current.py = mouseRef.current.y;
          mouseRef.current.x = x;
          mouseRef.current.y = y;
          mouseRef.current.vx = x - mouseRef.current.px;
          mouseRef.current.vy = y - mouseRef.current.py;
          mouseRef.current.angle = Math.atan2(
            mouseRef.current.vy,
            mouseRef.current.vx
          );
        }
      };
      const handleMouseDown = (e) => {
        if (mouseRef.current) mouseRef.current.isPressed = true;
        if (mouseDownCallbackRef.current) mouseDownCallbackRef.current(ctx, e);
      };
      const handleMouseUp = (e) => {
        if (mouseRef.current) mouseRef.current.isPressed = false;
        if (mouseUpCallbackRef.current) mouseUpCallbackRef.current(ctx, e);
      };
      const handleMouseEnter = (e) => {
        if (mouseRef.current) mouseRef.current.isHover = true;
        if (mouseInCallbackRef.current) mouseInCallbackRef.current(ctx, e);
      };
      const handleMouseLeave = (e) => {
        if (mouseRef.current) mouseRef.current.isHover = false;
        if (mouseOutCallbackRef.current) mouseOutCallbackRef.current(ctx, e);
      };
      const handleClick = (e) => {
        if (clickCallbackRef.current) clickCallbackRef.current(ctx, e);
      };
      canvas.addEventListener("mousemove", updateMousePosition);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("click", handleClick);
      return () => {
        canvas.removeEventListener("mousemove", updateMousePosition);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("click", handleClick);
      };
    });
    return {
      mouse: mouseRef.current,
      onClick: (callback) => clickCallbackRef.current = callback,
      onMouseIn: (callback) => mouseInCallbackRef.current = callback,
      onMouseOut: (callback) => mouseOutCallbackRef.current = callback,
      onMouseDown: (callback) => mouseDownCallbackRef.current = callback,
      onMouseUp: (callback) => mouseUpCallbackRef.current = callback
    };
  };
  const KlintScroll = () => {
    if (!scrollRef.current) {
      scrollRef.current = { ...DEFAULT_SCROLL_STATE };
    }
    const scrollCallbackRef = useRef2(null);
    useEffect2(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;
      const handleScroll = (e) => {
        e.preventDefault();
        if (!scrollRef.current) return;
        const currentTime = performance.now();
        const deltaTime = currentTime - scrollRef.current.lastTime;
        scrollRef.current.distance += e.deltaY;
        scrollRef.current.velocity = deltaTime > 0 ? e.deltaY / deltaTime : 0;
        scrollRef.current.lastTime = currentTime;
        if (scrollCallbackRef.current) {
          scrollCallbackRef.current(ctx, scrollRef.current, e);
        }
      };
      canvas.addEventListener("wheel", handleScroll);
      return () => canvas.removeEventListener("wheel", handleScroll);
    });
    return {
      scroll: scrollRef.current,
      onScroll: (callback) => scrollCallbackRef.current = callback
    };
  };
  const KlintWindow = () => {
    const resizeCallbackRef = useRef2(
      null
    );
    const blurCallbackRef = useRef2(null);
    const focusCallbackRef = useRef2(null);
    const visibilityChangeCallbackRef = useRef2(null);
    useEffect2(() => {
      if (!contextRef.current) return;
      const ctx = contextRef.current;
      const handleResize = () => {
        if (resizeCallbackRef.current) resizeCallbackRef.current(ctx);
      };
      const handleBlur = () => {
        if (blurCallbackRef.current) blurCallbackRef.current(ctx);
      };
      const handleFocus = () => {
        if (focusCallbackRef.current) focusCallbackRef.current(ctx);
      };
      const handleVisibilityChange = () => {
        const isVisible = document.visibilityState === "visible";
        if (visibilityChangeCallbackRef.current) {
          visibilityChangeCallbackRef.current(ctx, isVisible);
        }
      };
      window.addEventListener("resize", handleResize);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }, []);
    return {
      onResize: (callback) => resizeCallbackRef.current = callback,
      onBlur: (callback) => blurCallbackRef.current = callback,
      onFocus: (callback) => focusCallbackRef.current = callback,
      onVisibilityChange: (callback) => visibilityChangeCallbackRef.current = callback
    };
  };
  const buildKlintContext = (ctx, options) => {
    const context = ctx;
    context.__isMainContext = true;
    context.fps = 60;
    context.frame = 0;
    context.time = 0;
    context.deltaTime = 0;
    context.__imageOrigin = options.origin === "center" ? "center" : "corner";
    context.__rectangleOrigin = options.origin === "center" ? "center" : "corner";
    context.__canvasOrigin = options.origin === "center" ? "center" : "corner";
    context.__textFont = "sans-serif";
    context.__textWeight = "normal";
    context.__textStyle = "normal";
    context.__textSize = 72;
    context.__textAlignment = {
      horizontal: "left",
      vertical: "top"
    };
    context.__offscreens = /* @__PURE__ */ new Map();
    context.__isPlaying = true;
    context.__currentContext = context;
    Object.entries(KlintCoreFunctions).forEach(([name, fn]) => {
      context[name] = fn(context);
    });
    Object.entries(KlintFunctions).forEach(([name, fn]) => {
      context[name] = fn(context);
    });
    return context;
  };
  const initCoreContext = useCallback2(
    (canvas, options) => {
      if (!contextRef.current) {
        const ctx = canvas.getContext("2d", {
          alpha: options.alpha ?? true,
          willReadFrequently: options.willreadfrequently ?? true
        });
        if (!ctx) throw new Error("Failed to get canvas context");
        contextRef.current = buildKlintContext(ctx, options);
      }
      return contextRef.current;
    },
    []
  );
  const togglePlay = useCallback2((playing) => {
    if (!contextRef.current) return;
    if (playing !== void 0) {
      contextRef.current.__isPlaying = playing;
    } else {
      contextRef.current.__isPlaying = !contextRef.current.__isPlaying;
    }
  }, []);
  return {
    context: {
      context: contextRef.current,
      initCoreContext
    },
    KlintMouse,
    KlintScroll,
    KlintWindow,
    KlintImage,
    togglePlay,
    useDev
  };
}
var useProps = (props) => {
  const propsRef = useRef2(props);
  useEffect2(() => {
    propsRef.current = props;
  }, [props]);
  const get = useCallback2((key) => {
    return propsRef.current[key];
  }, []);
  const has = useCallback2((key) => {
    return key in propsRef.current;
  }, []);
  return {
    get,
    has,
    props: propsRef.current
  };
};
var useStorage = (initialProps = {}) => {
  const storeRef = useRef2(initialProps);
  const get = useCallback2((key) => {
    return storeRef.current[key];
  }, []);
  const set = useCallback2((key, value) => {
    storeRef.current[key] = value;
  }, []);
  const has = useCallback2((key) => {
    return key in storeRef.current;
  }, []);
  const remove = useCallback2((key) => {
    delete storeRef.current[key];
  }, []);
  return {
    get,
    set,
    has,
    remove,
    store: storeRef.current
  };
};
export {
  CONFIG_PROPS,
  EPSILON,
  Klint,
  KlintCoreFunctions,
  KlintFunctions,
  useKlint,
  useProps,
  useStorage
};
