import Color from "../elements/Color";
import Easing from "../elements/Easing";
import State from "../elements/State";
import Vector from "../elements/Vector";
import Time from "../elements/Time";
import Text from "../elements/Text";
import Thing from "../elements/Thing";

export interface KlintElements {
  Color: Color;
  Easing: Easing;
  State: State;
  Vector: Vector;
  Time: Time;
  Text: Text;
  Thing: Thing;
}

// Re-export all stable plugins
export { default as Color } from "../elements/Color";
export { default as Easing } from "../elements/Easing";
export { default as State } from "../elements/State";
export { default as Vector } from "../elements/Vector";
export { default as Time } from "../elements/Time";
export { default as Text } from "../elements/Text";
export { default as Thing } from "../elements/Thing";
