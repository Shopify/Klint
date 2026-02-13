import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@art-studio": path.resolve(
        __dirname,
        "../docusaurus/src/components/ArtStudio",
      ),
    },
  },
  build: {
    outDir: "dist",
  },
});
