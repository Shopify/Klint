import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    server: {
      deps: {
        inline: [/vitest-canvas-mock/],
      },
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Low-level font decoding was previously vendored and remains validated
        // through real-font integration tests rather than branch percentages.
        "src/plugins/font-parser/Common.ts",
        "src/plugins/font-parser/TTF.ts",
        "src/plugins/font-parser/OTF.ts",
        "src/plugins/font-parser/WOFF.ts",
        "src/plugins/font-parser/WOFF2.ts",
      ],
      reporter: ["text", "json-summary"],
      thresholds: {
        lines: 60,
        functions: 60,
        statements: 60,
        branches: 55,
      },
    },
  },
});
