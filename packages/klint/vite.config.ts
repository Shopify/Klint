import { defineConfig } from "vitest/config";
/// <reference types="vitest" />

export default defineConfig({
  assetsInclude: ['**/*.svg'],
  test: {
    includeSource: ['./tests/**/*.test.tsx'],
    setupFiles: ['vitest.setup.ts'],
    environment: 'jsdom',
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
});
