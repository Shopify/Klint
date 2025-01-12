import { useRef, useCallback } from "react";
import {
  KlintCoreContext,
  KlintConfig,
  KlintContext,
  KlintCanvasOptions,
} from "../component/KlintTypes";
import { CONFIG_PROPS, KlintFunctions } from "../component/Klint";

// Klint Core Functions
export type KlintCoreFunctions = {
  [K in KlintCoreFunctionNames]: ReturnType<(typeof KlintCoreFunctions)[K]>;
};
type KlintCoreFunctionNames = keyof typeof KlintCoreFunctions;

export const KlintCoreFunctions = {
  saveCanvas: (ctx: KlintCoreContext) => () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = ctx.canvas.toDataURL();
    link.click();
  },
  fullscreen: (ctx: KlintCoreContext) => () => {
    ctx.canvas.requestFullscreen?.();
  },
  extend:
    (ctx: KlintCoreContext) =>
    (name: string, data: unknown, enforceReplace = false) => {
      // if (ctx._) {
      //   console.log(`Cannot extend Klint with '${name}' after preload/setup`);
      //   return;
      // }
      if (name in ctx && !enforceReplace) return;
      (ctx as KlintCoreContext)[name] = data;
    },
  constrain: () => (val: number, floor: number, ceil: number) => {
    return Math.max(floor, Math.min(val, ceil));
  },
  lerp:
    (ctx: KlintContext) =>
    (A: number, B: number, mix: number, bounded = true) => {
      return A + (B - A) * (bounded ? ctx.constrain(mix, 0, 1) : mix);
    },
  fract:
    () =>
    (
      n: number,
      mod: number,
      mode: "precise" | "fast" | "faster" = "precise"
    ) => {
      if (mode === "faster") {
        // only works reliably for positive numbers < 2^31
        const floor = (x: number) => x >> 0;
        return n - floor(n / mod) * mod;
      }
      if (mode === "fast") {
        return n - ~~(n / mod) * mod;
      }
      if (n >= 0) return n % mod;
      return mod - (-n % mod);
    },
  distance:
    (ctx: KlintContext) =>
    (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      mode: "precise" | "fast" | "faster" = "precise"
    ) => {
      if (mode === "faster") {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        return dx + dy - Math.min(dx, dy) * 0.3;
      }
      if (mode === "fast")
        return ctx.squareDistance(x1, y1, x2, y2) * Math.SQRT1_2;
      return Math.hypot(x2 - x1, y2 - y1);
    },
  squareDistance: () => (x1: number, y1: number, x2: number, y2: number) => {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  },
  dot: () => (x1: number, y1: number, x2: number, y2: number) => {
    return x1 * x2 + y1 * y2;
  },
  remap:
    (ctx: KlintContext) =>
    (n: number, A: number, B: number, C: number, D: number, bounded = true) => {
      const t = (n - A) / (B - A);
      return ctx.lerp(C, D, t, bounded);
    },
  loadImage:
    () =>
    async (url: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
          resolve(img);
        };
        img.onerror = reject;
        img.src = url;
      });
    },
  passImage: () => (element: HTMLImageElement) => {
    if (!element.complete) {
      console.warn("Image passed to passImage() is not fully loaded");
      return null;
    }
    return element;
  },

  saveConfig: (ctx: KlintCoreContext) => (from?: KlintCoreContext) => {
    return Object.fromEntries(
      CONFIG_PROPS.map((key) => [
        key,
        from?.[key as keyof KlintCoreContext] ??
          ctx[key as keyof KlintCoreContext],
      ])
    ) as KlintConfig;
  },
  restoreConfig:
    (ctx: KlintCoreContext) =>
    (config: KlintConfig): void => {
      Object.assign(ctx, config);
    },
  describe: (ctx: KlintCoreContext) => (description: string) => {
    ctx.__description = description;
  },

  createOffscreen:
    (ctx: KlintCoreContext) =>
    (
      id: string,
      width: number,
      height: number,
      options?: KlintCanvasOptions,
      callback?: (ctx: KlintContext) => void
    ) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = width * ctx.__dpr;
      offscreen.height = height * ctx.__dpr;

      const context = offscreen.getContext("2d", {
        alpha: options?.alpha ?? true,
        willReadFrequently: options?.willreadfrequently ?? false,
      }) as KlintContext;

      if (!context) throw new Error("Failed to create offscreen context");

      // Initialize basic properties
      context.__dpr = ctx.__dpr;
      context.width = width * ctx.__dpr;
      context.height = height * ctx.__dpr;
      context.__isMainContext = false;

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

      // Add KlintFunctions if not ignored
      if (!options?.ignorefunctions) {
        Object.entries(KlintFunctions).forEach(([name, fn]) => {
          context[name] = fn(context);
        });
      }
      // Set origin if specified
      if (options?.origin) {
        context.__canvasOrigin = options.origin;
        if (options.origin === "center") {
          context.translate(context.width * 0.5, context.height * 0.5);
        }
      }
      if (callback) {
        callback(context);
      }

      // If static option is true, convert to base64 and store that instead
      if (options?.static === "true") {
        const base64 = offscreen.toDataURL();
        const img = new Image();
        img.src = base64;
        ctx.__offscreens.set(id, img);
        // console.log(img);
        return img;
      }

      ctx.__offscreens.set(id, context);
      return context;
    },
  getOffscreen:
    (ctx: KlintCoreContext) =>
    (id: string): KlintContext | HTMLImageElement => {
      const offscreen = ctx.__offscreens.get(id);
      if (!offscreen)
        throw new Error(`No offscreen context found with id: ${id}`);
      return offscreen;
    },
};

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
