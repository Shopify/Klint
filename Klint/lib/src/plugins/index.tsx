import Color from "./Color";
import Easing from "./Easing";
import SVGfont from "./SVGfont";
import State from "./State";
import Vector from "./Vector";
import Time from "./Time";
import Text from "./Text";
import Thing from "./Thing";

export interface KlintPlugins {
  Color: Color;
  Easing: Easing;
  SVGfont: SVGfont;
  State: State;
  Vector: Vector;
  Time: Time;
  Text: Text;
  Thing: Thing;
}

// Re-export all stable plugins
export { default as Color } from "./Color";
export { default as Easing } from "./Easing";
export { default as SVGfont } from "./SVGfont";
export { default as State } from "./State";
export { default as Vector } from "./Vector";
export { default as Time } from "./Time";
export { default as Text } from "./Text";
export { default as Thing } from "./Thing";
