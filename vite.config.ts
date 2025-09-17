import { defineConfig } from "vite";
import { join, resolve } from "path";
import { existsSync, rmSync } from "fs";
import {
  markdownToSlidesPlugin,
  getMarkdownHtmlInputs,
} from "./plugins/markdown-to-slides";
import { motionCanvasUrlsPlugin } from "./plugins/motion-canvas-urls";

export default defineConfig({
  plugins: [
    markdownToSlidesPlugin(),
    motionCanvasUrlsPlugin(),
    {
      name: "remove-vite-temp-html",
      writeBundle() {
        if (existsSync(".vite-temp-html")) {
          rmSync(".vite-temp-html", { recursive: true });
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        presentation: resolve(__dirname, "src/presentation.ts"),
        ...getMarkdownHtmlInputs(),
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
