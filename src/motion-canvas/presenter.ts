/**
 * Motion Canvas Presenter - manages playback of Motion Canvas animations
 * within Reveal.js presentations.
 *
 * Based on: https://github.com/hhenrichsen/motion-canvas-fiddle/blob/main/src/player.ts
 */

import {
  Player,
  Stage,
  ProjectMetadata,
  Logger,
  DefaultPlugin,
  ValueDispatcher,
  Vector2,
} from "@motion-canvas/core";
import type { Project } from "@motion-canvas/core";

export interface PresenterCallbacks {
  onError?: (message: string) => void;
  onStateChanged?: (isPlaying: boolean) => void;
  onFrameChanged?: (frame: number) => void;
  onDurationChanged?: (duration: number) => void;
  onSlideChanged?: (slideId: string | null) => void;
}

export interface PresenterSettings {
  fps?: number;
  width?: number;
  height?: number;
  background?: string | null;
}

const DEFAULT_SETTINGS: Required<PresenterSettings> = {
  fps: 30,
  width: 1920,
  height: 1080,
  background: null,
};

/**
 * MotionCanvasPresenter manages a single Motion Canvas animation
 * within a Reveal.js presentation slide.
 */
export class MotionCanvasPresenter {
  private player: Player | null = null;
  private stage: Stage | null = null;
  private project: Project | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private callbacks: PresenterCallbacks;
  private settings: Required<PresenterSettings>;

  private isPlaying = false;
  private lastFrame = 0;
  private duration = 0;
  private isInitialized = false;
  private renderLoopId: number | null = null;
  private isRendering = false;
  private hasSlides = false;

  constructor(callbacks: PresenterCallbacks = {}) {
    this.callbacks = callbacks;
    this.settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Initialize the presenter with a compiled project module and canvas.
   */
  async initialize(
    projectModule: Project,
    canvas: HTMLCanvasElement,
    settings: PresenterSettings = {},
  ): Promise<void> {
    if (this.isInitialized) {
      console.warn("[MotionCanvasPresenter] Already initialized");
      return;
    }

    this.canvas = canvas;
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
    this.project = projectModule;

    // Update project metadata with our settings
    if (this.project.meta) {
      this.project.meta.shared.size.set([
        this.settings.width,
        this.settings.height,
      ]);
      if (this.settings.background) {
        this.project.meta.shared.background.set(this.settings.background);
      }
      this.project.meta.preview.fps.set(this.settings.fps);
    }

    // Create player
    this.player = new Player(this.project, {
      size: new Vector2(this.settings.width, this.settings.height),
      fps: this.settings.fps,
    });

    // Create stage for rendering
    this.stage = new Stage();
    this.stage.configure({
      size: new Vector2(this.settings.width, this.settings.height),
    });

    this.setupEventListeners();
    await this.waitForInitialCalculation();

    this.isInitialized = true;
  }

  /**
   * Initialize with a scene description (result of makeScene2D).
   * This is used for embedded code blocks that already call makeScene2D.
   */
  async initializeWithScene(
    sceneDescription: any,
    canvas: HTMLCanvasElement,
    settings: PresenterSettings = {},
    sceneId?: string,
  ): Promise<void> {
    if (this.isInitialized) {
      console.warn("[MotionCanvasPresenter] Already initialized");
      return;
    }

    this.canvas = canvas;
    this.settings = { ...DEFAULT_SETTINGS, ...settings };

    // Clone scene description to avoid mutating shared registry objects
    const scene = { ...sceneDescription };

    // Use unique scene name based on provided ID or generate one
    scene.name =
      sceneId || `scene-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create fresh onReplaced dispatcher for this instance
    scene.onReplaced = new ValueDispatcher(scene);
    scene.onReplaced.current = scene;

    const logger = new Logger();

    // Create project with all required fields for ProjectMetadata
    this.project = {
      name: "embedded-animation",
      scenes: [scene],
      plugins: [DefaultPlugin()],
      logger,
      meta: null as any,
      settings: {},
      versions: {
        core: "3.17.2",
        two: "3.17.2",
        ui: "3.17.2",
        vitePlugin: "3.17.2",
      },
      experimentalFeatures: true,
    } as Project;

    // Initialize project metadata
    this.project.meta = new ProjectMetadata(this.project);

    // Configure project metadata
    this.project.meta.shared.size.set([
      this.settings.width,
      this.settings.height,
    ]);
    if (this.settings.background) {
      this.project.meta.shared.background.set(this.settings.background);
    }
    this.project.meta.preview.fps.set(this.settings.fps);

    // Add size to scene (critical for Scene2D to work properly)
    scene.size = this.project.meta.shared.size.get();

    // Update the onReplaced current value with the size
    if (scene.onReplaced) {
      scene.onReplaced.current = {
        ...scene,
        size: this.project.meta.shared.size.get(),
      };
    }

    // Create player - the constructor activates it automatically and triggers recalculation
    // Set loop: false for presentation mode (we want to stop at slides, not loop back)
    this.player = new Player(
      this.project,
      {
        size: this.project.meta.shared.size.get(),
        fps: this.settings.fps,
      },
      {
        loop: false, // Don't loop - stop at slides and end
      },
    );

    // Create stage for rendering
    this.stage = new Stage();
    this.stage.configure({
      size: this.project.meta.shared.size.get(),
    });

    this.setupEventListeners();

    // Wait for the player's initial recalculation to complete
    // The Player constructor already calls activate() which triggers recalculation
    await this.waitForInitialCalculation();

    // Detect if animation has slides (must be done after recalculation)
    this.hasSlides = this.player.playback.slides.length > 0;

    this.isInitialized = true;
  }

  private setupEventListeners(): void {
    if (!this.player || !this.project) return;

    // Note: We don't subscribe to player.onRender because we manage
    // rendering ourselves in presentationLoop() when in presentation mode

    // Log errors
    this.project.logger.onLogged.subscribe((payload: any) => {
      if (payload.level === "error") {
        console.error(
          "[MotionCanvasPresenter] Runtime error:",
          payload.message,
        );
        this.callbacks.onError?.(payload.message);
      }
    });

    // State changes
    this.player.onStateChanged.subscribe((state) => {
      this.isPlaying = !state.paused;
      this.callbacks.onStateChanged?.(this.isPlaying);
    });

    // Frame changes
    this.player.onFrameChanged.subscribe((frame) => {
      this.lastFrame = frame;
      this.callbacks.onFrameChanged?.(frame);
    });

    // Duration changes
    this.player.onDurationChanged.subscribe((duration) => {
      this.duration = duration;
      this.callbacks.onDurationChanged?.(duration);
    });
  }

  private isPresentationMode = false;
  private lastRenderTime = 0;
  private isSeeking = false;

  /**
   * Start a continuous render loop for presentation mode.
   *
   * Key insight from Motion Canvas's Presenter class:
   * - It doesn't use the Player class at all
   * - It sets PlaybackState.Presenting so beginSlide actually suspends
   * - It calls playback.progress() directly in its own loop
   *
   * We do the same here: use Presenting mode and manage progress ourselves.
   */
  private startRenderLoop(): void {
    if (this.renderLoopId !== null) return;

    const targetFrameTime = 1000 / (this.settings.fps + 5); // Same logic as Presenter

    const loop = async (time: number) => {
      if (!this.isRendering && time - this.lastRenderTime >= targetFrameTime) {
        this.lastRenderTime = time;
        this.isRendering = true;
        await this.presentationLoop();
        this.isRendering = false;
      }
      this.renderLoopId = requestAnimationFrame(loop);
    };

    this.renderLoopId = requestAnimationFrame(loop);
  }

  /**
   * The main render loop - handles both presentation mode and regular playback.
   *
   * In presentation mode: we manage progress with PlaybackState.Presenting
   * In regular mode: Player.run() manages progress, we just render frames
   */
  private async presentationLoop(): Promise<void> {
    if (!this.player || !this.stage || !this.canvas) return;

    const playback = this.player.playback;

    if (this.isPresentationMode && !this.isSeeking) {
      playback.state = 3; // PlaybackState.Presenting
      await playback.progress();
    }

    try {
      await this.stage.render(playback.currentScene, playback.previousScene);

      if (this.stage.finalBuffer) {
        const ctx = this.canvas.getContext("2d");
        if (ctx) {
          this.canvas.width = this.stage.finalBuffer.width;
          this.canvas.height = this.stage.finalBuffer.height;
          ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          ctx.drawImage(this.stage.finalBuffer, 0, 0);
        }
      }
    } catch (error: unknown) {
      console.error("[MotionCanvasPresenter] Render error:", error);
    }
  }

  /**
   * Stop the continuous render loop.
   */
  private stopRenderLoop(): void {
    if (this.renderLoopId !== null) {
      cancelAnimationFrame(this.renderLoopId);
      this.renderLoopId = null;
    }
  }

  private async waitForInitialCalculation(): Promise<void> {
    if (!this.player) return;

    return new Promise<void>((resolve) => {
      let resolved = false;

      const unsubscribe = this.player!.onRecalculated.subscribe(() => {
        if (resolved) return;
        resolved = true;
        unsubscribe();
        this.player!.requestRender();
        resolve();
      });

      // Timeout after 2 seconds if recalculation doesn't happen
      setTimeout(() => {
        if (resolved) return;
        resolved = true;
        console.warn(
          "[MotionCanvasPresenter] Recalculation timeout, proceeding anyway",
        );
        unsubscribe();
        this.player!.requestRender();
        resolve();
      }, 2000);

      this.player!.requestReset();
    });
  }

  // ============================================
  // Playback Control
  // ============================================

  /**
   * Start or resume playback.
   */
  play(): void {
    if (this.player) {
      // Access internal playerState to check paused status
      const playerState = (this.player as any).playerState;
      if (playerState?.current) {
        // Ensure paused is true before toggling, so toggle actually works
        if (!playerState.current.paused) {
          playerState.current = { ...playerState.current, paused: true };
        }
      }

      this.player.togglePlayback(true);
    }
  }

  /**
   * Pause playback.
   */
  pause(): void {
    if (this.player) {
      this.player.togglePlayback(false);
    }
  }

  /**
   * Toggle play/pause.
   */
  togglePlayback(): void {
    if (this.player) {
      this.player.togglePlayback();
    }
  }

  /**
   * Reset to the beginning.
   */
  reset(): void {
    if (this.player) {
      this.player.requestReset();
    }
  }

  /**
   * Seek to a specific frame.
   */
  seek(frame: number): void {
    if (this.player) {
      this.player.requestSeek(frame);
    }
  }

  // ============================================
  // Slide Navigation (for beginSlide support)
  // ============================================

  /**
   * Resume from a beginSlide wait point.
   * Call this when navigating to the next fragment in Reveal.js.
   */
  /**
   * Resume from a beginSlide wait point.
   *
   * This follows the same pattern as Motion Canvas's Presenter class:
   * - Call slides.resume() to set canResume = true
   * - The presentationLoop is already calling progress()
   * - Next progress() will see canResume = true in shouldWait() and continue
   */
  resumeSlide(): void {
    if (!this.player) return;

    const scene = this.player.playback.currentScene;
    if (scene && scene.slides) {
      // Set canResume = true, then the next progress() call will continue
      scene.slides.resume();
    }
  }

  /**
   * Go to the next slide in the animation.
   */
  nextSlide(): void {
    if (this.player) {
      this.player.playback.goForward();
    }
  }

  /**
   * Go to the previous slide in the animation.
   */
  previousSlide(): void {
    if (this.player) {
      this.player.playback.goBack();
    }
  }

  async seekToSlide(slideId: string): Promise<void> {
    if (!this.player) return;

    this.isSeeking = true;
    try {
      // Use Paused state during seek to avoid signal context issues
      this.player.playback.state = 2; // PlaybackState.Paused
      await this.player.playback.goTo(slideId);
    } finally {
      if (this.isPresentationMode) {
        this.player.playback.state = 3; // PlaybackState.Presenting
      }
      this.isSeeking = false;
    }
  }

  /**
   * Check if the animation is currently waiting at a beginSlide.
   */
  isWaitingAtSlide(): boolean {
    if (!this.player) return false;
    const scene = this.player.playback.currentScene;
    return scene?.slides?.isWaiting() ?? false;
  }

  /**
   * Get all slides in the animation.
   */
  getSlides(): string[] {
    if (!this.player) return [];
    return this.player.playback.slides.map((s) => s.id);
  }

  // ============================================
  // Reveal.js Integration
  // ============================================

  /**
   * Called when entering the slide containing this animation.
   */
  async onSlideEnter(): Promise<void> {
    if (!this.player) return;

    const playback = this.player.playback;

    if (this.hasSlides) {
      // CRITICAL: Deactivate Player's internal loop to prevent it from
      // overriding playback.state. The Player's run() method always sets
      // state to Paused/Playing, which breaks presentation mode.
      this.player.deactivate();

      // Reset playback to beginning
      await playback.reset();

      // Use presentation mode - we manage progress ourselves
      // In Presenting mode, shouldWait() respects canResume flag
      this.isPresentationMode = true;
      playback.state = 3; // PlaybackState.Presenting

      // Start our render loop which will call progress() in Presenting mode
      this.startRenderLoop();
    } else {
      // Use regular playback mode with looping - Player manages progress
      this.isPresentationMode = false;

      // Ensure Player is active (it should be, but be explicit)
      this.player.activate();

      // Reset playback to beginning
      await playback.reset();

      // Enable looping for animations without slides
      const playerState = (this.player as any).playerState;
      if (playerState?.current) {
        playerState.current = { ...playerState.current, loop: true };
      }

      // Start regular playback - Player will manage progress
      this.player.togglePlayback(true);

      // Start render loop to draw frames to our canvas
      this.startRenderLoop();
    }
  }

  /**
   * Called when leaving the slide containing this animation.
   */
  onSlideLeave(): void {
    this.isPresentationMode = false;
    this.stopRenderLoop();

    // Re-activate Player if it was deactivated for presentation mode
    if (this.player && this.hasSlides) {
      this.player.activate();
    }
  }

  /**
   * Called when a fragment is shown (next step in Reveal.js).
   * This should trigger resumeSlide() for beginSlide support.
   */
  onFragmentShown(): void {
    this.resumeSlide();
  }

  /**
   * Called when a fragment is hidden (going back in Reveal.js).
   * Note: Backward navigation is now handled directly by the runtime
   * using seekToSlide for better sync.
   */
  onFragmentHidden(): void {
    // No-op - runtime handles backward navigation directly via seekToSlide
  }

  // ============================================
  // State Getters
  // ============================================

  get playing(): boolean {
    return this.isPlaying;
  }

  get currentFrame(): number {
    return this.lastFrame;
  }

  get totalFrames(): number {
    return this.duration;
  }

  get fps(): number {
    return this.settings.fps;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }

  get slidesAvailable(): boolean {
    return this.hasSlides;
  }

  // ============================================
  // Cleanup
  // ============================================

  updateColors(colors: Record<string, string>): void {
    if (!this.player) return;

    for (const scene of this.player.playback.onScenesRecalculated.current) {
      scene.variables.updateSignals(colors);
    }
  }

  /**
   * Dispose of the presenter and clean up resources.
   */
  dispose(): void {
    this.stopRenderLoop();
    this.pause();
    this.player = null;
    this.stage = null;
    this.project = null;
    this.canvas = null;
    this.isInitialized = false;
  }
}

export default MotionCanvasPresenter;
