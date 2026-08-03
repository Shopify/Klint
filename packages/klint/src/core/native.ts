import { createKlintContext } from "./KlintContext";
import {
  KlintAnimationLoop,
  resizeKlintCanvas,
} from "./KlintRuntime";
import type {
  KlintCanvasOptions,
  KlintContext,
  KlintKeyboardState,
  KlintPointerState,
  KlintScrollState,
} from "./KlintTypes";
import { normalizeKlintOptions } from "./KlintTypes";

export * from "./KlintTypes";
export * from "../elements";

export interface KlintNativeOptions extends KlintCanvasOptions {
  canvas?: HTMLCanvasElement;
  container?: HTMLElement | string;
  width?: number;
  height?: number;
  preload?: (context: KlintContext) => void | Promise<void>;
  setup?: (context: KlintContext) => void | Promise<void>;
  draw?: (context: KlintContext) => void;
  onError?: (error: Error) => void;
  onReady?: (context: KlintContext) => void;
  onResize?: (context: KlintContext) => void;
  onVisible?: (context: KlintContext, visible: boolean) => void;
  onPointer?: (
    context: KlintContext,
    pointer: KlintPointerState,
    event: PointerEvent,
  ) => void;
  onWheel?: (
    context: KlintContext,
    scroll: KlintScrollState,
    event: WheelEvent,
  ) => void;
  onKey?: (
    context: KlintContext,
    keyboard: KlintKeyboardState,
    event: KeyboardEvent,
  ) => void;
  canvasAttributes?: Record<string, string>;
}

export interface KlintNativeController {
  readonly canvas: HTMLCanvasElement;
  readonly context: KlintContext;
  readonly mouse: KlintPointerState;
  readonly scroll: KlintScrollState;
  readonly keyboard: KlintKeyboardState;
  readonly ready: Promise<KlintContext>;
  play(): void;
  pause(): void;
  redraw(): void;
  resize(width?: number, height?: number): void;
  setDraw(draw?: (context: KlintContext) => void): void;
  destroy(): void;
}

const resolveContainer = (
  value: KlintNativeOptions["container"],
): HTMLElement | null => {
  if (typeof value === "string") return document.querySelector<HTMLElement>(value);
  return value ?? null;
};

/**
 * Create a framework-independent Klint sketch. The controller shares Klint's
 * context, DPR sizing and animation-loop implementation with the React adapter.
 */
export function createKlint(options: KlintNativeOptions = {}): KlintNativeController {
  if (typeof document === "undefined") {
    throw new Error("createKlint() requires a browser document");
  }

  const normalized = normalizeKlintOptions(options);
  const container = resolveContainer(options.container);
  const ownsCanvas = !options.canvas;
  const canvas = options.canvas ?? document.createElement("canvas");
  if (ownsCanvas) (container ?? document.body).appendChild(canvas);
  for (const [name, value] of Object.entries(options.canvasAttributes ?? {})) {
    canvas.setAttribute(name, value);
  }
  if (!canvas.hasAttribute("tabindex")) canvas.tabIndex = 0;
  canvas.style.display ||= "block";
  canvas.style.touchAction ||= "none";

  const context = createKlintContext(canvas, normalized);
  const mouse: KlintPointerState = {
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    isPressed: false,
    isHover: false,
  };
  const scroll: KlintScrollState = { distance: 0, velocity: 0, lastTime: 0 };
  const keyboard: KlintKeyboardState = {
    pressedKeys: new Set(),
    modifiers: { alt: false, shift: false, ctrl: false, meta: false },
    lastKey: null,
    lastKeyTime: 0,
  };
  context.mouse = mouse;
  context.scroll = scroll;
  context.keyboard = keyboard;
  let disposed = false;
  let draw = options.draw;
  const reportError = (error: Error) => options.onError?.(error);
  const loop = new KlintAnimationLoop(
    context,
    (current) => draw?.(current),
    reportError,
  );

  const resize = (width = options.width, height = options.height) => {
    if (disposed) return;
    const target = container ?? canvas.parentElement;
    const rect = target?.getBoundingClientRect();
    const nextWidth = width ?? (rect?.width || canvas.clientWidth || 300);
    const nextHeight = height ?? (rect?.height || canvas.clientHeight || 150);
    if (resizeKlintCanvas(canvas, context, nextWidth, nextHeight, normalized)) {
      options.onResize?.(context);
      if (context.__isReadyToDraw && (normalized.static || normalized.noloop)) {
        context.__redraw?.();
      }
    }
  };

  context.__redraw = () => {
    if (!disposed && context.__isReadyToDraw) draw?.(context);
  };
  resize();

  const inputController = new AbortController();
  const { signal: inputSignal } = inputController;
  const updatePointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    let x = (event.clientX - rect.left) * (context.width / rect.width);
    let y = (event.clientY - rect.top) * (context.height / rect.height);
    if (context.__canvasOrigin === "center") {
      x -= context.width * 0.5;
      y -= context.height * 0.5;
    }
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x = x;
    mouse.y = y;
    mouse.vx = x - mouse.px;
    mouse.vy = y - mouse.py;
    mouse.angle = Math.atan2(mouse.vy, mouse.vx);
    options.onPointer?.(context, mouse, event);
  };
  canvas.addEventListener("pointermove", updatePointer, { signal: inputSignal });
  canvas.addEventListener("pointerenter", (event) => {
    mouse.isHover = true;
    updatePointer(event);
  }, { signal: inputSignal });
  canvas.addEventListener("pointerleave", (event) => {
    mouse.isHover = false;
    updatePointer(event);
  }, { signal: inputSignal });
  canvas.addEventListener("pointerdown", (event) => {
    mouse.isPressed = true;
    canvas.focus({ preventScroll: true });
    canvas.setPointerCapture?.(event.pointerId);
    updatePointer(event);
  }, { signal: inputSignal });
  const releasePointer = (event: PointerEvent) => {
    mouse.isPressed = false;
    if (canvas.hasPointerCapture?.(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    updatePointer(event);
  };
  canvas.addEventListener("pointerup", releasePointer, { signal: inputSignal });
  canvas.addEventListener("pointercancel", releasePointer, { signal: inputSignal });

  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const unit =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? Math.max(context.height, 1)
          : 1;
    const delta = event.deltaY * unit;
    const now = performance.now();
    const elapsed = scroll.lastTime ? now - scroll.lastTime : 0;
    scroll.distance += delta;
    scroll.velocity = elapsed > 0 ? delta / elapsed : 0;
    scroll.lastTime = now;
    options.onWheel?.(context, scroll, event);
  }, { signal: inputSignal, passive: false });

  const keyMap: Record<string, string> = {
    " ": "Space",
    Control: "Ctrl",
    Escape: "Esc",
  };
  const normalizeKey = (key: string) => keyMap[key] ?? key;
  const updateModifiers = (event: KeyboardEvent) => {
    keyboard.modifiers.alt = event.altKey;
    keyboard.modifiers.shift = event.shiftKey;
    keyboard.modifiers.ctrl = event.ctrlKey;
    keyboard.modifiers.meta = event.metaKey;
  };
  canvas.addEventListener("keydown", (event) => {
    const key = normalizeKey(event.key);
    keyboard.pressedKeys.add(key);
    keyboard.lastKey = key;
    keyboard.lastKeyTime = performance.now();
    updateModifiers(event);
    options.onKey?.(context, keyboard, event);
  }, { signal: inputSignal });
  canvas.addEventListener("keyup", (event) => {
    keyboard.pressedKeys.delete(normalizeKey(event.key));
    updateModifiers(event);
    options.onKey?.(context, keyboard, event);
  }, { signal: inputSignal });
  const clearKeyboard = () => {
    keyboard.pressedKeys.clear();
    keyboard.modifiers = { alt: false, shift: false, ctrl: false, meta: false };
  };
  canvas.addEventListener("blur", clearKeyboard, { signal: inputSignal });
  window.addEventListener("blur", clearKeyboard, { signal: inputSignal });

  let resizeObserver: ResizeObserver | undefined;
  if (!normalized.ignoreResize && container && typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
  }

  let intersecting = true;
  let documentVisible = document.visibilityState !== "hidden";
  const updateVisibility = () => {
    const visible = intersecting && documentVisible;
    loop.setVisible(visible);
    options.onVisible?.(context, visible);
  };

  let intersectionObserver: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    intersectionObserver = new IntersectionObserver((entries) => {
      intersecting = entries[0]?.isIntersecting ?? true;
      updateVisibility();
    });
    intersectionObserver.observe(canvas);
  }

  const handleVisibility = () => {
    documentVisible = document.visibilityState !== "hidden";
    updateVisibility();
  };
  document.addEventListener("visibilitychange", handleVisibility);
  loop.start();

  const ready = (async () => {
    try {
      await options.preload?.(context);
      if (disposed) return context;
      context.__isPreloaded = true;
      await options.setup?.(context);
      if (disposed) return context;
      context.__isSetup = true;
      context.__isReadyToDraw = true;
      options.onReady?.(context);
      if (normalized.static || normalized.noloop) {
        context.__redraw?.();
        context.__isPlaying = false;
      } else {
        context.__isPlaying = normalized.autoplay;
        loop.resetClock();
      }
      return context;
    } catch (cause) {
      context.__isPlaying = false;
      const error = new Error(
        `Klint lifecycle failed: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
      reportError(error);
      throw error;
    }
  })();

  return {
    canvas,
    context,
    mouse,
    scroll,
    keyboard,
    ready,
    play: context.play,
    pause: context.pause,
    redraw: context.redraw,
    resize,
    setDraw(nextDraw) {
      draw = nextDraw;
      loop.setDraw((current) => draw?.(current));
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      context.__isPlaying = false;
      context.__redraw = undefined;
      inputController.abort();
      loop.stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      context.__offscreens.clear();
      if (ownsCanvas) canvas.remove();
    },
  };
}

export default createKlint;
