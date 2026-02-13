/**
 * Layout algorithms compute fractional positions (-1..1) for each layer.
 * These are applied in the draw loop: x/y * K.width/2, K.height/2.
 */

export interface LayoutPosition {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

type LayoutFn = (layerCount: number, index: number) => LayoutPosition;

const IDENTITY: LayoutPosition = { x: 0, y: 0, scale: 1, rotation: 0 };

function none(): LayoutPosition {
  return IDENTITY;
}

function grid(layerCount: number, index: number): LayoutPosition {
  if (layerCount <= 1) return IDENTITY;
  const cols = Math.ceil(Math.sqrt(layerCount));
  const rows = Math.ceil(layerCount / cols);
  const col = index % cols;
  const row = Math.floor(index / cols);
  // Map to -1..1 range, centered in each cell
  const cellW = 2 / cols;
  const cellH = 2 / rows;
  const x = -1 + cellW * (col + 0.5);
  const y = -1 + cellH * (row + 0.5);
  const scale = 1 / Math.max(cols, rows);
  return { x, y, scale, rotation: 0 };
}

function radial(layerCount: number, index: number): LayoutPosition {
  if (layerCount <= 1) return IDENTITY;
  // First layer at center, rest on circle
  if (index === 0) return { x: 0, y: 0, scale: 0.5, rotation: 0 };
  const ringCount = layerCount - 1;
  const angle = ((index - 1) / ringCount) * Math.PI * 2 - Math.PI / 2;
  const radius = 0.6;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    scale: 0.45,
    rotation: 0,
  };
}

function diagonal(layerCount: number, index: number): LayoutPosition {
  if (layerCount <= 1) return IDENTITY;
  const t = index / (layerCount - 1);
  // Top-left (-0.7, -0.7) to bottom-right (0.7, 0.7)
  return {
    x: -0.7 + t * 1.4,
    y: -0.7 + t * 1.4,
    scale: 0.5,
    rotation: 0,
  };
}

function ruleOfThirds(layerCount: number, index: number): LayoutPosition {
  // 4 power points at 1/3 intersections, then repeat
  const points = [
    { x: -2 / 3, y: -2 / 3 },
    { x: 2 / 3, y: -2 / 3 },
    { x: -2 / 3, y: 2 / 3 },
    { x: 2 / 3, y: 2 / 3 },
  ];
  if (layerCount <= 1) return IDENTITY;
  const pt = points[index % points.length];
  return { x: pt.x, y: pt.y, scale: 0.45, rotation: 0 };
}

function goldenSpiral(layerCount: number, index: number): LayoutPosition {
  if (layerCount <= 1) return IDENTITY;
  const PHI = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = Math.PI * 2 * (1 - 1 / PHI);
  const angle = index * goldenAngle;
  // Spiral outward with each successive layer
  const maxRadius = 0.7;
  const radius = maxRadius * Math.sqrt((index + 1) / layerCount);
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    scale: 0.4,
    rotation: angle,
  };
}

function stackVertical(layerCount: number, index: number): LayoutPosition {
  if (layerCount <= 1) return IDENTITY;
  const spacing = 1.6 / layerCount;
  const y = -0.8 + spacing * (index + 0.5);
  return { x: 0, y, scale: 1 / layerCount, rotation: 0 };
}

function stackHorizontal(layerCount: number, index: number): LayoutPosition {
  if (layerCount <= 1) return IDENTITY;
  const spacing = 1.6 / layerCount;
  const x = -0.8 + spacing * (index + 0.5);
  return { x, y: 0, scale: 1 / layerCount, rotation: 0 };
}

export const layoutFunctions: Record<string, LayoutFn> = {
  none,
  grid,
  radial,
  diagonal,
  "rule-of-thirds": ruleOfThirds,
  "golden-spiral": goldenSpiral,
  "stack-vertical": stackVertical,
  "stack-horizontal": stackHorizontal,
};
