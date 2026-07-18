// Universal entry point — auto-detects format from the buffer's magic number and
// delegates to the correct parser. Importing this pulls in *all* parsers; for
// tree-shakeable usage, import the specific module instead (ttf.mjs, otf.mjs, …).
//
//   import { parseFont, loadFont } from "./src/index.mjs";
//   const font = await loadFont("/fonts/foo.woff2");
//
// The async signature is necessary because WOFF and WOFF2 require a brotli /
// deflate decoder. TTF and OTF parsing remains synchronous internally.

import { u32 } from "./_common.mjs";

export async function parseFont(buffer, opts = {}) {
  const b = new Uint8Array(buffer);
  const magic = u32(b, 0);
  switch (magic) {
    case 0x00010000:                    // TTF
    case 0x74727565: {                  // 'true'
      const { parseTTF } = await import("./ttf.mjs");
      return parseTTF(buffer);
    }
    case 0x4f54544f: {                  // 'OTTO' — OTF / CFF
      const { parseOTF } = await import("./otf.mjs");
      return parseOTF(buffer);
    }
    case 0x774f4646: {                  // 'wOFF' — WOFF
      const { parseWOFF } = await import("./woff.mjs");
      return parseWOFF(buffer, opts);
    }
    case 0x774f4632: {                  // 'wOF2' — WOFF2
      const { parseWOFF2 } = await import("./woff2.mjs");
      return parseWOFF2(buffer, opts);
    }
    default:
      throw new Error(`Unknown font magic: 0x${magic.toString(16).padStart(8, "0")}`);
  }
}

export const loadFont = (url, opts) =>
  fetch(url).then(r => r.arrayBuffer()).then(b => parseFont(b, opts));

export default class FontParser {
  load = loadFont;
  loadFromBuffer = parseFont;
}
