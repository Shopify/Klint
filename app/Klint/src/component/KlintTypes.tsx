import { KlintFunctions } from "./KlintFunctions";
import { KlintCoreFunctions } from "./KlintCoreFunctions";

export interface KlintPlugins {}

export type KlintContexts = KlintContext | KlintOffscreenContext;

export interface KlintOffscreenContext
  extends CanvasRenderingContext2D,
    KlintFunctions,
    KlintPlugins {
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
export interface KlintContext
  extends KlintOffscreenContext,
    KlintCoreFunctions {
  frame: number;
  time: number;
  deltaTime: number;
  fps: number;
  __lastTargetTime: number;
  __lastRealTime: number;
  __isPlaying: boolean;
  __offscreens: Map<string, KlintOffscreenContext | HTMLImageElement>;
}
// mouse
