import UniversalFontParser, {
  loadFont,
  parseFont,
} from "../vendor/font-parsers/index.mjs";

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
  toGlyphPath?(glyphId: number, axisValues?: number[]): FontPoint[];
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

export type FontParserOptions = Record<string, unknown>;

export const parseFontBuffer = (
  buffer: ArrayBuffer,
  options?: FontParserOptions,
): Promise<FontData> => parseFont(buffer, options) as Promise<FontData>;

export const loadFontFile = (
  url: string,
  options?: FontParserOptions,
): Promise<FontData> => loadFont(url, options) as Promise<FontData>;

/** Auto-detecting TTF, OTF, WOFF and WOFF2 parser. */
export class FontParser {
  private readonly parser = new UniversalFontParser();

  load(url: string, options?: FontParserOptions): Promise<FontData> {
    return this.parser.load(url, options) as Promise<FontData>;
  }

  loadFromBuffer(
    buffer: ArrayBuffer,
    options?: FontParserOptions,
  ): Promise<FontData> {
    return this.parser.loadFromBuffer(buffer, options) as Promise<FontData>;
  }
}

export default FontParser;
