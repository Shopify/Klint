declare module "*/vendor/font-parsers/index.mjs" {
  export function parseFont(
    buffer: ArrayBuffer,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
  export function loadFont(
    url: string,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
  export default class UniversalFontParser {
    load(url: string, options?: Record<string, unknown>): Promise<unknown>;
    loadFromBuffer(
      buffer: ArrayBuffer,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
  }
}

declare module "*/vendor/font-parsers/ttf.mjs" {
  export function parseTTF(buffer: ArrayBuffer): unknown;
  export function loadTTF(url: string): Promise<unknown>;
  export default class TTFFontParser {
    load(url: string): Promise<unknown>;
    loadFromBuffer(buffer: ArrayBuffer): unknown;
  }
}

declare module "*/vendor/font-parsers/otf.mjs" {
  export function parseOTF(buffer: ArrayBuffer): unknown;
  export function loadOTF(url: string): Promise<unknown>;
  export default class OTFFontParser {
    load(url: string): Promise<unknown>;
    loadFromBuffer(buffer: ArrayBuffer): unknown;
  }
}

declare module "*/vendor/font-parsers/woff.mjs" {
  export function decompressWOFF(buffer: ArrayBuffer): Promise<unknown>;
  export function parseWOFF(buffer: ArrayBuffer): Promise<unknown>;
  export function loadWOFF(url: string): Promise<unknown>;
  export default class WOFFFontParser {
    load(url: string): Promise<unknown>;
    loadFromBuffer(buffer: ArrayBuffer): Promise<unknown>;
  }
}

declare module "*/vendor/font-parsers/woff2.mjs" {
  export function decompressWOFF2(
    buffer: ArrayBuffer,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
  export function parseWOFF2(
    buffer: ArrayBuffer,
    options?: Record<string, unknown>,
  ): Promise<unknown>;
  export function loadWOFF2(url: string): Promise<unknown>;
  export default class WOFF2FontParser {
    load(url: string): Promise<unknown>;
    loadFromBuffer(
      buffer: ArrayBuffer,
      options?: Record<string, unknown>,
    ): Promise<unknown>;
  }
}
