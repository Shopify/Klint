import WOFFFontParser, {
  decompressWOFF,
  loadWOFF as load,
  parseWOFF as parse,
} from "../vendor/font-parsers/woff.mjs";
import type { FontData } from "./FontParser";

export { decompressWOFF };
export const parseWOFF = (buffer: ArrayBuffer): Promise<FontData> =>
  parse(buffer) as Promise<FontData>;
export const loadWOFF = (url: string): Promise<FontData> =>
  load(url) as Promise<FontData>;

export class FontParserWOFF {
  private readonly parser = new WOFFFontParser();
  load(url: string): Promise<FontData> {
    return this.parser.load(url) as Promise<FontData>;
  }
  loadFromBuffer(buffer: ArrayBuffer): Promise<FontData> {
    return this.parser.loadFromBuffer(buffer) as Promise<FontData>;
  }
}

export default FontParserWOFF;
