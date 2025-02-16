import { useRef, useCallback } from "react";
import { KlintContext } from "../component/KlintTypes";
import { KlintCoreFunctions } from "../component/KlintCoreFunctions";
import { KlintFunctions } from "../component/KlintFunctions";
import Klint from "../component/Klint";

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
    context: { context: contextRef.current, initCoreContext },
    Klint: Klint,
  };
}
