import type { AlgorithmDef } from "./types";
import { perlin } from "./noise";

export const rectangularGrid: AlgorithmDef = {
  id: "rectangular-grid",
  name: "Rectangular Grid",
  category: "Grids",
  parameters: [
    { id: "cellSize", label: "Cell Size", type: "slider", defaultValue: 40, min: 10, max: 100, step: 5 },
    { id: "dotRadius", label: "Dot Radius", type: "slider", defaultValue: 4, min: 1, max: 20, step: 1 },
    { id: "noiseDistort", label: "Noise Distort", type: "slider", defaultValue: 0.3, min: 0, max: 1, step: 0.05 },
    { id: "color", label: "Color", type: "color", defaultValue: "#e8a87c" },
    { id: "animated", label: "Animated", type: "toggle", defaultValue: true },
    { id: "shape", label: "Shape", type: "select", defaultValue: "circle", options: [
      { label: "Circle", value: "circle" },
      { label: "Square", value: "square" },
      { label: "Line", value: "line" },
    ]},
  ],
  draw(K, params) {
    const { cellSize, dotRadius, noiseDistort, color, animated, shape } = params;
    const cols = Math.ceil(K.width / cellSize) + 2;
    const rows = Math.ceil(K.height / cellSize) + 2;
    const offsetX = -((cols * cellSize) / 2);
    const offsetY = -((rows * cellSize) / 2);

    K.fillColor(color);
    K.strokeColor(color);
    K.strokeWidth(1);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const baseX = offsetX + i * cellSize + cellSize / 2;
        const baseY = offsetY + j * cellSize + cellSize / 2;
        const timeOffset = animated ? K.time * 0.05 : 0;

        const nx = perlin(i * 0.15, j * 0.15, timeOffset) * noiseDistort * cellSize;
        const ny = perlin(i * 0.15 + 100, j * 0.15 + 100, timeOffset) * noiseDistort * cellSize;
        const x = baseX + nx;
        const y = baseY + ny;

        const sizeNoise = perlin(i * 0.2, j * 0.2, timeOffset + 50);
        const size = dotRadius * (0.5 + sizeNoise * 0.8);

        if (shape === "circle") {
          K.noStroke();
          K.circle(x, y, Math.max(1, size));
        } else if (shape === "square") {
          K.noStroke();
          K.push();
          K.translate(x, y);
          K.rotate(perlin(i * 0.1, j * 0.1, timeOffset) * Math.PI);
          K.rectangle(-size, -size, size * 2, size * 2);
          K.pop();
        } else {
          K.noFill();
          const angle = perlin(i * 0.1, j * 0.1, timeOffset) * Math.PI * 2;
          const len = size * 2;
          K.line(
            x - Math.cos(angle) * len,
            y - Math.sin(angle) * len,
            x + Math.cos(angle) * len,
            y + Math.sin(angle) * len,
          );
        }
      }
    }
  },
  toCode(params) {
    return `  // Rectangular Grid
  K.fillColor("${params.color}");
  K.strokeColor("${params.color}");
  K.strokeWidth(1);
  const cellSize = ${params.cellSize};
  const cols = Math.ceil(K.width / cellSize) + 2;
  const rows = Math.ceil(K.height / cellSize) + 2;
  const offsetX = -(cols * cellSize / 2);
  const offsetY = -(rows * cellSize / 2);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const baseX = offsetX + i * cellSize + cellSize / 2;
      const baseY = offsetY + j * cellSize + cellSize / 2;
      const t = ${params.animated ? "K.time * 0.05" : "0"};
      const nx = K.Noise.perlin(i * 0.15, j * 0.15, t) * ${params.noiseDistort} * cellSize;
      const ny = K.Noise.perlin(i * 0.15 + 100, j * 0.15 + 100, t) * ${params.noiseDistort} * cellSize;
      const size = ${params.dotRadius} * (0.5 + K.Noise.perlin(i * 0.2, j * 0.2, t + 50) * 0.8);
      ${params.shape === "circle" ? "K.noStroke(); K.circle(baseX + nx, baseY + ny, Math.max(1, size));" : params.shape === "square" ? `K.noStroke(); K.push(); K.translate(baseX + nx, baseY + ny); K.rotate(K.Noise.perlin(i * 0.1, j * 0.1, t) * Math.PI); K.rectangle(-size, -size, size * 2, size * 2); K.pop();` : `K.noFill(); const angle = K.Noise.perlin(i * 0.1, j * 0.1, t) * Math.PI * 2; const len = size * 2; K.line(baseX + nx - Math.cos(angle) * len, baseY + ny - Math.sin(angle) * len, baseX + nx + Math.cos(angle) * len, baseY + ny + Math.sin(angle) * len);`}
    }
  }`;
  },
};

export const hexagonalGrid: AlgorithmDef = {
  id: "hexagonal-grid",
  name: "Hexagonal Grid",
  category: "Grids",
  parameters: [
    { id: "cellSize", label: "Cell Size", type: "slider", defaultValue: 30, min: 10, max: 80, step: 5 },
    { id: "color", label: "Color", type: "color", defaultValue: "#41b3a3" },
    { id: "noiseDistort", label: "Noise Distort", type: "slider", defaultValue: 0.2, min: 0, max: 1, step: 0.05 },
    { id: "animated", label: "Animated", type: "toggle", defaultValue: true },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 1, min: 0.5, max: 4, step: 0.5 },
    { id: "filled", label: "Filled", type: "toggle", defaultValue: false },
  ],
  draw(K, params) {
    const { cellSize, color, noiseDistort, animated, strokeWidth, filled } = params;
    const hexH = cellSize * Math.sqrt(3);
    const cols = Math.ceil(K.width / (cellSize * 1.5)) + 4;
    const rows = Math.ceil(K.height / hexH) + 4;
    const offsetX = -((cols * cellSize * 1.5) / 2);
    const offsetY = -((rows * hexH) / 2);

    if (filled) {
      K.fillColor(color);
      K.noStroke();
    } else {
      K.noFill();
      K.strokeColor(color);
      K.strokeWidth(strokeWidth);
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = offsetX + i * cellSize * 1.5;
        const cy = offsetY + j * hexH + (i % 2 === 1 ? hexH / 2 : 0);
        const timeOffset = animated ? K.time * 0.03 : 0;

        const distort = perlin(i * 0.2, j * 0.2, timeOffset) * noiseDistort * cellSize;
        const sizeVar = 1 + perlin(i * 0.15 + 50, j * 0.15 + 50, timeOffset) * 0.3;

        K.push();
        K.translate(cx + distort, cy + distort);
        K.polygon(0, 0, cellSize * 0.45 * sizeVar, 6);
        K.pop();
      }
    }
  },
  toCode(params) {
    return `  // Hexagonal Grid
  ${params.filled ? `K.fillColor("${params.color}"); K.noStroke();` : `K.noFill(); K.strokeColor("${params.color}"); K.strokeWidth(${params.strokeWidth});`}
  const cellSize = ${params.cellSize};
  const hexH = cellSize * Math.sqrt(3);
  const cols = Math.ceil(K.width / (cellSize * 1.5)) + 4;
  const rows = Math.ceil(K.height / hexH) + 4;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = -(cols * cellSize * 1.5 / 2) + i * cellSize * 1.5;
      const cy = -(rows * hexH / 2) + j * hexH + (i % 2 === 1 ? hexH / 2 : 0);
      const t = ${params.animated ? "K.time * 0.03" : "0"};
      const distort = K.Noise.perlin(i * 0.2, j * 0.2, t) * ${params.noiseDistort} * cellSize;
      const sizeVar = 1 + K.Noise.perlin(i * 0.15 + 50, j * 0.15 + 50, t) * 0.3;
      K.push();
      K.translate(cx + distort, cy + distort);
      K.polygon(0, 0, cellSize * 0.45 * sizeVar, 6);
      K.pop();
    }
  }`;
  },
};
