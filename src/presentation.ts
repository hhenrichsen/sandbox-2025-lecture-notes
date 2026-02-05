import "./reveal.css";
import "./catppuccin.css";
import "@motion-canvas/core";
import "@motion-canvas/player";
import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes/notes.js";
import RevealZoom from "reveal.js/plugin/zoom/zoom.js";
import { colorConfig, defaultColors } from "virtual:motion-canvas-color-config";

// Expose Reveal globally for Motion Canvas runtime integration
(window as unknown as { Reveal: typeof Reveal }).Reveal = Reveal;

// Function to read CSS variables from root element
function getCSSVariables(): Record<string, string> {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const colors: Record<string, string> = {};

  colorConfig.forEach(
    ({
      name,
      cssVar,
      fallback,
    }: {
      name: string;
      cssVar: string;
      fallback: string;
    }) => {
      const value = computedStyle.getPropertyValue(`--${cssVar}`).trim();
      colors[name] = value || fallback;
    },
  );

  return colors;
}

function applyColorsToMotionCanvasPlayers() {
  const colors = getCSSVariables();
  const players = document.querySelectorAll("motion-canvas-player");
  players.forEach((player) => {
    const oldVariables = player.getAttribute("variables");
    player.setAttribute(
      "variables",
      JSON.stringify({ ...JSON.parse(oldVariables ?? "{}"), ...colors }),
    );
  });
}

function updatePresenterColors() {
  const colors = getCSSVariables();
  window.dispatchEvent(
    new CustomEvent("motion-canvas-colors-changed", {
      detail: { colors },
    }),
  );
}

function handleThemeChange() {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

  const updateTheme = () => {
    applyColorsToMotionCanvasPlayers();
    updatePresenterColors();
  };

  updateTheme();
  mediaQuery.addEventListener("change", updateTheme);
  window.addEventListener("themechange", updateTheme);
}

// Function to observe for new motion-canvas-player elements
function observeMotionCanvasPlayers() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.tagName === "MOTION-CANVAS-PLAYER") {
            applyColorsToMotionCanvasPlayers();
          }
          // Also check for motion-canvas-player in added subtrees
          const players = element.querySelectorAll?.("motion-canvas-player");
          if (players && players.length > 0) {
            applyColorsToMotionCanvasPlayers();
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Calculate remaining height for an element on a slide (similar to Reveal.js util)
function getRemainingHeight(element: Element, slideHeight: number): number {
  const htmlElement = element as HTMLElement;
  const parent = htmlElement.parentNode as HTMLElement;
  if (!parent) return slideHeight;

  // Store original height
  const oldHeight = htmlElement.style.height;

  // Temporarily set element height to 0 to measure other content
  htmlElement.style.height = "0px";

  // Temporarily set parent to auto height
  const oldParentHeight = parent.style.height;
  parent.style.height = "auto";

  // Calculate remaining height
  const remainingHeight = slideHeight - parent.offsetHeight;

  // Restore original styles
  htmlElement.style.height = oldHeight;
  parent.style.height = oldParentHeight;

  return remainingHeight;
}

// Layout media elements with shrink-only behavior for code blocks
function layoutMediaElements() {
  const config = Reveal.getConfig();
  const slideHeight = (config.height as number) || 700;

  // Get all slide sections (both horizontal and vertical)
  const slides = document.querySelectorAll(".reveal .slides section");

  slides.forEach((slide) => {
    // Handle code blocks - shrink only, don't grow
    // Use :scope > pre to only get direct children (top-level code blocks)
    slide.querySelectorAll(":scope > pre").forEach((pre) => {
      const htmlPre = pre as HTMLElement;
      const htmlCode = htmlPre.querySelector("code") as HTMLElement | null;
      if (!htmlCode) return;

      // Clear any previously set max-height to measure natural height
      htmlCode.style.maxHeight = "";

      const remainingHeight = getRemainingHeight(pre, slideHeight);
      const naturalHeight = htmlPre.scrollHeight;

      // Only constrain if natural height exceeds available space
      if (naturalHeight > remainingHeight && remainingHeight > 0) {
        // Account for pre padding (--pre-padding: 2rem = ~32px each side)
        // and code padding (2rem top/bottom = ~64px)
        const codeMaxHeight = remainingHeight - 96;
        htmlCode.style.maxHeight = Math.max(codeMaxHeight, 100) + "px";
      }
      // Don't set maxHeight for small code blocks - let CSS default handle it
    });

    // Handle motion-canvas-player elements - these should stretch to fill
    slide
      .querySelectorAll(":scope > motion-canvas-player")
      .forEach((player) => {
        if (!player.classList.contains("r-stretch")) {
          player.classList.add("r-stretch");
        }
      });
  });
}

// Sticky header - pre-computed mapping of slides to their applicable headers
interface HeaderInfo {
  text: string;
  level: number;
}

// Map of "h-v" slide indices to their applicable header
const slideHeaderMap = new Map<string, HeaderInfo>();

function processSlide(
  slide: Element,
  key: string,
  headingStack: (HeaderInfo | undefined)[],
) {
  const heading = slide.querySelector("h1, h2, h3, h4, h5");

  if (heading) {
    const level = parseInt(heading.tagName[1]);
    // Truncate stack to parent level, then add this heading
    headingStack.length = level - 1;
    headingStack[level - 1] = {
      text: heading.textContent || "",
      level,
    };
  }

  // Store the current applicable header for this slide
  const currentHeader = headingStack.filter(Boolean).slice(-1)[0];
  if (currentHeader) {
    slideHeaderMap.set(key, currentHeader);
  }
}

function buildSlideHeaderMap() {
  const horizontalSlides = document.querySelectorAll(
    ".reveal .slides > section",
  );
  const headingStack: (HeaderInfo | undefined)[] = [];

  horizontalSlides.forEach((hSlide, h) => {
    const verticalSlides = hSlide.querySelectorAll(":scope > section");

    if (verticalSlides.length === 0) {
      // Single slide (no vertical stack)
      processSlide(hSlide, `${h}-0`, headingStack);
    } else {
      // Vertical slide stack
      verticalSlides.forEach((vSlide, v) => {
        processSlide(vSlide, `${h}-${v}`, headingStack);
      });
    }
  });
}

function updateStickyHeader(slide: Element) {
  const header = document.getElementById("sticky-header");
  if (!header) return;

  // Get current slide indices from Reveal
  const indices = Reveal.getIndices();
  const key = `${indices.h}-${indices.v ?? 0}`;

  // Check if this slide has its own heading (should hide sticky header)
  const hasOwnHeading = slide.querySelector("h1, h2, h3, h4, h5");
  const applicableHeader = slideHeaderMap.get(key);

  if (hasOwnHeading || !applicableHeader) {
    header.classList.add("hidden");
    header.textContent = "";
  } else {
    header.classList.remove("hidden");
    header.textContent = applicableHeader.text;
    header.classList.remove(
      "level-1",
      "level-2",
      "level-3",
      "level-4",
      "level-5",
    );
    header.classList.add(`level-${applicableHeader.level}`);
  }
}

let plugins = [RevealNotes, RevealZoom];

// If there are code blocks, add the highlight plugin
// Since markdown is pre-processed, code blocks are already <pre><code> elements
if (document.querySelector("pre code")) {
  const { default: RevealHighlight } =
    await import("reveal.js/plugin/highlight/highlight.js");
  plugins.push(RevealHighlight);
}

Reveal.initialize({
  hash: true,
  plugins,
  slideNumber: "c/t",
});

// Initialize color sync system
document.addEventListener("DOMContentLoaded", () => {
  handleThemeChange();
  observeMotionCanvasPlayers();
});

// Also run when Reveal is ready
Reveal.on("ready", async (event) => {
  applyColorsToMotionCanvasPlayers();
  layoutMediaElements();
  // Build the slide-to-header map for sticky headers
  buildSlideHeaderMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStickyHeader((event as any).currentSlide);

  // Initialize Motion Canvas runtime now that Reveal is ready
  // This must happen after Reveal is initialized so the runtime can integrate
  const { initializeMotionCanvas } =
    await import("virtual:motion-canvas-runtime");
  initializeMotionCanvas();
});

// Re-apply colors, layout, and update sticky header when slides change
Reveal.on("slidechanged", (event) => {
  applyColorsToMotionCanvasPlayers();
  layoutMediaElements();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStickyHeader((event as any).currentSlide);
});

// Re-layout media elements when window is resized
Reveal.on("resize", () => {
  layoutMediaElements();
});

// Re-layout when motion canvas animations are initialized (canvases created)
window.addEventListener("motion-canvas-initialized", () => {
  layoutMediaElements();
  Reveal.layout();
});
