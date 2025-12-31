import React, { useRef, useEffect, useState, useCallback } from "react";
import { KlintFunctions, KlintCoreFunctions } from "./KlintFunctions";
import { type KlintElements, Vector } from "./elements";

const DEFAULT_FPS = 60.0;
const DEFAULT_ALT = "A beautiful artwork made with Klint Canvas";
export const EPSILON = 0.0001;

export type KlintContexts = KlintContext | KlintOffscreenContext;

export type CurveVertex =
  | { type: "line"; x: number; y: number }
  | {
      type: "bezier";
      cp1x: number;
      cp1y: number;
      cp2x: number;
      cp2y: number;
      x: number;
      y: number;
    }
  | { type: "quadratic"; cpx: number; cpy: number; x: number; y: number }
  | {
      type: "arc";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      radius: number;
    };

export interface KlintOffscreenContext
  extends CanvasRenderingContext2D,
    KlintFunctions,
    KlintElements {
  width: number;
  height: number;
  __dpr: number;
  __startedShape: boolean;
  __currentShape: CurveVertex[] | null;
  __startedContour: boolean;
  __currentContours: CurveVertex[][] | null;
  __currentContour: CurveVertex[] | null;
  __isReadyToDraw: boolean;
  __isMainContext: boolean;
  __imageOrigin: "corner" | "center";
  __rectangleOrigin: "corner" | "center";
  __canvasOrigin: "corner" | "center";
  __computedTextFont: string;
  __textFont: string;
  __textSize: number;
  __textLeading: number | undefined;
  __textStyle: string;
  __textWeight: string;
  __textAlignment: {
    horizontal: CanvasTextAlign;
    vertical: CanvasTextBaseline;
  };
  __fillRule: CanvasFillRule;
  createVector: (x: number, y: number) => Vector;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface KlintPerformanceMetrics {
  fps: number;
  frameTime: number; // Time taken to render last frame in ms
  averageFrameTime: number; // Rolling average frame time
  minFrameTime: number;
  maxFrameTime: number;
  droppedFrames: number; // Frames that took longer than target frame time
  memoryUsage?: number; // If available (in MB)
}

export interface KlintContext
  extends KlintOffscreenContext,
    KlintCoreFunctions {
  frame: number;
  time: number;
  deltaTime: number;
  fps: number;
  __lastTargetTime: number;
  __lastRealTime: number;
  __isPlaying: boolean;
  __offscreens: Map<string, KlintOffscreenContext | HTMLImageElement>;
  __performance?: KlintPerformanceMetrics;
}

export interface KlintCanvasOptions {
  alpha?: string;
  willreadfrequently?: string;
  autoplay?: string;
  ignoreResize?: string;
  noloop?: string;
  ignoreFunctions?: string;
  static?: string;
  nocanvas?: string;
  fps?: number;
  unsafemode?: string;
  dpr?: number | "default";
  origin?: "corner" | "center";
}

const DEFAULT_OPTIONS: KlintCanvasOptions = {
  alpha: "true",
  ignoreResize: "false",
  noloop: "false",
  static: "false",
  nocanvas: "false",
  unsafemode: "false",
  willreadfrequently: "false",
  fps: DEFAULT_FPS,
  dpr: "default",
  origin: "corner",
};

export type KlintConfig = Partial<
  Pick<KlintContext, (typeof CONFIG_PROPS)[number]>
>;

export interface KlintContextWrapper {
  context: KlintContext | null;
  initCoreContext: (
    canvas: HTMLCanvasElement,
    options: KlintCanvasOptions
  ) => KlintContext;
}

export const CONFIG_PROPS = [
  "lineWidth",
  "strokeStyle",
  "lineJoin",
  "lineCap",
  "fillStyle",
  "font",
  "textAlign",
  "textBaseline",
  "textRendering",
  "wordSpacing",
  "letterSpacing",
  "globalAlpha",
  "globalCompositeOperation",
  "origin",
  "transform",
  "__imageOrigin",
  "__rectangleOrigin",
  "__textFont",
  "__textWeight",
  "__textStyle",
  "__textSize",
  "__textLeading",
  "__textAlignment",
  "__fillRule",
  "__isPlaying",
] as const;

export interface KlintProps {
  context: KlintContextWrapper;
  draw: (ctx: KlintContext) => void;
  setup?: (ctx: KlintContext) => void;
  preload?: (ctx: KlintContext) => Promise<void>;
  options?: KlintCanvasOptions;
  onResize?: (ctx: KlintContext) => void;
  onVisible?: (ctx: KlintContext) => void;
  enablePerformanceTracking?: boolean;
}

function useAnimate(
  contextRef: React.RefObject<KlintContext | null>,
  draw: (context: KlintContext) => void,
  isVisible: boolean,
  enablePerformanceTracking = false
) {
  const animationFrameId = useRef<number>(0);
  const frameTimeHistoryRef = useRef<number[]>([]);
  const frameStartTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const droppedFramesRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp = 0) => {
      if (!contextRef.current || !isVisible) return;
      if (!contextRef.current.__isReadyToDraw) return;
      if (!contextRef.current.__isPlaying) {
        return;
      }

      const context = contextRef.current;
      const now = timestamp;
      const target = 1000 / context.fps;

      if (!context.__lastTargetTime) {
        context.__lastTargetTime = now;
        context.__lastRealTime = now;
        frameStartTimeRef.current = now;
        lastFpsUpdateRef.current = now;
      }

      const sinceLast = now - context.__lastTargetTime;
      const epsilon = 5;

      if (sinceLast >= target - epsilon) {
        const frameStart =
          enablePerformanceTracking && context.__performance
            ? performance.now()
            : 0;

        context.deltaTime = now - context.__lastRealTime;
        draw(context);
        if (context.time > 1e7) context.time = 0;
        if (context.frame > 1e7) context.frame = 0;
        context.time += context.deltaTime / 1000; // Convert ms to seconds

        context.frame++;
        context.__lastTargetTime = now;
        context.__lastRealTime = now;

        // Performance tracking
        if (enablePerformanceTracking && context.__performance) {
          const frameTime = performance.now() - frameStart;
          const targetFrameTime = 1000 / context.fps;

          frameTimeHistoryRef.current.push(frameTime);
          if (frameTimeHistoryRef.current.length > 60) {
            frameTimeHistoryRef.current.shift(); // Keep last 60 frames
          }

          // Update metrics
          const avgFrameTime =
            frameTimeHistoryRef.current.reduce((a, b) => a + b, 0) /
            frameTimeHistoryRef.current.length;
          context.__performance.frameTime = frameTime;
          context.__performance.averageFrameTime = avgFrameTime;
          context.__performance.minFrameTime = Math.min(
            ...frameTimeHistoryRef.current
          );
          context.__performance.maxFrameTime = Math.max(
            ...frameTimeHistoryRef.current
          );

          if (frameTime > targetFrameTime * 1.1) {
            droppedFramesRef.current++;
          }
          context.__performance.droppedFrames = droppedFramesRef.current;

          // Update FPS every second
          frameCountRef.current++;
          if (now - lastFpsUpdateRef.current >= 1000) {
            context.__performance.fps = frameCountRef.current;
            frameCountRef.current = 0;
            lastFpsUpdateRef.current = now;

            // Memory usage if available
            if (
              typeof performance !== "undefined" &&
              (performance as any).memory
            ) {
              context.__performance.memoryUsage =
                (performance as any).memory.usedJSHeapSize / 1048576; // MB
            }
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    },
    [draw, isVisible, contextRef, enablePerformanceTracking]
  );

  return {
    animate,
    animationFrameId,
  };
}

// Entry point
export default function Klint({
  context,
  setup,
  draw,
  options = {},
  preload,
  onVisible,
  enablePerformanceTracking = false,
}: KlintProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<KlintContext | null>(null); // KlintCoreContext | undefined
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const resizeCallbackRef = useRef<((this: Window, ev: UIEvent) => any) | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(true);

  // HMR cleanup for development
  useEffect(() => {
    // Vite HMR
    if (typeof import.meta !== "undefined" && (import.meta as any).hot) {
      (import.meta as any).hot.dispose(() => {
        console.log("[Klint] Component unmounting due to HMR");
        // Force cleanup of any pending animations
        if (contextRef.current) {
          contextRef.current.__isPlaying = false;
        }
      });
    }

    // Webpack HMR fallback
    if (typeof module !== "undefined" && (module as any).hot) {
      (module as any).hot.dispose(() => {
        console.log("[Klint] Component unmounting due to Webpack HMR");
        if (contextRef.current) {
          contextRef.current.__isPlaying = false;
        }
      });
    }
  }, []);
  const __options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const [toStaticImage, setStaticImage] = useState<string | null>(null);

  const initContext = context?.initCoreContext;
  const { animate, animationFrameId } = useAnimate(
    contextRef,
    draw,
    isVisible,
    enablePerformanceTracking
  );

  const updateCanvasSize = (shouldRedraw = false) => {
    if (!containerRef.current || !contextRef.current || !canvasRef.current)
      return;
    const container = containerRef.current;
    const context = contextRef.current;
    const canvas = canvasRef.current;

    const { width, height } = container.getBoundingClientRect();
    const config = context.saveConfig();
    context.dpr = context.__dpr;
    canvas.width = context.width = ~~(width * context.__dpr);
    canvas.height = context.height = ~~(height * context.__dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.restoreConfig(config);
    if (__options.origin === "center") {
      context.translate(canvas.width * 0.5, canvas.height * 0.5);
    }
    if (shouldRedraw) draw(context);
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const defaultDPR = window.devicePixelRatio || 3;
    const dpr = __options.dpr
      ? __options.dpr === "default"
        ? defaultDPR
        : __options.dpr
      : defaultDPR;

    contextRef.current = initContext ? initContext(canvas, __options) : null;
    const context = contextRef.current;
    if (!context) return;

    context.__dpr = dpr;

    // Initialize performance tracking if enabled
    if (enablePerformanceTracking) {
      context.__performance = {
        fps: 0,
        frameTime: 0,
        averageFrameTime: 0,
        minFrameTime: Infinity,
        maxFrameTime: 0,
        droppedFrames: 0,
      };
    }

    if (__options.fps && __options.fps !== context.fps) {
      context.fps = __options.fps;
    }

    updateCanvasSize();

    if (__options.ignoreResize !== "true") {
      const handleResize = () => {
        updateCanvasSize(context.__isReadyToDraw);
      };
      window.addEventListener("resize", handleResize);

      resizeCallbackRef.current = handleResize;
    }

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          onVisible?.(context);
        });
      },
      { threshold: 0.1, root: null, rootMargin: "50px" }
    );
    intersectionObserverRef.current.observe(container);

    const initializeKlint = async () => {
      if (!context) return;

      const handleStaticMode = () => {
        try {
          const imageUrl = canvas.toDataURL("image/png");
          setStaticImage(imageUrl);
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          throw new Error(`Klint draw error in static mode: ${message}`);
        }
      };

      const initializeContext = async (unsafeReset = false) => {
        // Preload phase
        if (preload && (unsafeReset || !context.__isPreloaded)) {
          try {
            await preload(context);
            if (!unsafeReset) context.__isPreloaded = true;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            throw new Error(`Klint error in the preload: ${message}`);
          }
        }

        // Setup phase
        if (setup && (unsafeReset || !context.__isSetup)) {
          try {
            setup(context);
            if (!unsafeReset) context.__isSetup = true;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            throw new Error(`Klint error in the setup: ${message}`);
          }
        }

        if (draw && !context.__isReadyToDraw) {
          try {
            draw(context);
            context.__isReadyToDraw = true;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            throw new Error(`Klint error in the draw: ${message}`);
          }
        }
      };

      const unsafeMode = __options.unsafemode === "true";
      if (!unsafeMode && context.__isReadyToDraw) return;

      await initializeContext(unsafeMode);

      if (__options.static === "true") {
        handleStaticMode();
      } else {
        if (__options.noloop !== "true") animate();
      }
    };

    initializeKlint();

    return () => {
      if (resizeCallbackRef.current) {
        window.removeEventListener("resize", resizeCallbackRef.current);
      }

      intersectionObserverRef.current?.disconnect();
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // Not ideal, but without an empty array, everything get recomputed unnecesseraly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {toStaticImage ? (
        <img
          src={toStaticImage}
          alt={contextRef.current?.__description || DEFAULT_ALT}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            display: __options.nocanvas === "true" ? "none" : "block",
          }}
          aria-label={contextRef.current?.__description || DEFAULT_ALT}
          role="img"
        />
      )}
    </div>
  );
}
