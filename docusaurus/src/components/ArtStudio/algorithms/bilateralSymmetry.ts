import type { AlgorithmDef } from "./types";
import { perlin } from "./noise";

export const bilateralSymmetry: AlgorithmDef = {
  id: "bilateral-symmetry",
  name: "Bilateral Mirror",
  category: "Symmetry",
  parameters: [
    { id: "noiseScale", label: "Noise Scale", type: "slider", defaultValue: 3, min: 0.5, max: 10, step: 0.5 },
    { id: "amplitude", label: "Amplitude", type: "slider", defaultValue: 1, min: 0.2, max: 2, step: 0.1 },
    { id: "strands", label: "Strands", type: "slider", defaultValue: 12, min: 1, max: 30, step: 1 },
    { id: "segments", label: "Segments", type: "slider", defaultValue: 60, min: 20, max: 120, step: 5 },
    { id: "color", label: "Color", type: "color", defaultValue: "#e8a87c" },
    { id: "mirrorAxis", label: "Mirror Axis", type: "select", defaultValue: "vertical", options: [
      { label: "Vertical", value: "vertical" },
      { label: "Horizontal", value: "horizontal" },
      { label: "Both", value: "both" },
    ]},
    { id: "flowSpeed", label: "Flow Speed", type: "slider", defaultValue: 0.05, min: 0, max: 3, step: 0.1 },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 2, min: 0.5, max: 6, step: 0.5 },
  ],
  draw(K, params) {
    const { noiseScale, amplitude, strands, segments, color, mirrorAxis, flowSpeed, strokeWidth } = params;
    // Use smaller dimension / 2 for the vertical extent, so shapes don't clip
    const extent = Math.min(K.width, K.height) * 0.45;
    const spread = Math.min(K.width, K.height) * 0.35 * amplitude;

    K.strokeColor(color);
    K.strokeWidth(strokeWidth);
    K.noFill();

    const drawHalf = (sign: number) => {
      for (let s = 0; s < strands; s++) {
        const strandOffset = (s / strands) * 100;
        K.beginShape();
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const y = -extent + t * extent * 2;
          const n = perlin(t * noiseScale, K.time * flowSpeed + strandOffset);
          const x = sign * ((s / strands) * spread * 0.3 + n * spread);
          K.vertex(x, y);
        }
        K.endShape();
      }
    };

    if (mirrorAxis === "vertical" || mirrorAxis === "both") {
      drawHalf(1);
      drawHalf(-1);
    }

    if (mirrorAxis === "horizontal" || mirrorAxis === "both") {
      K.push();
      K.rotate(Math.PI / 2);
      drawHalf(1);
      drawHalf(-1);
      K.pop();
    }
  },
  toCode(params) {
    return `  // Bilateral Mirror
  K.strokeColor("${params.color}");
  K.strokeWidth(${params.strokeWidth});
  K.noFill();
  const extent = Math.min(K.width, K.height) * 0.45;
  const spread = Math.min(K.width, K.height) * 0.35 * ${params.amplitude};
  const drawHalf = (sign) => {
    for (let s = 0; s < ${params.strands}; s++) {
      const off = (s / ${params.strands}) * 100;
      K.beginShape();
      for (let i = 0; i <= ${params.segments}; i++) {
        const t = i / ${params.segments};
        const y = -extent + t * extent * 2;
        const n = K.Noise.perlin(t * ${params.noiseScale}, K.time * ${params.flowSpeed} + off);
        K.vertex(sign * ((s / ${params.strands}) * spread * 0.3 + n * spread), y);
      }
      K.endShape();
    }
  };
  ${params.mirrorAxis === "vertical" || params.mirrorAxis === "both" ? "drawHalf(1); drawHalf(-1);" : ""}
  ${params.mirrorAxis === "horizontal" || params.mirrorAxis === "both" ? "K.push(); K.rotate(Math.PI / 2); drawHalf(1); drawHalf(-1); K.pop();" : ""}`;
  },
};
