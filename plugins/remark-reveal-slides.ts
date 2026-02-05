/**
 * Remark plugin for Reveal.js slide processing.
 *
 * This plugin handles:
 * - Slide splitting by separator comments (<!-- slide -->, <!-- vslide -->)
 * - Speaker notes extraction (<!-- notes -->)
 * - Wrapping content in <section> elements for Reveal.js
 */

import type { Root, Html, RootContent } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

export interface RevealSlidesOptions {
  separator?: string;
  verticalSeparator?: string;
  notesSeparator?: string;
}

const DEFAULT_OPTIONS: Required<RevealSlidesOptions> = {
  separator: "^<!--\\s*slide\\s*-->\\s*$",
  verticalSeparator: "^<!--\\s*vslide\\s*-->\\s*$",
  notesSeparator: "^\\s*<!-- notes -->\\s*$",
};

/**
 * Check if an HTML node matches a separator pattern
 */
function matchesSeparator(value: string, pattern: string): boolean {
  const regex = new RegExp(pattern, "m");
  return regex.test(value.trim());
}

/**
 * Remark plugin that processes markdown for Reveal.js slides.
 *
 * This works by:
 * 1. Traversing the MDAST to find HTML comment nodes that are slide separators
 * 2. Grouping nodes between separators into slide sections
 * 3. Marking notes sections for later extraction
 *
 * The actual wrapping in <section> elements happens in a companion rehype plugin,
 * since we need to work with the HTML AST for proper element wrapping.
 */
export const remarkRevealSlides: Plugin<[RevealSlidesOptions?], Root> = (
  options = {},
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return (tree, file) => {
    // Store slide boundaries in VFile data for the rehype plugin to use
    const slideBoundaries: Array<{
      type: "horizontal" | "vertical" | "notes";
      nodeIndex: number;
    }> = [];

    let nodeIndex = 0;

    visit(tree, "html", (node: Html, index, parent) => {
      if (!parent || index === undefined) return;

      const value = node.value;

      // Check for horizontal slide separator
      if (matchesSeparator(value, opts.separator)) {
        slideBoundaries.push({ type: "horizontal", nodeIndex: index });
        // Mark the node for removal (it's just a separator)
        node.value = `<!-- SLIDE_SEPARATOR:horizontal -->`;
      }
      // Check for vertical slide separator
      else if (matchesSeparator(value, opts.verticalSeparator)) {
        slideBoundaries.push({ type: "vertical", nodeIndex: index });
        node.value = `<!-- SLIDE_SEPARATOR:vertical -->`;
      }
      // Check for notes separator
      else if (matchesSeparator(value, opts.notesSeparator)) {
        slideBoundaries.push({ type: "notes", nodeIndex: index });
        node.value = `<!-- SLIDE_SEPARATOR:notes -->`;
      }

      nodeIndex++;
    });

    // Store in VFile for downstream plugins
    file.data.slideBoundaries = slideBoundaries;
    file.data.revealOptions = opts;
  };
};

/**
 * Rehype plugin that wraps content in Reveal.js <section> elements.
 * This runs after remark-rehype conversion and uses the slide boundaries
 * stored by remarkRevealSlides.
 */
import type { Root as HastRoot, Element, ElementContent } from "hast";
import type { Plugin as UnifiedPlugin } from "unified";

export const rehypeRevealSections: UnifiedPlugin<[], HastRoot> = () => {
  return (tree, file) => {
    const children = tree.children as ElementContent[];
    const newChildren: ElementContent[] = [];

    let currentSlide: ElementContent[] = [];
    let currentNotes: ElementContent[] = [];
    let inNotes = false;
    let verticalStack: Element[] = [];
    let inVerticalStack = false;

    function createSection(
      content: ElementContent[],
      notes?: ElementContent[],
    ): Element {
      const sectionChildren: ElementContent[] = [...content];

      if (notes && notes.length > 0) {
        sectionChildren.push({
          type: "element",
          tagName: "aside",
          properties: { className: ["notes"] },
          children: notes,
        });
      }

      return {
        type: "element",
        tagName: "section",
        properties: {},
        children: sectionChildren,
      };
    }

    function flushCurrentSlide() {
      if (currentSlide.length === 0 && currentNotes.length === 0) return;

      const section = createSection(currentSlide, currentNotes);

      if (inVerticalStack) {
        verticalStack.push(section);
      } else {
        newChildren.push(section);
      }

      currentSlide = [];
      currentNotes = [];
      inNotes = false;
    }

    function flushVerticalStack() {
      if (verticalStack.length === 0) return;

      // Wrap vertical stack in a parent section
      newChildren.push({
        type: "element",
        tagName: "section",
        properties: {},
        children: verticalStack,
      });

      verticalStack = [];
      inVerticalStack = false;
    }

    for (const node of children) {
      // Check if this is a separator marker
      if (
        node.type === "raw" ||
        (node.type === "element" && node.tagName === "p")
      ) {
        // Look for our separator comments in raw HTML or text content
        const textContent =
          node.type === "raw"
            ? node.value
            : (node as Element).children
                ?.map((c: any) => c.value || "")
                .join("") || "";

        if (textContent.includes("SLIDE_SEPARATOR:horizontal")) {
          flushCurrentSlide();
          if (inVerticalStack) {
            flushVerticalStack();
          }
          continue;
        }

        if (textContent.includes("SLIDE_SEPARATOR:vertical")) {
          flushCurrentSlide();
          inVerticalStack = true;
          continue;
        }

        if (textContent.includes("SLIDE_SEPARATOR:notes")) {
          inNotes = true;
          continue;
        }
      }

      // Check for comment nodes (the markers we inserted)
      if (node.type === "comment") {
        const comment = (node as any).value || "";

        if (comment.includes("SLIDE_SEPARATOR:horizontal")) {
          flushCurrentSlide();
          if (inVerticalStack) {
            flushVerticalStack();
          }
          continue;
        }

        if (comment.includes("SLIDE_SEPARATOR:vertical")) {
          flushCurrentSlide();
          inVerticalStack = true;
          continue;
        }

        if (comment.includes("SLIDE_SEPARATOR:notes")) {
          inNotes = true;
          continue;
        }
      }

      // Add node to appropriate collection
      if (inNotes) {
        currentNotes.push(node);
      } else {
        currentSlide.push(node);
      }
    }

    // Flush any remaining content
    flushCurrentSlide();
    if (inVerticalStack) {
      flushVerticalStack();
    }

    // If no slides were created, wrap everything in a single section
    if (newChildren.length === 0 && children.length > 0) {
      newChildren.push(createSection(children));
    }

    tree.children = newChildren;
  };
};

export default remarkRevealSlides;
