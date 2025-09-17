import { defineConfig } from "vite";
import { execSync } from "child_process";
import { resolve } from "path";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  unlinkSync,
  rmdirSync,
} from "fs";

// Function to get all HTML files from site directory
function getHtmlInputs() {
  const siteDir = "site";
  const inputs: Record<string, string> = {};

  if (!existsSync(siteDir)) return inputs;

  const files = readdirSync(siteDir);
  files.forEach((file) => {
    if (file.endsWith(".html")) {
      const name = file.replace(".html", "").replace(/[^a-zA-Z0-9]/g, "-");
      inputs[name] = resolve(__dirname, siteDir, file);
    }
  });

  return inputs;
}

// Get base URL once at the top level
const baseUrl = process.env.BASE_URL || "/";

// Function to process motion-canvas-player URLs
function processMotionCanvasUrls(html: string): string {
  if (baseUrl === "/" || !baseUrl) return html;

  return html.replace(
    /<motion-canvas-player([^>]*?)src="([^"]*?)"([^>]*?)>/g,
    (match, beforeSrc, src, afterSrc) => {
      // Normalize base URL - ensure it starts with / and ends with /
      const normalizedBase = "/" + baseUrl.replace(/^\/+|\/+$/g, "") + "/";

      // Normalize src - remove leading slashes
      const normalizedSrc = src.replace(/^\/+/, "");

      // Create the new absolute path
      const newSrc = normalizedBase + normalizedSrc;

      return `<motion-canvas-player${beforeSrc}src="${newSrc}"${afterSrc}>`;
    }
  );
}

export default defineConfig({
  plugins: [
    {
      name: "build-notes",
      buildStart() {
        console.log("Building notes from markdown files...");
        try {
          execSync("bun run index.ts", { stdio: "inherit" });
        } catch (error) {
          console.error("Failed to build notes:", error);
        }
      },
    },
    {
      name: "move-html-to-root",
      writeBundle() {
        // Move HTML files from dist/site/ to dist/ root
        const siteDir = "dist/site";
        const distDir = "dist";

        if (!existsSync(siteDir)) return;

        const files = readdirSync(siteDir);
        files.forEach((file) => {
          if (file.endsWith(".html")) {
            const srcPath = resolve(siteDir, file);
            const destPath = resolve(distDir, file);

            // Move file and process motion-canvas-player URLs
            let content = readFileSync(srcPath, "utf-8");
            content = processMotionCanvasUrls(content);
            writeFileSync(destPath, content, "utf-8");

            // Remove from site directory
            try {
              unlinkSync(srcPath);
            } catch (error) {
              // File already moved or doesn't exist, ignore
            }

            console.log(`Moved to root: ${file}`);
          }
        });

        // Remove empty site directory
        try {
          rmdirSync(siteDir);
        } catch (error) {
          // Directory not empty or doesn't exist, ignore
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        presentation: resolve(__dirname, "src/presentation.ts"),
        ...getHtmlInputs(),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "presentation"
            ? "js/[name]-[hash].js"
            : "js/[name]-[hash].js";
        },
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  base: baseUrl,
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
