import { useRef, useCallback } from "react";
import { KlintCoreContext } from "../component/KlintTypes";
import { KlintCoreFunctions } from "../component/KlintCoreFunctions";

export default function useKlint() {
  const contextRef = useRef<KlintCoreContext | null>(null);

  const initCoreContext = useCallback(
    (canvas: HTMLCanvasElement): KlintCoreContext => {
      if (!contextRef.current) {
        const context = canvas.getContext("2d") as unknown as KlintCoreContext;
        if (!context) throw new Error("Failed to get canvas context");
        // Initialize core properties
        contextRef.current = context;
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
        context.__textSize = 12;
        context.__textAlignment = {
          horizontal: "left" as CanvasTextAlign,
          vertical: "top" as CanvasTextBaseline,
        };
        context.__offscreens = new Map();
        context.__currentContext = context;
        // Add necessary Klint Functions.
        // If you really don't need these, you might be better with your
        // own canvas implementation.
        Object.entries(KlintCoreFunctions).forEach(([name, fn]) => {
          context[name] = fn(context);
        });

        contextRef.current = context;
      }
      return contextRef.current;
    },
    []
  );

  return { context: contextRef.current, initCoreContext };
}
