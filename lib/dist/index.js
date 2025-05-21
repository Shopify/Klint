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
  dpr: "default",
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
    const defaultDPR = window.devicePixelRatio || 3;
    const dpr = __options.dpr ? __options.dpr === "default" ? defaultDPR : __options.dpr : defaultDPR;
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

// src/elements/Color.tsx
var Color = class {
  constructor() {
    // context: KlintContexts;
    /**
     * Array of predefined colors in the Klint color palette
     */
    this.colors = [
      "#E84D37",
      // coral
      "#7F4C2F",
      // brown
      "#EDBC2F",
      // mustard
      "#BF3034",
      // crimson
      "#18599D",
      // navy
      "#45A7C6",
      // sky
      "#8CB151",
      // olive
      "#252120",
      // charcoal
      "#ECA088",
      // peach
      "#C9B1B8",
      // rose
      "#8F3064",
      // plum
      "#7B8870",
      // sage
      "#C0C180",
      // drab
      "#4B423D",
      // taupe
      "#1A2A65",
      // midnight
      "#EAA550",
      // golden
      "#F17B04",
      // orange
      "#404757"
      // slate
    ];
  }
  // /**
  //  * Creates a new Color instance
  //  * @param ctx - The Klint context
  //  */
  // constructor(ctx: KlintContexts) {
  //   this.context = ctx;
  // }
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
  /**
   * Ensures a color string has a # prefix
   * @param color - Color string in hex format (with or without #)
   * @returns Hex color string with # prefix
   */
  hex(color) {
    return color.startsWith("#") ? color : `#${color}`;
  }
  /**
   * Creates an RGB color string
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns RGB color string
   */
  rgb(r, g, b) {
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }
  /**
   * Creates an RGBA color string
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns RGBA color string
   */
  rgba(r, g, b, alpha) {
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
      b
    )}, ${alpha})`;
  }
  /**
   * Creates a grayscale color
   * @param value - Gray value (0-255)
   * @param alpha - Optional alpha/opacity value (0-1)
   * @returns RGB or RGBA grayscale color string
   */
  gray(value, alpha) {
    return alpha !== void 0 ? `rgba(${Math.round(value)}, ${Math.round(value)}, ${Math.round(
      value
    )}, ${alpha})` : `rgb(${Math.round(value)}, ${Math.round(value)}, ${Math.round(value)})`;
  }
  /**
   * Creates an HSL color string
   * @param h - Hue (0-360)
   * @param s - Saturation percentage (0-100)
   * @param l - Lightness percentage (0-100)
   * @returns HSL color string
   */
  hsl(h, s, l) {
    return `hsl(${h % 360}, ${Math.max(0, s)}%, ${Math.max(0, l)}%)`;
  }
  /**
   * Creates an HSLA color string
   * @param h - Hue (0-360)
   * @param s - Saturation percentage (0-100)
   * @param l - Lightness percentage (0-100)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns HSLA color string
   */
  hsla(h, s, l, alpha) {
    return `hsla(${h % 360}, ${Math.max(0, s)}%, ${Math.max(0, l)}%, ${alpha})`;
  }
  /**
   * Creates an LCH color string
   * @param l - Lightness percentage (0-100)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @returns LCH color string
   */
  lch(l, c, h) {
    return `lch(${l}% ${c} ${h})`;
  }
  /**
   * Creates an LCH color string with alpha
   * @param l - Lightness percentage (0-100)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns LCH color string with alpha
   */
  lcha(l, c, h, alpha) {
    return `lch(${l}% ${c} ${h} / ${alpha})`;
  }
  /**
   * Creates a LAB color string
   * @param l - Lightness percentage (0-100)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @returns LAB color string
   */
  lab(l, a, b) {
    return `lab(${l}% ${a} ${b})`;
  }
  /**
   * Creates a LAB color string with alpha
   * @param l - Lightness percentage (0-100)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns LAB color string with alpha
   */
  laba(l, a, b, alpha) {
    return `lab(${l}% ${a} ${b} / ${alpha})`;
  }
  /**
   * Creates an OKLCH color string
   * @param l - Lightness value (0-1)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @returns OKLCH color string
   */
  oklch(l, c, h) {
    return `oklch(${l} ${c} ${h})`;
  }
  /**
   * Creates an OKLCH color string with alpha
   * @param l - Lightness value (0-1)
   * @param c - Chroma value
   * @param h - Hue (0-360)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns OKLCH color string with alpha
   */
  oklcha(l, c, h, alpha) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }
  /**
   * Creates an OKLAB color string
   * @param l - Lightness value (0-1)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @returns OKLAB color string
   */
  oklab(l, a, b) {
    return `oklab(${l} ${a} ${b})`;
  }
  /**
   * Creates an OKLAB color string with alpha
   * @param l - Lightness value (0-1)
   * @param a - A-axis value (green to red)
   * @param b - B-axis value (blue to yellow)
   * @param alpha - Alpha/opacity value (0-1)
   * @returns OKLAB color string with alpha
   */
  oklaba(l, a, b, alpha) {
    return `oklab(${l} ${a} ${b} / ${alpha})`;
  }
  /**
   * Blends two colors using CSS color-mix
   * @param colorA - First color
   * @param colorB - Second color
   * @param factor - Blend factor (0-1) where 0 is colorA and 1 is colorB
   * @param colorMode - Color space to blend in (e.g., "oklch", "hsl")
   * @returns Blended color string
   */
  blendColors(colorA, colorB, factor, colorMode = "oklch") {
    const t = Math.max(0, Math.min(1, factor)) * 100;
    return `color-mix(in ${colorMode}, ${colorA}, ${colorB} ${t}%)`;
  }
  /**
   * Creates a palette of colors based on a single base color
   * @param baseColor - The base color to create palette from
   * @param steps - Number of steps in each direction (lighter/darker)
   * @returns Array of color strings forming a palette
   */
  createPalette(baseColor, steps = 9) {
    const palette = [];
    for (let i = 1; i < steps; i++) {
      const factor = i / steps;
      palette.unshift(this.blendColors(baseColor, "#ffffff", factor, "oklch"));
    }
    palette.push(baseColor);
    for (let i = 1; i < steps; i++) {
      const factor = i / steps;
      palette.push(this.blendColors(baseColor, "#000000", factor, "oklch"));
    }
    return palette;
  }
  /**
   * Creates a complementary color (opposite on the color wheel)
   * @param color - Base color
   * @returns Complementary color string
   */
  complementary(color) {
    return this.blendColors(color, "hsl(180deg 100% 50%)", 1, "hsl");
  }
  /**
   * Creates analogous colors (adjacent on the color wheel)
   * @param color - Base color
   * @param angle - Angle of separation in degrees
   * @returns Tuple of two analogous color strings
   */
  analogous(color, angle = 30) {
    return [
      this.blendColors(color, `hsl(${-angle}deg 100% 50%)`, 1, "hsl"),
      this.blendColors(color, `hsl(${angle}deg 100% 50%)`, 1, "hsl")
    ];
  }
  /**
   * Creates a triadic color scheme (three colors evenly spaced on the color wheel)
   * @param color - Base color
   * @returns Tuple of two additional colors to form a triadic scheme
   */
  triadic(color) {
    return [
      this.blendColors(color, "hsl(120deg 100% 50%)", 1, "hsl"),
      this.blendColors(color, "hsl(240deg 100% 50%)", 1, "hsl")
    ];
  }
  /**
   * Increases the saturation of a color
   * @param color - Base color
   * @param amount - Amount to saturate (percentage)
   * @returns Saturated color string
   */
  saturate(color, amount) {
    return this.blendColors(
      color,
      "hsl(0deg 100% 50% / 0%)",
      amount / 100,
      "hsl"
    );
  }
  /**
   * Lightens a color by mixing with white
   * @param color - Base color
   * @param amount - Amount to lighten (percentage)
   * @returns Lightened color string
   */
  lighten(color, amount) {
    return this.blendColors(color, "white", amount / 100, "hsl");
  }
  /**
   * Darkens a color by mixing with black
   * @param color - Base color
   * @param amount - Amount to darken (percentage)
   * @returns Darkened color string
   */
  darken(color, amount) {
    return this.blendColors(color, "black", amount / 100, "hsl");
  }
};
var Color_default = Color;

// src/elements/Easing.tsx
var Easing = class {
  constructor(ctx) {
    this.normalize = (val) => {
      return val * 0.5 + 0.5;
    };
    this.expand = (val) => {
      return val * 2 - 1;
    };
    this.inout = (val, power = 2) => {
      const m = val - 1;
      const t = val * 2;
      if (t < 1) {
        return val * Math.pow(t, power - 1);
      }
      return power % 2 === 0 ? 1 - Math.pow(m, power) * Math.pow(2, power - 1) : 1 + Math.pow(m, power) * Math.pow(2, power - 1);
    };
    this.in = (val, power = 2) => {
      return Math.pow(val, power);
    };
    this.out = (val, power = 2) => {
      const m = val - 1;
      return power % 2 === 0 ? 1 - Math.pow(m, power) : 1 + Math.pow(m, power);
    };
    this.overshootIn = (val) => {
      const k = 1.70158;
      return val * val * (val * (k + 1) - k);
    };
    this.overshootOut = (val) => {
      const m = val - 1;
      const k = 1.70158;
      return 1 + m * m * (m * (k + 1) + k);
    };
    this.overshootInOut = (val) => {
      const m = val - 1;
      const t = val * 2;
      const k = 1.70158 * 1.525;
      if (val < 0.5) return val * t * (t * (k + 1) - k);
      return 1 + 2 * m * m * (2 * m * (k + 1) + k);
    };
    this.bounceOut = (val) => {
      const r = 1 / 2.75;
      const k1 = r;
      const k2 = 2 * r;
      const k3 = 1.5 * r;
      const k4 = 2.5 * r;
      const k5 = 2.25 * r;
      const k6 = 2.625 * r;
      const k0 = 7.5625;
      let t;
      if (val < k1) {
        return k0 * val * val;
      } else if (val < k2) {
        t = val - k3;
        return k0 * t * t + 0.75;
      } else if (val < k4) {
        t = val - k5;
        return k0 * t * t + 0.9375;
      }
      t = val - k6;
      return k0 * t * t + 0.984375;
    };
    this.bounceIn = (val) => {
      return 1 - this.bounceOut(1 - val);
    };
    this.bounceInOut = (val) => {
      const t = val * 2;
      if (t < 1) return 0.5 - 0.5 * this.bounceOut(1 - t);
      return 0.5 + 0.5 * this.bounceOut(t - 1);
    };
    this.elasticIn = (val) => {
      const m = val - 1;
      return -Math.pow(2, 10 * m) * Math.sin((m * 40 - 3) * Math.PI / 6);
    };
    this.elasticOut = (val) => {
      return 1 + Math.pow(2, 10 * -val) * Math.sin((-val * 40 - 3) * Math.PI / 6);
    };
    this.elasticInOut = (val) => {
      const s = 2 * val - 1;
      const k = (80 * s - 9) * Math.PI / 18;
      if (s < 0) return -0.5 * Math.pow(2, 10 * s) * Math.sin(k);
      return 1 + 0.5 * Math.pow(2, -10 * s) * Math.sin(k);
    };
    this.smoothstep = (val, x0 = 0, x1 = 1) => {
      let p = (val - x0) / (x1 - x0);
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      return p * p * (3 - 2 * p);
    };
    this.log = () => {
      console.log(this);
    };
    this.context = ctx;
  }
};
var Easing_default = Easing;

// src/elements/State.tsx
var State = class {
  constructor() {
    this.store = /* @__PURE__ */ new Map();
  }
  set(key, value, callback) {
    this.store.set(key, value);
    callback?.(key, value);
  }
  get(key, callback) {
    const value = this.store.get(key);
    callback?.(key, value);
    return value;
  }
  has(key) {
    return this.store.has(key);
  }
  delete(key, callback) {
    this.store.delete(key);
    callback?.(key);
  }
  log() {
    return this.store;
  }
};
var State_default = State;

// src/elements/Vector.tsx
var Vector = class _Vector {
  /**
   * Creates a new Vector
   * @param x - X-coordinate (default: 0)
   * @param y - Y-coordinate (default: 0)
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  /**
   * Adds another vector to this vector
   * @param v - Vector to add
   * @returns This vector after addition
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  /**
   * Subtracts another vector from this vector
   * @param v - Vector to subtract
   * @returns This vector after subtraction
   */
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  /**
   * Multiplies this vector by a scalar
   * @param n - Scalar to multiply by
   * @returns This vector after multiplication
   */
  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }
  /**
   * Divides this vector by a scalar
   * @param n - Scalar to divide by
   * @returns This vector after division
   */
  div(n) {
    this.x /= n;
    this.y /= n;
    return this;
  }
  // to do : project, perp, slerp
  /**
   * Rotates this vector by an angle
   * @param angle - Angle in radians
   * @returns This vector after rotation
   */
  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }
  /**
   * Calculates the magnitude (length) of this vector
   * @returns The magnitude of the vector
   */
  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  /**
   * Alias for mag() - calculates the length of this vector
   * @returns The length of the vector
   */
  length() {
    return this.mag();
  }
  /**
   * Calculates the dot product of this vector with another vector
   * @param v - The other vector
   * @returns The dot product
   */
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  /**
   * Calculates the distance between this vector and another vector
   * @param v - The other vector
   * @returns The distance between the vectors
   */
  dist(v) {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }
  /**
   * Calculates the angle of this vector
   * @returns The angle in radians
   */
  angle() {
    return Math.atan2(-this.x, -this.y) + Math.PI;
  }
  /**
   * Creates a copy of this vector
   * @returns A new Vector with the same coordinates
   */
  copy() {
    return new _Vector(this.x, this.y);
  }
  /**
   * Normalizes this vector (sets its magnitude to 1)
   * @returns This vector after normalization
   */
  normalize() {
    const m = this.mag();
    return m !== 0 ? this.div(m) : this;
  }
  /**
   * Sets the coordinates of this vector
   * @param x - New X-coordinate
   * @param y - New Y-coordinate
   * @returns This vector after setting coordinates
   */
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  /**
   * Creates a new vector at a specified angle and distance from a center point
   * @param center - The center point vector
   * @param a - The angle in radians
   * @param r - The radius (distance from center)
   * @returns A new Vector at the calculated position
   */
  static fromAngle(center, a, r) {
    const x = Math.cos(a) * r + center.x;
    const y = Math.sin(a) * r + center.y;
    return new _Vector(x, y);
  }
};
var Vector_default = Vector;

// src/elements/Time.tsx
var Time = class {
  constructor(ctx) {
    this.timelines = /* @__PURE__ */ new Map();
    this.currentTimeline = "default";
    this.DEFAULT_DURATION = 8 * 60;
    this.staggers = [];
    this.context = ctx;
    this.timelines.set("default", {
      progress: 0,
      duration: this.DEFAULT_DURATION
    });
  }
  timeline(key) {
    if (!this.timelines.has(key)) {
      this.timelines.set(key, { progress: 0, duration: this.DEFAULT_DURATION });
    }
    this.currentTimeline = key;
    return this;
  }
  use(progress) {
    const timeline = this.timelines.get(this.currentTimeline);
    if (timeline.duration <= 0) {
      timeline.progress = 0;
      return this;
    }
    timeline.progress = timeline.duration === 1 ? Math.min(progress, 1) : progress / timeline.duration % 1;
    return this;
  }
  for(duration) {
    const timeline = this.timelines.get(this.currentTimeline);
    timeline.duration = duration;
    return this;
  }
  stagger(num, offset = 0, callback) {
    const timeline = this.timelines.get(this.currentTimeline);
    const totalduration = this.context.remap(
      timeline.progress,
      0,
      1,
      0,
      1 + offset
    );
    for (let i = 0; i < num; i++) {
      const id = 1 - i / (num - 1);
      const progress = this.context.constrain(
        totalduration - id * offset,
        0,
        1
      );
      if (!callback) {
        if (this.staggers[i]) {
          this.staggers[i].progress = progress;
        } else {
          this.staggers[i] = { progress, id };
        }
      } else {
        callback?.(progress, id, num);
      }
    }
    return callback ? this : this.staggers;
  }
  between(from = 0, to = 1, callback) {
    const timeline = this.timelines.get(this.currentTimeline);
    const localProgress = this.context.remap(
      timeline.progress,
      Math.max(0, from),
      Math.min(1, to),
      0,
      1
    );
    callback(localProgress);
    return this;
  }
  progress() {
    return this.timelines.get(this.currentTimeline)?.progress || 0;
  }
};
var Time_default = Time;

// src/elements/Text.tsx
var Text = class {
  constructor(ctx) {
    this.findTextSize = (text, dist, estimate, direction = "x") => {
      let low = 1;
      let high = estimate || this.context.__textSize * 2;
      let lastValidSize = low;
      for (let i = 0; i < 16; i++) {
        const mid = Math.floor((low + high) / 2);
        this.context.__textSize = mid;
        const bounds = this.textBounds(text);
        const size = direction === "x" ? bounds.width : bounds.height;
        if (size === dist) {
          return mid;
        } else if (size < dist) {
          lastValidSize = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      return lastValidSize;
    };
    this.getTextMetrics = (text) => {
      const ctx = this.context;
      const metrics = ctx.measureText(text);
      return {
        width: metrics.width,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
        baseline: metrics.actualBoundingBoxAscent
      };
    };
    this.splitTo = (text, kind, options = {}) => {
      const ctx = this.context;
      const {
        maxWidth = 0,
        lineSpacing = 0,
        letterSpacing = 0,
        wordSpacing = 0
      } = options;
      ctx.computeFont();
      if (maxWidth < this.textBounds(" ").width * 2 && maxWidth !== 0) {
        return [];
      }
      const lines = text.split("\n");
      const lineHeights = lines.map((line) => this.getTextMetrics(line).height);
      const totalHeight = lineHeights.reduce((sum, height) => sum + height, 0) + (lines.length - 1) * (lineSpacing || 0);
      let y = ctx.textBaseline === "middle" ? -totalHeight / 2 : 0;
      return lines.flatMap((lineText, lineIndex) => {
        const words = lineText.split(" ");
        const currentLine = {
          text: "",
          width: 0,
          letters: []
        };
        const totalWidth = this.getTextMetrics(lineText).width;
        let startX = 0;
        switch (ctx.textAlign) {
          case "center":
            startX = -totalWidth / 2;
            break;
          case "right":
            startX = -totalWidth;
            break;
        }
        let x = startX;
        let letterIndex = 0;
        let wordIndex = 0;
        const lineLetters = words.flatMap((word) => {
          const letters = [];
          for (const char of word) {
            const charMetrics = this.getTextMetrics(char);
            x += charMetrics.width / 2;
            const letterData = {
              char,
              x,
              y: y + (ctx.textBaseline === "middle" ? lineHeights[lineIndex] / 2 : 0),
              metrics: charMetrics,
              ...kind === "all" && {
                letterIndex,
                wordIndex,
                lineIndex
              }
            };
            letters.push(letterData);
            currentLine.text += char;
            x += charMetrics.width / 2 + letterSpacing;
            letterIndex++;
          }
          if (wordIndex < words.length - 1) {
            const spaceMetrics = this.getTextMetrics(" ");
            x += spaceMetrics.width + wordSpacing;
            letters.push({
              char: " ",
              x,
              y,
              metrics: spaceMetrics,
              ...kind === "all" && {
                letterIndex,
                wordIndex,
                lineIndex
              }
            });
            currentLine.text += " ";
            letterIndex++;
          }
          wordIndex++;
          return letters;
        });
        const lineHeight = lineHeights[lineIndex];
        y += lineHeight + lineSpacing;
        return lineLetters;
      });
    };
    this.circularText = (text, radius = 100, fill = "fill", offset = 0, arc = Math.PI * 2) => {
      const totalAngle = Math.min(Math.max(arc, 0), Math.PI * 2);
      if (fill === "fill") {
        const chars = text.split("");
        const anglePerChar = totalAngle / (chars.length + 1);
        chars.forEach((char, i) => {
          const angle = anglePerChar * i + offset;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          this.context.push();
          this.context.textAlign = "center";
          this.context.translate(x, y);
          this.context.rotate(angle + Math.PI / 2);
          this.context.text(char, 0, 0);
          this.context.pop();
        });
      } else if (fill === "kerned") {
        let currentAngle = offset;
        text.split("").forEach((char) => {
          const charWidth = this.textBounds(char).width;
          currentAngle += charWidth / radius * 0.5;
          const angle = currentAngle;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          this.context.push();
          this.context.textAlign = "center";
          this.context.translate(x, y);
          this.context.rotate(angle + Math.PI / 2);
          this.context.text(char, 0, 0);
          this.context.pop();
          currentAngle += charWidth / radius * 0.5;
        });
      } else if (fill === "words") {
        const words = text.split(" ");
        const wordMetrics = words.map((word) => ({
          word,
          width: this.textBounds(word).width
        }));
        const spaceCount = words.length;
        const totalWordWidth = wordMetrics.reduce((sum, m) => sum + m.width, 0);
        const spaceAngle = (totalAngle - totalWordWidth / radius) / spaceCount;
        let currentAngle = offset;
        wordMetrics.forEach(({ word }, i) => {
          word.split("").forEach((char) => {
            const charWidth = this.textBounds(char).width;
            currentAngle += charWidth / radius * 0.5;
            const x = Math.cos(currentAngle) * radius;
            const y = Math.sin(currentAngle) * radius;
            this.context.push();
            this.context.textAlign = "center";
            this.context.translate(x, y);
            this.context.rotate(currentAngle + Math.PI / 2);
            this.context.text(char, 0, 0);
            this.context.pop();
            currentAngle += charWidth / radius * 0.5;
          });
          if (i < words.length - 1) {
            currentAngle += spaceAngle;
          }
        });
      }
    };
    this.textBounds = (text) => {
      if (this.context.font !== this.context.__computedTextFont) {
        this.context.font = this.context.__computedTextFont;
      }
      const metrics = this.context.measureText(text);
      return {
        x: metrics.actualBoundingBoxLeft * -1,
        y: metrics.actualBoundingBoxAscent * -1,
        width: metrics.width,
        height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
      };
    };
    this.log = () => {
      console.log(this.context);
    };
    this.context = ctx;
  }
};
var Text_default = Text;

// src/elements/Thing.tsx
var Thing = class {
  constructor(ctx) {
    this.context = ctx;
  }
  log() {
    console.log(this.context);
  }
};
var Thing_default = Thing;

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
      context.Color = ctx.Color;
      context.createVector = (x = 0, y = 0) => new Vector_default(x, y);
      context.Easing = ctx.Easing;
      context.Text = ctx.Text;
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
var DEFAULT_GESTURE_STATE = {
  active: false,
  touches: null,
  startTouches: null,
  startDistance: 0,
  currentDistance: 0,
  scale: 1,
  rotation: 0,
  startTime: 0,
  deltaX: 0,
  deltaY: 0,
  velocityX: 0,
  velocityY: 0,
  lastTime: 0,
  lastX: 0,
  lastY: 0
};
function useKlint() {
  const contextRef = useRef2(null);
  const mouseRef = useRef2(null);
  const scrollRef = useRef2(null);
  const gestureRef = useRef2(null);
  const useDev = () => {
    return;
  };
  const KlintImage = () => {
    const imagesRef = useRef2(/* @__PURE__ */ new Map());
    const loadImage = useCallback2(
      async (key, url, options) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            imagesRef.current.set(key, img);
            resolve(img);
          };
          img.onerror = reject;
          img.crossOrigin = options?.crossOrigin || "anonymous";
          img.src = url;
        });
      },
      []
    );
    const loadImages = useCallback2(
      async (imageMap, options) => {
        const promises = Object.entries(imageMap).map(
          ([key, url]) => loadImage(key, url, options).then(
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
  const KlintGesture = () => {
    if (!gestureRef.current) {
      gestureRef.current = { ...DEFAULT_GESTURE_STATE };
    }
    const tapCallbackRef = useRef2(null);
    const swipeCallbackRef = useRef2(null);
    const pinchCallbackRef = useRef2(null);
    const rotateCallbackRef = useRef2(null);
    const touchStartCallbackRef = useRef2(null);
    const touchMoveCallbackRef = useRef2(null);
    const touchEndCallbackRef = useRef2(null);
    useEffect2(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;
      const getDistance = (t1, t2) => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      };
      const getAngle = (t1, t2) => {
        return Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180 / Math.PI;
      };
      const getTouchCenter = (touches) => {
        if (touches.length === 1) {
          return {
            x: touches[0].clientX,
            y: touches[0].clientY
          };
        }
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < touches.length; i++) {
          sumX += touches[i].clientX;
          sumY += touches[i].clientY;
        }
        return {
          x: sumX / touches.length,
          y: sumY / touches.length
        };
      };
      const handleTouchStart = (e) => {
        if (!gestureRef.current) return;
        const now = performance.now();
        const touchCenter = getTouchCenter(e.touches);
        gestureRef.current.active = true;
        gestureRef.current.touches = e.touches;
        gestureRef.current.startTouches = e.touches;
        gestureRef.current.startTime = now;
        gestureRef.current.lastTime = now;
        gestureRef.current.lastX = touchCenter.x;
        gestureRef.current.lastY = touchCenter.y;
        gestureRef.current.deltaX = 0;
        gestureRef.current.deltaY = 0;
        gestureRef.current.velocityX = 0;
        gestureRef.current.velocityY = 0;
        if (e.touches.length >= 2) {
          gestureRef.current.startDistance = getDistance(
            e.touches[0],
            e.touches[1]
          );
          gestureRef.current.currentDistance = gestureRef.current.startDistance;
          gestureRef.current.scale = 1;
          gestureRef.current.rotation = getAngle(e.touches[0], e.touches[1]);
        }
        if (touchStartCallbackRef.current) {
          touchStartCallbackRef.current(ctx, e, gestureRef.current);
        }
      };
      const handleTouchMove = (e) => {
        if (!gestureRef.current || !gestureRef.current.active) return;
        const now = performance.now();
        const deltaTime = now - gestureRef.current.lastTime;
        const touchCenter = getTouchCenter(e.touches);
        gestureRef.current.touches = e.touches;
        gestureRef.current.deltaX = touchCenter.x - gestureRef.current.lastX;
        gestureRef.current.deltaY = touchCenter.y - gestureRef.current.lastY;
        if (deltaTime > 0) {
          gestureRef.current.velocityX = gestureRef.current.deltaX / deltaTime;
          gestureRef.current.velocityY = gestureRef.current.deltaY / deltaTime;
        }
        gestureRef.current.lastTime = now;
        gestureRef.current.lastX = touchCenter.x;
        gestureRef.current.lastY = touchCenter.y;
        if (e.touches.length >= 2) {
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          gestureRef.current.currentDistance = currentDistance;
          if (gestureRef.current.startDistance > 0) {
            gestureRef.current.scale = currentDistance / gestureRef.current.startDistance;
          }
          const currentAngle = getAngle(e.touches[0], e.touches[1]);
          const startAngle = gestureRef.current.rotation;
          gestureRef.current.rotation = currentAngle - startAngle;
          if (pinchCallbackRef.current) {
            pinchCallbackRef.current(ctx, e, gestureRef.current);
          }
          if (rotateCallbackRef.current && Math.abs(gestureRef.current.rotation) > 5) {
            rotateCallbackRef.current(ctx, e, gestureRef.current);
          }
        }
        if (touchMoveCallbackRef.current) {
          touchMoveCallbackRef.current(ctx, e, gestureRef.current);
        }
      };
      const handleTouchEnd = (e) => {
        if (!gestureRef.current || !gestureRef.current.active || !gestureRef.current.startTouches)
          return;
        const now = performance.now();
        const touchDuration = now - gestureRef.current.startTime;
        if (touchDuration < 300 && Math.abs(gestureRef.current.deltaX) < 10 && Math.abs(gestureRef.current.deltaY) < 10) {
          if (tapCallbackRef.current) {
            tapCallbackRef.current(ctx, e, gestureRef.current);
          }
        }
        const swipeThreshold = 50;
        const isHorizontalSwipe = Math.abs(gestureRef.current.deltaX) > Math.abs(gestureRef.current.deltaY);
        if (swipeCallbackRef.current && touchDuration < 300) {
          if (isHorizontalSwipe && Math.abs(gestureRef.current.deltaX) > swipeThreshold) {
            const direction = gestureRef.current.deltaX > 0 ? "right" : "left";
            swipeCallbackRef.current(ctx, e, gestureRef.current, direction);
          } else if (!isHorizontalSwipe && Math.abs(gestureRef.current.deltaY) > swipeThreshold) {
            const direction = gestureRef.current.deltaY > 0 ? "down" : "up";
            swipeCallbackRef.current(ctx, e, gestureRef.current, direction);
          }
        }
        if (touchEndCallbackRef.current) {
          touchEndCallbackRef.current(ctx, e, gestureRef.current);
        }
        if (e.touches.length === 0) {
          gestureRef.current.active = false;
        }
      };
      const handleTouchCancel = (e) => {
        if (!gestureRef.current) return;
        gestureRef.current.active = false;
        if (touchEndCallbackRef.current) {
          touchEndCallbackRef.current(ctx, e, gestureRef.current);
        }
      };
      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false
      });
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      canvas.addEventListener("touchend", handleTouchEnd);
      canvas.addEventListener("touchcancel", handleTouchCancel);
      return () => {
        canvas.removeEventListener("touchstart", handleTouchStart);
        canvas.removeEventListener("touchmove", handleTouchMove);
        canvas.removeEventListener("touchend", handleTouchEnd);
        canvas.removeEventListener("touchcancel", handleTouchCancel);
      };
    }, []);
    return {
      gesture: gestureRef.current,
      onTap: (callback) => tapCallbackRef.current = callback,
      onSwipe: (callback) => swipeCallbackRef.current = callback,
      onPinch: (callback) => pinchCallbackRef.current = callback,
      onRotate: (callback) => rotateCallbackRef.current = callback,
      onTouchStart: (callback) => touchStartCallbackRef.current = callback,
      onTouchMove: (callback) => touchMoveCallbackRef.current = callback,
      onTouchEnd: (callback) => touchEndCallbackRef.current = callback
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
    context.Color = new Color_default();
    context.createVector = (x = 0, y = 0) => new Vector_default(x, y);
    context.Easing = new Easing_default(context);
    context.State = new State_default();
    context.Time = new Time_default(context);
    context.Text = new Text_default(context);
    context.Thing = new Thing_default(context);
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
    KlintGesture,
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
