// Klint Web Component - Standalone Version
// This file includes all necessary dependencies inline to avoid module resolution issues

const DEFAULT_FPS = 60;
const DEFAULT_ALT = "A beautiful artwork made with Klint Canvas";
const EPSILON = 0.0001;

const DEFAULT_OPTIONS = {
  alpha: "true",
  ignoreResize: "false",
  noloop: "false",
  static: "false",
  nocanvas: "false",
  unsafemode: "false",
  willreadfrequently: "false",
  fps: DEFAULT_FPS,
  dpr: "default",
  origin: "corner",
};

const CONFIG_PROPS = [
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
  "__textLeading",
  "__textAlignment",
  "__isPlaying",
];

// Element Classes

class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  length() {
    return this.mag();
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  angle() {
    return Math.atan2(this.y, this.x);
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  normalize() {
    const m = this.mag();
    if (m !== 0) this.div(m);
    return this;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
}

class Color {
  constructor() {
    this.colors = [
      "#E84D37", // coral
      "#7F4C2F", // brown
      "#EDBC2F", // mustard
      "#BF3034", // crimson
      "#18599D", // navy
      "#45A7C6", // sky
      "#8CB151", // olive
      "#252120", // charcoal
      "#ECA088", // peach
      "#C9B1B8", // rose
      "#8F3064", // plum
      "#7B8870", // sage
      "#C0C180", // drab
      "#4B423D", // taupe
      "#1A2A65", // midnight
      "#EAA550", // golden
      "#F17B04", // orange
      "#404757", // slate
    ];
  }

  get coral() {
    return this.colors[0];
  }
  get brown() {
    return this.colors[1];
  }
  get mustard() {
    return this.colors[2];
  }
  get crimson() {
    return this.colors[3];
  }
  get navy() {
    return this.colors[4];
  }
  get sky() {
    return this.colors[5];
  }
  get olive() {
    return this.colors[6];
  }
  get charcoal() {
    return this.colors[7];
  }
  get peach() {
    return this.colors[8];
  }
  get rose() {
    return this.colors[9];
  }
  get plum() {
    return this.colors[10];
  }
  get sage() {
    return this.colors[11];
  }
  get drab() {
    return this.colors[12];
  }
  get taupe() {
    return this.colors[13];
  }
  get midnight() {
    return this.colors[14];
  }
  get golden() {
    return this.colors[15];
  }
  get orange() {
    return this.colors[16];
  }
  get slate() {
    return this.colors[17];
  }

  hex(color) {
    return color;
  }

  rgb(r, g, b) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  rgba(r, g, b, alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  gray(value, alpha) {
    return alpha !== undefined
      ? `rgba(${value}, ${value}, ${value}, ${alpha})`
      : `rgb(${value}, ${value}, ${value})`;
  }

  hsl(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  hsla(h, s, l, alpha) {
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
  }
}

class Easing {
  constructor() {
    // Common easing functions
    this.linear = (t) => t;
    this.easeInQuad = (t) => t * t;
    this.easeOutQuad = (t) => t * (2 - t);
    this.easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    this.easeInCubic = (t) => t * t * t;
    this.easeOutCubic = (t) => --t * t * t + 1;
    this.easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }
}

class State {
  constructor() {
    this.states = new Map();
  }

  set(key, value) {
    this.states.set(key, value);
  }

  get(key, defaultValue) {
    return this.states.has(key) ? this.states.get(key) : defaultValue;
  }
}

class Time {
  constructor() {}

  seconds() {
    return Date.now() / 1000;
  }

  millis() {
    return Date.now();
  }
}

class Text {
  constructor() {}
}

class Thing {
  constructor() {}
}

// Klint Functions
const KlintFunctions = {
  extend:
    (ctx) =>
    (name, data, enforceReplace = false) => {
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

  disk:
    (ctx) =>
    (x, y, radius, startAngle = 0, endAngle = Math.PI * 2, closed = true) => {
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
    const originType = ctx.__rectangleOrigin || ctx.__canvasOrigin || "corner";
    const h = height ?? width;
    const drawX = originType === "center" ? x - width / 2 : x;
    const drawY = originType === "center" ? y - h / 2 : y;
    ctx.beginPath();
    ctx.rect(drawX, drawY, width, h);
    ctx.drawIfVisible();
  },

  roundedRectangle: (ctx) => (x, y, width, radius, height) => {
    const originType = ctx.__rectangleOrigin || ctx.__canvasOrigin || "corner";
    const h = height ?? width;
    const drawX = originType === "center" ? x - width / 2 : x;
    const drawY = originType === "center" ? y - h / 2 : y;
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, width, h, radius);
    ctx.drawIfVisible();
  },

  polygon:
    (ctx) =>
    (x, y, radius, sides, radius2, rotation = 0) => {
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

  beginShape: (ctx) => () => {
    if (ctx.__startedShape) return;
    ctx.beginPath();
    ctx.__startedShape = true;
    ctx.__currentShape = [];
    ctx.__currentContours = [];
  },

  beginContour: (ctx) => () => {
    if (!ctx.__startedShape || ctx.__startedContour) return;
    ctx.__startedContour = true;
    ctx.__currentContour = [];
  },

  vertex: (ctx) => (x, y) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push({ type: "line", x, y });
  },

  bezierVertex: (ctx) => (cp1x, cp1y, cp2x, cp2y, x, y) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push({ type: "bezier", cp1x, cp1y, cp2x, cp2y, x, y });
  },

  quadraticVertex: (ctx) => (cpx, cpy, x, y) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push({ type: "quadratic", cpx, cpy, x, y });
  },

  arcVertex: (ctx) => (x1, y1, x2, y2, radius) => {
    if (!ctx.__startedShape) return;
    const points = ctx.__startedContour
      ? ctx.__currentContour
      : ctx.__currentShape;
    points?.push({ type: "arc", x1, y1, x2, y2, radius });
  },

  endContour:
    (ctx) =>
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
    (ctx) =>
    (close = false) => {
      if (!ctx.__startedShape) return;
      if (ctx.__startedContour) ctx.endContour();

      const points = ctx.__currentShape;
      if (!points?.length) return;

      const drawPath = (points, close = false) => {
        if (points.length === 0) return;

        const firstPoint = points[0];
        const startX = firstPoint.x || firstPoint.x2;
        const startY = firstPoint.y || firstPoint.y2;
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
                point.y
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
      ctx.__startedShape = false;
    },

  gradient:
    (ctx) =>
    (x1 = 0, y1 = 0, x2 = ctx.width, y2 = ctx.width) => {
      return ctx.createLinearGradient(x1, y1, x2, y2);
    },

  radialGradient:
    (ctx) =>
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
    (ctx) =>
    (angle = 0, x1 = ctx.width / 2, y1 = ctx.height / 2) => {
      return ctx.createConicGradient(angle, x1, y1);
    },

  addColorStop:
    () =>
    (gradient, offset = 0, color = "#000") => {
      return gradient.addColorStop(offset, color);
    },

  constrain: () => (val, floor, ceil) => {
    return Math.max(floor, Math.min(val, ceil));
  },

  lerp:
    (ctx) =>
    (A, B, mix, bounded = true) => {
      return A + (B - A) * (bounded ? ctx.constrain(mix, 0, 1) : mix);
    },

  fract:
    () =>
    (n, mod, mode = "precise") => {
      if (mode === "faster") {
        const floor = (x) => x >> 0;
        return n - floor(n / mod) * mod;
      }
      if (mode === "fast") {
        return n - ~~(n / mod) * mod;
      }
      if (n >= 0) return n % mod;
      return mod - (-n % mod);
    },

  distance:
    (ctx) =>
    (x1, y1, x2, y2, mode = "precise") => {
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

  remap:
    (ctx) =>
    (n, A, B, C, D, bounded = true) => {
      const t = (n - A) / (B - A);
      return ctx.lerp(C, D, t, bounded);
    },

  bezierLerp: () => (a, b, c, d, t) => {
    const u = 1 - t;
    return (
      u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
    );
  },

  bezierTangent: () => (a, b, c, d, t) => {
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

  textQuality:
    (ctx) =>
    (quality = "auto") => {
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

  computeTextStyle: (ctx) => () => {
    ctx.__computedTextFont = `${ctx.__textWeight} ${ctx.__textStyle} ${ctx.__textSize}px ${ctx.__textFont}`;
  },

  alignText: (ctx) => (horizontal, vertical) => {
    ctx.__textAlignment.horizontal = horizontal;
    ctx.__textAlignment.vertical = vertical ?? ctx.__textAlignment.vertical;
  },

  textLeading: (ctx) => (spacing) => {
    ctx.__textLeading = spacing;
    return ctx.__textLeading;
  },

  computeFont: (ctx) => () => {
    ctx.computeTextStyle();
    if (ctx.font !== ctx.__computedTextFont) ctx.font = ctx.__computedTextFont;
  },

  textWidth: (ctx) => (text) => {
    ctx.computeFont();
    return ctx.measureText(text).width;
  },

  text:
    (ctx) =>
    (text, x, y, maxWidth = undefined) => {
      if (text === undefined) return;
      ctx.computeFont();

      if (ctx.textAlign !== ctx.__textAlignment.horizontal) {
        ctx.textAlign = ctx.__textAlignment.horizontal;
      }
      if (ctx.textBaseline !== ctx.__textAlignment.vertical) {
        ctx.textBaseline = ctx.__textAlignment.vertical;
      }

      const textString = String(text);

      if (textString.includes("\n")) {
        const lines = textString.split("\n");
        const firstLineMetrics = ctx.measureText(lines[0] || "M");
        const defaultLineHeight =
          firstLineMetrics.actualBoundingBoxAscent +
          firstLineMetrics.actualBoundingBoxDescent;
        const lineHeight = ctx.__textLeading ?? ctx.__textSize * 1.2;
        const totalHeight =
          lines.length * lineHeight - (lineHeight - defaultLineHeight);

        let startY = y;
        if (ctx.__textAlignment.vertical === "middle") {
          startY = y - totalHeight / 2 + defaultLineHeight / 2;
        } else if (ctx.__textAlignment.vertical === "bottom") {
          startY = y - totalHeight + defaultLineHeight;
        } else if (ctx.__textAlignment.vertical === "top") {
          startY = y + defaultLineHeight / 2;
        }

        lines.forEach((line, index) => {
          const lineY = startY + index * lineHeight;
          if (ctx.checkTransparency("fill"))
            ctx.fillText(line, x, lineY, maxWidth);
          if (ctx.checkTransparency("stroke"))
            ctx.strokeText(line, x, lineY, maxWidth);
        });
      } else {
        if (ctx.checkTransparency("fill"))
          ctx.fillText(textString, x, y, maxWidth);
        if (ctx.checkTransparency("stroke"))
          ctx.strokeText(textString, x, y, maxWidth);
      }
    },

  image: (ctx) => (image, x, y, arg3, arg4, arg5, arg6, arg7, arg8) => {
    const sourceImage = "canvas" in image ? image.canvas : image;

    if (arg5 !== undefined) {
      const [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = [
        x,
        y,
        arg3,
        arg4,
        arg5,
        arg6,
        arg7,
        arg8,
      ];
      const adjustedX = ctx.__imageOrigin === "center" ? dx - dWidth / 2 : dx;
      const adjustedY = ctx.__imageOrigin === "center" ? dy - dHeight / 2 : dy;
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

    if (arg3 !== undefined) {
      const [dx, dy, dWidth, dHeight] = [x, y, arg3, arg4];
      const adjustedX = ctx.__imageOrigin === "center" ? dx - dWidth / 2 : dx;
      const adjustedY = ctx.__imageOrigin === "center" ? dy - dHeight / 2 : dy;
      ctx.drawImage(sourceImage, adjustedX, adjustedY, dWidth, dHeight);
      return;
    }

    const [dx, dy] = [x, y];
    const width = sourceImage.naturalWidth || sourceImage.width;
    const height = sourceImage.naturalHeight || sourceImage.height;
    const adjustedX = ctx.__imageOrigin === "center" ? dx - width / 2 : dx;
    const adjustedY = ctx.__imageOrigin === "center" ? dy - height / 2 : dy;
    ctx.drawImage(sourceImage, adjustedX, adjustedY);
  },

  loadPixels: (ctx) => () => {
    return ctx.getImageData(0, 0, ctx.width, ctx.height);
  },

  updatePixels: (ctx) => (pixels) => {
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
    (ctx) =>
    (x, y, w = 1, h = 1) => {
      const imageData = ctx.getImageData(x, y, w, h);
      return Array.from(imageData.data);
    },

  scaleTo:
    () =>
    (
      originWidth,
      originHeight,
      destinationWidth,
      destinationHeight,
      cover = false
    ) => {
      const widthRatio = destinationWidth / originWidth;
      const heightRatio = destinationHeight / originHeight;
      return cover
        ? Math.max(widthRatio, heightRatio)
        : Math.min(widthRatio, heightRatio);
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

  toBase64:
    (ctx) =>
    (type = "image/png", quality) => {
      const canvas = ctx.canvas;
      return canvas.toDataURL(type, quality);
    },

  saveConfig: (ctx) => (from) => {
    return Object.fromEntries(
      CONFIG_PROPS.map((key) => [key, from?.[key] ?? ctx[key]])
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
  },

  clipTo:
    (ctx) =>
    (callback, revert = false) => {
      ctx.save();
      ctx.beginPath();
      const originalFillStyle = ctx.fillStyle;
      const originalStrokeStyle = ctx.strokeStyle;
      ctx.fillStyle = "white";
      ctx.strokeStyle = "white";
      const originalFill = ctx.fill;
      const originalStroke = ctx.stroke;
      const originalDrawIfVisible = ctx.drawIfVisible;
      callback(ctx);
      ctx.fill = originalFill;
      ctx.stroke = originalStroke;
      ctx.drawIfVisible = originalDrawIfVisible;
      ctx.fillStyle = originalFillStyle;
      ctx.strokeStyle = originalStrokeStyle;

      if (revert) {
        ctx.clip("evenodd");
      } else {
        ctx.clip();
      }
    },
};

// Klint Core Functions
const KlintCoreFunctions = {
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

  redraw: () => () => {},

  extend:
    (ctx) =>
    (name, data, enforceReplace = false) => {
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
      CONFIG_PROPS.map((key) => [key, from?.[key] ?? ctx[key]])
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
    offscreen.width = width;
    offscreen.height = height;

    const context = offscreen.getContext("2d", {
      alpha: options?.alpha ?? true,
      willReadFrequently: options?.willreadfrequently ?? false,
    });

    if (!context) throw new Error("Failed to create offscreen context");

    // Initialize basic properties
    context.__dpr = ctx.__dpr;
    context.width = width;
    context.height = height;
    context.__isMainContext = false;

    context.__imageOrigin = "corner";
    context.__rectangleOrigin = "corner";
    context.__canvasOrigin = "corner";
    context.__textFont = "sans-serif";
    context.__textWeight = "normal";
    context.__textStyle = "normal";
    context.__textSize = 120;
    context.__textLeading = undefined;
    context.__textAlignment = {
      horizontal: "left",
      vertical: "top",
    };

    // Add KlintFunctions if not ignored
    if (!options?.ignoreFunctions) {
      // Add Klint Elements
      context.Color = ctx.Color;
      context.createVector = (x = 0, y = 0) => new Vector(x, y);
      context.Easing = ctx.Easing;
      context.Text = ctx.Text;

      Object.entries(KlintFunctions).forEach(([name, fn]) => {
        context[name] = fn(context);
      });
    }

    // Set origin if specified
    if (options?.origin) {
      context.__canvasOrigin = options.origin;
      if (options.origin === "center") {
        context.translate(context.width * 0.5, context.height * 0.5);
      }
    }

    if (callback) {
      callback(context);
    }

    // If static option is true, convert to base64 and store that instead
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
  },
};

// Web Component
class KlintCanvas extends HTMLElement {
  static observedAttributes = [
    "width",
    "height",
    "fps",
    "dpr",
    "origin",
    "alpha",
    "autoplay",
    "noloop",
    "static",
    "ignoreResize",
    "nocanvas",
    "willreadfrequently",
    "unsafemode",
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Internal state
    this._canvas = null;
    this._context = null;
    this._animationFrameId = null;
    this._resizeObserver = null;
    this._intersectionObserver = null;
    this._isVisible = true;
    this._options = { ...DEFAULT_OPTIONS };

    // User callbacks
    this._setup = null;
    this._draw = null;
    this._preload = null;
    this.onResize = null;
    this.onVisible = null;

    // Bind methods
    this._animate = this._animate.bind(this);
  }

  connectedCallback() {
    this._setupShadowDOM();
    this._initializeCanvas();
    this._setupObservers();
    this._parseScriptTag();
    this._initialize();
  }

  disconnectedCallback() {
    this._cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    this._options[name] = newValue;

    if (this._context && (name === "width" || name === "height")) {
      this._updateCanvasSize();
    }

    if (this._context && name === "fps") {
      this._context.fps = parseFloat(newValue) || DEFAULT_FPS;
    }
  }

  _setupShadowDOM() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          position: relative;
        }
        canvas {
          display: block;
        }
        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      </style>
      <canvas></canvas>
    `;

    this._canvas = this.shadowRoot.querySelector("canvas");
  }

  _initializeCanvas() {
    if (!this._canvas) return;

    // Update options from attributes
    for (const attr of KlintCanvas.observedAttributes) {
      const value = this.getAttribute(attr);
      if (value !== null) {
        this._options[attr] = value;
      }
    }

    const defaultDPR = window.devicePixelRatio || 3;
    const dpr = this._options.dpr
      ? this._options.dpr === "default"
        ? defaultDPR
        : parseFloat(this._options.dpr)
      : defaultDPR;

    this._context = this._createContext(this._canvas);
    if (!this._context) return;

    this._context.__dpr = dpr;
    this._context.fps = parseFloat(this._options.fps) || DEFAULT_FPS;

    this._updateCanvasSize();
  }

  _createContext(canvas) {
    const ctx = canvas.getContext("2d", {
      alpha: this._options.alpha !== "false",
      willReadFrequently: this._options.willreadfrequently === "true",
    });

    if (!ctx) return null;

    // Initialize context properties
    ctx.width = 0;
    ctx.height = 0;
    ctx.__dpr = 1;
    ctx.__startedShape = false;
    ctx.__currentShape = null;
    ctx.__startedContour = false;
    ctx.__currentContours = null;
    ctx.__currentContour = null;
    ctx.__isReadyToDraw = false;
    ctx.__isMainContext = true;
    ctx.__imageOrigin = "corner";
    ctx.__rectangleOrigin = "corner";
    ctx.__canvasOrigin = this._options.origin || "corner";
    ctx.__computedTextFont = "";
    ctx.__textFont = "sans-serif";
    ctx.__textSize = 120;
    ctx.__textLeading = undefined;
    ctx.__textStyle = "normal";
    ctx.__textWeight = "normal";
    ctx.__textAlignment = {
      horizontal: "left",
      vertical: "top",
    };

    // Animation properties
    ctx.frame = 0;
    ctx.time = 0;
    ctx.deltaTime = 0;
    ctx.fps = DEFAULT_FPS;
    ctx.__lastTargetTime = 0;
    ctx.__lastRealTime = 0;
    ctx.__isPlaying = true;
    ctx.__offscreens = new Map();
    ctx.__isPreloaded = false;
    ctx.__isSetup = false;

    // Add Element classes
    ctx.Color = new Color();
    ctx.createVector = (x = 0, y = 0) => new Vector(x, y);
    ctx.Easing = new Easing();
    ctx.State = new State();
    ctx.Time = new Time();
    ctx.Text = new Text();
    ctx.Thing = new Thing();

    // Augment with Klint functions
    Object.entries(KlintFunctions).forEach(([name, fn]) => {
      ctx[name] = fn(ctx);
    });

    Object.entries(KlintCoreFunctions).forEach(([name, fn]) => {
      ctx[name] = fn(ctx);
    });

    return ctx;
  }

  _updateCanvasSize(shouldRedraw = false) {
    if (!this._canvas || !this._context) return;

    const rect = this.getBoundingClientRect();
    const width = parseFloat(this.getAttribute("width")) || rect.width;
    const height = parseFloat(this.getAttribute("height")) || rect.height;

    const config = this._context.saveConfig();
    this._context.dpr = this._context.__dpr;
    this._canvas.width = this._context.width = ~~(width * this._context.__dpr);
    this._canvas.height = this._context.height = ~~(
      height * this._context.__dpr
    );
    this._canvas.style.width = `${width}px`;
    this._canvas.style.height = `${height}px`;
    this._context.restoreConfig(config);

    if (this._options.origin === "center") {
      this._context.translate(
        this._canvas.width * 0.5,
        this._canvas.height * 0.5
      );
    }

    if (shouldRedraw && this._draw) {
      this._draw(this._context);
    }
  }

  _setupObservers() {
    // Resize observer
    if (this._options.ignoreResize !== "true") {
      this._resizeObserver = new ResizeObserver(() => {
        this._updateCanvasSize(this._context?.__isReadyToDraw);
        if (this.onResize) {
          this.onResize(this._context);
        }
        this.dispatchEvent(
          new CustomEvent("klint-resize", {
            detail: { context: this._context },
          })
        );
      });
      this._resizeObserver.observe(this);
    }

    // Intersection observer
    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this._isVisible = entry.isIntersecting;
          if (this.onVisible) {
            this.onVisible(this._context);
          }
          this.dispatchEvent(
            new CustomEvent("klint-visible", {
              detail: {
                context: this._context,
                visible: entry.isIntersecting,
              },
            })
          );
        });
      },
      { threshold: 0.1, root: null, rootMargin: "50px" }
    );
    this._intersectionObserver.observe(this);
  }

  _parseScriptTag() {
    const script = this.querySelector('script[type="text/klint"]');
    if (!script) return;

    try {
      // Create a function scope and extract the functions
      const code = script.textContent;
      const func = new Function(
        "exports",
        code +
          "\n" +
          'if (typeof setup !== "undefined") exports.setup = setup;\n' +
          'if (typeof draw !== "undefined") exports.draw = draw;\n' +
          'if (typeof preload !== "undefined") exports.preload = preload;\n' +
          'if (typeof onResize !== "undefined") exports.onResize = onResize;\n' +
          'if (typeof onVisible !== "undefined") exports.onVisible = onVisible;'
      );

      const exports = {};
      func(exports);

      // Assign the functions
      if (exports.setup) this.setup = exports.setup;
      if (exports.draw) this.draw = exports.draw;
      if (exports.preload) this._preload = exports.preload;
      if (exports.onResize) this.onResize = exports.onResize;
      if (exports.onVisible) this.onVisible = exports.onVisible;
    } catch (error) {
      console.error("Error parsing Klint script:", error);
    }
  }

  async _initialize() {
    if (!this._context) return;

    const unsafeMode = this._options.unsafemode === "true";
    if (!unsafeMode && this._context.__isReadyToDraw) return;

    try {
      // Preload phase
      if (this._preload && (unsafeMode || !this._context.__isPreloaded)) {
        await this._preload(this._context);
        if (!unsafeMode) this._context.__isPreloaded = true;
      }

      // Setup phase
      if (this._setup && (unsafeMode || !this._context.__isSetup)) {
        this._setup(this._context);
        if (!unsafeMode) this._context.__isSetup = true;
      }

      // Initial draw
      if (this._draw && !this._context.__isReadyToDraw) {
        this._draw(this._context);
        this._context.__isReadyToDraw = true;
      }

      // Handle static mode
      if (this._options.static === "true") {
        this._handleStaticMode();
      } else {
        // Start animation loop
        if (this._options.noloop !== "true") {
          this._animate();
        }
      }

      // Dispatch ready event
      this.dispatchEvent(
        new CustomEvent("klint-ready", {
          detail: { context: this._context },
        })
      );
    } catch (error) {
      console.error("Klint initialization error:", error);
    }
  }

  _animate(timestamp = 0) {
    if (!this._context || !this._isVisible) return;
    if (!this._context.__isReadyToDraw) return;
    if (!this._context.__isPlaying) return;

    const now = timestamp;
    const target = 1000 / this._context.fps;

    if (!this._context.__lastTargetTime) {
      this._context.__lastTargetTime = now;
      this._context.__lastRealTime = now;
    }

    const sinceLast = now - this._context.__lastTargetTime;
    const epsilon = 5;

    if (sinceLast >= target - epsilon) {
      this._context.deltaTime = now - this._context.__lastRealTime;

      if (this._draw) {
        this._draw(this._context);
      }

      if (this._context.time > 1e7) this._context.time = 0;
      if (this._context.frame > 1e7) this._context.frame = 0;
      this._context.time += this._context.deltaTime / 1000; // Convert to seconds
      this._context.frame++;
      this._context.__lastTargetTime = now;
      this._context.__lastRealTime = now;
    }

    this._animationFrameId = requestAnimationFrame(this._animate);
  }

  _handleStaticMode() {
    try {
      const imageUrl = this._canvas.toDataURL("image/png");
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = this._context.__description || DEFAULT_ALT;

      // Replace canvas with image
      this._canvas.style.display = "none";
      this.shadowRoot.appendChild(img);
    } catch (error) {
      console.error("Error creating static image:", error);
    }
  }

  _cleanup() {
    if (this._animationFrameId) {
      cancelAnimationFrame(this._animationFrameId);
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
    }

    if (this._intersectionObserver) {
      this._intersectionObserver.disconnect();
    }
  }

  // Public API
  get context() {
    return this._context;
  }

  set setup(fn) {
    this._setup = fn;
    if (this._context && !this._context.__isSetup) {
      this._initialize();
    }
  }

  get setup() {
    return this._setup;
  }

  set draw(fn) {
    this._draw = fn;
    if (this._context && !this._context.__isReadyToDraw) {
      this._initialize();
    }
  }

  get draw() {
    return this._draw;
  }

  set preload(fn) {
    this._preload = fn;
    if (this._context && !this._context.__isPreloaded) {
      this._initialize();
    }
  }

  get preload() {
    return this._preload;
  }

  play() {
    if (this._context) {
      this._context.__isPlaying = true;
      this._animate();
    }
  }

  pause() {
    if (this._context) {
      this._context.__isPlaying = false;
    }
  }

  saveCanvas() {
    if (this._context) {
      this._context.saveCanvas();
    }
  }

  fullscreen() {
    this.requestFullscreen?.();
  }
}

// Register the custom element
customElements.define("klint-canvas", KlintCanvas);

export default KlintCanvas;
