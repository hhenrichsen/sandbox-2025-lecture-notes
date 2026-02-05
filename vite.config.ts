import { defineConfig } from "vite";
import { resolve } from "path";
import { markdownToSlidesPlugin } from "./plugins/markdown-to-slides";
import { motionCanvasUrlsPlugin } from "./plugins/motion-canvas-urls";

export default defineConfig({
  plugins: [markdownToSlidesPlugin(), motionCanvasUrlsPlugin()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        presentation: resolve(__dirname, "src/presentation.ts"),
      },
    },
  },
  base: process.env.BASE_URL || "/",
  publicDir: "assets",
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      assets: resolve(__dirname, "assets"),
    },
  },
});
