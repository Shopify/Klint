import { useRef, useEffect, useCallback, useState } from "react";

import {
  KlintProps,
  KlintContext,
  KlintMouse,
  KlintScroll,
  KlintCanvasOptions,
} from "./KlintTypes";

export type {
  KlintProps,
  KlintContext,
  KlintOffscreenContext,
  KlintMouse,
  KlintScroll,
  KlintCanvasOptions,
  KlintConfig,
} from "./KlintTypes";

// import { KlintFunctions } from "./KlintFunctions";

const DEFAULT_FPS = 60;
const DEFAULT_ALT = "A beautiful artwork made with Klint Canvas";
export const EPSILON = 0.0001;

const DEFAULT_OPTIONS: KlintCanvasOptions = {
  alpha: "true",
  ignoreMouse: "false",
  ignoreScroll: "true",
  ignoreKeyboard: "true",
  ignoreResize: "false",
  noloop: "false",
  static: "false",
  nocanvas: "false",
  unsafemode: "false",
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

const createEventHandler = (
  mouseRef: React.RefObject<KlintMouse>,
  contextRef: React.RefObject<KlintContext>,
  containerRef: React.RefObject<HTMLDivElement>,
  callbacks: {
    onMouseIn?: (context: KlintContext) => void;
    onMouseOut?: (context: KlintContext) => void;
    onClick?: (context: KlintContext) => void;
    onScroll?: (
      context: KlintContext,
      scrollData: { distance: number; velocity: number }
    ) => void;
    onKeyPressed?: (context: KlintContext, key: string) => void;
    onRelease?: (context: KlintContext) => void;
  },
  scrollRef: React.RefObject<KlintScroll>,
  updateMousePosition: (
    clientX: number,
    clientY: number,
    containerRef: React.RefObject<HTMLDivElement>,
    contextRef: React.RefObject<KlintContext>,
    mouseRef: React.RefObject<KlintMouse>
  ) => void,
  updateKlintScroll: (
    wheel: WheelEvent,
    scrollRef: React.RefObject<KlintScroll>,
    contextRef: React.RefObject<KlintContext>,
    callbacks: {
      onScroll?: (
        context: KlintContext,
        scrollData: { distance: number; velocity: number }
      ) => void;
    }
  ) => void
) => {
  const handlers = {
    move: (e: Event) => {
      if (!mouseRef.current) return;
      const event = e as MouseEvent | TouchEvent;
      const { clientX, clientY } =
        event instanceof TouchEvent ? event.touches[0] : event;
      updateMousePosition(clientX, clientY, containerRef, contextRef, mouseRef);
      if (event instanceof TouchEvent) event.preventDefault();
    },
    down: () => mouseRef.current && (mouseRef.current.isPressed = true),
    up: () => mouseRef.current && (mouseRef.current.isPressed = false),
    enter: () => {
      if (!mouseRef.current) return;
      mouseRef.current.isHover = true;
      if (contextRef.current) callbacks.onMouseIn?.(contextRef.current);
    },
    leave: () => {
      if (!mouseRef.current) return;
      mouseRef.current.isHover = false;
      if (contextRef.current) callbacks.onMouseOut?.(contextRef.current);
    },
    click: () => {
      if (contextRef.current) callbacks.onClick?.(contextRef.current);
    },
    scroll: (e: Event) => {
      const wheel = e as WheelEvent;
      updateKlintScroll(wheel, scrollRef, contextRef, {
        onScroll: callbacks.onScroll,
      });
      wheel.preventDefault();
    },
    keypress: (e: Event) => {
      const event = e as KeyboardEvent;
      if (contextRef.current)
        callbacks.onKeyPressed?.(contextRef.current, event.key);
    },
    release: () => {
      if (contextRef.current) callbacks.onRelease?.(contextRef.current);
    },
  };

  return handlers;
};

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
  onScroll,
  onKeyPressed,
  onRelease,
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
  const __options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
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

  const updateScrollState = (
    wheel: WheelEvent,
    scrollRef: React.RefObject<KlintScroll>,
    contextRef: React.RefObject<KlintContext>,
    callbacks: {
      onScroll?: (
        context: KlintContext,
        scrollData: { distance: number; velocity: number }
      ) => void;
    }
  ) => {
    if (!scrollRef.current || !contextRef.current) return;

    const now = performance.now();
    const deltaTime = now - scrollRef.current.lastTime;
    const spring = 0.3;
    const damping = 0.75;
    const epsilon = 0.075; // Threshold for zeroing out velocity

    // Update velocity with spring physics
    scrollRef.current.velocity =
      deltaTime > 0
        ? (wheel.deltaY / deltaTime) * spring +
          scrollRef.current.velocity * damping
        : scrollRef.current.velocity * damping;

    // Force velocity to 0 if it's very small
    if (Math.abs(scrollRef.current.velocity) < epsilon) {
      scrollRef.current.velocity = 0;
    }

    // Apply velocity to distance
    scrollRef.current.distance += scrollRef.current.velocity;
    scrollRef.current.lastTime = now;

    // Decelerate when no input
    if (Math.abs(wheel.deltaY) < 0.01) {
      scrollRef.current.velocity *= damping;
    }

    callbacks.onScroll?.(contextRef.current, {
      distance: Math.min(Math.max(scrollRef.current.distance, -100000), 100000),
      velocity: Math.abs(scrollRef.current.velocity),
    });
  };

  const scrollRef = useRef<KlintScroll>({
    distance: 0,
    velocity: 0,
    lastTime: performance.now(),
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlers = createEventHandler(
      mouseRef,
      contextRef,
      containerRef,
      { onMouseIn, onMouseOut, onClick, onScroll, onKeyPressed, onRelease },
      scrollRef,
      updateMousePosition,
      updateScrollState
    );

    const eventMap: Record<
      string,
      {
        events: Array<[keyof HTMLElementEventMap, (e: Event) => void]>;
        ignore: boolean;
      }
    > = {
      mouse: {
        events: [
          ["mousemove", handlers.move],
          ["mousedown", handlers.down],
          ["mouseup", handlers.up],
          ["mouseenter", handlers.enter],
          ["mouseleave", handlers.leave],
        ],
        ignore: __options.ignoreMouse === "true",
      },
      click: {
        events: [["click", handlers.click]],
        ignore: false, // Never ignore if onClick exists
      },
      scroll: {
        events: [["wheel", handlers.scroll]],
        ignore: __options.ignoreScroll === "true",
      },
      keyboard: {
        events: [
          ["keypress", handlers.keypress],
          ["keyup", handlers.release],
        ],
        ignore: __options.ignoreKeyboard === "true",
      },
    };
    // Add event listeners based on options and callback existence
    Object.entries(eventMap).forEach(([type, { events, ignore }]) => {
      if (ignore) return;
      // Special case for click
      if (type === "click" && !onClick) return;

      events.forEach(([event, handler]) => {
        container.addEventListener(event, handler as EventListener);
      });
    });
    return () => {
      Object.values(eventMap).forEach(({ events }) => {
        events.forEach(([event, handler]) => {
          container.removeEventListener(event, handler as EventListener);
        });
      });
    };
  }, [
    onMouseIn,
    onMouseOut,
    onClick,
    onScroll,
    onKeyPressed,
    onRelease,
    __options.ignoreMouse,
    __options.ignoreScroll,
    __options.ignoreKeyboard,
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
      context.__mousePosition = {
        x: context.width * 0.5,
        y: context.height * 0.5,
      };
    }

    if (__options.fps && __options.fps !== context.fps) {
      context.fps = __options.fps;
    }

    updateCanvasSize();

    if (options.ignoreResize !== "true") {
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

      // Unsafe mode - reload everything on each re-render.
      // Used for the Editor, do not use unless you know what you're doing.
      if (__options.unsafemode === "true") {
        try {
          if (preload) {
            await preload(context);
          }
          if (setup) {
            setup(context);
          }
          context.__isReadyToDraw = true;

          if (__options.static === "true") {
            draw(context);
            const imageUrl = canvas.toDataURL("image/png");
            setStaticImage(imageUrl);
            return;
          }

          setIsReady(true);
          if (__options.noloop !== "true") animate();
        } catch (error) {
          console.error("Fatal Klint initialization error:", error);
          context.__isReadyToDraw = false;
        }
        return;
      }

      // Safe mode - normal initialization with state checks
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
