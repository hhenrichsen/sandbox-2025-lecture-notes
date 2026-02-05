import { defineConfig } from "vite";
import { resolve } from "path";
import { markdownToSlidesPlugin } from "./plugins/markdown-to-slides";
import { motionCanvasUrlsPlugin } from "./plugins/motion-canvas-urls";
import { viteMotionCanvasPlugin } from "./plugins/vite-motion-canvas";

export default defineConfig({
  plugins: [
    markdownToSlidesPlugin(),
    viteMotionCanvasPlugin({ debug: true }),
    motionCanvasUrlsPlugin(),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        presentation: resolve(__dirname, "src/presentation.ts"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("virtual:motion-canvas-scene/")) {
            const match = id.match(/virtual:motion-canvas-scene\/([^.]+)/);
            if (match) return `animation-${match[1]}`;
          }
        },
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
      "@/motion-canvas": resolve(__dirname, "src/motion-canvas"),
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "@motion-canvas/2d/lib",
  },
});
