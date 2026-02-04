import Klint from "./Klint";
import useKlint, { useProps, useStorage } from "./useKlint";
import { type KlintMouse, type KlintScroll } from "./useKlint";

import { KlintCoreFunctions, KlintFunctions } from "./KlintFunctions";
import { type KlintPerformanceMetrics } from "./Klint";

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
  type KlintPerformanceMetrics,
  // Functions
  KlintCoreFunctions,
  KlintFunctions,
};

// Export element types
export type { PerformanceWidgetOptions } from "./elements/Performance";
export type { KlintServerRenderOptions } from "./elements/SSR";
