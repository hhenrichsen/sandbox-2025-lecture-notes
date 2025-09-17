import { readFileSync, writeFileSync, readdirSync, existsSync, renameSync } from "fs";
import { join } from "path";
import type { Plugin } from "vite";

// Function to process motion-canvas-player URLs
function processMotionCanvasUrls(html: string, baseUrl: string): string {
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
    },
  );
}

export function motionCanvasUrlsPlugin(): Plugin {
  let viteConfig: any;
  
  return {
    name: "motion-canvas-urls",
    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
    },
    writeBundle() {
      const distDir = viteConfig.build.outDir || "dist";
      const baseUrl = process.env.BASE_URL || "/";
      const tempHtmlDir = join(distDir, ".vite-temp-html");

      // First, move HTML files from temp directory to root dist
      if (existsSync(tempHtmlDir)) {
        const files = readdirSync(tempHtmlDir);
        files.forEach((file) => {
          if (file.endsWith(".html")) {
            const srcPath = join(tempHtmlDir, file);
            const destPath = join(distDir, file);
            
            // Move file to root dist
            renameSync(srcPath, destPath);
            console.log(`Moved HTML file to root: ${file}`);
          }
        });
      }

      // Then process motion-canvas URLs in the moved files
      const files = readdirSync(distDir);
      files.forEach((file) => {
        if (file.endsWith(".html")) {
          const filePath = join(distDir, file);
          
          // Process motion-canvas-player URLs
          let content = readFileSync(filePath, "utf-8");
          const processedContent = processMotionCanvasUrls(content, baseUrl);
          
          if (content !== processedContent) {
            writeFileSync(filePath, processedContent, "utf-8");
            console.log(`Processed motion-canvas URLs in: ${file}`);
          }
        }
      });
    },
  };
}