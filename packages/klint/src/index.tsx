import Klint from "./Klint";
import useKlint, { useProps, useStorage } from "./useKlint";
import type {
  KlintGesture,
  KlintKeyboard,
  KlintMouse,
  KlintScroll,
  KlintVector,
} from "./useKlint";

import { KlintCoreFunctions, KlintFunctions } from "./core/KlintFunctions";

export * from "./Klint";
export * from "./elements";

export {
  Klint,
  useKlint,
  useProps,
  useStorage,
  // Types
  type KlintGesture,
  type KlintKeyboard,
  type KlintMouse,
  type KlintScroll,
  type KlintVector,
  // Functions
  KlintCoreFunctions,
  KlintFunctions,
};

// Export element types
export { Rectangle } from "./elements/Quadtree";
export type { QuadtreePoint } from "./elements/Quadtree";
