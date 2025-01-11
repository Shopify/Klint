import { KlintFunctions, CONFIG_PROPS } from "./Klint";
// canvas props

export interface KlintCanvasOptions {
  alpha?: string;
  willreadfrequently?: string;
  ignoremouse?: string;
  ignoreresize?: string;
  noloop?: string;
  ignorefunctions?: string;
  static?: string;
  nocanvas?: string;
  fps?: number;
  origin?: "corner" | "center";
}

export interface KlintProps {
  context: KlintContextWrapper;
  draw: (ctx: KlintContext | KlintCoreContext) => void;
  setup?: (ctx: KlintContext | KlintCoreContext) => void;
  preload?: (ctx: KlintContext | KlintCoreContext) => Promise<void>;
  options?: KlintCanvasOptions;
}

export type KlintConfig = Partial<
  Pick<KlintContext, (typeof CONFIG_PROPS)[number]>
>;
export type KlintImageInput = HTMLImageElement | undefined | HTMLCanvasElement;

export type VertexType = "linear" | "bezier" | "curve" | "catmull" | "arc";
export type VertexPoint = {
  type: VertexType;
  points: number[][]; // [x,y] for linear, [[x1,y1], [x2,y2], [x,y]] for bezier, etc.
};

export interface KlintContext extends CanvasRenderingContext2D {
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

// core context, should not be applied to the offscreen canvas
export interface KlintCoreContext extends KlintContext, KlintFunctions {
  // core
  frame: number;
  time: number;
  deltaTime: number;
  fps: number;
  mouse: KlintMouse;
  // internals
  __lastTargetTime: number;
  __lastRealTime: number;
  __offscreens: Map<string, KlintContext | HTMLImageElement>;
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
}

export interface KlintContextWrapper {
  context: KlintCoreContext | null;
  initCoreContext: (canvas: HTMLCanvasElement) => KlintCoreContext;
}
