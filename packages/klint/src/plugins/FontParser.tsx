/**
 * FontParser types and lazy-loading wrapper.
 *
 * The runtime implementation lives in FontParser.mjs (pre-minified, ~13 KB /
 * ~5 KB gzipped). It is copied to dist/plugins/ at build time and fetched
 * on first use, keeping the main plugins bundle lean.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FontPoint {
  x: number;
  y: number;
  contour: number;
}

export interface FontLetter {
  center: { x: number; y: number };
  letterIndex: number;
  wordIndex: number;
  lineIndex: number;
  width: number;
  height: number;
  char?: string;
}

export interface FontLetterWithPath extends FontLetter {
  path: Path2D;
}

export interface FontLetterWithSVG extends FontLetter {
  d: string;
}

export interface FontLetterWithPoints extends FontLetter {
  shape: FontPoint[];
}

export interface FontTextBlock {
  width: number;
  height: number;
}

export interface FontPathsResult {
  letters: FontLetterWithPath[];
  block: FontTextBlock;
}

export interface FontSVGResult {
  letters: FontLetterWithSVG[];
  block: FontTextBlock;
}

export interface FontPointsResult {
  letters: FontLetterWithPoints[];
  block: FontTextBlock;
}

export interface FontTextOptions {
  align?: "left" | "center" | "right";
  baseline?: "top" | "center" | "bottom" | "baseline";
  anchor?: "default" | "center";
  letterSpacing?: number;
  lineSpacing?: number;
  wordSpacing?: number;
  sampling?: number;
  axisValues?: number[];
}

export interface FontData {
  toPaths(text: string, size?: number, options?: FontTextOptions): FontPathsResult;
  toSVG(text: string, size?: number, options?: FontTextOptions): FontSVGResult;
  toPoints(text: string, size?: number, options?: FontTextOptions): FontPointsResult;
  head?: { unitsPerEm: number; xMin: number; yMin: number; xMax: number; yMax: number };
  hhea?: { ascender: number; descender: number; lineGap: number };
  name?: { fontFamily: string; postScriptName: string };
  fvar?: any;
  [key: string]: any;
}

// ─── Lazy wrapper ─────────────────────────────────────────────────────────────
// Module-level promise — the import fires exactly once regardless of how many
// FontParser instances are created concurrently.

let _impl: Promise<any> | null = null;

function getImpl(): Promise<any> {
  if (!_impl) _impl = import("./FontParser.mjs").then((m) => m.default);
  return _impl;
}

export class FontParser {
  /** Fetch a .ttf file by URL and parse it */
  load(url: string): Promise<FontData> {
    return getImpl().then((Impl) => new Impl().load(url));
  }

  /**
   * Parse a font from an ArrayBuffer.
   * Async because the implementation is loaded lazily on first call;
   * subsequent calls resolve from the module cache.
   */
  loadFromBuffer(buffer: ArrayBuffer): Promise<FontData> {
    return getImpl().then((Impl) => new Impl().loadFromBuffer(buffer));
  }
}
