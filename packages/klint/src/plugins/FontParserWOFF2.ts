import WOFF2FontParser, {
  decompressWOFF2,
  loadWOFF2 as load,
  parseWOFF2 as parse,
} from "../vendor/font-parsers/woff2.mjs";
import type { FontData, FontParserOptions } from "./FontParser";

export { decompressWOFF2 };
export const parseWOFF2 = (
  buffer: ArrayBuffer,
  options?: FontParserOptions,
): Promise<FontData> => parse(buffer, options) as Promise<FontData>;
export const loadWOFF2 = (url: string): Promise<FontData> =>
  load(url) as Promise<FontData>;

export class FontParserWOFF2 {
  private readonly parser = new WOFF2FontParser();
  load(url: string): Promise<FontData> {
    return this.parser.load(url) as Promise<FontData>;
  }
  loadFromBuffer(
    buffer: ArrayBuffer,
    options?: FontParserOptions,
  ): Promise<FontData> {
    return this.parser.loadFromBuffer(buffer, options) as Promise<FontData>;
  }
}

export default FontParserWOFF2;
