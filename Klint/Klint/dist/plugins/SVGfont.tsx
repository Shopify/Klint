// import { KlintOffscreenContext, KlintContext } from "../component/KlintTypes";
import { KlintContexts } from "../component/Klint";
declare module "../component/Klint" {
  interface KlintPlugins {
    SVGfont: SVGfont;
  }
}

export type SVGFontPaths = Array<Array<Array<{ x: number; y: number }>>>;

interface FontMetrics {
  fontFamily: string;
  fontWeight: string;
  unitsPerEm: number;
  ascent: number;
  descent: number;
  xHeight: number;
  capHeight: number;
}

interface GlyphMetrics {
  name: string;
  unicode: string;
  horizAdvX: number;
  d?: string; // Path data (we'll parse this later)
}

interface KlintSVGfont {
  context: KlintContexts;
  metrics: FontMetrics;
  glyphs: Map<string, GlyphMetrics>;
  parse(font: string): void;
}

interface PointOptions {
  factor: number; // between 0 and 1, controls sampling density
  align?: "center" | "left" | "right";
  center?: "alphabetic" | "middle" | "top";
  letterSpacing?: number;
  treshold?: number;
}

interface DisplacementParams {
  point: { x: number; y: number };
  position: { x: number; y: number };
  groupIndex: number;
  letterSpacing: number;
}

interface DisplacementCallback {
  (params: DisplacementParams): { x: number; y: number };
}

class SVGfont implements KlintSVGfont {
  public readonly metrics: FontMetrics;
  public readonly glyphs: Map<string, GlyphMetrics>;
  private font: string = "";
  private SCALE: number = 1;
  private targetXHeight: number = 256;
  constructor(public readonly context: KlintContexts) {
    this.metrics = {
      fontFamily: "",
      fontWeight: "",
      unitsPerEm: 0,
      ascent: 0,
      descent: 0,
      xHeight: 0,
      capHeight: 0,
    };
    this.glyphs = new Map();
    this.context = context;
  }

  parse(font: string, desiredXHeight: number = 256): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(font, "text/xml");

    // Parse font metrics from font-face
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

    // Calculate the scale factor based on x-height
    this.targetXHeight = desiredXHeight;
    this.SCALE = this.targetXHeight / this.metrics.xHeight;

    // Parse glyphs
    const glyphElements = doc.querySelectorAll("glyph");
    const basicCharRegex = /^[\w]$/;
    const commonGlyphNames = new Set([
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
      "bracketright",
    ]);
    glyphElements.forEach((glyph) => {
      const character = glyph.getAttribute("glyph-name");
      const unicode = glyph.getAttribute("unicode");
      // Skip if not a basic character or diacritic
      if (
        !character ||
        !unicode ||
        (!basicCharRegex.test(character) &&
          !commonGlyphNames.has(character) &&
          character.length > 1)
      )
        return;

      const horizAdvX = parseInt(glyph.getAttribute("horiz-adv-x") || "0");
      let pathData = glyph.getAttribute("d");

      // Scale down the path if it exists
      if (pathData) {
        pathData = pathData.replace(/[-+]?\d*\.?\d+/g, (match) =>
          (parseFloat(match) * this.SCALE).toString()
        );
      }

      const glyphData: GlyphMetrics = {
        name: character,
        unicode: unicode,
        horizAdvX: horizAdvX * this.SCALE,
        d: pathData || undefined,
      };

      this.glyphs.set(unicode, glyphData);
    });

    // Add explicit space character if not present
    if (!this.glyphs.has(" ")) {
      this.glyphs.set(" ", {
        name: "space",
        unicode: " ",
        horizAdvX: this.metrics.unitsPerEm * this.SCALE * 0.25, // typical space width
        d: undefined,
      });
    }
  }

  toJSON() {
    return {
      metrics: this.metrics,
      glyphs: Array.from(this.glyphs.entries()).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {} as Record<string, GlyphMetrics>),
    };
  }

  getPoints(
    text: string,
    options: PointOptions
  ): Array<Array<Array<{ x: number; y: number }>>> {
    const {
      factor,
      align = "left",
      center = "alphabetic",
      letterSpacing = 0,
    } = options;
    const points: Array<Array<Array<{ x: number; y: number }>>> = [];

    const svgns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgns, "svg");
    const path = document.createElementNS(svgns, "path");
    svg.appendChild(path);

    // Calculate total width for alignment
    let totalWidth = 0;
    const chars = text.split("");
    chars.forEach((char, i) => {
      const glyph = this.glyphs.get(char);
      if (glyph) {
        totalWidth += glyph.horizAdvX;
        if (i < chars.length - 1) totalWidth += letterSpacing;
      }
    });

    // Calculate starting X based on alignment
    let currentX = 0;
    if (align === "center") {
      currentX = -totalWidth / 2;
    } else if (align === "right") {
      currentX = -totalWidth;
    }
    console.log(this.SCALE);
    // Calculate Y offset based on vertical alignment
    let yOffset = 0;
    switch (center) {
      case "middle":
        yOffset =
          -((this.metrics.ascent - this.metrics.descent) / 2) *
          this.SCALE *
          0.5;
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
      if (!glyph) continue;

      // Handle whitespace and characters without paths
      if (!glyph.d) {
        currentX += glyph.horizAdvX + letterSpacing;
        continue;
      }

      path.setAttribute("d", glyph.d);

      const subpaths = glyph.d.split(/(?=[Mm])/);
      const glyphContours: Array<Array<{ x: number; y: number }>> = [];

      for (const subpath of subpaths) {
        if (!subpath.trim()) continue;

        path.setAttribute("d", subpath);
        const pathLength = path.getTotalLength();
        const numPoints = Math.max(10, Math.floor(pathLength * factor));
        const contourPoints: Array<{ x: number; y: number }> = [];

        const step = pathLength / (numPoints - 1);
        for (let i = 0; i < numPoints; i++) {
          const point = path.getPointAtLength(i * step);
          contourPoints.push({
            x: point.x + currentX,
            y: -(point.y + yOffset), // Apply vertical offset
          });
        }

        if (subpath.toLowerCase().includes("z")) {
          contourPoints.push({ ...contourPoints[0] });
        }

        glyphContours.push(contourPoints);
      }

      // Sort contours by length (longest first) and reverse inner contours
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

  flatten(
    points: SVGFontPaths,
    displacement?: DisplacementCallback
  ): Array<{ x: number; y: number }> {
    return points.flatMap((glyph) =>
      glyph.flatMap((contour, contourIndex) =>
        contour.map((point) => {
          if (displacement) {
            return displacement({
              point,
              position: point,
              groupIndex: contourIndex,
              letterSpacing: 0,
            });
          }
          return point;
        })
      )
    );
  }

  draw(points: SVGFontPaths, displacement?: DisplacementCallback) {
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
              letterSpacing: 0, // You can add letter spacing logic here
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
}

export default SVGfont;
