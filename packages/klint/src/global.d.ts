// Ambient module declaration for the pre-minified FontParser implementation.
// Tells TypeScript that the dynamic import resolves to a class whose instances
// expose load() and loadFromBuffer() — types come from FontParser.tsx.
declare module "*/FontParser.mjs" {
  import type { FontData } from "./plugins/FontParser";

  class FontParserImpl {
    load(url: string): Promise<FontData>;
    loadFromBuffer(buffer: ArrayBuffer): FontData;
  }

  export default FontParserImpl;
}
