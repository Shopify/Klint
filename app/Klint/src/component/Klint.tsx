import {
  useRef,
  useEffect,
  useState,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";

import {
  KlintProps,
  KlintContext,
  KlintMouse,
  KlintScroll,
  KlintCanvasOptions,
} from "./KlintTypes";

import { useEventHandlers } from "./hooks/useEvents";
import { useAnimate } from "./hooks/useAnimate";

export type {
  KlintProps,
  KlintContext,
  KlintOffscreenContext,
  KlintMouse,
  KlintScroll,
  KlintCanvasOptions,
  KlintConfig,
} from "./KlintTypes";

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
  const scrollRef = useRef<KlintScroll>({
    distance: 0,
    velocity: 0,
    lastTime: 0,
  });
  const __options = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const [isReady, setIsReady] = useState(false);
  const [toStaticImage, setStaticImage] = useState<string | null>(null);

  let initContext:
    | ((canvas: HTMLCanvasElement) => KlintContext | null)
    | undefined;
  if (context) {
    initContext = context.initCoreContext;
  }

  const handlers = useEventHandlers(
    mouseRef,
    contextRef,
    containerRef,
    { onMouseIn, onMouseOut, onClick, onScroll, onKeyPressed, onRelease },
    scrollRef
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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

    // Add event listeners
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
    handlers,
    onClick,
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

      const handleStaticMode = () => {
        draw(context);
        const imageUrl = canvas.toDataURL("image/png");
        setStaticImage(imageUrl);
      };

      const startAnimation = () => {
        setIsReady(true);
        if (__options.noloop !== "true") animate();
      };

      const initializeContext = async (skipStateChecks = false) => {
        if (preload && (skipStateChecks || !context.__isPreloaded)) {
          await preload(context);
          if (!skipStateChecks) context.__isPreloaded = true;
        }

        if (setup && (skipStateChecks || !context.__isSetup)) {
          setup(context);
          if (!skipStateChecks) context.__isSetup = true;
        }

        context.__isReadyToDraw = true;
      };

      try {
        // Unsafe mode - reload everything on each re-render
        if (__options.unsafemode === "true") {
          await initializeContext(true);
          return __options.static === "true"
            ? handleStaticMode()
            : startAnimation();
        }

        // Safe mode - normal initialization with state checks
        if (context.__isReadyToDraw) return;
        await initializeContext();

        return __options.static === "true"
          ? handleStaticMode()
          : startAnimation();
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

  const { animate } = useAnimate(contextRef, draw, isVisible);

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
    <KlintErrorBoundary>
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
    </KlintErrorBoundary>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class KlintErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Klint error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{ padding: "20px", color: "red" }}>
            Something went wrong with the canvas.
          </div>
        )
      );
    }

    return this.props.children;
  }
}
