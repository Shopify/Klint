import TTFFontParser, {
  loadTTF as load,
  parseTTF as parse,
} from "../vendor/font-parsers/ttf.mjs";
import type { FontData } from "./FontParser";

export const parseTTF = (buffer: ArrayBuffer): FontData =>
  parse(buffer) as FontData;
export const loadTTF = (url: string): Promise<FontData> =>
  load(url) as Promise<FontData>;

export class FontParserTTF {
  private readonly parser = new TTFFontParser();
  load(url: string): Promise<FontData> {
    return this.parser.load(url) as Promise<FontData>;
  }
  loadFromBuffer(buffer: ArrayBuffer): FontData {
    return this.parser.loadFromBuffer(buffer) as FontData;
  }
}

export default FontParserTTF;
