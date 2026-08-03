import type {
  KlintContexts,
  KlintContext,
  KlintOffscreenContext,
  KlintCanvasOptions,
  KlintConfig,
  CurveVertex,
} from "./KlintTypes";
import {
  CONFIG_PROPS,
  EPSILON,
  normalizeKlintOptions,
} from "./KlintTypes";
import { applyKlintBaseTransform, resolveDpr } from "./KlintRuntime";
import {
  initializeKlintContextState,
  installKlintElements,
  installKlintFunctions,
} from "./KlintContext";

// Klint Core functions
export type KlintCoreFunctions = {
  [K in KlintCoreFunctionNames]: ReturnType<(typeof KlintCoreFunctions)[K]>;
};
type KlintCoreFunctionNames = keyof typeof KlintCoreFunctions;

export type KlintOffscreenMap = Map<
  string,
  KlintOffscreenContext | HTMLImageElement
>;

export const KlintCoreFunctions = {
  saveCanvas: (ctx: KlintContext) => () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = ctx.canvas.toDataURL();
    link.click();
  },
  fullscreen: (ctx: KlintContext) => () => {
    ctx.canvas.requestFullscreen?.();
  },
  play: (ctx: KlintContext) => () => {
    ctx.__lastTargetTime = -1;
    ctx.__lastRealTime = -1;
    ctx.__isPlaying = true;
  },
  pause: (ctx: KlintContext) => () => {
    ctx.__isPlaying = false;
  },
  redraw: (ctx: KlintContext) => () => {
    ctx.__redraw?.();
  },
  describe: (ctx: KlintContext) => (description: string) => {
    ctx.__description = description;
    ctx.canvas.setAttribute("aria-label", description);
    if (!ctx.canvas.hasAttribute("role")) ctx.canvas.setAttribute("role", "img");
  },

  createOffscreen:
    (ctx: KlintContext) =>
    (
      id: string,
      width: number,
      height: number,
      options?: KlintCanvasOptions,
      callback?: (ctx: KlintOffscreenContext) => void,
    ) => {
      if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) {
        throw new RangeError("Offscreen dimensions must be finite, non-negative numbers");
      }

      const normalized = normalizeKlintOptions(options);
      const offscreen = document.createElement("canvas");
      const dpr = options?.dpr !== undefined ? resolveDpr(normalized) : ctx.dpr;
      offscreen.width = Math.round(width * dpr);
      offscreen.height = Math.round(height * dpr);

      const context = offscreen.getContext("2d", {
        alpha: normalized.alpha,
        willReadFrequently: normalized.willreadfrequently,
      }) as KlintOffscreenContext | null;
      if (!context) throw new Error("Failed to create offscreen context");

      initializeKlintContextState(context, normalized, false);
      context.width = width;
      context.height = height;
      context.__dpr = dpr;
      context.dpr = dpr;
      if (!normalized.ignoreFunctions) {
        installKlintElements(context);
        installKlintFunctions(context);
      }
      applyKlintBaseTransform(context);
      callback?.(context);

      // Static offscreens remain canvas-backed. Avoiding data URLs removes a
      // synchronous encode/decode and preserves alpha/color fidelity.
      ctx.__offscreens.set(id, context);
      return context;
    },

  getOffscreen:
    (ctx: KlintContext) =>
    (id: string): KlintOffscreenContext | HTMLImageElement => {
      const offscreen = ctx.__offscreens.get(id);
      if (!offscreen)
        throw new Error(`No offscreen context found with id: ${id}`);
      return offscreen;
    },
};

// Klint Functions
export type KlintFunctions = {
  [K in KlintFunctionNames]: ReturnType<(typeof KlintFunctions)[K]>;
};
type KlintFunctionNames = keyof typeof KlintFunctions;

export const KlintFunctions = {
  extend:
    (ctx: KlintContexts) =>
    (name: string, data: unknown, enforceReplace = false) => {
      if (name in ctx && !enforceReplace) {
        console.warn(
          `Klint.extend("${name}") was ignored because that property already exists. Pass true as the third argument to replace it intentionally.`,
        );
        return ctx[name];
      }
      ctx[name] = data;
      return data;
    },

  background: (ctx: KlintContexts) => (color?: string) => {
    ctx.save();
    ctx.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    if (color && color !== "transparent") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ctx.width, ctx.height);
    } else {
      ctx.clearRect(0, 0, ctx.width, ctx.height);
    }
    ctx.restore();
  },
  reset: (ctx: KlintContexts) => () => {
    ctx.save();
    ctx.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.restore();
    applyKlintBaseTransform(ctx);
  },
  clear: (ctx: KlintContexts) => () => {
    ctx.save();
    ctx.setTransform(ctx.dpr, 0, 0, ctx.dpr, 0, 0);
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.restore();
  },
  fillColor: (ctx: KlintContexts) => (color: string | CanvasGradient) => {
    ctx.fillStyle = color;
  },
  strokeColor: (ctx: KlintContexts) => (color: string | CanvasGradient) => {
    ctx.strokeStyle = color;
  },
  noFill: (ctx: KlintContexts) => () => {
    ctx.fillStyle = "transparent";
  },
  noStroke: (ctx: KlintContexts) => () => {
    ctx.strokeStyle = "transparent";
  },
  strokeWidth: (ctx: KlintContexts) => (width: number) => {
    if (width <= 0) {
      ctx.lineWidth = EPSILON;
      return;
    }
    ctx.lineWidth = width;
  },
  strokeJoin: (ctx: KlintContexts) => (join: CanvasLineJoin) => {
    ctx.lineJoin = join;
  },
  strokeCap: (ctx: KlintContexts) => (cap: CanvasLineCap) => {
    ctx.lineCap = cap;
  },
  push: (ctx: KlintContexts) => () => {
    ctx.save();
  },
  pop: (ctx: KlintContexts) => () => {
    ctx.restore();
  },
  point: (ctx: KlintContexts) => (x: number, y: number) => {
    if (!ctx.checkTransparency("stroke")) return;
    ctx.beginPath();
    ctx.strokeRect(x, y, 1, 1);
  },
  checkTransparency: (ctx: KlintContexts) => (toCheck: string) => {
    if (toCheck === "stroke" && ctx.strokeStyle === "transparent") return false;
    if (toCheck === "fill" && ctx.fillStyle === "transparent") return false;
    return true;
  },
  drawIfVisible: (ctx: KlintContexts) => () => {
    if (ctx.checkTransparency("fill")) ctx.fill(ctx.__fillRule || "nonzero");
    if (ctx.checkTransparency("stroke")) ctx.stroke();
  },
  fillRule: (ctx: KlintContexts) => (rule: CanvasFillRule) => {
    ctx.__fillRule = rule;
  },
  line:
    (ctx: KlintContexts) =>
    (x1: number, y1: number, x2: number, y2: number) => {
      if (!ctx.checkTransparency("stroke")) return;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
  circle:
    (ctx: KlintContexts) =>
    (x: number, y: number, radius: number, radius2?: number) => {
      ctx.beginPath();
      ctx.ellipse(x, y, radius, radius2 || radius, 0, 0, Math.PI * 2);
      ctx.drawIfVisible();
    },
  disk:
    (ctx: KlintContexts) =>
    (
      x: number,
      y: number,
      radius: number,
      startAngle = 0,
      endAngle = Math.PI * 2,
      closed = true,
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
    (ctx: KlintContexts) =>
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
    (ctx: KlintContexts) =>
    (
      x: number,
      y: number,
      width: number,
      radius: number | number[],
      height?: number,
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
    (ctx: KlintContexts) =>
    (
      x: number,
      y: number,
      radius: number,
      sides: number,
      radius2?: number,
      rotation: number = 0,
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
  beginShape: (ctx: KlintContexts) => () => {
    if (ctx.__startedShape) return;
    ctx.beginPath();
    ctx.__startedShape = true;
    ctx.__currentShape = [];
    ctx.__currentContours = [];
  },
  beginContour: (ctx: KlintContexts) => () => {
    if (!ctx.__startedShape || ctx.__startedContour) return;
    ctx.__startedContour = true;
    ctx.__currentContour = [];
  },
  vertex: (ctx: KlintContexts) => (x: number, y: number) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push({ type: "line", x, y });
  },
  bezierVertex:
    (ctx: KlintContexts) =>
    (
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number,
    ) => {
      if (!ctx.__startedShape) return;
      const points = ctx.__startedContour
        ? ctx.__currentContour
        : ctx.__currentShape;
      points?.push({ type: "bezier", cp1x, cp1y, cp2x, cp2y, x, y });
    },
  quadraticVertex:
    (ctx: KlintContexts) =>
    (cpx: number, cpy: number, x: number, y: number) => {
      if (!ctx.__startedShape) return;
      const points = ctx.__startedContour
        ? ctx.__currentContour
        : ctx.__currentShape;
      points?.push({ type: "quadratic", cpx, cpy, x, y });
    },
  arcVertex:
    (ctx: KlintContexts) =>
    (x1: number, y1: number, x2: number, y2: number, radius: number) => {
      if (!ctx.__startedShape) return;
      const points = ctx.__startedContour
        ? ctx.__currentContour
        : ctx.__currentShape;
      points?.push({ type: "arc", x1, y1, x2, y2, radius });
    },
  endContour:
    (ctx: KlintContexts) =>
    (forceRevert = true) => {
      if (!ctx.__startedContour) return;
      if (!ctx.__currentContour?.length) {
        ctx.__currentContour = null;
        ctx.__startedContour = false;
        return;
      }
      const contourPoints = [...ctx.__currentContour];
      if (forceRevert) {
        contourPoints.reverse();
      }
      ctx.__currentContours?.push(contourPoints);
      ctx.__currentContour = null;
      ctx.__startedContour = false;
    },
  endShape:
    (ctx: KlintContexts) =>
    (close = false) => {
      if (!ctx.__startedShape) return;
      if (ctx.__startedContour) ctx.endContour();

      const points = ctx.__currentShape;
      if (!points?.length) {
        ctx.__currentShape = null;
        ctx.__currentContours = null;
        ctx.__currentContour = null;
        ctx.__startedShape = false;
        ctx.__startedContour = false;
        return;
      }

      const drawPath = (points: CurveVertex[], close = false) => {
        if (points.length === 0) return;

        const firstPoint = points[0];
        // Move to first point regardless of type
        const startX =
          firstPoint.type === "line"
            ? firstPoint.x
            : firstPoint.type === "bezier"
              ? firstPoint.x
              : firstPoint.type === "quadratic"
                ? firstPoint.x
                : firstPoint.x2; // arc
        const startY =
          firstPoint.type === "line"
            ? firstPoint.y
            : firstPoint.type === "bezier"
              ? firstPoint.y
              : firstPoint.type === "quadratic"
                ? firstPoint.y
                : firstPoint.y2; // arc
        ctx.moveTo(startX, startY);

        for (let i = 0; i < points.length; i++) {
          const point = points[i];

          switch (point.type) {
            case "line":
              if (i > 0) ctx.lineTo(point.x, point.y);
              break;
            case "bezier":
              ctx.bezierCurveTo(
                point.cp1x,
                point.cp1y,
                point.cp2x,
                point.cp2y,
                point.x,
                point.y,
              );
              break;
            case "quadratic":
              ctx.quadraticCurveTo(point.cpx, point.cpy, point.x, point.y);
              break;
            case "arc":
              ctx.arcTo(point.x1, point.y1, point.x2, point.y2, point.radius);
              break;
          }
        }

        if (close && points.length > 1) {
          ctx.closePath();
        }
      };

      ctx.beginPath();
      drawPath(points, close);
      ctx.__currentContours?.forEach((contour) => drawPath(contour, true));
      ctx.drawIfVisible();
      ctx.__currentShape = null;
      ctx.__currentContours = null;
      ctx.__currentContour = null;
      ctx.__startedShape = false;
      ctx.__startedContour = false;
    },
  gradient:
    (ctx: KlintContexts) =>
    (x1 = 0, y1 = 0, x2 = ctx.width, y2 = ctx.height) => {
      return ctx.createLinearGradient(x1, y1, x2, y2);
    },
  radialGradient:
    (ctx: KlintContexts) =>
    (
      x1 = ctx.width / 2,
      y1 = ctx.height / 2,
      r1 = 0,
      x2 = ctx.width / 2,
      y2 = ctx.height / 2,
      r2 = Math.min(ctx.width, ctx.height),
    ) => {
      return ctx.createRadialGradient(x1, y1, r1, x2, y2, r2);
    },
  conicGradient:
    (ctx: KlintContexts) =>
    (angle = 0, x1 = ctx.width / 2, y1 = ctx.height / 2) => {
      return ctx.createConicGradient(angle, x1, y1);
    },
  addColorStop:
    () =>
    (gradient: CanvasGradient, offset = 0, color = "#000") => {
      return gradient.addColorStop(offset, color);
    },

  PI: () => Math.PI,
  TWO_PI: () => Math.PI * 2,
  TAU: () => Math.PI * 2,

  constrain: () => (val: number, floor: number, ceil: number) => {
    return Math.max(floor, Math.min(val, ceil));
  },
  lerp:
    (ctx: KlintContexts) =>
    (A: number, B: number, mix: number, bounded = true) => {
      return A + (B - A) * (bounded ? ctx.constrain(mix, 0, 1) : mix);
    },
  fract:
    () =>
    (
      n: number,
      mod: number,
      _mode: "precise" | "fast" | "faster" = "precise",
    ) => {
      const size = Math.abs(mod);
      if (size === 0) return Number.NaN;
      return ((n % size) + size) % size;
    },
  distance:
    (_ctx: KlintContexts) =>
    (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      mode: "precise" | "fast" | "faster" = "precise",
    ) => {
      if (mode === "faster") {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy) + Math.min(dx, dy) * 0.375;
      }
      if (mode === "fast") {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return Math.max(dx, dy) + Math.min(dx, dy) * (Math.SQRT2 - 1);
      }
      return Math.hypot(x2 - x1, y2 - y1);
    },
  squareDistance: () => (x1: number, y1: number, x2: number, y2: number) => {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  },
  dot: () => (x1: number, y1: number, x2: number, y2: number) => {
    return x1 * x2 + y1 * y2;
  },
  remap:
    (ctx: KlintContexts) =>
    (n: number, A: number, B: number, C: number, D: number, bounded = true) => {
      const t = (n - A) / (B - A);
      return ctx.lerp(C, D, t, bounded);
    },
  bezierLerp: () => (a: number, b: number, c: number, d: number, t: number) => {
    // Cubic Bezier interpolation: (1-t)^3*a + 3(1-t)^2*t*b + 3(1-t)*t^2*c + t^3*d
    const u = 1 - t;
    return (
      u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
    );
  },
  bezierTangent:
    () => (a: number, b: number, c: number, d: number, t: number) => {
      // Cubic Bezier tangent: derivative of cubic bezier at t
      const u = 1 - t;
      return (
        3 * d * t * t -
        3 * c * t * t +
        6 * c * u * t -
        6 * b * u * t +
        3 * b * u * u -
        3 * a * u * u
      );
    },
  textFont: (ctx: KlintContexts) => (font: string) => {
    ctx.__textFont = font;
  },
  textSize: (ctx: KlintContexts) => (size: number) => {
    if (Number.isFinite(size) && size > 0) ctx.__textSize = size;
  },
  textStyle: (ctx: KlintContexts) => (style: string) => {
    ctx.__textStyle = style || "normal";
  },
  textWeight: (ctx: KlintContexts) => (weight: string) => {
    ctx.__textWeight = weight || "normal";
  },
  textQuality:
    (ctx: KlintContexts) =>
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
    (ctx: KlintContexts) => (kind: "letter" | "word", value: number) => {
      ctx[`${kind}Spacing`] = `${value}px`;
    },
  // TO DO : add variable axis handling
  computeTextStyle: (ctx: KlintContexts) => () => {
    ctx.__computedTextFont = `${ctx.__textStyle} ${ctx.__textWeight} ${ctx.__textSize}px ${ctx.__textFont}`;
  },
  alignText:
    (ctx: KlintContexts) =>
    (horizontal: CanvasTextAlign, vertical?: CanvasTextBaseline) => {
      ctx.__textAlignment.horizontal = horizontal;
      ctx.__textAlignment.vertical = vertical ?? ctx.__textAlignment.vertical;
    },
  textLeading: (ctx: KlintContexts) => (spacing: number) => {
    ctx.__textLeading = spacing;
    return ctx.__textLeading;
  },
  computeFont: (ctx: KlintContexts) => () => {
    ctx.computeTextStyle();
    if (ctx.font !== ctx.__computedTextFont) ctx.font = ctx.__computedTextFont;
  },
  textWidth: (ctx: KlintContexts) => (text: string) => {
    ctx.computeFont();
    return ctx.measureText(text).width;
  },
  text:
    (ctx: KlintContexts) =>
    (
      text: string | number | undefined,
      x: number,
      y: number,
      maxWidth: number | undefined = undefined,
    ) => {
      if (text === undefined) return;
      ctx.computeFont();

      if (ctx.textAlign !== ctx.__textAlignment.horizontal) {
        ctx.textAlign = ctx.__textAlignment.horizontal;
      }
      if (ctx.textBaseline !== ctx.__textAlignment.vertical) {
        ctx.textBaseline = ctx.__textAlignment.vertical;
      }

      const textString = String(text);

      // Check if text contains line breaks
      if (textString.includes("\n")) {
        const lines = textString.split("\n");

        // Calculate line height - use ctx.__textLeading if set, otherwise use font metrics
        const firstLineMetrics = ctx.measureText(lines[0] || "M");
        const defaultLineHeight =
          firstLineMetrics.actualBoundingBoxAscent +
          firstLineMetrics.actualBoundingBoxDescent;
        const lineHeight = ctx.__textLeading ?? ctx.__textSize * 1.2;

        // Calculate total block height
        const totalHeight =
          lines.length * lineHeight - (lineHeight - defaultLineHeight);

        // Adjust starting Y position based on vertical alignment
        let startY = y;
        if (ctx.__textAlignment.vertical === "middle") {
          startY = y - totalHeight / 2 + defaultLineHeight / 2;
        } else if (ctx.__textAlignment.vertical === "bottom") {
          startY = y - totalHeight + defaultLineHeight;
        } else if (ctx.__textAlignment.vertical === "top") {
          startY = y + defaultLineHeight / 2;
        }

        // Draw each line
        lines.forEach((line, index) => {
          const lineY = startY + index * lineHeight;

          if (ctx.checkTransparency("fill"))
            ctx.fillText(line, x, lineY, maxWidth);
          if (ctx.checkTransparency("stroke"))
            ctx.strokeText(line, x, lineY, maxWidth);
        });
      } else {
        // Single line - original behavior
        if (ctx.checkTransparency("fill"))
          ctx.fillText(textString, x, y, maxWidth);
        if (ctx.checkTransparency("stroke"))
          ctx.strokeText(textString, x, y, maxWidth);
      }
    },

  paragraph:
    (ctx: KlintContexts) =>
    (
      text: string | number | undefined,
      x: number,
      y: number,
      width: number,
      options?: {
        justification?: "left" | "center" | "right" | "justified";
        overflow?: number;
        break?: "words" | "letters";
      },
    ) => {
      if (text === undefined) return;
      ctx.computeFont();

      const textString = String(text);
      const justification = options?.justification || "left";
      const overflow = options?.overflow || 0;
      const breakMode = options?.break || "words";

      // Save current text alignment
      const originalAlign = ctx.textAlign;
      const originalBaseline = ctx.textBaseline;

      // Set alignment for paragraph
      if (justification === "center") {
        ctx.textAlign = "center";
      } else if (justification === "right") {
        ctx.textAlign = "right";
      } else {
        ctx.textAlign = "left";
      }
      ctx.textBaseline = "top";

      const lines: string[] = [];
      for (const explicitLine of textString.split("\n")) {
        const tokens =
          breakMode === "letters"
            ? explicitLine.split("")
            : explicitLine.trim().split(/\s+/).filter(Boolean);
        let currentLine = "";

        for (const token of tokens) {
          const candidate = currentLine
            ? breakMode === "letters"
              ? currentLine + token
              : `${currentLine} ${token}`
            : token;
          if (ctx.measureText(candidate).width > width && currentLine) {
            lines.push(currentLine);
            currentLine = token;
          } else {
            currentLine = candidate;
          }
        }
        lines.push(currentLine);
      }

      // Calculate line height
      const lineHeight = ctx.__textLeading ?? ctx.__textSize * 1.2;

      // Handle overflow - limit lines if overflow is set
      let linesToDraw = lines;
      if (overflow > 0 && lines.length * lineHeight > overflow) {
        const maxLines = Math.floor(overflow / lineHeight);
        linesToDraw = lines.slice(0, maxLines);
      }

      // Draw each line
      linesToDraw.forEach((line, index) => {
        const lineY = y + index * lineHeight;
        let lineX = x;

        // Adjust x position based on justification
        if (justification === "center") {
          lineX = x + width / 2;
        } else if (justification === "right") {
          lineX = x + width;
        } else if (
          justification === "justified" &&
          index < linesToDraw.length - 1
        ) {
          // Justify all lines except the last one
          const words = line.split(/\s+/);
          if (words.length > 1) {
            // Calculate space width needed for justification
            const textWidth = ctx.measureText(words.join("")).width;
            const totalSpaceWidth = width - textWidth;
            const spaceWidth = totalSpaceWidth / (words.length - 1);

            // Draw each word individually with calculated spacing
            let currentX = x;
            words.forEach((word) => {
              if (ctx.checkTransparency("fill")) {
                ctx.fillText(word, currentX, lineY);
              }
              if (ctx.checkTransparency("stroke")) {
                ctx.strokeText(word, currentX, lineY);
              }
              currentX += ctx.measureText(word).width + spaceWidth;
            });
            return; // Skip normal drawing for justified line
          }
        }

        // Draw line normally (non-justified)
        if (ctx.checkTransparency("fill")) {
          ctx.fillText(line, lineX, lineY);
        }
        if (ctx.checkTransparency("stroke")) {
          ctx.strokeText(line, lineX, lineY);
        }
      });

      // Restore original alignment
      ctx.textAlign = originalAlign;
      ctx.textBaseline = originalBaseline;
    },

  // DO NOT use putImageData for images you can draw : https://www.measurethat.net/Benchmarks/Show/9510/0/putimagedata-vs-drawimage
  image:
    (ctx: KlintContexts) =>
    (
      image:
        | HTMLImageElement
        | HTMLCanvasElement
        | OffscreenCanvas
        | KlintContexts,
      x: number,
      y: number,
      arg3?: number,
      arg4?: number,
      arg5?: number,
      arg6?: number,
      arg7?: number,
      arg8?: number,
    ) => {
      const isKlintContext = "canvas" in image;
      const sourceImage = isKlintContext ? image.canvas : image;

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
        const sourceScale = isKlintContext ? image.dpr : 1;
        ctx.drawImage(
          sourceImage,
          sx * sourceScale,
          sy * sourceScale,
          sWidth * sourceScale,
          sHeight * sourceScale,
          adjustedX,
          adjustedY,
          dWidth,
          dHeight,
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
      const width = isKlintContext
        ? image.width
        : sourceImage instanceof HTMLImageElement
          ? sourceImage.naturalWidth
          : sourceImage.width;
      const height = isKlintContext
        ? image.height
        : sourceImage instanceof HTMLImageElement
          ? sourceImage.naturalHeight
          : sourceImage.height;
      const adjustedX = ctx.__imageOrigin === "center" ? dx - width / 2 : dx;
      const adjustedY = ctx.__imageOrigin === "center" ? dy - height / 2 : dy;

      ctx.drawImage(sourceImage, adjustedX, adjustedY, width, height);
    },
  scaleTo:
    () =>
    (
      originWidth: number,
      originHeight: number,
      destinationWidth: number,
      destinationHeight: number,
      cover = false,
    ) => {
      const widthRatio = destinationWidth / originWidth;
      const heightRatio = destinationHeight / originHeight;
      return cover
        ? Math.max(widthRatio, heightRatio)
        : Math.min(widthRatio, heightRatio);
    },
  opacity: (ctx: KlintContexts) => (value: number) => {
    ctx.globalAlpha = ctx.constrain(value, 0, 1);
  },
  blend:
    (ctx: KlintContexts) => (blend: GlobalCompositeOperation | "default") => {
      ctx.globalCompositeOperation =
        blend === "default" ? "source-over" : blend;
    },
  smooth: (ctx: KlintContexts) => () => {
    ctx.imageSmoothingEnabled = true;
  },
  noSmooth: (ctx: KlintContexts) => () => {
    ctx.imageSmoothingEnabled = false;
  },
  setCanvasOrigin: (ctx: KlintContexts) => (type: "center" | "corner") => {
    ctx.__canvasOrigin = type;
  },
  setImageOrigin: (ctx: KlintContexts) => (type: "center" | "corner") => {
    ctx.__imageOrigin = type;
  },
  setRectOrigin: (ctx: KlintContexts) => (type: "center" | "corner") => {
    ctx.__rectangleOrigin = type;
  },
  withConfig:
    (ctx: KlintContexts) =>
    (config: KlintConfig): void => {
      Object.assign(ctx, config);
    },
  toBase64:
    (ctx: KlintContexts) =>
    (type: string = "image/png", quality?: number) => {
      const canvas = ctx.canvas;
      return canvas.toDataURL(type, quality);
    },
  saveConfig: (ctx: KlintContexts) => (from?: KlintContexts) => {
    return Object.fromEntries(
      CONFIG_PROPS.map((key) => [
        key,
        from?.[key as keyof KlintContexts] ?? ctx[key as keyof KlintContexts],
      ]),
    ) as KlintConfig;
  },
  restoreConfig:
    (ctx: KlintContexts) =>
    (config: KlintConfig): void => {
      Object.assign(ctx, config);
    },
  resizeCanvas: (ctx: KlintContexts) => (width: number, height: number) => {
    if (ctx.__isMainContext) return;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) {
      throw new RangeError("Canvas dimensions must be finite, non-negative numbers");
    }

    const config = ctx.saveConfig();
    ctx.canvas.width = Math.round(width * ctx.dpr);
    ctx.canvas.height = Math.round(height * ctx.dpr);
    ctx.width = width;
    ctx.height = height;
    ctx.restoreConfig(config);
    applyKlintBaseTransform(ctx);
  },
  clipTo:
    (ctx: KlintContexts) =>
    (
      callback: (K: KlintContexts | KlintContext) => void,
      fillRule?: CanvasFillRule,
    ) => {
      // Build a clip path without painting; let caller manage push/pop
      const originalFill = ctx.fill;
      const originalStroke = ctx.stroke;
      const originalDrawIfVisible = ctx.drawIfVisible;
      const originalBeginPath = ctx.beginPath;

      // Suppress any drawing while constructing the clip path
      ctx.fill = () => {};
      ctx.stroke = () => {};
      ctx.drawIfVisible = () => {};

      // Start one fresh path; subsequent beginPath() inside callback won't reset it
      let allowBeginPath = true;
      ctx.beginPath = () => {
        if (allowBeginPath) {
          originalBeginPath.call(ctx);
          allowBeginPath = false;
        }
      };

      try {
        ctx.beginPath();
        callback(ctx);
        ctx.clip(fillRule || ctx.__fillRule || "nonzero");
      } finally {
        ctx.beginPath = originalBeginPath;
        ctx.drawIfVisible = originalDrawIfVisible;
        ctx.fill = originalFill;
        ctx.stroke = originalStroke;
      }
    },

  screenToWorld:
    (ctx: KlintContexts) =>
    (screenX: number, screenY: number): { x: number; y: number } => {
      const inverse = ctx.getTransform().inverse();
      const pt = inverse.transformPoint(
        new DOMPoint(screenX * ctx.dpr, screenY * ctx.dpr),
      );
      return { x: pt.x, y: pt.y };
    },

  worldToScreen:
    (ctx: KlintContexts) =>
    (worldX: number, worldY: number): { x: number; y: number } => {
      const matrix = ctx.getTransform();
      const point = matrix.transformPoint(new DOMPoint(worldX, worldY));
      return { x: point.x / ctx.dpr, y: point.y / ctx.dpr };
    },

  getVisibleBounds:
    (ctx: KlintContexts) =>
    (): {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    } => {
      const inverse = ctx.getTransform().inverse();
      const pixelWidth = ctx.width * ctx.dpr;
      const pixelHeight = ctx.height * ctx.dpr;
      const c0 = inverse.transformPoint(new DOMPoint(0, 0));
      const c1 = inverse.transformPoint(new DOMPoint(pixelWidth, 0));
      const c2 = inverse.transformPoint(new DOMPoint(pixelWidth, pixelHeight));
      const c3 = inverse.transformPoint(new DOMPoint(0, pixelHeight));
      const left = Math.min(c0.x, c1.x, c2.x, c3.x);
      const right = Math.max(c0.x, c1.x, c2.x, c3.x);
      const top = Math.min(c0.y, c1.y, c2.y, c3.y);
      const bottom = Math.max(c0.y, c1.y, c2.y, c3.y);
      return {
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: bottom - top,
      };
    },

  canIuseFilter: (ctx: KlintContexts) => () => {
    return ctx.filter !== undefined && ctx.filter !== null;
  },

  blur: (ctx: KlintContexts) => (radius: number) => {
    if (ctx.filter === undefined || ctx.filter === null) return;
    ctx.filter = `blur(${radius}px)`;
  },

  SVGfilter: (ctx: KlintContexts) => (url: string) => {
    if (ctx.filter === undefined || ctx.filter === null) return;
    if (!url || !url.startsWith("url(")) return;
    ctx.filter = url;
  },

  dropShadow:
    (ctx: KlintContexts) =>
    (offsetX: number, offsetY: number, blurRadius: number, color: string) => {
      if (ctx.filter === undefined || ctx.filter === null) return;
      ctx.filter = `drop-shadow(${offsetX}px ${offsetY}px ${blurRadius}px ${color})`;
    },

  grayscale: (ctx: KlintContexts) => (amount: number) => {
    if (ctx.filter === undefined || ctx.filter === null) return;
    const value = ctx.constrain(amount, 0, 1);
    ctx.filter = `grayscale(${value})`;
  },

  hue: (ctx: KlintContexts) => (angle: number) => {
    if (ctx.filter === undefined || ctx.filter === null) return;
    const degrees = (angle * 180) / Math.PI;
    ctx.filter = `hue-rotate(${degrees}deg)`;
  },

  invert: (ctx: KlintContexts) => (amount: number) => {
    if (ctx.filter === undefined || ctx.filter === null) return;
    const value = ctx.constrain(amount, 0, 1);
    ctx.filter = `invert(${value})`;
  },

  filterOpacity: (ctx: KlintContexts) => (value: number) => {
    if (ctx.filter === undefined || ctx.filter === null) return;
    const amount = ctx.constrain(value, 0, 1);
    ctx.filter = `opacity(${amount})`;
  },
} as const;
