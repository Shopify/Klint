import { useRef, useCallback, useEffect } from "react";
import { KlintContext, KlintMouse, KlintScroll } from "../component/KlintTypes";
import { KlintCoreFunctions } from "../component/KlintCoreFunctions";
import { KlintFunctions } from "../component/KlintFunctions";

export type {
  KlintContext,
  KlintOffscreenContext,
  KlintContexts,
  KlintMouse,
} from "../component/KlintTypes";

const DEFAULT_MOUSE_STATE: KlintMouse = {
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

const DEFAULT_SCROLL_STATE: KlintScroll = {
  distance: 0,
  velocity: 0,
  lastTime: 0,
};

export default function useKlint() {
  const contextRef = useRef<KlintContext | null>(null);
  const mouseRef = useRef<KlintMouse | null>(null);
  const scrollRef = useRef<KlintScroll | null>(null);

  const useMouse = () => {
    mouseRef.current = DEFAULT_MOUSE_STATE;
    const clickCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseInCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseOutCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseDownCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseUpCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);

    useEffect(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;

      const updateMousePosition = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const origin = contextRef.current?.__canvasOrigin || "corner";

        const x =
          origin === "center"
            ? (e.clientX - rect.left) * dpr - canvas.width / 2
            : (e.clientX - rect.left) * dpr;
        const y =
          origin === "center"
            ? (e.clientY - rect.top) * dpr - canvas.height / 2
            : (e.clientY - rect.top) * dpr;

        if (mouseRef.current) {
          mouseRef.current.px = mouseRef.current.x;
          mouseRef.current.py = mouseRef.current.y;
          mouseRef.current.x = x;
          mouseRef.current.y = y;
          mouseRef.current.vx = x - mouseRef.current.px;
          mouseRef.current.vy = y - mouseRef.current.py;
          mouseRef.current.angle = Math.atan2(
            mouseRef.current.vy,
            mouseRef.current.vx
          );
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isPressed = true;
        if (mouseDownCallbackRef.current) mouseDownCallbackRef.current(ctx, e);
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isPressed = false;
        if (mouseUpCallbackRef.current) mouseUpCallbackRef.current(ctx, e);
      };

      const handleMouseEnter = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isHover = true;
        if (mouseInCallbackRef.current) mouseInCallbackRef.current(ctx, e);
      };

      const handleMouseLeave = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isHover = false;
        if (mouseOutCallbackRef.current) mouseOutCallbackRef.current(ctx, e);
      };

      const handleClick = (e: MouseEvent) => {
        if (clickCallbackRef.current) clickCallbackRef.current(ctx, e);
      };

      canvas.addEventListener("mousemove", updateMousePosition);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("click", handleClick);

      return () => {
        canvas.removeEventListener("mousemove", updateMousePosition);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("click", handleClick);
      };
    }, []);

    return {
      mouse: mouseRef.current,
      onClick: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (clickCallbackRef.current = callback),
      onMouseIn: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseInCallbackRef.current = callback),
      onMouseOut: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseOutCallbackRef.current = callback),
      onMouseDown: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseDownCallbackRef.current = callback),
      onMouseUp: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseUpCallbackRef.current = callback),
    };
  };

  const useScroll = () => {
    scrollRef.current = DEFAULT_SCROLL_STATE;
    const scrollCallbackRef = useRef<
      ((ctx: KlintContext, scroll: KlintScroll, e: WheelEvent) => void) | null
    >(null);

    useEffect(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;

      const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        if (!scrollRef.current) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - scrollRef.current.lastTime;

        scrollRef.current.distance += e.deltaY;
        scrollRef.current.velocity = deltaTime > 0 ? e.deltaY / deltaTime : 0;
        scrollRef.current.lastTime = currentTime;

        if (scrollCallbackRef.current) {
          scrollCallbackRef.current(ctx, scrollRef.current, e);
        }
      };

      canvas.addEventListener("wheel", handleScroll);
      return () => canvas.removeEventListener("wheel", handleScroll);
    }, []);

    return {
      scroll: scrollRef.current,
      onScroll: (
        callback: (
          ctx: KlintContext,
          scroll: KlintScroll,
          e: WheelEvent
        ) => void
      ) => (scrollCallbackRef.current = callback),
    };
  };

  const buildKlintContext = (ctx: CanvasRenderingContext2D): KlintContext => {
    const context = ctx as unknown as KlintContext;
    // Initialize core properties
    context.__isMainContext = true;
    context.fps = 60;
    context.frame = 0;
    context.time = 0;
    context.deltaTime = 0;

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

  // Add mount tracking
  // useEffect(() => {
  //   console.log("useKlint mounted");
  //   return () => console.log("useKlint unmounted");
  // }, []);

  return {
    context: {
      context: contextRef.current,
      initCoreContext,
    },
    useMouse,
    useScroll,
  };
}
