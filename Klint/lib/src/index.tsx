import Klint from "./Klint";
import useKlint, { useProps, useStorage } from "./useKlint";
import { type KlintMouse, type KlintScroll } from "./useKlint";

// Import plugins directly from their source files
import BitmapText from "./plugins/BitmapText";
import Color from "./plugins/Color";
import Easing from "./plugins/Easing";
import SVGfont from "./plugins/SVGfont";
import State from "./plugins/State";
import Text from "./plugins/Text";
import Thing from "./plugins/Thing";
import Time from "./plugins/Time";
import Vector from "./plugins/Vector";
import { KlintCoreFunctions, KlintFunctions } from "./KlintFunctions";

export * from "./Klint";

export {
  Klint,
  useKlint,
  useProps,
  useStorage,
  type KlintMouse,
  type KlintScroll,
  BitmapText,
  Color,
  Easing,
  KlintCoreFunctions,
  KlintFunctions,
  SVGfont,
  State,
  Text,
  Thing,
  Time,
  Vector,
};
