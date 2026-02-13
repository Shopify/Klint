import type { AlgorithmDef } from "./types";
import { parametricSpiral, fibonacciSpiral } from "./spirals";
import { concentricRings } from "./concentricRings";
import { roseCurve, biomorphic } from "./petalForms";
import { bilateralSymmetry } from "./bilateralSymmetry";
import { radialSymmetry } from "./radialSymmetry";
import { rectangularGrid, hexagonalGrid } from "./gridPatterns";
import { flowField } from "./noiseFields";

const algorithms: AlgorithmDef[] = [
  parametricSpiral,
  fibonacciSpiral,
  concentricRings,
  roseCurve,
  biomorphic,
  bilateralSymmetry,
  radialSymmetry,
  rectangularGrid,
  hexagonalGrid,
  flowField,
];

export const algorithmRegistry: Record<string, AlgorithmDef> = {};
for (const algo of algorithms) {
  algorithmRegistry[algo.id] = algo;
}

export const algorithmsByCategory: Record<string, AlgorithmDef[]> = {};
for (const algo of algorithms) {
  if (!algorithmsByCategory[algo.category]) {
    algorithmsByCategory[algo.category] = [];
  }
  algorithmsByCategory[algo.category].push(algo);
}

export const categoryOrder = ["Spirals", "Rings", "Petals", "Symmetry", "Grids", "Noise"];

export { algorithms };
