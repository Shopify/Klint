export { layoutFunctions } from "./layoutAlgorithms";
export type { LayoutPosition } from "./layoutAlgorithms";

export const LAYOUT_OPTIONS: { label: string; value: string }[] = [
  { label: "None", value: "none" },
  { label: "Grid", value: "grid" },
  { label: "Radial", value: "radial" },
  { label: "Diagonal", value: "diagonal" },
  { label: "Rule of Thirds", value: "rule-of-thirds" },
  { label: "Golden Spiral", value: "golden-spiral" },
  { label: "Stack Vertical", value: "stack-vertical" },
  { label: "Stack Horizontal", value: "stack-horizontal" },
];
