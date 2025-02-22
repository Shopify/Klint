import { useRef, useCallback } from "react";
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
    _isSetup: false,
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

// Modified hook
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
    _isSetup: false,
  });

  const initMouse = useCallback(
    (
      ctx: KlintContext,
      callbacks?: {
        onMouseIn?: () => void;
        onMouseOut?: () => void;
        onClick?: () => void;
        onKeyPressed?: (key: string) => void;
        onRelease?: () => void;
      }
    ) => {
      const updateMousePosition = (e: MouseEvent) => {
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
      };

      const handleMouseEnter = () => {
        mouseRef.current.isHover = true;
        callbacks?.onMouseIn?.();
      };

      const handleMouseLeave = () => {
        mouseRef.current.isHover = false;
        callbacks?.onMouseOut?.();
      };

      const handleMouseDown = () => {
        mouseRef.current.isPressed = true;
      };

      const handleMouseUp = () => {
        mouseRef.current.isPressed = false;
        callbacks?.onRelease?.();
      };

      const handleClick = () => {
        callbacks?.onClick?.();
      };
      if (!mouseRef.current._isSetup) {
        ctx.canvas.addEventListener("mousemove", updateMousePosition);
        ctx.canvas.addEventListener("mouseenter", handleMouseEnter);
        ctx.canvas.addEventListener("mouseleave", handleMouseLeave);
        ctx.canvas.addEventListener("mousedown", handleMouseDown);
        ctx.canvas.addEventListener("mouseup", handleMouseUp);
        ctx.canvas.addEventListener("click", handleClick);
      }

      return () => {
        ctx.canvas.removeEventListener("mousemove", updateMousePosition);
        ctx.canvas.removeEventListener("mouseenter", handleMouseEnter);
        ctx.canvas.removeEventListener("mouseleave", handleMouseLeave);
        ctx.canvas.removeEventListener("mousedown", handleMouseDown);
        ctx.canvas.removeEventListener("mouseup", handleMouseUp);
        ctx.canvas.removeEventListener("click", handleClick);
      };
    },
    []
  );

  const useMouse = useCallback(() => mouseRef.current, []);

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
