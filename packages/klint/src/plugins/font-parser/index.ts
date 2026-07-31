import { u32 } from "./Common";
import type {
  FontData,
  FontFormat,
  FontParserOptions,
} from "../FontParser";

const FONT_SIGNATURES: Record<number, FontFormat> = {
  0x00010000: "ttf",
  0x74727565: "ttf", // "true"
  0x4f54544f: "otf", // "OTTO"
  0x774f4646: "woff", // "wOFF"
  0x774f4632: "woff2", // "wOF2"
};

/** Detect a supported font format from its binary signature. */
export function detectFontFormat(buffer: ArrayBuffer): FontFormat {
  if (buffer.byteLength < 4) {
    throw new Error("Invalid font file: expected at least 4 bytes");
  }

  const magic = u32(new Uint8Array(buffer), 0);
  const format = FONT_SIGNATURES[magic];
  if (!format) {
    throw new Error(
      `Unknown font magic: 0x${magic.toString(16).padStart(8, "0")}`,
    );
  }
  return format;
}

/** Load only the decoder selected by the font's binary signature. */
export async function decodeFont(
  buffer: ArrayBuffer,
  options: FontParserOptions = {},
): Promise<FontData> {
  switch (detectFontFormat(buffer)) {
    case "ttf": {
      const { parseTTF } = await import("./TTF");
      return parseTTF(buffer);
    }
    case "otf": {
      const { parseOTF } = await import("./OTF");
      return parseOTF(buffer);
    }
    case "woff": {
      const { parseWOFF } = await import("./WOFF");
      return parseWOFF(buffer, options);
    }
    case "woff2": {
      const { parseWOFF2 } = await import("./WOFF2");
      return parseWOFF2(buffer, options);
    }
  }
}
