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

const fontFixtures = [
  ["TTF", "Jost-Regular.ttf"],
  ["OTF", "Marcel-Semibold.otf"],
  ["WOFF", "Jost-Regular.woff"],
  ["WOFF2", "Jost-Regular.woff2"],
];
for (const [moduleFormat, Parser] of [
  ["ESM", esmFonts.FontParser],
  ["CommonJS", cjsFonts.FontParser],
]) {
  for (const [fontFormat, filename] of fontFixtures) {
    const fixture = await readFile(
      new URL(`../tests/Plugins/fixtures/${filename}`, import.meta.url),
    );
    const buffer = fixture.buffer.slice(
      fixture.byteOffset,
      fixture.byteOffset + fixture.byteLength,
    );
    const font = await new Parser().loadFromBuffer(buffer);
    const letter = font.toSVG("A").letters[0];
    if (!letter?.d) {
      throw new Error(
        `${moduleFormat} FontParser artifact failed to parse ${fontFormat}`,
      );
    }
  }
}

console.log(
  "Artifact smoke test passed for ESM, CommonJS, native, and all font formats.",
);
