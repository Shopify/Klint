import { useRef, useEffect, useMemo, useCallback, useState } from "react";

import {
  KlintProps,
  // KlintOffscreenContext,
  KlintContext,
  KlintMouse,
  KlintCanvasOptions,
} from "./KlintTypes";

export type {
  KlintProps,
  KlintContext,
  KlintOffscreenContext,
  KlintMouse,
  KlintCanvasOptions,
  KlintConfig,
} from "./KlintTypes";

import { KlintFunctions } from "./KlintFunctions";

const DEFAULT_FPS = 60;
const DEFAULT_ALT = "A beautiful artwork made with Klint Canvas";

const DEFAULT_OPTIONS: KlintCanvasOptions = {
  alpha: "true",
  ignoremouse: "false",
  ignoreresize: "false",
  noloop: "false",
  ignorefunctions: "false",
  static: "false",
  nocanvas: "false",
  willreadfrequently: "false",
  fps: DEFAULT_FPS,
  origin: "corner",
};

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
  "__textAlignment",
] as const;

// Entry point
export default function Klint({
  context,
  setup,
  draw,
  options = {},
  preload,
  onClick,
  onResize,
  onMouseIn,
  onMouseOut,
}: KlintProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<KlintContext | null>(null); // KlintCoreContext | undefined
  const animationFrameId = useRef<number>();
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const mouseRef = useRef<KlintMouse>({
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    isPressed: false,
    isHover: false,
  });
  const __options = useMemo(() => {
    return {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }, [options]);
  const [isReady, setIsReady] = useState(false);
  const [toStaticImage, setStaticImage] = useState<string | null>(null);
  // from the hook
  let initContext:
    | ((canvas: HTMLCanvasElement) => KlintContext | null)
    | undefined;
  if (context) {
    initContext = context.initCoreContext;
  }
  const updateMousePosition = (
    clientX: number,
    clientY: number,
    containerRef: React.RefObject<HTMLDivElement>,
    contextRef: React.RefObject<KlintContext>,
    mouseRef: React.RefObject<KlintMouse>
  ) => {
    if (!contextRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const context = contextRef.current;
    const dpr = context.__dpr;
    const mouse = mouseRef.current;
    const origin = context.__canvasOrigin;
    if (mouse) {
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x =
        origin === "center"
          ? (clientX - rect.left) * dpr - context.canvas.width / 2
          : (clientX - rect.left) * dpr;
      mouse.y =
        origin === "center"
          ? (clientY - rect.top) * dpr - context.canvas.height / 2
          : (clientY - rect.top) * dpr;
      mouse.vx = mouse.x - mouse.px;
      mouse.vy = mouse.y - mouse.py;
      mouse.angle = Number(
        ((Math.atan2(mouse.vy, mouse.vx) * 180) / Math.PI).toFixed(4)
      );

      contextRef.current.mouse = mouse;
    }
  };

  const handlePointerMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (e.type.startsWith("touch")) {
      e.preventDefault();
      const touch = (e as TouchEvent).touches[0];
      updateMousePosition(
        touch.clientX,
        touch.clientY,
        containerRef,
        contextRef,
        mouseRef
      );
    } else {
      updateMousePosition(
        (e as MouseEvent).clientX,
        (e as MouseEvent).clientY,
        containerRef,
        contextRef,
        mouseRef
      );
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    if (mouseRef.current) {
      mouseRef.current.isPressed = true;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (mouseRef.current) {
      mouseRef.current.isPressed = false;
    }
  }, []);

  const handlePointerEnter = useCallback(() => {
    if (mouseRef.current) {
      mouseRef.current.isHover = true;
    }
    if (contextRef.current) onMouseIn?.(contextRef.current);
  }, [onMouseIn]);

  const handlePointerLeave = useCallback(() => {
    if (mouseRef.current) {
      mouseRef.current.isHover = false;
    }
    if (contextRef.current) onMouseOut?.(contextRef.current);
  }, [onMouseOut]);

  const handleClick = useCallback(() => {
    if (mouseRef.current) {
      mouseRef.current.isHover = false;
    }
    if (contextRef.current) onClick?.(contextRef.current);
  }, [onClick]);

  useEffect(() => {
    if (__options.ignoremouse === "true") return;

    const container = containerRef.current;
    if (!container) return;

    // Mouse events (non-passive)
    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("mousedown", handlePointerDown);
    container.addEventListener("mouseup", handlePointerUp);
    container.addEventListener("mouseenter", handlePointerEnter);
    container.addEventListener("mouseleave", handlePointerLeave);
    container.addEventListener("click", handleClick);

    // Touch events (passive)
    container.addEventListener("touchmove", handlePointerMove, {
      passive: false,
    });
    container.addEventListener("touchstart", handlePointerMove, {
      passive: true,
    });
    container.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    container.addEventListener("touchend", handlePointerUp, { passive: true });

    // Document-level events
    document.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("touchend", handlePointerUp, { passive: true });

    return () => {
      // Mouse cleanup
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("mousedown", handlePointerDown);
      container.removeEventListener("mouseup", handlePointerUp);
      container.removeEventListener("mouseenter", handlePointerEnter);
      container.removeEventListener("mouseleave", handlePointerLeave);
      container.removeEventListener("click", handleClick);
      // Touch cleanup
      container.removeEventListener("touchmove", handlePointerMove);
      container.removeEventListener("touchstart", handlePointerMove);
      container.removeEventListener("touchstart", handlePointerDown);
      container.removeEventListener("touchend", handlePointerUp);

      // Document cleanup
      document.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("touchend", handlePointerUp);
    };
  }, [
    handlePointerMove,
    handlePointerDown,
    handlePointerUp,
    handlePointerEnter,
    handlePointerLeave,
    handleClick,
    __options.ignoremouse,
  ]);

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
    const dpr = window.devicePixelRatio || 3;

    contextRef.current = initContext ? initContext(canvas) : null;
    const context = contextRef.current;
    if (!context) return;
    context.__dpr = dpr;

    if (__options.origin === "center") {
      context.__imageOrigin = "center";
      context.__rectangleOrigin = "center";
      context.__canvasOrigin = "center";
    }

    if (__options.fps && __options.fps !== context.fps) {
      context.fps = __options.fps;
    }

    if (__options.ignorefunctions !== "true") {
      Object.entries(KlintFunctions).forEach(([name, fn]) => {
        contextRef.current![name] = fn(context as KlintContext);
      });
    }

    updateCanvasSize();

    if (options.ignoreresize !== "true") {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateCanvasSize(context.__isReadyToDraw);
        onResize?.(context);
      });
      resizeObserverRef.current.observe(container);
    }

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, root: null, rootMargin: "50px" }
    );
    intersectionObserverRef.current.observe(canvas);

    const initializeKlint = async () => {
      if (!context) return;
      if (context.__isReadyToDraw) return;

      try {
        try {
          if (preload && !context.__isPreloaded) {
            await preload(context);
          }
        } catch (error) {
          console.error("Error during preload:", error);
          throw error;
        } finally {
          context.__isPreloaded = true;
        }

        try {
          if (setup && !context.__isSetup) {
            setup(context);
          }
        } catch (error) {
          console.error("Error during setup:", error);
          throw error;
        } finally {
          context.__isSetup = true;
        }
        context.__isReadyToDraw = true;
        if (__options.static === "true") {
          try {
            draw(context);
            const imageUrl = canvas.toDataURL("image/png");
            setStaticImage(imageUrl);
            return;
          } catch (error) {
            console.error("Error in static mode:", error);
            throw error;
          }
        }
        setIsReady(true);
        if (__options.noloop !== "true") animate();
      } catch (error) {
        console.error("Fatal Klint initialization error:", error);
        context.__isReadyToDraw = false;
      }
    };

    initializeKlint();

    return () => {
      resizeObserverRef.current?.disconnect();
      intersectionObserverRef.current?.disconnect();
    };
    // Not ideal, but without an empty array, everything get recomputed unnecesseraly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animate = useCallback(() => {
    if (!contextRef.current || !isVisible) return;
    if (!contextRef.current.__isReadyToDraw) return;
    if (!contextRef.current.__isPlaying) {
      // Schedule next frame even when paused to allow resuming
      animationFrameId.current = requestAnimationFrame(animate);
      return;
    }
    const context = contextRef.current;
    const now = performance.now();
    const target = 1000 / context.fps;
    if (!context.__lastTargetTime) {
      context.__lastTargetTime = now;
      context.__lastRealTime = now;
    }
    const sinceLast = now - context.__lastTargetTime;
    const epsilon = 5;

    if (sinceLast >= target - epsilon) {
      context.deltaTime = now - context.__lastRealTime;
      draw(context);
      if (context.time > 1e7) context.time = 0;
      if (context.frame > 1e7) context.frame = 0;
      context.time += context.deltaTime / DEFAULT_FPS;
      context.frame++;
      context.__lastTargetTime = Math.max(
        context.__lastTargetTime + target,
        now
      );
      context.__lastRealTime = now;
    }
    animationFrameId.current = requestAnimationFrame(animate);
  }, [draw, isVisible]);

  useEffect(() => {
    if (!contextRef.current) return;
    if (!isReady) return;

    draw(contextRef.current);
    if (!isVisible) return;
    if (__options.noloop !== "true") {
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, isVisible, __options.noloop, draw, isReady]);

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
