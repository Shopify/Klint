import {
  CONFIG_PROPS,
  KlintConfig,
  KlintCanvasOptions,
} from "../component/Klint";
import { KlintFunctions } from "../component/KlintFunctions";
import {
  KlintContext,
  KlintContexts,
  KlintOffscreenContext,
} from "../component/KlintTypes";
// Klint Core Functions
export type KlintCoreFunctions = {
  [K in KlintCoreFunctionNames]: ReturnType<(typeof KlintCoreFunctions)[K]>;
};
type KlintCoreFunctionNames = keyof typeof KlintCoreFunctions;

export type KlintOffscreenMap = Map<
  string,
  KlintOffscreenContext | HTMLImageElement
>;

export const KlintCoreFunctions = {
  saveCanvas: (ctx: KlintContext) => () => {
    const link = document.createElement("a");
    link.download = "canvas.png";
    link.href = ctx.canvas.toDataURL();
    link.click();
  },
  fullscreen: (ctx: KlintContext) => () => {
    ctx.canvas.requestFullscreen?.();
  },
  play: (ctx: KlintContext) => () => {
    if (!ctx.__isPlaying) ctx.__isPlaying = true;
  },
  pause: (ctx: KlintContext) => () => {
    if (ctx.__isPlaying) ctx.__isPlaying = false;
  },
  // to do
  redraw: () => () => {},
  extend:
    (ctx: KlintContext) =>
    (name: string, data: unknown, enforceReplace = false) => {
      if (name in ctx && !enforceReplace) return;
      (ctx as KlintContext)[name] = data;
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
  loadImages:
    () =>
    async (urls: string[]): Promise<HTMLImageElement[]> => {
      return Promise.all(
        urls.map((url) => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              img.width = img.naturalWidth;
              img.height = img.naturalHeight;
              resolve(img);
            };
            img.onerror = reject;
            img.src = url;
          });
        })
      );
    },
  passImage: () => (element: HTMLImageElement) => {
    if (!element.complete) {
      console.warn("Image passed to passImage() is not fully loaded");
      return null;
    }
    return element;
  },
  passImages: () => (elements: HTMLImageElement[]) => {
    return elements.map((element) => {
      if (!element.complete) {
        console.warn("Image passed to passImages() is not fully loaded");
        return null;
      }
      return element;
    });
  },

  saveConfig: (ctx: KlintContexts) => (from?: KlintContexts) => {
    return Object.fromEntries(
      CONFIG_PROPS.map((key) => [
        key,
        from?.[key as keyof KlintContexts] ?? ctx[key as keyof KlintContexts],
      ])
    ) as KlintConfig;
  },
  restoreConfig:
    (ctx: KlintContext) =>
    (config: KlintConfig): void => {
      Object.assign(ctx, config);
    },
  describe: (ctx: KlintContext) => (description: string) => {
    ctx.__description = description;
  },

  createOffscreen:
    (ctx: KlintContext) =>
    (
      id: string,
      width: number,
      height: number,
      options?: KlintCanvasOptions,
      callback?: (ctx: KlintOffscreenContext) => void
    ) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = width * ctx.__dpr;
      offscreen.height = height * ctx.__dpr;

      const context = offscreen.getContext("2d", {
        alpha: options?.alpha ?? true,
        willReadFrequently: options?.willreadfrequently ?? false,
      }) as unknown as KlintOffscreenContext;

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
      context.__textSize = 120;
      context.__textAlignment = {
        horizontal: "left" as CanvasTextAlign,
        vertical: "top" as CanvasTextBaseline,
      };

      // Add KlintFunctions if not ignored
      if (!options?.ignoreFunctions) {
        Object.entries(KlintFunctions).forEach(([name, fn]) => {
          context[name] = fn(context as KlintOffscreenContext);
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
    (ctx: KlintContext) =>
    (id: string): KlintOffscreenContext | HTMLImageElement => {
      const offscreen = ctx.__offscreens.get(id);
      if (!offscreen)
        throw new Error(`No offscreen context found with id: ${id}`);
      return offscreen;
    },
};
