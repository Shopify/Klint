import Klint from "./Klint";
import useKlint, { useProps, useStorage } from "./useKlint";
import { type KlintMouse, type KlintScroll } from "./useKlint";

import { KlintCoreFunctions, KlintFunctions } from "./KlintFunctions";

export * from "./Klint";
export * from "./elements";

export {
  Klint,
  useKlint,
  useProps,
  useStorage,
  // Types
  type KlintMouse,
  type KlintScroll,
  // Functions
  KlintCoreFunctions,
  KlintFunctions,
};

// Export element types
export { Rectangle } from "./elements/Quadtree";
export type { QuadtreePoint } from "./elements/Quadtree";
