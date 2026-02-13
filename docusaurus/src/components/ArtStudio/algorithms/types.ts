import type { KlintContext } from "@shopify/klint";

export interface LayerTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export const DEFAULT_TRANSFORM: LayerTransform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
};

export type LayoutAlgorithmId =
  | "none"
  | "grid"
  | "radial"
  | "diagonal"
  | "rule-of-thirds"
  | "golden-spiral"
  | "stack-vertical"
  | "stack-horizontal";

export type ParameterType = "slider" | "color" | "select" | "toggle";

export interface ParameterDef {
  id: string;
  label: string;
  type: ParameterType;
  /** Slider: default number. Color: hex string. Select: string. Toggle: boolean. */
  defaultValue: number | string | boolean;
  /** Slider only */
  min?: number;
  max?: number;
  step?: number;
  /** Select only */
  options?: { label: string; value: string }[];
}

export interface AlgorithmDef {
  id: string;
  name: string;
  category: string;
  parameters: ParameterDef[];
  draw: (K: KlintContext, params: Record<string, any>) => void;
  toCode: (params: Record<string, any>) => string;
}

export interface Layer {
  id: string;
  algorithmId: string;
  name: string;
  visible: boolean;
  params: Record<string, any>;
  blendMode: GlobalCompositeOperation;
  opacity: number;
  transform: LayerTransform;
}

export interface StudioState {
  layers: Layer[];
  selectedLayerId: string | null;
  background: string;
  playing: boolean;
  layout: LayoutAlgorithmId;
}

export type StudioAction =
  | { type: "ADD_LAYER"; algorithmId: string; algorithm: AlgorithmDef }
  | { type: "REMOVE_LAYER"; layerId: string }
  | { type: "REORDER_LAYERS"; fromIndex: number; toIndex: number }
  | { type: "SELECT_LAYER"; layerId: string | null }
  | { type: "TOGGLE_VISIBILITY"; layerId: string }
  | { type: "UPDATE_PARAM"; layerId: string; paramId: string; value: any }
  | { type: "UPDATE_LAYER"; layerId: string; changes: Partial<Layer> }
  | { type: "SET_BACKGROUND"; color: string }
  | { type: "TOGGLE_PLAYING" }
  | { type: "DUPLICATE_LAYER"; layerId: string }
  | { type: "SET_LAYOUT"; layout: LayoutAlgorithmId };
