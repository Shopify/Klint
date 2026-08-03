import { decodeFont, detectFontFormat } from "./font-parser";

export { detectFontFormat };

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
  gid: number;
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
  /** Raw numeric path-command stream for a glyph. */
  toGlyphPath?(glyphId: number, axisValues?: number[]): number[];
  head?: {
    unitsPerEm: number;
    locFmt?: number;
    xMin?: number;
    yMin?: number;
    xMax?: number;
    yMax?: number;
  };
  hhea?: {
    asc?: number;
    desc?: number;
    nHM?: number;
    ascender?: number;
    descender?: number;
    lineGap?: number;
  };
  name?: { fontFamily: string; postScriptName: string };
  fvar?: unknown;
  [key: string]: unknown;
}

export interface FontParserOptions {
  brotli?: (bytes: Uint8Array) => Uint8Array | Promise<Uint8Array>;
  [key: string]: unknown;
}

export type FontFormat = "ttf" | "otf" | "woff" | "woff2";

/** Parse a TTF, OTF, WOFF, or WOFF2 buffer, selected by its binary signature. */
export function parseFontBuffer(
  buffer: ArrayBuffer,
  options: FontParserOptions = {},
): Promise<FontData> {
  return decodeFont(buffer, options);
}

export async function loadFontFile(
  url: string,
  options?: FontParserOptions,
): Promise<FontData> {
  const response = await fetch(url);
  return parseFontBuffer(await response.arrayBuffer(), options);
}

/** Auto-detecting TTF, OTF, WOFF, and WOFF2 parser. */
export class FontParser {
  load(url: string, options?: FontParserOptions): Promise<FontData> {
    return loadFontFile(url, options);
  }

  loadFromBuffer(
    buffer: ArrayBuffer,
    options?: FontParserOptions,
  ): Promise<FontData> {
    return parseFontBuffer(buffer, options);
  }
}

export default FontParser;
