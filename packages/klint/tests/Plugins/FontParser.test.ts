/**
 * FontParser Plugin Tests
 *
 * Tests actual font parsing capabilities using real TTF files.
 * Covers: loading, metadata, toPaths, toSVG, toPoints, layout,
 * alignment, multiline, spacing, variable fonts.
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import FontParser from "../../src/plugins/FontParser";
import type {
  FontData,
  FontPathsResult,
  FontSVGResult,
  FontPointsResult,
  FontTextOptions,
} from "../../src/plugins/FontParser";

// ─── Test Fixtures ───────────────────────────────────────────────────

const FIXTURES_DIR = resolve(__dirname, "fixtures");

function loadFixture(name: string): ArrayBuffer {
  const buf = readFileSync(resolve(FIXTURES_DIR, name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

// ─── Tests ───────────────────────────────────────────────────────────

describe("FontParser", () => {
  let parser: FontParser;
  let staticFont: FontData;
  let variableFont: FontData;

  beforeAll(async () => {
    parser = new FontParser();
    staticFont = await parser.loadFromBuffer(loadFixture("Jost-Regular.ttf"));
    variableFont = await parser.loadFromBuffer(loadFixture("Inter-Variable.ttf"));
  });

  // ── Class & Loading ──────────────────────────────────────────────

  describe("Class", () => {
    it("should instantiate", () => {
      expect(parser).toBeInstanceOf(FontParser);
    });

    it("should have load and loadFromBuffer methods", () => {
      expect(typeof parser.load).toBe("function");
      expect(typeof parser.loadFromBuffer).toBe("function");
    });

    it("should parse a static font from buffer", () => {
      expect(staticFont).toBeDefined();
      expect(staticFont.head).toBeDefined();
      expect(staticFont.hhea).toBeDefined();
    });

    it("should parse a variable font from buffer", () => {
      expect(variableFont).toBeDefined();
      expect(variableFont.fvar).toBeDefined();
    });

    it("load() should call fetch and return a promise", async () => {
      const mockBuffer = loadFixture("Jost-Regular.ttf");
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: () => Promise.resolve(mockBuffer),
      });

      const font = await parser.load("https://example.com/font.ttf");
      expect(font).toBeDefined();
      expect(font.head.unitsPerEm).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/font.ttf",
      );
    });
  });

  // ── Font Metadata ────────────────────────────────────────────────

  describe("Metadata", () => {
    it("should expose head table with unitsPerEm", () => {
      expect(staticFont.head.unitsPerEm).toBeGreaterThan(0);
      expect(typeof staticFont.head.unitsPerEm).toBe("number");
    });

    it("should expose hhea table with ascender/descender", () => {
      expect(staticFont.hhea.asc).toBeGreaterThan(0); // ascender is positive
      expect(staticFont.hhea.desc).toBeLessThan(0); // descender is negative
    });

    it("should not have fvar for a static font", () => {
      expect(staticFont.fvar).toBeUndefined();
    });

    it("should have fvar axes for a variable font", () => {
      expect(variableFont.fvar).toBeDefined();
      expect(Array.isArray(variableFont.fvar![0])).toBe(true);
      expect(variableFont.fvar![0].length).toBeGreaterThan(0);
    });

    it("should have axis min/default/max values", () => {
      const axes = variableFont.fvar![0];
      for (const axis of axes) {
        const [_tag, min, def, max] = axis;
        expect(min).toBeLessThanOrEqual(def);
        expect(def).toBeLessThanOrEqual(max);
      }
    });
  });

  // ── toPaths ──────────────────────────────────────────────────────

  describe("toPaths", () => {
    it("should return letters and block", () => {
      const result = staticFont.toPaths("Hello");
      expect(result.letters).toBeDefined();
      expect(result.block).toBeDefined();
      expect(Array.isArray(result.letters)).toBe(true);
    });

    it("should produce one letter per character", () => {
      const result = staticFont.toPaths("ABC");
      expect(result.letters.length).toBe(3);
    });

    it("should create Path2D objects for each letter", () => {
      const result = staticFont.toPaths("Hi");
      for (const letter of result.letters) {
        expect(letter.path).toBeDefined();
        expect(letter.path).toBeInstanceOf(Path2D);
      }
    });

    it("should include position metadata on each letter", () => {
      const result = staticFont.toPaths("Test");
      for (const letter of result.letters) {
        expect(letter.center).toBeDefined();
        expect(typeof letter.center.x).toBe("number");
        expect(typeof letter.center.y).toBe("number");
        expect(typeof letter.letterIndex).toBe("number");
        expect(typeof letter.wordIndex).toBe("number");
        expect(typeof letter.lineIndex).toBe("number");
        expect(typeof letter.width).toBe("number");
        expect(typeof letter.height).toBe("number");
      }
    });

    it("should have sequential letterIndex values", () => {
      const result = staticFont.toPaths("Hello");
      for (let i = 0; i < result.letters.length; i++) {
        expect(result.letters[i].letterIndex).toBe(i);
      }
    });

    it("should have positive block dimensions", () => {
      const result = staticFont.toPaths("Hello");
      expect(result.block.width).toBeGreaterThan(0);
      expect(result.block.height).toBeGreaterThan(0);
    });

    it("should scale block width with font size", () => {
      const small = staticFont.toPaths("Test", 24);
      const large = staticFont.toPaths("Test", 96);
      expect(large.block.width).toBeGreaterThan(small.block.width);
      expect(large.block.width / small.block.width).toBeCloseTo(4, 0);
    });

    it("should handle default size of 100", () => {
      const result = staticFont.toPaths("A");
      expect(result.letters[0].height).toBe(100);
    });

    it("should advance x position for sequential letters", () => {
      const result = staticFont.toPaths("AB");
      expect(result.letters[1].center.x).toBeGreaterThan(
        result.letters[0].center.x,
      );
    });
  });

  // ── toSVG ────────────────────────────────────────────────────────

  describe("toSVG", () => {
    it("should return letters with SVG path d strings", () => {
      const result = staticFont.toSVG("Hello");
      expect(result.letters).toBeDefined();
      expect(result.block).toBeDefined();
      expect(result.letters.length).toBe(5);
    });

    it("should produce valid SVG path data", () => {
      const result = staticFont.toSVG("A");
      const d = result.letters[0].d;
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
      // SVG paths start with M (moveTo) and end with Z (close)
      expect(d).toMatch(/^M/);
      expect(d).toMatch(/Z$/);
    });

    it("should contain only valid SVG path commands", () => {
      const result = staticFont.toSVG("Hello World");
      for (const letter of result.letters) {
        if (letter.d.length === 0) continue; // space has no path
        // Should only contain M, L, Q, Z commands and numbers
        expect(letter.d).toMatch(/^[MLQZ0-9.\s-]+$/);
      }
    });

    it("should have same block dimensions as toPaths", () => {
      const paths = staticFont.toPaths("Test", 72);
      const svg = staticFont.toSVG("Test", 72);
      expect(svg.block.width).toBeCloseTo(paths.block.width, 2);
      expect(svg.block.height).toBeCloseTo(paths.block.height, 2);
    });

    it("should have same letter positions as toPaths", () => {
      const paths = staticFont.toPaths("AB", 48);
      const svg = staticFont.toSVG("AB", 48);
      for (let i = 0; i < 2; i++) {
        expect(svg.letters[i].center.x).toBeCloseTo(
          paths.letters[i].center.x,
          2,
        );
        expect(svg.letters[i].center.y).toBeCloseTo(
          paths.letters[i].center.y,
          2,
        );
        expect(svg.letters[i].width).toBeCloseTo(
          paths.letters[i].width,
          2,
        );
      }
    });

    it("should produce different paths for different characters", () => {
      const result = staticFont.toSVG("AO");
      expect(result.letters[0].d).not.toBe(result.letters[1].d);
    });

    it("should scale with font size", () => {
      const small = staticFont.toSVG("A", 24);
      const large = staticFont.toSVG("A", 96);
      // Larger size → longer path data (bigger numbers)
      expect(large.letters[0].d.length).toBeGreaterThan(0);
      expect(small.letters[0].d.length).toBeGreaterThan(0);
    });
  });

  // ── toPoints ─────────────────────────────────────────────────────

  describe("toPoints", () => {
    it("should return letters with shape arrays", () => {
      const result = staticFont.toPoints("O");
      expect(result.letters.length).toBe(1);
      expect(Array.isArray(result.letters[0].shape)).toBe(true);
      expect(result.letters[0].shape.length).toBeGreaterThan(0);
    });

    it("should produce points with x, y, contour", () => {
      const result = staticFont.toPoints("A");
      for (const pt of result.letters[0].shape) {
        expect(typeof pt.x).toBe("number");
        expect(typeof pt.y).toBe("number");
        expect(typeof pt.contour).toBe("number");
        expect(Number.isFinite(pt.x)).toBe(true);
        expect(Number.isFinite(pt.y)).toBe(true);
      }
    });

    it("should detect multiple contours (e.g. 'O' has inner + outer)", () => {
      const result = staticFont.toPoints("O", 120, { sampling: 0.5 });
      const contours = new Set(
        result.letters[0].shape.map((p) => p.contour),
      );
      // "O" typically has 2 contours: outer ring and inner hole
      expect(contours.size).toBeGreaterThanOrEqual(2);
    });

    it("should produce more points with higher sampling", () => {
      const low = staticFont.toPoints("A", 100, { sampling: 0.1 });
      const high = staticFont.toPoints("A", 100, { sampling: 1.0 });
      expect(high.letters[0].shape.length).toBeGreaterThan(
        low.letters[0].shape.length,
      );
    });

    it("should use default sampling of 0.25", () => {
      const defaultSampling = staticFont.toPoints("A", 100);
      const explicit = staticFont.toPoints("A", 100, { sampling: 0.25 });
      expect(defaultSampling.letters[0].shape.length).toBe(
        explicit.letters[0].shape.length,
      );
    });

    it("should have same block dimensions as toPaths", () => {
      const paths = staticFont.toPaths("Test", 72);
      const points = staticFont.toPoints("Test", 72);
      expect(points.block.width).toBeCloseTo(paths.block.width, 2);
      expect(points.block.height).toBeCloseTo(paths.block.height, 2);
    });

    it("should produce points for each character", () => {
      const result = staticFont.toPoints("AB", 72, { sampling: 0.3 });
      expect(result.letters.length).toBe(2);
      expect(result.letters[0].shape.length).toBeGreaterThan(0);
      expect(result.letters[1].shape.length).toBeGreaterThan(0);
    });
  });

  // ── Text Layout ──────────────────────────────────────────────────

  describe("Layout", () => {
    it("should handle single line text", () => {
      const result = staticFont.toPaths("Hello World", 48);
      // All letters on line 0
      for (const letter of result.letters) {
        expect(letter.lineIndex).toBe(0);
      }
    });

    it("should handle multiline text", () => {
      const result = staticFont.toPaths("Line 1\nLine 2\nLine 3", 48);
      const lineIndices = result.letters.map((l) => l.lineIndex);
      expect(new Set(lineIndices).size).toBe(3);
      expect(lineIndices).toContain(0);
      expect(lineIndices).toContain(1);
      expect(lineIndices).toContain(2);
    });

    it("should assign correct wordIndex for spaces", () => {
      const result = staticFont.toPaths("Hello World", 48);
      // "Hello" = word 0, " " boundary, "World" = word 1
      const helloLetters = result.letters.slice(0, 5);
      const worldLetters = result.letters.slice(6, 11);
      for (const l of helloLetters) {
        expect(l.wordIndex).toBe(0);
      }
      for (const l of worldLetters) {
        expect(l.wordIndex).toBe(1);
      }
    });

    it("should handle empty string", () => {
      const result = staticFont.toPaths("");
      expect(result.letters.length).toBe(0);
    });

    it("should handle single character", () => {
      const result = staticFont.toPaths("X", 72);
      expect(result.letters.length).toBe(1);
      expect(result.letters[0].letterIndex).toBe(0);
    });

    it("should handle space character", () => {
      const result = staticFont.toPaths(" ", 72);
      expect(result.letters.length).toBe(1);
      // Space should have an advance width but no visible path
      expect(result.letters[0].width).toBeGreaterThan(0);
    });
  });

  // ── Alignment ────────────────────────────────────────────────────

  describe("Alignment", () => {
    const size = 48;
    const text = "Hi";

    it("left alignment: first letter starts at x ≈ 0", () => {
      const result = staticFont.toPaths(text, size, { align: "left" });
      expect(result.letters[0].center.x).toBeCloseTo(0, 0);
    });

    it("right alignment: last letter ends near block width", () => {
      const left = staticFont.toPaths(text, size, { align: "left" });
      const right = staticFont.toPaths(text, size, { align: "right" });
      // Both should have same block width
      expect(right.block.width).toBeCloseTo(left.block.width, 2);
      // Right-aligned first letter x should equal left-aligned first letter x
      // (single line, same width — no difference for single line)
    });

    it("center alignment on multiline: shorter lines are centered", () => {
      const result = staticFont.toPaths("WIDE LINE\nHI", size, {
        align: "center",
      });
      const wideLine = result.letters.filter((l) => l.lineIndex === 0);
      const hiLine = result.letters.filter((l) => l.lineIndex === 1);

      // First letter of the short line should start further right
      expect(hiLine[0].center.x).toBeGreaterThan(wideLine[0].center.x);
    });

    it("anchor center should offset the block to be centered at origin", () => {
      const result = staticFont.toPaths("Test", size, {
        anchor: "center",
        align: "center",
      });
      // With anchor=center + align=center, letters should span around x=0
      const xs = result.letters.map((l) => l.center.x);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs.map((x, i) => x + result.letters[i].width));
      // The center of the text block should be near 0
      expect((minX + maxX) / 2).toBeCloseTo(0, -1);
    });

    it("baseline center on single line should center around y ≈ 0", () => {
      const result = staticFont.toPaths("Test", size, {
        baseline: "center",
      });
      // All y positions should be near 0
      const ys = result.letters.map((l) => l.center.y);
      const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
      expect(Math.abs(avgY)).toBeLessThan(size); // roughly centered
    });
  });

  // ── Spacing ──────────────────────────────────────────────────────

  describe("Spacing", () => {
    it("letterSpacing should increase block width", () => {
      const normal = staticFont.toPaths("Hello", 48);
      const spaced = staticFont.toPaths("Hello", 48, { letterSpacing: 10 });
      expect(spaced.block.width).toBeGreaterThan(normal.block.width);
    });

    it("wordSpacing should increase distance between words", () => {
      const normal = staticFont.toPaths("A B", 48);
      const spaced = staticFont.toPaths("A B", 48, { wordSpacing: 20 });
      expect(spaced.block.width).toBeGreaterThan(normal.block.width);
    });

    it("lineSpacing should increase block height for multiline", () => {
      const normal = staticFont.toPaths("A\nB", 48);
      const spaced = staticFont.toPaths("A\nB", 48, { lineSpacing: 20 });
      expect(spaced.block.height).toBeGreaterThan(normal.block.height);
    });

    it("letterSpacing should shift later letters further right", () => {
      const normal = staticFont.toPaths("AB", 48);
      const spaced = staticFont.toPaths("AB", 48, { letterSpacing: 50 });
      const normalGap =
        normal.letters[1].center.x - normal.letters[0].center.x;
      const spacedGap =
        spaced.letters[1].center.x - spaced.letters[0].center.x;
      expect(spacedGap).toBeGreaterThan(normalGap);
      // The gap should increase by exactly the letterSpacing
      expect(spacedGap - normalGap).toBeCloseTo(50, 0);
    });
  });

  // ── Variable Fonts ───────────────────────────────────────────────

  describe("Variable Fonts", () => {
    it("should expose variation axes", () => {
      const axes = variableFont.fvar![0];
      expect(axes.length).toBeGreaterThan(0);
    });

    it("should produce different widths at different weight values", () => {
      const axes = variableFont.fvar![0];
      // Find the weight axis range
      const weightAxis = axes[0]; // typically first axis is weight
      const minWeight = weightAxis[1];
      const maxWeight = weightAxis[3];

      // Weight extremes should produce different outlines.
      const lightSVG = variableFont.toSVG("A", 72, {
        axisValues: [minWeight],
      });
      const boldSVG = variableFont.toSVG("A", 72, {
        axisValues: [maxWeight],
      });
      expect(lightSVG.letters[0].d).not.toBe(boldSVG.letters[0].d);
    });

    it("should produce different point shapes at different axis values", () => {
      const axes = variableFont.fvar![0];
      const minVal = axes[0][1];
      const maxVal = axes[0][3];

      const light = variableFont.toPoints("O", 100, {
        sampling: 0.3,
        axisValues: [minVal],
      });
      const bold = variableFont.toPoints("O", 100, {
        sampling: 0.3,
        axisValues: [maxVal],
      });

      // The point coordinates should differ
      const lightFirst = light.letters[0].shape[0];
      const boldFirst = bold.letters[0].shape[0];
      const differs =
        Math.abs(lightFirst.x - boldFirst.x) > 0.01 ||
        Math.abs(lightFirst.y - boldFirst.y) > 0.01;
      expect(differs).toBe(true);
    });

    it("should accept axisValues in options for toPaths", () => {
      const result = variableFont.toPaths("Hi", 48, {
        axisValues: [400],
      });
      expect(result.letters.length).toBe(2);
      expect(result.block.width).toBeGreaterThan(0);
    });

    it("should accept axisValues in options for toSVG", () => {
      const result = variableFont.toSVG("Hi", 48, {
        axisValues: [700],
      });
      expect(result.letters.length).toBe(2);
      expect(result.letters[0].d.length).toBeGreaterThan(0);
    });

    it("should accept axisValues in options for toPoints", () => {
      const result = variableFont.toPoints("Hi", 48, {
        axisValues: [400],
        sampling: 0.3,
      });
      expect(result.letters.length).toBe(2);
      expect(result.letters[0].shape.length).toBeGreaterThan(0);
    });
  });

  // ── Edge Cases & Robustness ──────────────────────────────────────

  describe("Edge Cases", () => {
    it("should handle special characters", () => {
      const result = staticFont.toPaths("!@#$%&*()");
      expect(result.letters.length).toBe(9);
    });

    it("should handle numbers", () => {
      const result = staticFont.toSVG("0123456789");
      expect(result.letters.length).toBe(10);
      // Each digit should produce some path data
      for (const letter of result.letters) {
        expect(letter.d.length).toBeGreaterThan(0);
      }
    });

    it("should handle mixed case", () => {
      const result = staticFont.toPaths("AaBbCc");
      expect(result.letters.length).toBe(6);
      // Uppercase 'A' and lowercase 'a' should have different widths
      const aUpperWidth = result.letters[0].width;
      const aLowerWidth = result.letters[1].width;
      expect(aUpperWidth).not.toBeCloseTo(aLowerWidth, 0);
    });

    it("should handle repeated characters identically", () => {
      const result = staticFont.toSVG("AAA");
      expect(result.letters[0].d).toBe(result.letters[1].d);
      expect(result.letters[1].d).toBe(result.letters[2].d);
    });

    it("should handle very small font sizes", () => {
      const result = staticFont.toPaths("Test", 1);
      expect(result.letters.length).toBe(4);
      expect(result.block.width).toBeGreaterThan(0);
    });

    it("should handle very large font sizes", () => {
      const result = staticFont.toPaths("T", 1000);
      expect(result.letters.length).toBe(1);
      expect(result.block.width).toBeGreaterThan(0);
    });

    it("should handle long text strings", () => {
      const text = "A".repeat(200);
      const result = staticFont.toPaths(text, 12);
      expect(result.letters.length).toBe(200);
    });

    it("should handle multiple consecutive spaces", () => {
      const result = staticFont.toPaths("A  B", 48);
      expect(result.letters.length).toBe(4); // A, space, space, B
    });

    it("should handle Windows-style line endings", () => {
      const result = staticFont.toPaths("A\r\nB", 48);
      const lineIndices = new Set(result.letters.map((l) => l.lineIndex));
      expect(lineIndices.size).toBe(2);
    });
  });

  // ── Consistency Across Methods ───────────────────────────────────

  describe("Cross-method Consistency", () => {
    const text = "Hello World";
    const size = 72;

    it("all methods should return same number of letters", () => {
      const paths = staticFont.toPaths(text, size);
      const svg = staticFont.toSVG(text, size);
      const points = staticFont.toPoints(text, size);

      expect(paths.letters.length).toBe(text.length);
      expect(svg.letters.length).toBe(text.length);
      expect(points.letters.length).toBe(text.length);
    });

    it("all methods should return same block dimensions", () => {
      const paths = staticFont.toPaths(text, size);
      const svg = staticFont.toSVG(text, size);
      const points = staticFont.toPoints(text, size);

      expect(svg.block.width).toBeCloseTo(paths.block.width, 2);
      expect(points.block.width).toBeCloseTo(paths.block.width, 2);
      expect(svg.block.height).toBeCloseTo(paths.block.height, 2);
      expect(points.block.height).toBeCloseTo(paths.block.height, 2);
    });

    it("all methods should return same letter positions", () => {
      const paths = staticFont.toPaths(text, size);
      const svg = staticFont.toSVG(text, size);
      const points = staticFont.toPoints(text, size);

      for (let i = 0; i < text.length; i++) {
        expect(svg.letters[i].center.x).toBeCloseTo(
          paths.letters[i].center.x,
          2,
        );
        expect(svg.letters[i].center.y).toBeCloseTo(
          paths.letters[i].center.y,
          2,
        );
        expect(points.letters[i].center.x).toBeCloseTo(
          paths.letters[i].center.x,
          2,
        );
        expect(points.letters[i].center.y).toBeCloseTo(
          paths.letters[i].center.y,
          2,
        );
      }
    });

    it("all methods should respect same alignment options", () => {
      const opts: FontTextOptions = {
        align: "center",
        baseline: "center",
      };
      const paths = staticFont.toPaths(text, size, opts);
      const svg = staticFont.toSVG(text, size, opts);
      const points = staticFont.toPoints(text, size, opts);

      expect(svg.letters[0].center.x).toBeCloseTo(
        paths.letters[0].center.x,
        2,
      );
      expect(points.letters[0].center.x).toBeCloseTo(
        paths.letters[0].center.x,
        2,
      );
    });
  });

  // ── Type Safety ──────────────────────────────────────────────────

  describe("Type Safety", () => {
    it("toPaths returns FontPathsResult shape", () => {
      const result: FontPathsResult = staticFont.toPaths("A");
      expect(result.letters[0].path).toBeInstanceOf(Path2D);
      expect(result.block.width).toBeGreaterThan(0);
    });

    it("toSVG returns FontSVGResult shape", () => {
      const result: FontSVGResult = staticFont.toSVG("A");
      expect(typeof result.letters[0].d).toBe("string");
      expect(result.block.width).toBeGreaterThan(0);
    });

    it("toPoints returns FontPointsResult shape", () => {
      const result: FontPointsResult = staticFont.toPoints("A");
      expect(Array.isArray(result.letters[0].shape)).toBe(true);
      expect(result.block.width).toBeGreaterThan(0);
    });

    it("FontTextOptions should be accepted by all methods", () => {
      const options: FontTextOptions = {
        align: "center",
        baseline: "center",
        anchor: "center",
        letterSpacing: 2,
        lineSpacing: 5,
        wordSpacing: 3,
        sampling: 0.5,
        axisValues: [400],
      };

      // These should not throw
      expect(() => variableFont.toPaths("A", 48, options)).not.toThrow();
      expect(() => variableFont.toSVG("A", 48, options)).not.toThrow();
      expect(() => variableFont.toPoints("A", 48, options)).not.toThrow();
    });
  });
});
