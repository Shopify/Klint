import type { AlgorithmDef } from "./types";
import { perlin } from "./noise";

export const flowField: AlgorithmDef = {
  id: "flow-field",
  name: "Flow Field",
  category: "Noise",
  parameters: [
    { id: "noiseScale", label: "Noise Scale", type: "slider", defaultValue: 0.005, min: 0.001, max: 0.02, step: 0.001 },
    { id: "flowSpeed", label: "Flow Speed", type: "slider", defaultValue: 0.03, min: 0, max: 2, step: 0.05 },
    { id: "density", label: "Density", type: "slider", defaultValue: 20, min: 5, max: 50, step: 5 },
    { id: "lineLength", label: "Line Length", type: "slider", defaultValue: 30, min: 5, max: 80, step: 5 },
    { id: "color", label: "Color", type: "color", defaultValue: "#e8a87c" },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 1, min: 0.5, max: 4, step: 0.5 },
    { id: "colorVariation", label: "Color Variation", type: "toggle", defaultValue: true },
  ],
  draw(K, params) {
    const { noiseScale, flowSpeed, density, lineLength, color, strokeWidth, colorVariation } = params;
    const cols = Math.ceil(K.width / density);
    const rows = Math.ceil(K.height / density);
    const startX = -(cols * density) / 2;
    const startY = -(rows * density) / 2;

    K.strokeWidth(strokeWidth);
    K.noFill();

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = startX + i * density;
        const y = startY + j * density;
        const angle = perlin(x * noiseScale, y * noiseScale, K.time * flowSpeed) * Math.PI * 4;

        if (colorVariation) {
          const hueShift = perlin(i * 0.1, j * 0.1) * 60;
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          const cr = Math.min(255, Math.max(0, r + hueShift));
          const cg = Math.min(255, Math.max(0, g + hueShift * 0.5));
          const cb = Math.min(255, Math.max(0, b - hueShift * 0.3));
          K.strokeColor(`rgb(${cr}, ${cg}, ${cb})`);
        } else {
          K.strokeColor(color);
        }

        const x2 = x + Math.cos(angle) * lineLength;
        const y2 = y + Math.sin(angle) * lineLength;
        K.line(x, y, x2, y2);
      }
    }
  },
  toCode(params) {
    return `  // Flow Field
  K.strokeWidth(${params.strokeWidth});
  K.noFill();
  const density = ${params.density};
  const cols = Math.ceil(K.width / density);
  const rows = Math.ceil(K.height / density);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = -(cols * density / 2) + i * density;
      const y = -(rows * density / 2) + j * density;
      const angle = K.Noise.perlin(x * ${params.noiseScale}, y * ${params.noiseScale}, K.time * ${params.flowSpeed}) * Math.PI * 4;
      ${params.colorVariation ? `const hue = K.Noise.perlin(i * 0.1, j * 0.1) * 60;
      K.strokeColor(\`rgb(\${Math.min(255, ${parseInt(params.color.slice(1, 3), 16)} + hue)}, \${Math.min(255, ${parseInt(params.color.slice(3, 5), 16)} + hue * 0.5)}, \${Math.max(0, ${parseInt(params.color.slice(5, 7), 16)} - hue * 0.3)})\`);` : `K.strokeColor("${params.color}");`}
      K.line(x, y, x + Math.cos(angle) * ${params.lineLength}, y + Math.sin(angle) * ${params.lineLength});
    }
  }`;
  },
};
