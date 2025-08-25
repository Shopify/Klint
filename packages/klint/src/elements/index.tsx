import Color from "../elements/Color";
import Easing from "../elements/Easing";
import Vector from "../elements/Vector";
import Text from "../elements/Text";
import Thing from "../elements/Thing";
import Grid from "../elements/Grid";
import Strip from "../elements/Strip";
import Noise from "../elements/Noise";
import Hotspot from "../elements/Hotspot";

export interface KlintElements {
  Color: Color;
  Easing: Easing;
  Vector: Vector;
  Text: Text;
  Thing: Thing;
  Grid: Grid;
  Strip: Strip;
  Noise: Noise;
  Hotspot: Hotspot;
}

// Re-export all stable plugins
export { default as Color } from "../elements/Color";
export { default as Easing } from "../elements/Easing";
export { default as Vector } from "../elements/Vector";
export { default as Text } from "../elements/Text";
export { default as Thing } from "../elements/Thing";
export { default as Grid } from "../elements/Grid";
export { default as Strip } from "../elements/Strip";
export { default as Noise } from "../elements/Noise";
export { default as Hotspot } from "../elements/Hotspot";
