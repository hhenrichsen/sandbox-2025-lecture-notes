/// <reference types="vite/client" />

// Virtual module declarations for Motion Canvas integration
declare module "virtual:motion-canvas-runtime" {
  export function initializeMotionCanvas(): void;
  export function getPresenter(hash: string): unknown;
  export function getAllPresenters(): Map<string, unknown>;
  export function disposeAll(): void;
  export default initializeMotionCanvas;
}

declare module "virtual:motion-canvas-registry" {
  interface AnimationData {
    scene: unknown;
    title: string;
    autoplay: boolean;
  }

  export function getAnimation(hash: string): Promise<AnimationData | null>;
  export function hasAnimation(hash: string): boolean;
  export function getAllHashes(): string[];
}

declare module "virtual:motion-canvas-scene/*" {
  const scene: unknown;
  export default scene;
}

declare module "virtual:motion-canvas-colors" {
  import type { SimpleSignal } from "@motion-canvas/core/lib/signals";
  import type { Color } from "@motion-canvas/core";

  export const defaultColors: Record<string, string>;
  export const colorConfig: Array<{
    name: string;
    cssVar: string;
    fallback: string;
  }>;
  export type ColorName = string;
  export interface ColorPalette {
    [key: string]: string;
  }
  export function getStaticColors(): ColorPalette;
  export function getColors(): Record<string, SimpleSignal<Color>>;
}

declare module "virtual:motion-canvas-color-config" {
  export const defaultColors: Record<string, string>;
  export const colorConfig: Array<{
    name: string;
    cssVar: string;
    fallback: string;
  }>;
}
