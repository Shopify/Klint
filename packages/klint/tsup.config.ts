import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    native: "src/core/native.ts",
    "plugins/index": "src/plugins/index.tsx",
    "plugins/Bezier": "src/plugins/Bezier.tsx",
    "plugins/Polyline": "src/plugins/Polyline.tsx",
    "plugins/FontParser": "src/plugins/FontParser.tsx",
    "plugins/FontParserTTF": "src/plugins/font-parser/TTF.ts",
    "plugins/FontParserOTF": "src/plugins/font-parser/OTF.ts",
    "plugins/FontParserWOFF": "src/plugins/font-parser/WOFF.ts",
    "plugins/FontParserWOFF2": "src/plugins/font-parser/WOFF2.ts",
    "plugins/Catmull": "src/plugins/Catmull.tsx",
    "plugins/Delaunay": "src/plugins/Delaunay.tsx",
    "plugins/Sprites": "src/plugins/Sprites.tsx",
    "plugins/Projector": "src/plugins/Projector.tsx",
  },
  format: ["esm", "cjs"],
  target: "es2020",
  dts: true,
  splitting: true,
  minify: true,
  clean: true,
  external: ["react", "react-dom"],
});
