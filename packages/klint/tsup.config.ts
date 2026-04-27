import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    "plugins/index": "src/plugins/index.tsx",
    "plugins/Bezier": "src/plugins/Bezier.tsx",
    "plugins/Polyline": "src/plugins/Polyline.tsx",
    "plugins/FontParser": "src/plugins/FontParser.tsx",
    "plugins/Catmull": "src/plugins/Catmull.tsx",
    "plugins/Delaunay": "src/plugins/Delaunay.tsx",
    "plugins/MatterPhysics": "src/plugins/MatterPhysics.tsx",
    "plugins/Sprites": "src/plugins/Sprites.tsx",
    "plugins/Projector": "src/plugins/Projector.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  external: ["react", "react-dom"],
  esbuildOptions(options) {
    // Prevent esbuild from bundling the pre-minified implementation.
    // It will be copied as-is and loaded via a runtime dynamic import.
    options.external = [
      ...(options.external ?? []),
      "./FontParser.mjs",
      "*/FontParser.mjs",
    ];
  },
  onSuccess: async () => {
    const src = resolve(__dirname, "src/plugins/FontParser.mjs");
    const dest = resolve(__dirname, "dist/plugins/FontParser.mjs");
    mkdirSync(resolve(__dirname, "dist/plugins"), { recursive: true });
    copyFileSync(src, dest);
    console.log("✓ Copied FontParser.mjs → dist/plugins/FontParser.mjs");
  },
});
