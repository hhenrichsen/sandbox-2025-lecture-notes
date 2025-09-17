import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
  mkdirSync,
} from "fs";
import { join, extname, basename } from "path";
import matter from "gray-matter";
import Handlebars from "handlebars";

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
  siteDir: string;
  templateFile: string;
  indexFile: string;
  slidesConfig: SlidesConfig;
}

// Load configuration from mkslides.yml
function loadConfig(): Config {
  let slidesConfig: SlidesConfig = {
    highlight_theme:
      "https://unpkg.com/@catppuccin/highlightjs@1.0.1/css/catppuccin-mocha.css",
    theme: "assets/catppuccin.css",
    separator: "^<!--\\s*slide\\s*-->\\s*$",
    separator_vertical: "^<!--\\s*vslide\\s*-->\\s*$",
    separator_notes: "^\\s*<!-- notes -->\\s*$",
  };

  return {
    notesDir: "notes",
    siteDir: "site",
    templateFile: "templates/template.html",
    indexFile: "templates/index.html",
    slidesConfig,
  };
}

const config = loadConfig();

function ensureDirectoryExists(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function readMarkdownFile(filePath: string): MarkdownFile {
  const content = readFileSync(filePath, "utf-8");
  const { data: frontmatter, content: markdownContent } = matter(content);

  // Extract title from first heading if not in frontmatter
  let title = frontmatter.title;
  if (!title) {
    const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
    title = titleMatch
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

function processMarkdownFiles(): MarkdownFile[] {
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
        console.log(`Processed: ${entry}`);
      } catch (error) {
        console.error(`Error processing ${entry}:`, error);
      }
    }
  }

  return files.sort((a, b) => a.filename.localeCompare(b.filename));
}

function generateHTMLFiles(markdownFiles: MarkdownFile[]): void {
  // Ensure site directory exists
  ensureDirectoryExists(config.siteDir);

  // Read template
  if (!existsSync(config.templateFile)) {
    console.error(`Template file '${config.templateFile}' does not exist`);
    return;
  }

  const templateContent = readFileSync(config.templateFile, "utf-8");
  const template = Handlebars.compile(templateContent);

  // Generate HTML files for each markdown file
  for (const file of markdownFiles) {
    const templateData = {
      ...file,
      ...config.slidesConfig,
    };
    const htmlContent = template(templateData, {
      noEscape: true,
    });
    const outputPath = join(config.siteDir, `${file.filename}.html`);
    writeFileSync(outputPath, htmlContent, "utf-8");
    console.log(`Generated: ${file.filename}.html`);
  }
}

function generateIndexFile(markdownFiles: MarkdownFile[]): void {
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
  const htmlContent = template({
    files: markdownFiles,
    generatedAt: new Date().toLocaleString(),
    count: markdownFiles.length,
  });

  const outputPath = join(config.siteDir, "index.html");
  writeFileSync(outputPath, htmlContent, "utf-8");
  console.log("Generated: index.html");
}

function main(): void {
  console.log("Starting markdown to HTML conversion...");

  // Process all markdown files
  const markdownFiles = processMarkdownFiles();

  if (markdownFiles.length === 0) {
    console.log("No markdown files found to process");
    return;
  }

  // Generate HTML files
  generateHTMLFiles(markdownFiles);

  // Generate index file
  generateIndexFile(markdownFiles);

  console.log(
    `\nConversion complete! Processed ${markdownFiles.length} files.`,
  );
  console.log(`Output directory: ${config.siteDir}`);
}

// Run the main function
main();
