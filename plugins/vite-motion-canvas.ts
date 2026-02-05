/**
 * Vite plugin for compiling Motion Canvas code blocks extracted from markdown.
 *
 * This plugin:
 * 1. Maintains a registry of extracted motion-canvas blocks
 * 2. Creates virtual modules for each animation scene
 * 3. Generates a registry module that maps hashes to scene factories
 * 4. Works seamlessly in both dev and build modes
 */

import type { Plugin, ResolvedConfig } from "vite";
import { transformWithEsbuild } from "vite";
import type { MotionCanvasBlock } from "./remark-motion-canvas";

// Global registry of motion-canvas blocks
// This is populated by the markdown processor and read by this plugin
const blockRegistry = new Map<string, MotionCanvasBlock>();

/**
 * Register a motion-canvas block for compilation.
 * Called by the markdown processor after extracting blocks.
 */
export function registerMotionCanvasBlock(block: MotionCanvasBlock): void {
  blockRegistry.set(block.hash, block);
}

/**
 * Register multiple blocks at once.
 */
export function registerMotionCanvasBlocks(blocks: MotionCanvasBlock[]): void {
  for (const block of blocks) {
    blockRegistry.set(block.hash, block);
  }
}

/**
 * Get all registered blocks.
 */
export function getRegisteredBlocks(): MotionCanvasBlock[] {
  return Array.from(blockRegistry.values());
}

/**
 * Clear the block registry (useful for rebuilds).
 */
export function clearBlockRegistry(): void {
  blockRegistry.clear();
}

// Virtual module IDs
const VIRTUAL_RUNTIME_ID = "virtual:motion-canvas-runtime";
const RESOLVED_RUNTIME_ID = "\0" + VIRTUAL_RUNTIME_ID;
const VIRTUAL_REGISTRY_ID = "virtual:motion-canvas-registry";
const RESOLVED_REGISTRY_ID = "\0" + VIRTUAL_REGISTRY_ID;
const VIRTUAL_COLORS_ID = "virtual:motion-canvas-colors";
const RESOLVED_COLORS_ID = "\0" + VIRTUAL_COLORS_ID;
const VIRTUAL_COLOR_CONFIG_ID = "virtual:motion-canvas-color-config";
const RESOLVED_COLOR_CONFIG_ID = "\0" + VIRTUAL_COLOR_CONFIG_ID;

export interface ColorConfig {
  name: string;
  cssVar?: string;
  fallback: string;
}

const DEFAULT_COLORS: ColorConfig[] = [
  { name: "base", fallback: "#1e1e2e" },
  { name: "text", fallback: "#cdd6f4" },
  { name: "pink", fallback: "#f5c2e7" },
  { name: "mauve", fallback: "#cba6f7" },
  { name: "red", fallback: "#f38ba8" },
  { name: "maroon", fallback: "#eba0ac" },
  { name: "peach", fallback: "#fab387" },
  { name: "yellow", fallback: "#f9e2af" },
  { name: "green", fallback: "#a6e3a1" },
  { name: "teal", fallback: "#94e2d5" },
  { name: "sky", fallback: "#89dceb" },
  { name: "sapphire", fallback: "#74c7ec" },
  { name: "blue", fallback: "#89b4fa" },
  { name: "lavender", fallback: "#b4befe" },
  { name: "subtext1", fallback: "#bac2de" },
  { name: "subtext0", fallback: "#a6adc8" },
  { name: "overlay2", fallback: "#9399b2" },
  { name: "overlay1", fallback: "#7f849c" },
  { name: "overlay0", fallback: "#6c7086" },
  { name: "surface2", fallback: "#585b70" },
  { name: "surface1", fallback: "#45475a" },
  { name: "surface0", fallback: "#313244" },
  { name: "mantle", fallback: "#181825" },
  { name: "crust", fallback: "#11111b" },
];

/**
 * Generate the registry module that maps hashes to lazy-loaded scene imports.
 * Each animation is loaded on-demand for better code splitting.
 */
function generateRegistryModule(): string {
  const blocks = getRegisteredBlocks();

  if (blocks.length === 0) {
    return `
// No motion-canvas animations registered
export const animations = new Map();
export async function getAnimation(hash) { return null; }
export function hasAnimation(hash) { return false; }
export function getAllHashes() { return []; }
`;
  }

  // Generate lazy loaders for each animation
  const entries = blocks
    .map(
      (block) => `  ["${block.hash}", {
    load: () => import("virtual:motion-canvas-scene/${block.hash}"),
    title: ${JSON.stringify(block.title || "")},
    autoplay: ${block.autoplay ?? false},
  }]`,
    )
    .join(",\n");

  return `
// Auto-generated Motion Canvas animation registry with lazy loading
const animations = new Map([
${entries}
]);

// Cache for loaded scenes
const loadedScenes = new Map();

export async function getAnimation(hash) {
  const entry = animations.get(hash);
  if (!entry) return null;

  if (!loadedScenes.has(hash)) {
    const module = await entry.load();
    loadedScenes.set(hash, {
      scene: module.default,
      title: entry.title,
      autoplay: entry.autoplay,
    });
  }
  return loadedScenes.get(hash);
}

export function hasAnimation(hash) {
  return animations.has(hash);
}

export function getAllHashes() {
  return Array.from(animations.keys());
}
`;
}

/**
 * Generate the colors module with configurable color definitions.
 */
function generateColorsModule(colors: ColorConfig[]): string {
  const defaultColorsObj = colors
    .map((c) => `  ${c.name}: "${c.fallback}"`)
    .join(",\n");

  const cssVarMapping = colors
    .map(
      (c) =>
        `  { name: "${c.name}", cssVar: "${c.cssVar || c.name}", fallback: "${c.fallback}" }`,
    )
    .join(",\n");

  return `
import { Color, createSignal, useScene } from "@motion-canvas/core";

export const defaultColors = {
${defaultColorsObj}
};

export const colorConfig = [
${cssVarMapping}
];

export function getStaticColors() {
  return { ...defaultColors };
}

export function getColors() {
  try {
    const scene = useScene();
    const variables = scene.variables;
    if (variables) {
      const colors = {};
      colorConfig.forEach(({ name, fallback }) => {
        try {
          const value = variables.get(name, fallback);
          colors[name] = createSignal(() => new Color(value()));
        } catch {
          colors[name] = createSignal(() => new Color(fallback));
        }
      });
      return colors;
    }
  } catch {}

  return Object.fromEntries(
    Object.entries(defaultColors).map(([key, value]) => [
      key,
      createSignal(() => new Color(value)),
    ])
  );
}
`;
}

function generateColorConfigModule(colors: ColorConfig[]): string {
  const defaultColorsObj = colors
    .map((c) => `  ${c.name}: "${c.fallback}"`)
    .join(",\n");

  const cssVarMapping = colors
    .map(
      (c) =>
        `  { name: "${c.name}", cssVar: "${c.cssVar || c.name}", fallback: "${c.fallback}" }`,
    )
    .join(",\n");

  return `
export const defaultColors = {
${defaultColorsObj}
};

export const colorConfig = [
${cssVarMapping}
];
`;
}

/**
 * Generate a scene module from user code.
 * The user code should use makeScene2D and export default.
 */
function generateSceneModule(block: MotionCanvasBlock): string {
  // Replace relative import paths like "../colors" with the virtual colors module
  let code = block.code;

  // Replace common import patterns for colors to use the virtual module
  code = code.replace(
    /from\s+["']\.\.\/colors["']/g,
    'from "virtual:motion-canvas-colors"',
  );
  code = code.replace(
    /from\s+["']\.\.\/\.\.\/colors["']/g,
    'from "virtual:motion-canvas-colors"',
  );
  code = code.replace(
    /from\s+["']\.\/colors["']/g,
    'from "virtual:motion-canvas-colors"',
  );
  code = code.replace(
    /from\s+["']@\/motion-canvas\/colors["']/g,
    'from "virtual:motion-canvas-colors"',
  );

  return `// Auto-generated scene module
// Hash: ${block.hash}
// Source: ${block.sourceFile || "unknown"}

${code}
`;
}

/**
 * Generate the runtime initialization script.
 * This integrates with Reveal.js and uses the registry for loading animations.
 */
function generateRuntimeScript(): string {
  return `
/**
 * Motion Canvas Runtime - integrates animations with Reveal.js
 */
import { MotionCanvasPresenter } from "@/motion-canvas/presenter";
import { getAnimation, hasAnimation, getAllHashes } from "virtual:motion-canvas-registry";
import { colorConfig } from "virtual:motion-canvas-color-config";

function getCurrentColors() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const colors = {};
  colorConfig.forEach(({ name, cssVar, fallback }) => {
    const value = computedStyle.getPropertyValue("--" + cssVar).trim();
    colors[name] = value || fallback;
  });
  return colors;
}

// Store active presenters by hash
const presenters = new Map();
const initializedContainers = new WeakSet();
let activePresenter = null;
let ignoreFragmentEvents = false; // Guard to prevent fragment events during initialization
let isResuming = false; // Debounce flag to prevent rapid resume calls

/**
 * Find all motion-canvas containers in the document.
 */
function findContainers() {
  return Array.from(document.querySelectorAll("[data-motion-canvas]"));
}

/**
 * Find motion-canvas containers within a specific slide.
 */
function findContainersInSlide(slide) {
  return Array.from(slide.querySelectorAll("[data-motion-canvas]"));
}

/**
 * Initialize a single container with its animation.
 */
async function initializeContainer(container) {
  if (initializedContainers.has(container)) {
    return presenters.get(container.dataset.motionCanvas);
  }

  const hash = container.dataset.motionCanvas;
  if (!hash) {
    console.warn("[motion-canvas] Container missing data-motion-canvas attribute");
    return null;
  }

  // Check if animation exists in registry
  if (!hasAnimation(hash)) {
    showPlaceholder(container, hash);
    return null;
  }

  const animationData = await getAnimation(hash);
  if (!animationData || !animationData.scene) {
    showError(container, "Animation data not found");
    return null;
  }

  try {
    // Create canvas element
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.maxHeight = "70vh";
    canvas.style.objectFit = "contain";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto";
    canvas.style.backgroundColor = "transparent";
    canvas.style.borderRadius = "8px";

    // Clear container and add canvas
    container.innerHTML = "";
    container.appendChild(canvas);

    const presenter = new MotionCanvasPresenter();
    await presenter.initializeWithScene(animationData.scene, canvas, {
      fps: 60,
      size: { width: 1920, height: 1080 },
    }, hash);

    // Apply initial colors
    presenter.updateColors(getCurrentColors());

    initializedContainers.add(container);
    presenters.set(hash, presenter);

    return presenter;
  } catch (error) {
    console.error("[motion-canvas] Failed to initialize:", hash, error);
    showError(container, error.message || "Failed to initialize animation");
    return null;
  }
}

/**
 * Show an error message in the container.
 */
function showError(container, message) {
  container.innerHTML = \`
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      background: #1e1e2e;
      border-radius: 8px;
      color: #f38ba8;
      font-family: monospace;
      padding: 20px;
      text-align: center;
    ">
      <div>
        <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
        <div>\${message}</div>
      </div>
    </div>
  \`;
}

/**
 * Show a placeholder for uncompiled animations.
 */
function showPlaceholder(container, hash) {
  container.innerHTML = \`
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      background: linear-gradient(135deg, #1e1e2e 0%, #313244 100%);
      border-radius: 8px;
      color: #cdd6f4;
      font-family: monospace;
      padding: 20px;
      text-align: center;
    ">
      <div>
        <div style="font-size: 48px; margin-bottom: 10px;">🎬</div>
        <div style="color: #a6adc8;">Animation: \${hash.substring(0, 8)}...</div>
        <div style="color: #f9e2af; margin-top: 10px;">Not found in registry</div>
      </div>
    </div>
  \`;
}

/**
 * Handle Reveal.js slide change events.
 */
function onSlideChanged(event) {
  const currentSlide = event.currentSlide;
  const previousSlide = event.previousSlide;

  // Pause animations on the previous slide
  if (previousSlide) {
    const prevContainers = findContainersInSlide(previousSlide);
    for (const container of prevContainers) {
      const hash = container.dataset.motionCanvas;
      const presenter = presenters.get(hash);
      if (presenter) {
        presenter.onSlideLeave();
      }
    }
  }

  // Reset active presenter
  activePresenter = null;

  // Initialize and play animations on the current slide
  initializeSlideAnimations(currentSlide);
}

/**
 * Handle Reveal.js fragment shown events.
 */
function onFragmentShown(event) {
  // Ignore events during initialization (when we're adding fragments)
  if (ignoreFragmentEvents) {
    return;
  }

  // Only handle our motion-canvas-slide fragments
  const fragment = event.fragment;
  if (fragment && fragment.classList.contains("motion-canvas-slide")) {
    // Debounce rapid resume calls to prevent piling up
    if (activePresenter && !isResuming) {
      isResuming = true;
      activePresenter.onFragmentShown();
      // Reset after a short delay to allow the animation to process
      setTimeout(() => { isResuming = false; }, 50);
    }
  }
}

/**
 * Handle Reveal.js fragment hidden events.
 */
async function onFragmentHidden(event) {
  if (ignoreFragmentEvents) {
    return;
  }

  const fragment = event.fragment;
  if (fragment && fragment.classList.contains("motion-canvas-slide")) {
    if (activePresenter) {
      const fragmentIndex = parseInt(fragment.dataset.fragmentIndex, 10);
      const slides = activePresenter.getSlides();

      if (fragmentIndex < slides.length) {
        await activePresenter.seekToSlide(slides[fragmentIndex]);
      }
    }
  }
}

/**
 * Initialize animations on a slide.
 */
async function initializeSlideAnimations(slide) {
  if (!slide) return;

  const containers = findContainersInSlide(slide);
  for (const container of containers) {
    const presenter = await initializeContainer(container);
    if (presenter) {
      // Check if animation has slides (beginSlide points)
      // and add corresponding Reveal.js fragments
      await addFragmentsForSlides(container, presenter);

      presenter.onSlideEnter();
      if (!activePresenter) {
        activePresenter = presenter;
      }

      // Check for existing visible fragments and advance to match URL fragment
      if (presenter.slidesAvailable) {
        const section = container.closest("section");
        if (section) {
          const visibleFragments = section.querySelectorAll(".fragment.motion-canvas-slide.visible");
          if (visibleFragments.length > 0) {
            // Find the highest visible fragment index
            let maxIndex = -1;
            visibleFragments.forEach(f => {
              const idx = parseInt(f.dataset.fragmentIndex, 10);
              if (idx > maxIndex) maxIndex = idx;
            });

            // Advance to that fragment
            const slides = presenter.getSlides();
            if (maxIndex >= 0 && maxIndex < slides.length) {
              // Resume slides until we reach the target
              for (let i = 0; i <= maxIndex; i++) {
                presenter.resumeSlide();
                // Small delay to let animation process
                await new Promise(r => setTimeout(r, 50));
              }
            }
          }
        }
      }
    }
  }

  // Dispatch event to trigger layout recalculation now that canvases are created
  window.dispatchEvent(new CustomEvent('motion-canvas-initialized'));
}

/**
 * Add Reveal.js fragment elements for each beginSlide in the animation.
 * This allows Reveal.js navigation to control animation slides.
 * Only adds fragments if the animation has slides (uses presentation mode).
 */
async function addFragmentsForSlides(container, presenter) {
  // Check if presenter has slides - if not, skip fragment creation
  // Animation without slides uses regular looping playback
  if (!presenter.slidesAvailable) {
    return;
  }

  // Wait a tick for the animation to calculate its slides
  await new Promise(resolve => setTimeout(resolve, 100));

  const slides = presenter.getSlides();
  if (slides.length > 0) {
    // Get the parent section (Reveal.js slide)
    const section = container.closest("section");
    if (section) {
      // Check if fragments already exist
      const existingFragments = section.querySelectorAll(".fragment.motion-canvas-slide");
      if (existingFragments.length === 0) {
        // Set flag to ignore fragment events during initialization
        ignoreFragmentEvents = true;
        
        // Create invisible fragment elements for each animation slide
        slides.forEach((slideId, index) => {
          const fragment = document.createElement("span");
          fragment.className = "fragment motion-canvas-slide";
          fragment.dataset.fragmentIndex = String(index);
          fragment.dataset.slideId = slideId;
          fragment.style.display = "none";
          section.appendChild(fragment);
        });

        // Tell Reveal.js to sync fragments (this may trigger events)
        if (typeof Reveal !== "undefined" && Reveal.sync) {
          Reveal.sync();
        }
        
        // Clear the ignore flag after a tick
        await new Promise(resolve => setTimeout(resolve, 50));
        ignoreFragmentEvents = false;
      }
    }
  }
}

/**
 * Initialize the Motion Canvas runtime.
 * Should be called after Reveal.js is initialized.
 */
export function initializeMotionCanvas() {
  // Listen for color changes from theme updates
  window.addEventListener("motion-canvas-colors-changed", (event) => {
    const { colors } = event.detail;
    for (const [hash, presenter] of presenters) {
      presenter.updateColors(colors);
    }
  });

  // Reveal should be available on window (set by presentation.ts)
  if (typeof Reveal !== "undefined" && typeof Reveal.on === "function") {
    // Register event handlers for slide/fragment changes
    Reveal.on("slidechanged", onSlideChanged);
    Reveal.on("fragmentshown", onFragmentShown);
    Reveal.on("fragmenthidden", onFragmentHidden);

    // Initialize animations on the current slide
    const currentSlide = Reveal.getCurrentSlide();
    initializeSlideAnimations(currentSlide);
  } else {
    // Fallback: No Reveal.js, initialize all containers immediately
    const containers = findContainers();
    for (const container of containers) {
      initializeContainer(container).then((presenter) => {
        if (presenter) {
          presenter.play();
        }
      });
    }
  }
}

// Export utilities
export function getPresenter(hash) {
  return presenters.get(hash);
}

export function getAllPresenters() {
  return presenters;
}

export function disposeAll() {
  for (const [hash, presenter] of presenters) {
    presenter.dispose();
  }
  presenters.clear();
}

export default initializeMotionCanvas;
`;
}

export interface ViteMotionCanvasOptions {
  debug?: boolean;
  colors?: ColorConfig[];
  allowedPackages?: string[] | "all";
}

interface ResolvedViteMotionCanvasOptions {
  debug: boolean;
  colors: ColorConfig[];
  allowedPackages: string[] | "all";
}

const DEFAULT_OPTIONS: ResolvedViteMotionCanvasOptions = {
  debug: false,
  colors: DEFAULT_COLORS,
  allowedPackages: "all",
};

/**
 * Vite plugin for Motion Canvas code block compilation.
 */
export function viteMotionCanvasPlugin(
  options: ViteMotionCanvasOptions = {},
): Plugin {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let config: ResolvedConfig;

  return {
    name: "vite-motion-canvas",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    resolveId(id) {
      // Handle virtual runtime module
      if (id === VIRTUAL_RUNTIME_ID) {
        return RESOLVED_RUNTIME_ID;
      }

      // Handle virtual registry module
      if (id === VIRTUAL_REGISTRY_ID) {
        return RESOLVED_REGISTRY_ID;
      }

      // Handle virtual colors module
      if (id === VIRTUAL_COLORS_ID) {
        return RESOLVED_COLORS_ID;
      }

      // Handle virtual color config module (for runtime, no Motion Canvas deps)
      if (id === VIRTUAL_COLOR_CONFIG_ID) {
        return RESOLVED_COLOR_CONFIG_ID;
      }

      // Handle virtual scene modules (virtual:motion-canvas-scene/{hash})
      // Use .tsx extension to ensure proper JSX transformation
      if (id.startsWith("virtual:motion-canvas-scene/")) {
        const hash = id.replace("virtual:motion-canvas-scene/", "");
        return `\0virtual:motion-canvas-scene/${hash}.tsx`;
      }

      return null;
    },

    async load(id) {
      // Load the runtime script
      if (id === RESOLVED_RUNTIME_ID) {
        return generateRuntimeScript();
      }

      // Load the registry module
      if (id === RESOLVED_REGISTRY_ID) {
        const registryCode = generateRegistryModule();
        if (opts.debug) {
          console.log("[vite-motion-canvas] Generated registry module:");
          console.log(registryCode);
        }
        return registryCode;
      }

      // Load the colors module (for Motion Canvas scenes)
      if (id === RESOLVED_COLORS_ID) {
        const colorsCode = generateColorsModule(opts.colors);
        if (opts.debug) {
          console.log("[vite-motion-canvas] Generated colors module:");
          console.log(colorsCode);
        }
        return colorsCode;
      }

      // Load the color config module (for runtime, no Motion Canvas deps)
      if (id === RESOLVED_COLOR_CONFIG_ID) {
        const configCode = generateColorConfigModule(opts.colors);
        if (opts.debug) {
          console.log("[vite-motion-canvas] Generated color config module:");
          console.log(configCode);
        }
        return configCode;
      }

      // Load scene modules (with .tsx extension)
      if (
        id.startsWith("\0virtual:motion-canvas-scene/") &&
        id.endsWith(".tsx")
      ) {
        const hash = id
          .replace("\0virtual:motion-canvas-scene/", "")
          .replace(".tsx", "");
        const block = blockRegistry.get(hash);

        if (block) {
          if (opts.debug) {
            console.log(`[vite-motion-canvas] Loading scene: ${hash}`);
          }
          const sceneCode = generateSceneModule(block);

          // Transform TSX to JS using esbuild
          // Use a real path for tsconfig lookup (the virtual path confuses esbuild)
          const fakePath = `${config.root}/src/motion-canvas/scene-${hash}.tsx`;
          const result = await transformWithEsbuild(sceneCode, fakePath, {
            loader: "tsx",
            jsx: "automatic",
            jsxImportSource: "@motion-canvas/2d/lib",
            tsconfigRaw: {
              compilerOptions: {
                jsx: "react-jsx",
                jsxImportSource: "@motion-canvas/2d/lib",
              },
            },
          });

          return {
            code: result.code,
            map: result.map,
          };
        }

        console.warn(`[vite-motion-canvas] Scene not found: ${hash}`);
        return `
// Scene not found: ${hash}
export default null;
`;
      }

      return null;
    },

    // Log info at build time
    buildStart() {
      const blocks = getRegisteredBlocks();
      if (blocks.length > 0) {
        console.log(
          `[vite-motion-canvas] ${blocks.length} animation(s) registered`,
        );
      }
    },

    // Handle HMR for development
    handleHotUpdate({ file, server }) {
      // If a markdown file changes, the markdown processor will re-register blocks
      // We need to invalidate the registry module so it gets regenerated
      if (file.endsWith(".md")) {
        const registryModule =
          server.moduleGraph.getModuleById(RESOLVED_REGISTRY_ID);
        if (registryModule) {
          server.moduleGraph.invalidateModule(registryModule);
        }
        return;
      }

      return;
    },
  };
}

export default viteMotionCanvasPlugin;
