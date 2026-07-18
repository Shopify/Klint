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
      exclude: ["src/vendor/**", "src/global.d.ts"],
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
