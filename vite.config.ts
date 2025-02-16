import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
/// <reference types="vitest" />
declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  test: {
    includeSource: ['app/Klint/tests/*/*.test.tsx',],
    setupFiles: ['./vitest.setup.ts'],
    environment: 'jsdom',
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    // // For this config, check https://github.com/vitest-dev/vitest/issues/740
    // threads: false,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  assetsInclude: ['**/*.svg'],
});

