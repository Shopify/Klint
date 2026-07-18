import OTFFontParser, {
  loadOTF as load,
  parseOTF as parse,
} from "../vendor/font-parsers/otf.mjs";
import type { FontData } from "./FontParser";

export const parseOTF = (buffer: ArrayBuffer): FontData =>
  parse(buffer) as FontData;
export const loadOTF = (url: string): Promise<FontData> =>
  load(url) as Promise<FontData>;

export class FontParserOTF {
  private readonly parser = new OTFFontParser();
  load(url: string): Promise<FontData> {
    return this.parser.load(url) as Promise<FontData>;
  }
  loadFromBuffer(buffer: ArrayBuffer): FontData {
    return this.parser.loadFromBuffer(buffer) as FontData;
  }
}

export default FontParserOTF;
