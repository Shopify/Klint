import Color from "../elements/Color";
import Easing from "../elements/Easing";
import Vector from "../elements/Vector";
import Text from "../elements/Text";
import Grid from "../elements/Grid";
import Strip from "../elements/Strip";
import Noise from "../elements/Noise";
import Hotspot from "../elements/Hotspot";
import Quadtree from "../elements/Quadtree";
import Pixels from "../elements/Pixels";
import Timeline from "../elements/Timeline";

export interface KlintElements {
  Color: Color;
  Easing: Easing;
  Vector: Vector;
  Text: Text;
  Grid: Grid;
  Strip: Strip;
  Noise: Noise;
  Hotspot: Hotspot;
  Quadtree: typeof Quadtree;
  Pixels: Pixels;
  Timeline: Timeline;
}

// Re-export all stable elements
export { default as Color } from "../elements/Color";
export { default as Easing } from "../elements/Easing";
export { default as Vector } from "../elements/Vector";
export { default as Text } from "../elements/Text";
export { default as Grid } from "../elements/Grid";
export { default as Strip } from "../elements/Strip";
export { default as Noise } from "../elements/Noise";
export { default as Hotspot } from "../elements/Hotspot";
export { default as Quadtree } from "../elements/Quadtree";
export { default as Pixels } from "../elements/Pixels";
export { default as Timeline } from "../elements/Timeline";
