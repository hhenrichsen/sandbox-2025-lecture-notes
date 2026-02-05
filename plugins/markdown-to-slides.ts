import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, basename, resolve, normalize } from "path";
import matter from "gray-matter";
import Handlebars from "handlebars";
import type { Plugin, ViteDevServer, ResolvedConfig } from "vite";

// Virtual file prefix - the \0 tells Vite this is a virtual module
const VIRTUAL_PREFIX = "\0virtual-slide:";

interface MarkdownFile {
  title: string;
  content: string; // Raw markdown content
  author?: string;
  description?: string;
  generatedAt: string;
  filename: string;
}

interface SlidesConfig {
  highlight_theme: string;
  theme: string;
  separator: string;
  separator_vertical: string;
  separator_notes: string;
}

interface Config {
  notesDir: string;
  templateFile: string;
  slidesConfig: SlidesConfig;
}

function loadConfig(): Config {
  const slidesConfig: SlidesConfig = {
    highlight_theme:
      "https://unpkg.com/@catppuccin/highlightjs@1.0.1/css/catppuccin-mocha.css",
    theme: "assets/catppuccin.css",
    separator: "^<!--\\s*slide\\s*-->\\s*$",
    separator_vertical: "^<!--\\s*vslide\\s*-->\\s*$",
    separator_notes: "^\\s*<!-- notes -->\\s*$",
  };

  return {
    notesDir: "notes",
    templateFile: "templates/template.html",
    slidesConfig,
  };
}

function readMarkdownFile(filePath: string): MarkdownFile {
  const content = readFileSync(filePath, "utf-8");
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Extract title from first heading if not in frontmatter
  let title: string = frontmatter.title as string;
  if (!title) {
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
    title =
      titleMatch && titleMatch[1]
        ? titleMatch[1].replace(/<!-- .*? -->/g, "").trim()
        : basename(filePath, ".md");
  }

  // Keep raw markdown content for Reveal.js
  return {
    title: title,
    content: markdownContent, // Raw markdown content
    author: frontmatter.author,
    description: frontmatter.description,
    generatedAt: new Date().toLocaleString(),
    filename: basename(filePath, ".md"),
  };
}

function getMarkdownFiles(config: Config): MarkdownFile[] {
  const files: MarkdownFile[] = [];
  const notesPath = config.notesDir;

  if (!existsSync(notesPath)) {
    console.error(`Notes directory '${notesPath}' does not exist`);
    return files;
  }

  const entries = readdirSync(notesPath);

  for (const entry of entries) {
    const filePath = join(notesPath, entry);
    const stat = statSync(filePath);

    if (stat.isFile() && extname(entry) === ".md") {
      try {
        const markdownFile = readMarkdownFile(filePath);
        files.push(markdownFile);
      } catch (error) {
        console.error(`Error processing ${entry}:`, error);
      }
    }
  }

  return files.sort((a, b) => a.filename.localeCompare(b.filename));
}

function generateHtmlForPage(
  markdownFile: MarkdownFile,
  config: Config,
): string {
  if (!existsSync(config.templateFile)) {
    throw new Error(`Template file '${config.templateFile}' does not exist`);
  }

  const templateContent = readFileSync(config.templateFile, "utf-8");
  const template = Handlebars.compile(templateContent);

  const templateData = {
    ...markdownFile,
    ...config.slidesConfig,
  };

  // Template uses {{{content}}} for unescaped content
  return template(templateData);
}

function generateIndexHtml(markdownFiles: MarkdownFile[]): string {
  const indexTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lecture Notes Index</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        
        .notes-list {
            list-style: none;
            padding: 0;
        }
        
        .notes-list li {
            margin-bottom: 1em;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f8f9fa;
        }
        
        .notes-list li:hover {
            background-color: #e9ecef;
        }
        
        .note-title {
            font-size: 1.2em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 0.5em;
        }
        
        .note-meta {
            font-size: 0.9em;
            color: #666;
            margin-bottom: 0.5em;
        }
        
        .note-description {
            color: #555;
            margin-bottom: 0.5em;
        }
        
        .note-link {
            color: #3498db;
            text-decoration: none;
            font-weight: 500;
        }
        
        .note-link:hover {
            text-decoration: underline;
        }
        
        .generated-info {
            margin-top: 2em;
            padding: 15px;
            background-color: #e8f4f8;
            border-radius: 5px;
            font-size: 0.9em;
            color: #666;
        }
    </style>
</head>
<body>
    <h1>Lecture Notes</h1>
    
    <ul class="notes-list">
        {{#each files}}
        <li>
            <div class="note-title">{{title}}</div>
            {{#if author}}<div class="note-meta"><strong>Author:</strong> {{author}}</div>{{/if}}
            {{#if description}}<div class="note-description">{{description}}</div>{{/if}}
            <a href="{{filename}}.html" class="note-link">Read Notes →</a>
        </li>
        {{/each}}
    </ul>
    
    <div class="generated-info">
        <strong>Generated:</strong> {{generatedAt}}<br>
        <strong>Total Notes:</strong> {{count}}
    </div>
</body>
</html>`;

  const template = Handlebars.compile(indexTemplate);
  return template({
    files: markdownFiles,
    generatedAt: new Date().toLocaleString(),
    count: markdownFiles.length,
  });
}

export function markdownToSlidesPlugin(): Plugin {
  const config = loadConfig();
  let resolvedConfig: ResolvedConfig;
  let virtualPages: Map<string, MarkdownFile> = new Map();

  // Build the virtual page map from markdown files
  function refreshVirtualPages() {
    virtualPages.clear();
    const markdownFiles = getMarkdownFiles(config);
    for (const file of markdownFiles) {
      virtualPages.set(`${file.filename}.html`, file);
    }
    // Add index page
    virtualPages.set("index.html", null as any); // Special marker for index
    return markdownFiles;
  }

  // Check if a path is a virtual page
  function isVirtualPage(urlPath: string): boolean {
    // Normalize the path - decode URL, remove leading slash and query strings
    const decoded = decodeURIComponent(urlPath);
    const cleanPath = decoded.replace(/^\//, "").split("?")[0] ?? "";
    return virtualPages.has(cleanPath) || cleanPath === "" || cleanPath === "/";
  }

  // Get the virtual page filename from a URL
  function getPageFilename(urlPath: string): string {
    // Decode URL-encoded characters (spaces become %20 in URLs)
    const decoded = decodeURIComponent(urlPath);
    const cleanPath = decoded.replace(/^\//, "").split("?")[0] ?? "";
    if (cleanPath === "" || cleanPath === "/") {
      return "index.html";
    }
    return cleanPath;
  }

  return {
    name: "markdown-to-slides",

    // Provide build inputs configuration
    config() {
      const markdownFiles = refreshVirtualPages();
      console.log(
        `[markdown-to-slides] Found ${markdownFiles.length} markdown files`,
      );

      // Create input entries for all virtual pages
      const input: Record<string, string> = {};
      for (const [filename] of virtualPages) {
        const name = filename
          .replace(".html", "")
          .replace(/[^a-zA-Z0-9]/g, "-");
        input[name] = VIRTUAL_PREFIX + filename;
      }

      return {
        // Use custom appType to disable Vite's default HTML handling
        appType: "custom",
        build: {
          rollupOptions: {
            input,
          },
        },
      };
    },

    // Store resolved config for later use
    configResolved(resolved) {
      resolvedConfig = resolved;
    },

    // Resolve virtual module IDs
    resolveId(id) {
      // Handle virtual prefix from build inputs
      if (id.startsWith(VIRTUAL_PREFIX)) {
        const filename = id.slice(VIRTUAL_PREFIX.length);
        // Return an absolute path for the virtual file
        const root = resolvedConfig?.root || process.cwd();
        return resolve(root, filename);
      }
      return null;
    },

    // Load virtual module content
    load(id) {
      // Normalize path for cross-platform support
      const normalizedId = normalize(id).replace(/\\/g, "/");
      const rootDir = resolvedConfig?.root || process.cwd();
      const root = normalize(rootDir).replace(/\\/g, "/");

      // Check if this is a virtual page request
      if (normalizedId.startsWith(root)) {
        const relativePath = normalizedId.slice(root.length + 1);

        if (relativePath === "index.html") {
          const markdownFiles = getMarkdownFiles(config);
          return generateIndexHtml(markdownFiles);
        }

        const page = virtualPages.get(relativePath);
        if (page) {
          return generateHtmlForPage(page, config);
        }
      }

      return null;
    },

    // Configure dev server for serving virtual HTML
    configureServer(server: ViteDevServer) {
      const rootDir = resolvedConfig?.root || process.cwd();

      // Watch for changes in notes and templates directories
      const watchPaths = [
        join(rootDir, config.notesDir),
        join(rootDir, "templates"),
      ];

      // Refresh virtual pages and trigger reload on file changes
      server.watcher.on("change", (file) => {
        const normalizedFile = normalize(file).replace(/\\/g, "/");
        if (
          normalizedFile.endsWith(".md") ||
          normalizedFile.includes("templates")
        ) {
          console.log(`[markdown-to-slides] File changed: ${file}`);
          refreshVirtualPages();
          // Trigger full reload for HTML changes
          server.ws.send({ type: "full-reload", path: "*" });
        }
      });

      // Watch for new/deleted files
      server.watcher.on("add", (file) => {
        if (file.endsWith(".md")) {
          console.log(`[markdown-to-slides] File added: ${file}`);
          refreshVirtualPages();
          server.ws.send({ type: "full-reload", path: "*" });
        }
      });

      server.watcher.on("unlink", (file) => {
        if (file.endsWith(".md")) {
          console.log(`[markdown-to-slides] File removed: ${file}`);
          refreshVirtualPages();
          server.ws.send({ type: "full-reload", path: "*" });
        }
      });

      // Return post-middleware function (runs after Vite's internal middlewares)
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || "/";

          // Only handle HTML requests for virtual pages
          if (!url.endsWith(".html") && url !== "/" && !url.endsWith("/")) {
            return next();
          }

          const filename = getPageFilename(url);

          if (!isVirtualPage(url)) {
            return next();
          }

          try {
            let html: string;

            if (filename === "index.html") {
              console.log(`[markdown-to-slides] Serving index page`);
              const markdownFiles = getMarkdownFiles(config);
              html = generateIndexHtml(markdownFiles);
            } else {
              const page = virtualPages.get(filename);
              console.log(
                `[markdown-to-slides] Looking up page: "${filename}", found: ${!!page}`,
              );
              if (!page) {
                console.log(
                  `[markdown-to-slides] Virtual pages keys:`,
                  Array.from(virtualPages.keys()),
                );
                return next();
              }
              html = generateHtmlForPage(page, config);
              console.log(
                `[markdown-to-slides] Generated HTML for ${filename}, length: ${html.length}`,
              );
            }

            // Transform HTML through Vite's pipeline (handles script imports, etc.)
            const transformedHtml = await server.transformIndexHtml(url, html);

            res.setHeader("Content-Type", "text/html");
            res.statusCode = 200;
            res.end(transformedHtml);
            console.log(`[markdown-to-slides] Served ${filename} successfully`);
          } catch (error) {
            console.error(`[markdown-to-slides] Error serving ${url}:`, error);
            next(error);
          }
        });
      };
    },
  };
}

// Export helper to get virtual page inputs for external use
export function getMarkdownHtmlInputs(): Record<string, string> {
  const config = loadConfig();
  const markdownFiles = getMarkdownFiles(config);
  const inputs: Record<string, string> = {};

  for (const file of markdownFiles) {
    const name = file.filename.replace(/[^a-zA-Z0-9]/g, "-");
    inputs[name] = VIRTUAL_PREFIX + `${file.filename}.html`;
  }

  // Add index
  inputs["index"] = VIRTUAL_PREFIX + "index.html";

  return inputs;
}
