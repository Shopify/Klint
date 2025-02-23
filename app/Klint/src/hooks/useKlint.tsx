import { useRef, useCallback, useState, useEffect } from "react";
import { KlintContext, KlintMouse } from "../component/KlintTypes";
import { KlintCoreFunctions } from "../component/KlintCoreFunctions";
import { KlintFunctions } from "../component/KlintFunctions";

export type {
  KlintContext,
  KlintOffscreenContext,
  KlintContexts,
  KlintMouse,
} from "../component/KlintTypes";

export function buildKlintContext(ctx: CanvasRenderingContext2D): KlintContext {
  const context = ctx as unknown as KlintContext;
  // Initialize core properties
  context.__isMainContext = true;
  context.fps = 60;
  context.frame = 0;
  context.time = 0;
  context.deltaTime = 0;
  context.mouse = {
    x: 0,
    y: 0,
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    isPressed: false,
    isHover: false,
    ctx: context,
  };

  // Initialize defaults
  context.__imageOrigin = "corner";
  context.__rectangleOrigin = "corner";
  context.__canvasOrigin = "corner";
  context.__textFont = "sans-serif";
  context.__textWeight = "normal";
  context.__textStyle = "normal";
  context.__textSize = 120;
  context.__textAlignment = {
    horizontal: "left" as CanvasTextAlign,
    vertical: "top" as CanvasTextBaseline,
  };
  context.__offscreens = new Map();
  context.__isPlaying = true;
  context.__currentContext = context;

  // Add Klint core functions
  Object.entries(KlintCoreFunctions).forEach(([name, fn]) => {
    context[name] = fn(context as unknown as KlintContext);
  });
  // Add Klint functions
  Object.entries(KlintFunctions).forEach(([name, fn]) => {
    context[name] = fn(context as unknown as KlintContext);
  });

  return context;
}

interface KlintCallbacks {
  mousemove?: string;
  mouseenter?: string;
  mouseleave?: string;
  mousedown?: string;
  mouseup?: string;
  click?: string;
}

// Types for mouse event handlers
type MouseEventCallback = (context: KlintContext, event: MouseEvent) => void;
type MouseHandler = (callback: MouseEventCallback) => void;

interface MouseControls {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  angle: number;
  isPressed: boolean;
  isHover: boolean;
  onClick: (callback: MouseEventCallback | null) => void;
  onMouseIn: MouseHandler;
  onMouseOut: MouseHandler;
  onMouseDown: MouseHandler;
  onMouseUp: MouseHandler;
}

interface MouseState {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  angle: number;
  isPressed: boolean;
  isHover: boolean;
}

export default function useKlint() {
  const contextRef = useRef<KlintContext | null>(null);
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
    ctx: null,
  });
  const eventCallbacks = useRef<Record<string, MouseEventCallback>>({});
  const isInitialized = useRef(false);
  const [mouseState, setMouseState] = useState<MouseState>({
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
  const mouseCallbacksRef = useRef<Record<string, MouseEventCallback | null>>({
    click: null,
    mouseenter: null,
    mouseleave: null,
    mousedown: null,
    mouseup: null,
  });

  const initMouse = useCallback((ctx: KlintContext) => {
    const eventHandlers = {
      mousemove: (e: MouseEvent) => {
        mouseRef.current.ctx = ctx;
        const rect = ctx.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 3;
        const origin = ctx.__canvasOrigin;
        const prevX = mouseRef.current.x;
        const prevY = mouseRef.current.y;

        mouseRef.current.px = prevX;
        mouseRef.current.py = prevY;
        mouseRef.current.x =
          origin === "center"
            ? (e.clientX - rect.left) * dpr - ctx.canvas.width / 2
            : (e.clientX - rect.left) * dpr;
        mouseRef.current.y =
          origin === "center"
            ? (e.clientY - rect.top) * dpr - ctx.canvas.height / 2
            : (e.clientY - rect.top) * dpr;
        mouseRef.current.vx = mouseRef.current.x - prevX;
        mouseRef.current.vy = mouseRef.current.y - prevY;
        mouseRef.current.angle = Math.atan2(
          mouseRef.current.vy,
          mouseRef.current.vx
        );
        eventCallbacks.current.mousemove?.(ctx, e);
      },
      mouseenter: () => {
        mouseRef.current.isHover = true;
        eventCallbacks.current.mouseenter?.(ctx, e);
      },
      mouseleave: () => {
        mouseRef.current.isHover = false;
        eventCallbacks.current.mouseleave?.(ctx, e);
      },
      mousedown: () => {
        mouseRef.current.isPressed = true;
        eventCallbacks.current.mousedown?.(ctx, e);
      },
      mouseup: () => {
        mouseRef.current.isPressed = false;
        eventCallbacks.current.mouseup?.(ctx, e);
      },
      click: () => {
        eventCallbacks.current.click?.(ctx, e);
      },
    };

    const boundEvents = new Set<keyof KlintCallbacks>();

    // Cleanup function
    return () => {
      boundEvents.forEach((event) => {
        ctx.canvas.removeEventListener(event, eventHandlers[event]);
      });
    };
  }, []);

  // Mouse controls hook
  const useMouse = (): MouseControls => {
    useEffect(() => {
      if (isInitialized.current || !contextRef.current) return;
      isInitialized.current = true;

      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;

      const handleMouseMove = (e: MouseEvent) => {
        setMouseState((prev) => {
          const rect = canvas.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;
          const origin = ctx.__canvasOrigin;

          const x = Math.floor(
            origin === "center"
              ? (e.clientX - rect.left) * dpr - canvas.width / 2
              : (e.clientX - rect.left) * dpr
          );
          const y = Math.floor(
            origin === "center"
              ? (e.clientY - rect.top) * dpr - canvas.height / 2
              : (e.clientY - rect.top) * dpr
          );

          const vx = x - prev.x;
          const vy = y - prev.y;
          const angle = Math.atan2(vy, vx);

          return {
            ...prev,
            px: prev.x,
            py: prev.y,
            x,
            y,
            vx,
            vy,
            angle,
          };
        });
      };

      const handleClick = (e: MouseEvent) => {
        if (mouseCallbacksRef.current.click && contextRef.current) {
          mouseCallbacksRef.current.click(contextRef.current, e);
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        setMouseState((prev) => ({ ...prev, isPressed: true }));
        if (mouseCallbacksRef.current.mousedown && contextRef.current) {
          mouseCallbacksRef.current.mousedown(contextRef.current, e);
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        setMouseState((prev) => ({ ...prev, isPressed: false }));
        if (mouseCallbacksRef.current.mouseup && contextRef.current) {
          mouseCallbacksRef.current.mouseup(contextRef.current, e);
        }
      };

      const handleMouseEnter = (e: MouseEvent) => {
        setMouseState((prev) => ({ ...prev, isHover: true }));
        if (mouseCallbacksRef.current.mouseenter && contextRef.current) {
          mouseCallbacksRef.current.mouseenter(contextRef.current, e);
        }
      };

      const handleMouseLeave = (e: MouseEvent) => {
        setMouseState((prev) => ({ ...prev, isHover: false }));
        if (mouseCallbacksRef.current.mouseleave && contextRef.current) {
          mouseCallbacksRef.current.mouseleave(contextRef.current, e);
        }
      };

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("click", handleClick);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleClick);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        isInitialized.current = false;
      };
    }, []);

    return {
      ...mouseState,
      onClick: (callback: MouseEventCallback | null) => {
        mouseCallbacksRef.current.click = callback;
      },
      onMouseIn: (callback: MouseEventCallback) => {
        mouseCallbacksRef.current.mouseenter = callback;
      },
      onMouseOut: (callback: MouseEventCallback) => {
        mouseCallbacksRef.current.mouseleave = callback;
      },
      onMouseDown: (callback: MouseEventCallback) => {
        mouseCallbacksRef.current.mousedown = callback;
      },
      onMouseUp: (callback: MouseEventCallback) => {
        mouseCallbacksRef.current.mouseup = callback;
      },
    };
  };

  const initCoreContext = useCallback(
    (canvas: HTMLCanvasElement): KlintContext => {
      if (!contextRef.current) {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Failed to get canvas context");
        contextRef.current = buildKlintContext(ctx);
      }
      return contextRef.current;
    },
    []
  );

  return {
    context: {
      context: contextRef.current,
      initCoreContext,
      mouse: { current: mouseRef.current, initMouse },
    },
    useMouse,
  };
}
