import { CONFIG_PROPS } from "./Klint";
import { KlintFunctions } from "./KlintFunctions";
import { KlintCoreFunctions } from "./KlintCoreFunctions";
// canvas props

export interface KlintCanvasOptions {
  alpha?: string;
  willreadfrequently?: string;
  autoplay?: string;
  ignoremouse?: string;
  ignoreresize?: string;
  noloop?: string;
  ignorefunctions?: string;
  static?: string;
  nocanvas?: string;
  fps?: number;
  unsafemode?: string;
  origin?: "corner" | "center";
}

export interface KlintProps {
  context: KlintContextWrapper;
  draw: (ctx: KlintContext) => void;
  setup?: (ctx: KlintContext) => void;
  preload?: (ctx: KlintContext) => Promise<void>;
  options?: KlintCanvasOptions;
  onClick?: (ctx: KlintContext) => void;
  onResize?: (ctx: KlintContext) => void;
  onMouseIn?: (ctx: KlintContext) => void;
  onMouseOut?: (ctx: KlintContext) => void;
  onLoading?: (isLoading: boolean) => void;
  onError?: (isError: boolean) => void;
}

export type KlintConfig = Partial<
  Pick<KlintContext, (typeof CONFIG_PROPS)[number]>
>;
export type KlintImageInput = HTMLImageElement | undefined | HTMLCanvasElement;

export type VertexType = "linear" | "curve" | "catmull" | "arc";
export type VertexPoint = {
  type: VertexType;
  points: number[][]; // [x,y] for linear, [[x1,y1], [x2,y2], [x,y]] for bezier, etc.
};

export interface KlintOffscreenContext
  extends CanvasRenderingContext2D,
    KlintFunctions {
  width: number;
  height: number;
  __dpr: number;
  __startedShape: boolean;
  __currentShape: number[][] | null;
  __startedContour: boolean;
  __currentContours: number[][][] | null;
  __currentContour: number[][] | null;
  __isReadyToDraw: boolean;
  __isMainContext: boolean;
  __imageOrigin: "corner" | "center";
  __rectangleOrigin: "corner" | "center";
  __canvasOrigin: "corner" | "center";
  __computedTextFont: string;
  __textFont: string;
  __textSize: number;
  __textStyle: string;
  __textWeight: string;
  __textAlignment: {
    horizontal: CanvasTextAlign;
    vertical: CanvasTextBaseline;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type KlintContexts = KlintContext | KlintOffscreenContext;

// core context, should not be applied to the offscreen canvas
export interface KlintContext
  extends KlintOffscreenContext,
    KlintFunctions,
    KlintCoreFunctions {
  // core
  frame: number;
  time: number;
  deltaTime: number;
  fps: number;
  mouse: KlintMouse;
  // internals
  __lastTargetTime: number;
  __lastRealTime: number;
  __isPlaying: boolean;
  __offscreens: Map<string, KlintOffscreenContext | HTMLImageElement>;
}
// mouse
export interface KlintMouse {
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

export interface KlintContextWrapper {
  context: KlintContext | null;
  initCoreContext: (canvas: HTMLCanvasElement) => KlintContext;
}
