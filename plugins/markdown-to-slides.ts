import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, basename, resolve, normalize } from "path";
import matter from "gray-matter";
import Handlebars from "handlebars";
import type { Plugin, ViteDevServer, ResolvedConfig } from "vite";

// Unified ecosystem imports
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Element } from "hast";
import type { Code } from "mdast";
import { visit } from "unist-util-visit";
import { defaultHandlers, type State } from "mdast-util-to-hast";

// Virtual file prefix - the \0 tells Vite this is a virtual module
const VIRTUAL_PREFIX = "\0virtual-slide:";

// Match line numbers syntax: [1,4-8] or [25: 1,4-8]
const CODE_LINE_NUMBER_REGEX = /\[\s*((\d*):)?\s*([\s\d,|-]*)\]/;

/**
 * Rehype plugin that adds Reveal.js line number attributes to code blocks.
 * Reads the meta string from data-meta attribute (preserved by custom code handler)
 * and parses [1,4-8] or [25: 1,4-8] syntax for line highlighting.
 *
 * Note: Syntax highlighting is handled at runtime by Reveal.js's highlight plugin.
 */
function rehypeRevealCodeBlocks() {
  return (tree: any) => {
    visit(tree, "element", (node: Element) => {
      // Look for <pre> elements with data-meta attribute
      if (node.tagName !== "pre") return;

      const codeElement = node.children?.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code",
      );

      if (!codeElement) return;

      // Get meta string from data-meta attribute (set by custom code handler)
      const meta = node.properties?.["data-meta"];
      if (typeof meta !== "string") return;

      // Parse line number syntax from meta string
      const match = meta.match(CODE_LINE_NUMBER_REGEX);
      if (match) {
        codeElement.properties = codeElement.properties || {};
        
        // Extract starting line number offset (e.g., [25: 1,4-8] -> 25)
        if (match[2]) {
          codeElement.properties["data-ln-start-from"] = match[2].trim();
        }
        
        // Extract line numbers to highlight (e.g., [1,4-8] or [1-3|5-9])
        if (match[3]) {
          codeElement.properties["data-line-numbers"] = match[3].trim();
        }
      }

      // Remove data-meta from output (it was just for internal use)
      delete node.properties?.["data-meta"];
    });
  };
}

/**
 * Custom code handler for remark-rehype that preserves the meta string.
 * The meta string contains line number syntax like [1,4-8] which we need
 * for Reveal.js highlighting.
 */
function codeHandler(state: State, node: Code) {
  const result = defaultHandlers.code(state, node);
  
  // Preserve meta string as data-meta attribute on the <pre> element
  if (node.meta && result && result.type === "element") {
    result.properties = result.properties || {};
    result.properties["data-meta"] = node.meta;
  }
  
  return result;
}

/**
 * Create the unified processor pipeline for markdown to HTML conversion.
 *
 * Pipeline:
 * 1. remarkParse - Parse markdown to MDAST
 * 2. remarkRehype - Convert MDAST to HAST (with custom code handler)
 * 3. rehypeRevealCodeBlocks - Add Reveal.js line number attributes from meta
 * 4. rehypeStringify - Serialize HAST to HTML string
 *
 * Note: Syntax highlighting is handled at runtime by Reveal.js's highlight plugin,
 * keeping this pipeline synchronous.
 */
function createMarkdownProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, {
      allowDangerousHtml: true,
      handlers: {
        code: codeHandler,
      },
    })
    .use(rehypeRevealCodeBlocks)
    .use(rehypeStringify, { allowDangerousHtml: true });
}

// Shared processor instance (created lazily)
let markdownProcessor: ReturnType<typeof createMarkdownProcessor> | null = null;

function getProcessor() {
  if (!markdownProcessor) {
    markdownProcessor = createMarkdownProcessor();
  }
  return markdownProcessor;
}

/**
 * Convert markdown to HTML using the unified processor.
 */
async function markdownToHtml(markdown: string): Promise<string> {
  const processor = getProcessor();
  const result = await processor.process(markdown);
  return String(result);
}

/**
 * Synchronous version for compatibility with existing code.
 * Uses processSync which blocks but works in non-async contexts.
 */
function markdownToHtmlSync(markdown: string): string {
  const processor = getProcessor();
  const result = processor.processSync(markdown);
  return String(result);
}

/**
 * Split markdown content into slides based on separators.
 * Replicates reveal.js markdown plugin's slidify() function.
 */
function slidifyMarkdown(
  markdown: string,
  separator: string,
  verticalSeparator: string | null,
  notesSeparator: string,
): string {
  const separatorRegex = new RegExp(
    separator + (verticalSeparator ? "|" + verticalSeparator : ""),
    "mg",
  );
  const horizontalSeparatorRegex = new RegExp(separator);
  const notesRegex = new RegExp(notesSeparator, "mgi");

  let matches;
  let lastIndex = 0;
  let isHorizontal;
  let wasHorizontal = true;
  let content;
  const sectionStack: (string | string[])[] = [];

  // Iterate until all blocks between separators are stacked up
  while ((matches = separatorRegex.exec(markdown))) {
    // Determine direction (horizontal by default)
    isHorizontal = horizontalSeparatorRegex.test(matches[0]);

    if (!isHorizontal && wasHorizontal) {
      // Create vertical stack
      sectionStack.push([]);
    }

    // Pluck slide content from markdown input
    content = markdown.substring(lastIndex, matches.index);

    if (isHorizontal && wasHorizontal) {
      // Add to horizontal stack
      sectionStack.push(content);
    } else {
      // Add to vertical stack
      (sectionStack[sectionStack.length - 1] as string[]).push(content);
    }

    lastIndex = separatorRegex.lastIndex;
    wasHorizontal = isHorizontal;
  }

  // Add the remaining slide
  const remaining = markdown.substring(lastIndex);
  if (wasHorizontal) {
    sectionStack.push(remaining);
  } else {
    (sectionStack[sectionStack.length - 1] as string[]).push(remaining);
  }

  // Build HTML sections
  let sectionsHtml = "";

  for (let i = 0; i < sectionStack.length; i++) {
    const item = sectionStack[i];
    if (!item) continue;

    if (Array.isArray(item)) {
      // Vertical slide stack
      sectionsHtml += "<section>";
      for (const child of item) {
        sectionsHtml += renderSlideSection(child, notesRegex);
      }
      sectionsHtml += "</section>";
    } else {
      // Single horizontal slide
      sectionsHtml += renderSlideSection(item, notesRegex);
    }
  }

  return sectionsHtml;
}

/**
 * Render a single slide section with notes extraction and markdown conversion.
 * Uses the unified processor (remark/rehype) for markdown to HTML conversion.
 */
function renderSlideSection(content: string, notesRegex: RegExp): string {
  // Extract speaker notes
  const notesParts = content.split(notesRegex);
  const slideContent = notesParts[0] ?? "";
  let notesHtml = "";

  if (notesParts.length > 1 && notesParts[1]) {
    // Convert notes markdown to HTML using unified
    notesHtml = `<aside class="notes">${markdownToHtmlSync(notesParts[1].trim())}</aside>`;
  }

  // Convert main content markdown to HTML using unified
  const slideHtml = markdownToHtmlSync(slideContent.trim());

  return `<section>${slideHtml}${notesHtml}</section>`;
}

interface MarkdownFile {
  title: string;
  content: string; // Raw markdown content
  slides?: string; // Pre-rendered HTML slides
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

function readMarkdownFile(filePath: string, config: Config): MarkdownFile {
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

  // Pre-render markdown to HTML slides at build time
  const slides = slidifyMarkdown(
    markdownContent,
    config.slidesConfig.separator,
    config.slidesConfig.separator_vertical,
    config.slidesConfig.separator_notes,
  );

  return {
    title: title,
    content: markdownContent, // Keep raw content for reference
    slides: slides, // Pre-rendered HTML slides
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
        const markdownFile = readMarkdownFile(filePath, config);
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
