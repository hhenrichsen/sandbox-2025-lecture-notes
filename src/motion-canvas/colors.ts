/**
 * Shared color utilities for Motion Canvas animations.
 * Provides Catppuccin Mocha theme colors that can be used in embedded animations.
 */

import { Color, createSignal, useScene } from "@motion-canvas/core";
import type { SimpleSignal } from "@motion-canvas/core/lib/signals";

// Default dark theme colors (Catppuccin Mocha)
export const defaultColors = {
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
} as const;

// Type for color names
export type ColorName = keyof typeof defaultColors;

// Interface for color object
export interface ColorPalette {
  base: string;
  text: string;
  pink: string;
  mauve: string;
  red: string;
  maroon: string;
  peach: string;
  yellow: string;
  green: string;
  teal: string;
  sky: string;
  sapphire: string;
  blue: string;
  lavender: string;
  subtext1: string;
  subtext0: string;
  overlay2: string;
  overlay1: string;
  overlay0: string;
  surface2: string;
  surface1: string;
  surface0: string;
  mantle: string;
  crust: string;
}

/**
 * Get a simple color value (no signals).
 * Use this when you don't need reactive updates.
 */
export function getStaticColors(): ColorPalette {
  return { ...defaultColors };
}

/**
 * Get the current color palette from scene variables.
 * Falls back to default dark theme colors if not available.
 *
 * Use this inside Motion Canvas scenes for reactive color support.
 */
export function getColors(): Record<ColorName, SimpleSignal<Color>> {
  try {
    const scene = useScene();
    const variables = scene.variables;

    if (variables) {
      const colors: Partial<Record<ColorName, SimpleSignal<Color>>> = {};

      // Try to read each color from scene variables
      const colorVars: (keyof ColorPalette)[] = [
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

      colorVars.forEach((colorName) => {
        try {
          const value = variables.get(colorName, defaultColors[colorName]);
          colors[colorName] = createSignal(() => new Color(value()));
        } catch (error) {
          // If variable doesn't exist, use default
          colors[colorName] = createSignal(
            () => new Color(defaultColors[colorName]),
          );
        }
      });

      // Return all colors as signals
      return colors as Record<ColorName, SimpleSignal<Color>>;
    }
  } catch (error) {
    console.warn("Failed to read colors from scene variables:", error);
  }

  // Return default colors as fallback (as signals)
  return Object.fromEntries(
    Object.entries(defaultColors).map(([key, value]) => [
      key,
      createSignal(() => new Color(value)),
    ]),
  ) as Record<ColorName, SimpleSignal<Color>>;
}
