import type {
  KlintCanvasOptions,
  KlintContext,
  KlintContexts,
} from "./KlintTypes";
import { normalizeKlintOptions } from "./KlintTypes";

export function resolveDpr(options: KlintCanvasOptions): number {
  const normalized = normalizeKlintOptions(options);
  const requested =
    normalized.dpr === "default"
      ? typeof window === "undefined"
        ? 1
        : window.devicePixelRatio || 1
      : normalized.dpr;
  return Math.min(requested, normalized.maxDpr);
}

/** Reset the native transform to Klint's logical-pixel coordinate system. */
export function applyKlintBaseTransform(
  context: KlintContexts,
  includeOrigin = true,
): void {
  const dpr = context.__dpr || 1;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (includeOrigin && context.__canvasOrigin === "center") {
    context.translate(context.width * 0.5, context.height * 0.5);
  }
}

/**
 * Resize a canvas backing store while keeping the public API in logical CSS
 * pixels. Returns true when the backing store changed.
 */
export function resizeKlintCanvas(
  canvas: HTMLCanvasElement,
  context: KlintContext,
  width: number,
  height: number,
  options: KlintCanvasOptions,
): boolean {
  const logicalWidth = Math.max(0, width);
  const logicalHeight = Math.max(0, height);
  const dpr = resolveDpr(options);
  const pixelWidth = Math.max(0, Math.round(logicalWidth * dpr));
  const pixelHeight = Math.max(0, Math.round(logicalHeight * dpr));
  const changed =
    canvas.width !== pixelWidth ||
    canvas.height !== pixelHeight ||
    context.__dpr !== dpr ||
    context.width !== logicalWidth ||
    context.height !== logicalHeight;

  if (!changed) return false;

  const config = context.saveConfig();
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  context.width = logicalWidth;
  context.height = logicalHeight;
  context.__dpr = dpr;
  context.dpr = dpr;
  context.restoreConfig(config);
  applyKlintBaseTransform(context);
  return true;
}

export type KlintFrameCallback = (context: KlintContext) => void;

/** Small requestAnimationFrame controller shared by React and native adapters. */
export class KlintAnimationLoop {
  private context: KlintContext;
  private draw: KlintFrameCallback;
  private frameId = 0;
  private mounted = false;
  private visible = true;
  private onError?: (error: Error) => void;

  constructor(
    context: KlintContext,
    draw: KlintFrameCallback,
    onError?: (error: Error) => void,
  ) {
    this.context = context;
    this.draw = draw;
    this.onError = onError;
  }

  setDraw(draw: KlintFrameCallback): void {
    this.draw = draw;
  }

  setVisible(visible: boolean): void {
    if (this.visible === visible) return;
    this.visible = visible;
    this.resetClock();
  }

  resetClock(): void {
    this.context.__lastTargetTime = -1;
    this.context.__lastRealTime = -1;
  }

  start(): void {
    if (this.mounted) return;
    this.mounted = true;
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.mounted = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  private tick = (timestamp: number): void => {
    if (!this.mounted) return;

    // Keep the scheduler alive while paused so play() can resume without
    // needing a second controller or a React render.
    this.frameId = requestAnimationFrame(this.tick);

    const context = this.context;
    if (!this.visible || !context.__isReadyToDraw || !context.__isPlaying) {
      this.resetClock();
      return;
    }

    const target = 1000 / context.fps;
    if (context.__lastTargetTime < 0) {
      context.__lastTargetTime = timestamp;
      context.__lastRealTime = timestamp;
      return;
    }

    const elapsed = timestamp - context.__lastTargetTime;
    if (elapsed < target) return;

    context.deltaTime = Math.max(0, timestamp - context.__lastRealTime);

    try {
      this.draw(context);
    } catch (cause) {
      context.__isPlaying = false;
      const error = new Error(
        `Klint error in draw: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
      this.onError?.(error);
      return;
    }

    context.time += context.deltaTime / 1000;
    context.frame += 1;
    if (context.time > 1e7) context.time = 0;
    if (context.frame > 1e7) context.frame = 0;

    // Preserve the remainder so non-divisor frame rates do not drift as much.
    context.__lastTargetTime = timestamp - (elapsed % target);
    context.__lastRealTime = timestamp;
  };
}
