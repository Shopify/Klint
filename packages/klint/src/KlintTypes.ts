import type { KlintCoreFunctions, KlintFunctions } from "./KlintFunctions";
import type { KlintElements } from "./elements";
import type Vector from "./elements/Vector";

export const DEFAULT_FPS = 60;
export const EPSILON = 0.0001;

export type KlintContexts = KlintContext | KlintOffscreenContext;

export interface KlintPointerState {
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

export interface KlintScrollState {
  distance: number;
  velocity: number;
  lastTime: number;
}

export interface KlintKeyboardState {
  pressedKeys: Set<string>;
  modifiers: {
    alt: boolean;
    shift: boolean;
    ctrl: boolean;
    meta: boolean;
  };
  lastKey: string | null;
  lastKeyTime: number;
}

export type CurveVertex =
  | { type: "line"; x: number; y: number }
  | {
      type: "bezier";
      cp1x: number;
      cp1y: number;
      cp2x: number;
      cp2y: number;
      x: number;
      y: number;
    }
  | { type: "quadratic"; cpx: number; cpy: number; x: number; y: number }
  | {
      type: "arc";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      radius: number;
    };

export interface KlintOffscreenContext
  extends CanvasRenderingContext2D,
    KlintFunctions,
    KlintElements {
  /** Canvas dimensions in logical CSS pixels. */
  width: number;
  height: number;
  /** Backing-store pixels per logical pixel. */
  dpr: number;
  __dpr: number;
  __startedShape: boolean;
  __currentShape: CurveVertex[] | null;
  __startedContour: boolean;
  __currentContours: CurveVertex[][] | null;
  __currentContour: CurveVertex[] | null;
  __isReadyToDraw: boolean;
  __isMainContext: boolean;
  __imageOrigin: "corner" | "center";
  __rectangleOrigin: "corner" | "center";
  __canvasOrigin: "corner" | "center";
  __computedTextFont: string;
  __textFont: string;
  __textSize: number;
  __textLeading: number | undefined;
  __textStyle: string;
  __textWeight: string;
  __textAlignment: {
    horizontal: CanvasTextAlign;
    vertical: CanvasTextBaseline;
  };
  __fillRule: CanvasFillRule;
  createVector: (x?: number, y?: number, z?: number) => Vector;
  /** User extensions intentionally remain open-ended. */
  [key: string]: any;
}

export interface KlintContext extends KlintOffscreenContext, KlintCoreFunctions {
  frame: number;
  time: number;
  /** Time since the previous rendered frame, in milliseconds. */
  deltaTime: number;
  fps: number;
  __lastTargetTime: number;
  __lastRealTime: number;
  __isPlaying: boolean;
  __redraw?: () => void;
  __isPreloaded: boolean;
  __isSetup: boolean;
  __offscreens: Map<string, KlintOffscreenContext | HTMLImageElement>;
  /** Input state is installed by the React hooks or native adapter. */
  mouse?: KlintPointerState;
  scroll?: KlintScrollState;
  keyboard?: KlintKeyboardState;
}

export interface KlintCanvasOptions {
  alpha?: boolean;
  willreadfrequently?: boolean;
  autoplay?: boolean;
  ignoreResize?: boolean;
  noloop?: boolean;
  ignoreFunctions?: boolean;
  static?: boolean;
  nocanvas?: boolean;
  fps?: number;
  unsafemode?: boolean;
  dpr?: number | "default";
  /** Optional maximum when dpr is "default". */
  maxDpr?: number;
  origin?: "corner" | "center";
}

export const DEFAULT_OPTIONS: Required<KlintCanvasOptions> = {
  alpha: true,
  ignoreResize: false,
  noloop: false,
  ignoreFunctions: false,
  static: false,
  nocanvas: false,
  unsafemode: false,
  autoplay: true,
  willreadfrequently: false,
  fps: DEFAULT_FPS,
  dpr: "default",
  maxDpr: 3,
  origin: "corner",
};

export const normalizeBoolean = (
  value: boolean | string | undefined,
  fallback: boolean,
): boolean => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

/**
 * Normalize options once at canvas initialization. String handling is retained
 * at runtime for pre-0.5 callers, while the public type now requires booleans.
 */
export function normalizeKlintOptions(
  options: KlintCanvasOptions = {},
): Required<KlintCanvasOptions> {
  const legacy = options as KlintCanvasOptions & Record<string, unknown>;
  const fps = Number(options.fps ?? DEFAULT_OPTIONS.fps);
  const requestedDpr = options.dpr ?? DEFAULT_OPTIONS.dpr;
  const requestedMaxDpr = Number(options.maxDpr ?? DEFAULT_OPTIONS.maxDpr);

  return {
    alpha: normalizeBoolean(legacy.alpha as boolean | string, DEFAULT_OPTIONS.alpha),
    willreadfrequently: normalizeBoolean(
      legacy.willreadfrequently as boolean | string,
      DEFAULT_OPTIONS.willreadfrequently,
    ),
    autoplay: normalizeBoolean(
      legacy.autoplay as boolean | string,
      DEFAULT_OPTIONS.autoplay,
    ),
    ignoreResize: normalizeBoolean(
      legacy.ignoreResize as boolean | string,
      DEFAULT_OPTIONS.ignoreResize,
    ),
    noloop: normalizeBoolean(
      legacy.noloop as boolean | string,
      DEFAULT_OPTIONS.noloop,
    ),
    ignoreFunctions: normalizeBoolean(
      legacy.ignoreFunctions as boolean | string,
      DEFAULT_OPTIONS.ignoreFunctions,
    ),
    static: normalizeBoolean(
      legacy.static as boolean | string,
      DEFAULT_OPTIONS.static,
    ),
    nocanvas: normalizeBoolean(
      legacy.nocanvas as boolean | string,
      DEFAULT_OPTIONS.nocanvas,
    ),
    unsafemode: normalizeBoolean(
      legacy.unsafemode as boolean | string,
      DEFAULT_OPTIONS.unsafemode,
    ),
    fps: Number.isFinite(fps) && fps > 0 ? fps : DEFAULT_FPS,
    dpr:
      requestedDpr === "default" ||
      (typeof requestedDpr === "number" &&
        Number.isFinite(requestedDpr) &&
        requestedDpr > 0)
        ? requestedDpr
        : "default",
    maxDpr:
      Number.isFinite(requestedMaxDpr) && requestedMaxDpr > 0
        ? requestedMaxDpr
        : DEFAULT_OPTIONS.maxDpr,
    origin: options.origin === "center" ? "center" : "corner",
  };
}

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
  "filter",
  "imageSmoothingEnabled",
  "imageSmoothingQuality",
  "shadowBlur",
  "shadowColor",
  "shadowOffsetX",
  "shadowOffsetY",
  "miterLimit",
  "direction",
  "__imageOrigin",
  "__rectangleOrigin",
  "__textFont",
  "__textWeight",
  "__textStyle",
  "__textSize",
  "__textLeading",
  "__textAlignment",
  "__fillRule",
  "__isPlaying",
] as const;

export type KlintConfig = Partial<
  Pick<KlintContext, (typeof CONFIG_PROPS)[number]>
>;

export interface KlintContextWrapper {
  readonly context: KlintContext | null;
  initCoreContext: (
    canvas: HTMLCanvasElement,
    options: KlintCanvasOptions,
  ) => KlintContext;
  releaseCoreContext: (canvas: HTMLCanvasElement) => void;
  subscribe: (listener: (context: KlintContext | null) => void) => () => void;
}
