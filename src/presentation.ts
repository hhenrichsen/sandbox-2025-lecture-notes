import "./reveal.css";
import "./catppuccin.css";
import "@motion-canvas/core";
import "@motion-canvas/player";
import Reveal from "reveal.js";
import RevealNotes from "reveal.js/plugin/notes/notes.js";
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.js";
import RevealZoom from "reveal.js/plugin/zoom/zoom.js";

// Default dark theme colors (fallback)
const defaultColors = {
  base: "#1e1e2e",
  text: "#cdd6f4",
  pink: "#f5c2e7",
  mauve: "#cba6f7",
  red: "#f38ba8",
  maroon: "#eba0ac",
  peach: "#fab387",
  yellow: "#f9e2af",
  green: "#a6e3a1",
  teal: "#94e2d5",
  sky: "#89dceb",
  sapphire: "#74c7ec",
  blue: "#89b4fa",
  lavender: "#b4befe",
  subtext1: "#bac2de",
  subtext0: "#a6adc8",
  overlay2: "#9399b2",
  overlay1: "#7f849c",
  overlay0: "#6c7086",
  surface2: "#585b70",
  surface1: "#45475a",
  surface0: "#313244",
  mantle: "#181825",
  crust: "#11111b",
};

// Function to read CSS variables from root element
function getCSSVariables(): Record<string, string> {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const colors: Record<string, string> = {};

  // List of color variables to extract
  const colorVars = [
    "base",
    "text",
    "pink",
    "mauve",
    "red",
    "maroon",
    "peach",
    "yellow",
    "green",
    "teal",
    "sky",
    "sapphire",
    "blue",
    "lavender",
    "subtext1",
    "subtext0",
    "overlay2",
    "overlay1",
    "overlay0",
    "surface2",
    "surface1",
    "surface0",
    "mantle",
    "crust",
  ];

  colorVars.forEach((varName) => {
    const value = computedStyle.getPropertyValue(`--${varName}`).trim();
    if (value) {
      colors[varName] = value;
    } else {
      // Fallback to default if not found
      colors[varName] =
        defaultColors[varName as keyof typeof defaultColors] || "";
    }
  });

  return colors;
}

// Function to apply colors to motion-canvas-player elements
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

// Function to handle theme changes
function handleThemeChange() {
  // Listen for changes in color scheme preference
  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

  const updateTheme = () => {
    // Apply colors to existing players
    applyColorsToMotionCanvasPlayers();
  };

  // Update on initial load
  updateTheme();

  // Listen for changes
  mediaQuery.addEventListener("change", updateTheme);

  // Also listen for manual theme changes (if you add theme toggle later)
  // You can dispatch a custom event when theme changes
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

let plugins = [RevealMarkdown, RevealNotes, RevealZoom];

// If there are code blocks (```), add the highlight plugin:
if (document.querySelector("textarea[data-template]")) {
  const template = document.querySelector(
    "textarea[data-template]",
  )?.textContent;
  if (template?.includes("```")) {
    const { default: RevealHighlight } =
      await import("reveal.js/plugin/highlight/highlight.js");
    plugins.push(RevealHighlight);
  }
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
Reveal.on("ready", (event) => {
  applyColorsToMotionCanvasPlayers();
  // Build the slide-to-header map for sticky headers
  buildSlideHeaderMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStickyHeader((event as any).currentSlide);
});

// Re-apply colors and update sticky header when slides change
Reveal.on("slidechanged", (event) => {
  applyColorsToMotionCanvasPlayers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStickyHeader((event as any).currentSlide);
});
