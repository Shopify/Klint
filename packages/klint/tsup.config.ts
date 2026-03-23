import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: {
    index: "src/index.tsx",
    "plugins/index": "src/plugins/index.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
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
