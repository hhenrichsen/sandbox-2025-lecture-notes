/**
 * Remark plugin for extracting Motion Canvas code blocks from markdown.
 *
 * This plugin:
 * 1. Detects ```motion-canvas code blocks
 * 2. Extracts code content and generates a content hash
 * 3. Replaces the code block with a placeholder div for the player
 * 4. Stores extracted blocks in VFile data for the Vite plugin to compile
 */

import type { Root, Code, Html } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { createHash } from "crypto";

export interface MotionCanvasBlock {
  /** SHA-256 hash of the code content (first 16 chars) */
  hash: string;
  /** The raw code content from the code block */
  code: string;
  /** The original language tag (e.g., "tsx" from "tsx motion-canvas") */
  lang?: string;
  /** Optional title from meta string */
  title?: string;
  /** Whether to autoplay the animation */
  autoplay?: boolean;
  /** Source file this block came from */
  sourceFile?: string;
}

export interface MotionCanvasOptions {
  /** Whether to autoplay animations by default */
  defaultAutoplay?: boolean;
}

const DEFAULT_OPTIONS: Required<MotionCanvasOptions> = {
  defaultAutoplay: false,
};

/**
 * Generate a short hash from code content for identification.
 */
function generateHash(content: string): string {
  return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Parse meta string for options like title and autoplay.
 * Format: ```motion-canvas title="Example" autoplay
 */
function parseMeta(meta: string | null | undefined): {
  title?: string;
  autoplay?: boolean;
} {
  if (!meta) return {};

  const result: { title?: string; autoplay?: boolean } = {};

  // Parse title="..." or title='...'
  const titleMatch = meta.match(/title=["']([^"']+)["']/);
  if (titleMatch) {
    result.title = titleMatch[1];
  }

  // Check for autoplay flag
  if (/\bautoplay\b/.test(meta)) {
    result.autoplay = true;
  }

  return result;
}

/**
 * Create HTML for the Motion Canvas player placeholder.
 */
function createPlayerHtml(block: MotionCanvasBlock): string {
  const attrs: string[] = [`data-motion-canvas="${block.hash}"`];

  if (block.title) {
    attrs.push(`data-title="${block.title}"`);
  }

  if (block.autoplay) {
    attrs.push(`data-autoplay="true"`);
  }

  // The div will be replaced with a motion-canvas-player at runtime
  return `<div class="motion-canvas-container" ${attrs.join(" ")}></div>`;
}

/**
 * Check if a code block is a motion-canvas block.
 * Supports both:
 * - ```motion-canvas (lang is "motion-canvas")
 * - ```tsx motion-canvas (lang is "tsx", meta contains "motion-canvas")
 */
function isMotionCanvasBlock(node: Code): boolean {
  if (node.lang === "motion-canvas") {
    return true;
  }
  if (node.meta?.includes("motion-canvas")) {
    return true;
  }
  return false;
}

/**
 * Get the actual language for a motion-canvas block.
 * Returns the lang if it's not "motion-canvas", otherwise "tsx" as default.
 */
function getBlockLanguage(node: Code): string {
  if (node.lang && node.lang !== "motion-canvas") {
    return node.lang;
  }
  return "tsx"; // Default to tsx for motion-canvas blocks
}

/**
 * Remark plugin that extracts motion-canvas code blocks and replaces them
 * with placeholder divs for the Motion Canvas player.
 *
 * Supports two syntax styles:
 * - ```motion-canvas - standalone motion-canvas language
 * - ```tsx motion-canvas - tsx with motion-canvas in meta
 */
export const remarkMotionCanvas: Plugin<[MotionCanvasOptions?], Root> = (
  options = {},
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return (tree, file) => {
    // Collect all motion-canvas blocks to process
    const blocks: Array<{
      node: Code;
      index: number;
      parent: Root | any;
    }> = [];

    visit(tree, "code", (node: Code, index, parent) => {
      if (isMotionCanvasBlock(node) && index !== undefined && parent) {
        blocks.push({ node, index, parent });
      }
    });

    // Store extracted blocks in VFile data
    const extractedBlocks: MotionCanvasBlock[] = [];

    // Process blocks in reverse order to maintain indices during replacement
    for (let i = blocks.length - 1; i >= 0; i--) {
      const { node, index, parent } = blocks[i]!;
      const code = node.value;
      const hash = generateHash(code);
      const metaOptions = parseMeta(node.meta);

      const block: MotionCanvasBlock = {
        hash,
        code,
        lang: getBlockLanguage(node),
        title: metaOptions.title,
        autoplay: metaOptions.autoplay ?? opts.defaultAutoplay,
        sourceFile: file.path,
      };

      extractedBlocks.push(block);

      // Replace the code node with HTML placeholder
      const htmlNode: Html = {
        type: "html",
        value: createPlayerHtml(block),
      };

      parent.children[index] = htmlNode;
    }

    // Store in VFile data for downstream processing
    file.data.motionCanvasBlocks = extractedBlocks;

    // Log for debugging during development
    if (extractedBlocks.length > 0) {
      console.log(
        `[remark-motion-canvas] Found ${extractedBlocks.length} motion-canvas block(s) in ${file.path || "unknown"}`,
      );
    }
  };
};

/**
 * Type augmentation for VFile data.
 */
declare module "vfile" {
  interface DataMap {
    motionCanvasBlocks?: MotionCanvasBlock[];
  }
}

export default remarkMotionCanvas;
