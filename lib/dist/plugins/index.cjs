"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/plugins/index.tsx
var plugins_exports = {};
__export(plugins_exports, {
  Color: () => Color_default,
  Easing: () => Easing_default,
  SVGfont: () => SVGfont_default,
  State: () => State_default,
  Text: () => Text_default,
  Thing: () => Thing_default,
  Time: () => Time_default,
  Vector: () => Vector_default
});
module.exports = __toCommonJS(plugins_exports);

// src/plugins/Color.tsx
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

// src/plugins/Easing.tsx
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
      if (val < 0.5)
        return val * t * (t * (k + 1) - k);
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
      if (t < 1)
        return 0.5 - 0.5 * this.bounceOut(1 - t);
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
      if (s < 0)
        return -0.5 * Math.pow(2, 10 * s) * Math.sin(k);
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

// src/plugins/SVGfont.tsx
var SVGfont = class {
  constructor(context) {
    this.context = context;
    this.font = "";
    this.SCALE = 1;
    this.targetXHeight = 256;
    this.metrics = {
      fontFamily: "",
      fontWeight: "",
      unitsPerEm: 0,
      ascent: 0,
      descent: 0,
      xHeight: 0,
      capHeight: 0
    };
    this.glyphs = /* @__PURE__ */ new Map();
    this.context = context;
  }
  parse(font, desiredXHeight = 256) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(font, "text/xml");
    const fontFace = doc.querySelector("font-face");
    if (fontFace) {
      this.metrics.fontFamily = fontFace.getAttribute("font-family") || "";
      this.metrics.fontWeight = fontFace.getAttribute("font-weight") || "";
      this.metrics.unitsPerEm = parseInt(
        fontFace.getAttribute("units-per-em") || "0"
      );
      this.metrics.ascent = parseInt(fontFace.getAttribute("ascent") || "0");
      this.metrics.descent = parseInt(fontFace.getAttribute("descent") || "0");
      this.metrics.xHeight = parseInt(fontFace.getAttribute("x-height") || "0");
      this.metrics.capHeight = parseInt(
        fontFace.getAttribute("cap-height") || "0"
      );
    }
    this.targetXHeight = desiredXHeight;
    this.SCALE = this.targetXHeight / this.metrics.xHeight;
    const glyphElements = doc.querySelectorAll("glyph");
    const basicCharRegex = /^[\w]$/;
    const commonGlyphNames = /* @__PURE__ */ new Set([
      "space",
      "period",
      "comma",
      "hyphen",
      "exclam",
      "question",
      "slash",
      "less",
      "greater",
      "parenleft",
      "parenright",
      "braceleft",
      "braceright",
      "bracketleft",
      "bracketright"
    ]);
    glyphElements.forEach((glyph) => {
      const character = glyph.getAttribute("glyph-name");
      const unicode = glyph.getAttribute("unicode");
      if (!character || !unicode || !basicCharRegex.test(character) && !commonGlyphNames.has(character) && character.length > 1)
        return;
      const horizAdvX = parseInt(glyph.getAttribute("horiz-adv-x") || "0");
      let pathData = glyph.getAttribute("d");
      if (pathData) {
        pathData = pathData.replace(
          /[-+]?\d*\.?\d+/g,
          (match) => (parseFloat(match) * this.SCALE).toString()
        );
      }
      const glyphData = {
        name: character,
        unicode,
        horizAdvX: horizAdvX * this.SCALE,
        d: pathData || void 0
      };
      this.glyphs.set(unicode, glyphData);
    });
    if (!this.glyphs.has(" ")) {
      this.glyphs.set(" ", {
        name: "space",
        unicode: " ",
        horizAdvX: this.metrics.unitsPerEm * this.SCALE * 0.25,
        // typical space width
        d: void 0
      });
    }
  }
  toJSON() {
    return {
      metrics: this.metrics,
      glyphs: Array.from(this.glyphs.entries()).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {})
    };
  }
  getPoints(text, options) {
    const {
      factor,
      align = "left",
      center = "alphabetic",
      letterSpacing = 0
    } = options;
    const points = [];
    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    const path = document.createElementNS(svgns, "path");
    svg.appendChild(path);
    let totalWidth = 0;
    const chars = text.split("");
    chars.forEach((char, i) => {
      const glyph = this.glyphs.get(char);
      if (glyph) {
        totalWidth += glyph.horizAdvX;
        if (i < chars.length - 1)
          totalWidth += letterSpacing;
      }
    });
    let currentX = 0;
    if (align === "center") {
      currentX = -totalWidth / 2;
    } else if (align === "right") {
      currentX = -totalWidth;
    }
    console.log(this.SCALE);
    let yOffset = 0;
    switch (center) {
      case "middle":
        yOffset = -((this.metrics.ascent - this.metrics.descent) / 2) * this.SCALE * 0.5;
        break;
      case "top":
        yOffset = this.metrics.ascent * this.SCALE;
        break;
      case "alphabetic":
      default:
        yOffset = 0;
        break;
    }
    for (const char of chars) {
      const glyph = this.glyphs.get(char);
      if (!glyph)
        continue;
      if (!glyph.d) {
        currentX += glyph.horizAdvX + letterSpacing;
        continue;
      }
      path.setAttribute("d", glyph.d);
      const subpaths = glyph.d.split(/(?=[Mm])/);
      const glyphContours = [];
      for (const subpath of subpaths) {
        if (!subpath.trim())
          continue;
        path.setAttribute("d", subpath);
        const pathLength = path.getTotalLength();
        const numPoints = Math.max(10, Math.floor(pathLength * factor));
        const contourPoints = [];
        const step = pathLength / (numPoints - 1);
        for (let i = 0; i < numPoints; i++) {
          const point = path.getPointAtLength(i * step);
          contourPoints.push({
            x: point.x + currentX,
            y: -(point.y + yOffset)
            // Apply vertical offset
          });
        }
        if (subpath.toLowerCase().includes("z")) {
          contourPoints.push({ ...contourPoints[0] });
        }
        glyphContours.push(contourPoints);
      }
      glyphContours.sort((a, b) => b.length - a.length);
      for (let i = 1; i < glyphContours.length; i++) {
        glyphContours[i].reverse();
      }
      points.push(glyphContours);
      currentX += glyph.horizAdvX + letterSpacing;
    }
    svg.remove();
    return points;
  }
  flatten(points, displacement) {
    return points.flatMap(
      (glyph) => glyph.flatMap(
        (contour, contourIndex) => contour.map((point) => {
          if (displacement) {
            return displacement({
              point,
              position: point,
              groupIndex: contourIndex,
              letterSpacing: 0
            });
          }
          return point;
        })
      )
    );
  }
  draw(points, displacement) {
    for (const glyph of points) {
      this.context.beginShape();
      glyph.forEach((contour, contourIndex) => {
        if (contourIndex !== 0) {
          this.context.beginContour();
        }
        contour.forEach((point) => {
          if (displacement) {
            const { x, y } = displacement({
              point,
              position: point,
              groupIndex: contourIndex,
              letterSpacing: 0
              // You can add letter spacing logic here
            });
            this.context.vertex(x, y);
          } else {
            this.context.vertex(point.x, point.y);
          }
        });
        if (contourIndex !== 0) {
          this.context.endContour();
        }
      });
      this.context.endShape(true);
    }
  }
};
var SVGfont_default = SVGfont;

// src/plugins/State.tsx
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

// src/plugins/Vector.tsx
var Vector = class {
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
    return new Vector(this.x, this.y);
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
    return new Vector(x, y);
  }
};
var Vector_default = Vector;

// src/plugins/Time.tsx
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

// src/plugins/Text.tsx
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

// src/plugins/Thing.tsx
var Thing = class {
  constructor(ctx) {
    this.context = ctx;
  }
  log() {
    console.log(this.context);
  }
};
var Thing_default = Thing;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Color,
  Easing,
  SVGfont,
  State,
  Text,
  Thing,
  Time,
  Vector
});
