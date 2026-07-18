import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const esmCore = await import("../dist/index.js");
const esmNative = await import("../dist/native.js");
const esmFonts = await import("../dist/plugins/FontParser.js");
const cjsCore = require("../dist/index.cjs");
const cjsNative = require("../dist/native.cjs");
const cjsFonts = require("../dist/plugins/FontParser.cjs");

for (const [label, value] of [
  ["ESM Klint", esmCore.Klint],
  ["ESM createKlint", esmNative.createKlint],
  ["ESM FontParser", esmFonts.FontParser],
  ["CJS Klint", cjsCore.Klint],
  ["CJS createKlint", cjsNative.createKlint],
  ["CJS FontParser", cjsFonts.FontParser],
]) {
  if (typeof value !== "function") throw new Error(`${label} export is missing`);
}

const fixture = await readFile(
  new URL("../tests/Plugins/fixtures/Jost-Regular.ttf", import.meta.url),
);
const buffer = fixture.buffer.slice(
  fixture.byteOffset,
  fixture.byteOffset + fixture.byteLength,
);
for (const [label, Parser] of [
  ["ESM", esmFonts.FontParser],
  ["CJS", cjsFonts.FontParser],
]) {
  const font = await new Parser().loadFromBuffer(buffer);
  if (font.toSVG("A").letters.length !== 1) {
    throw new Error(`${label} FontParser artifact failed to parse TTF`);
  }
}

console.log("Artifact smoke test passed for ESM, CommonJS, native, and FontParser.");
