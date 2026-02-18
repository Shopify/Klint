export interface Drop {
  color: string;
  vertices: { x: number; y: number }[];
}

export type ShapeType =
  | "circle"
  | "flower"
  | "blob"
  | "star"
  | "crescent"
  | "supershape";

export interface DropSpec {
  cx: number;
  cy: number;
  r: number;
  color: string;
  shape: ShapeType;
  // flower
  petals?: number;
  amplitude?: number;
  // blob
  harmonics?: { amp: number; freq: number; phase: number }[];
  // star
  points?: number;
  innerRatio?: number;
  sharpness?: number;
  // crescent
  offset?: number;
  rotation?: number;
  // supershape
  m?: number;
  n1?: number;
  n2?: number;
  n3?: number;
}

export interface TextResult {
  drops: Drop[];
}

// Curated color sets: [background, ...foreground]
// Foreground colors are shuffled per load; background is fixed per set.
export const COLOR_SETS = [
  {
    bg: "orange",
    fg: ["sky", "golden", "mustard", "peach", "charcoal", "rose"],
  },
  { bg: "navy", fg: ["peach", "rose", "orange", "mustard", "midnight"] },
];

export const TEXT_COLOR = "#ffffff";
export const STRENGTH = 1.5;
export const TINE_U = 0.4;
export const TINE_SCALE = 150;
export const STROKE_DECAY = 4800; // drag distance (px) at which strength reaches zero
export const GOLDEN_ANGLE = 2.39996322; // 137.508 deg — the angle that never repeats
export const DROP_COUNT = 18;
export const FRAMES_PER_DROP = 5;
export const LERP_EASE_FAST = 0.22; // near center
export const LERP_EASE_SLOW = 0.04; // at edges
export const LERP_SNAP = 0.25; // snap to target when within this distance squared
