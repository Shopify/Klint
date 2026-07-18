import { KlintCoreFunctions, KlintFunctions } from "./KlintFunctions";
import type {
  KlintCanvasOptions,
  KlintContext,
  KlintContexts,
  KlintOffscreenContext,
} from "./KlintTypes";
import { normalizeKlintOptions } from "./KlintTypes";
import {
  Color,
  Easing,
  Grid,
  Hotspot,
  Noise,
  Pixels,
  Quadtree,
  Strip,
  Text,
  Timeline,
  Vector,
} from "./elements";

export function installKlintElements(context: KlintContexts): void {
  context.Color = new Color();
  context.createVector = (x = 0, y = 0, z = 0) => new Vector(x, y, z);
  context.Vector = new Vector();
  context.Easing = new Easing();
  context.Text = new Text(context);
  context.Grid = new Grid(context as KlintContext);
  context.Strip = new Strip(context as KlintContext);
  context.Noise = new Noise(context as KlintContext);
  context.Hotspot = new Hotspot(context as KlintContext);
  context.Quadtree = Quadtree;
  context.Pixels = new Pixels(context);
  context.Timeline = new Timeline();
}

export function initializeKlintContextState(
  context: KlintContexts,
  options: KlintCanvasOptions,
  isMainContext: boolean,
): void {
  const normalized = normalizeKlintOptions(options);

  context.__isMainContext = isMainContext;
  context.__imageOrigin = normalized.origin;
  context.__rectangleOrigin = normalized.origin;
  context.__canvasOrigin = normalized.origin;
  context.__textFont = "sans-serif";
  context.__textWeight = "normal";
  context.__textStyle = "normal";
  context.__textSize = 72;
  context.__textLeading = undefined;
  context.__computedTextFont = "normal normal 72px sans-serif";
  context.__textAlignment = {
    horizontal: "left",
    vertical: "top",
  };
  context.__fillRule = "nonzero";
  context.__startedShape = false;
  context.__currentShape = null;
  context.__startedContour = false;
  context.__currentContours = null;
  context.__currentContour = null;
  context.__isReadyToDraw = false;
  context.__dpr = 1;
  context.dpr = 1;
}

export function installKlintFunctions(context: KlintContexts): void {
  if (context.__isMainContext) {
    Object.entries(KlintCoreFunctions).forEach(([name, factory]) => {
      context[name] = factory(context as KlintContext);
    });
  }

  Object.entries(KlintFunctions).forEach(([name, factory]) => {
    context[name] = factory(context);
  });
}

export function createKlintContext(
  canvas: HTMLCanvasElement,
  options: KlintCanvasOptions = {},
): KlintContext {
  const normalized = normalizeKlintOptions(options);
  const nativeContext = canvas.getContext("2d", {
    alpha: normalized.alpha,
    willReadFrequently: normalized.willreadfrequently,
  });
  if (!nativeContext) throw new Error("Failed to get canvas context");

  const context = nativeContext as KlintContext;
  initializeKlintContextState(context, normalized, true);
  context.fps = normalized.fps;
  context.frame = 0;
  context.time = 0;
  context.deltaTime = 0;
  context.__lastTargetTime = -1;
  context.__lastRealTime = -1;
  context.__isPlaying = normalized.autoplay;
  context.__isPreloaded = false;
  context.__isSetup = false;
  context.__offscreens = new Map<string, KlintOffscreenContext | HTMLImageElement>();

  installKlintElements(context);
  installKlintFunctions(context);
  return context;
}
