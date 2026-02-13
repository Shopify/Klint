import type { AlgorithmDef } from "./types";

export const concentricRings: AlgorithmDef = {
  id: "concentric-rings",
  name: "Concentric Rings",
  category: "Rings",
  parameters: [
    { id: "ringCount", label: "Ring Count", type: "slider", defaultValue: 12, min: 3, max: 40, step: 1 },
    { id: "colorStart", label: "Inner Color", type: "color", defaultValue: "#e27d60" },
    { id: "colorEnd", label: "Outer Color", type: "color", defaultValue: "#41b3a3" },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 2, min: 0.5, max: 8, step: 0.5 },
    { id: "pulseSpeed", label: "Pulse Speed", type: "slider", defaultValue: 0.1, min: 0, max: 5, step: 0.1 },
    { id: "gap", label: "Ring Gap", type: "slider", defaultValue: 1, min: 0.3, max: 3, step: 0.1 },
    { id: "filled", label: "Filled", type: "toggle", defaultValue: false },
  ],
  draw(K, params) {
    const { ringCount, colorStart, colorEnd, strokeWidth, pulseSpeed, gap, filled } = params;
    const maxR = Math.min(K.width, K.height) * 0.4;

    for (let i = 0; i < ringCount; i++) {
      const t = i / (ringCount - 1);
      const pulse = Math.sin(K.time * pulseSpeed + i * 0.5) * 0.1;
      const r = (t + pulse) * maxR * gap;

      // Interpolate color
      const r1 = parseInt(colorStart.slice(1, 3), 16);
      const g1 = parseInt(colorStart.slice(3, 5), 16);
      const b1 = parseInt(colorStart.slice(5, 7), 16);
      const r2 = parseInt(colorEnd.slice(1, 3), 16);
      const g2 = parseInt(colorEnd.slice(3, 5), 16);
      const b2 = parseInt(colorEnd.slice(5, 7), 16);
      const cr = Math.round(r1 + (r2 - r1) * t);
      const cg = Math.round(g1 + (g2 - g1) * t);
      const cb = Math.round(b1 + (b2 - b1) * t);
      const c = `rgb(${cr}, ${cg}, ${cb})`;

      if (filled) {
        K.fillColor(c);
        K.noStroke();
        K.opacity((1 - t) * 0.3 + 0.05);
      } else {
        K.noFill();
        K.strokeColor(c);
        K.strokeWidth(strokeWidth);
      }
      K.circle(0, 0, Math.abs(r));
    }
  },
  toCode(params) {
    return `  // Concentric Rings
  const maxR = Math.min(K.width, K.height) * 0.4;
  for (let i = 0; i < ${params.ringCount}; i++) {
    const t = i / ${params.ringCount - 1};
    const pulse = Math.sin(K.time * ${params.pulseSpeed} + i * 0.5) * 0.1;
    const r = (t + pulse) * maxR * ${params.gap};
    const cr = Math.round(${parseInt(params.colorStart.slice(1, 3), 16)} + (${parseInt(params.colorEnd.slice(1, 3), 16)} - ${parseInt(params.colorStart.slice(1, 3), 16)}) * t);
    const cg = Math.round(${parseInt(params.colorStart.slice(3, 5), 16)} + (${parseInt(params.colorEnd.slice(3, 5), 16)} - ${parseInt(params.colorStart.slice(3, 5), 16)}) * t);
    const cb = Math.round(${parseInt(params.colorStart.slice(5, 7), 16)} + (${parseInt(params.colorEnd.slice(5, 7), 16)} - ${parseInt(params.colorStart.slice(5, 7), 16)}) * t);
    ${params.filled ? `K.fillColor(\`rgb(\${cr}, \${cg}, \${cb})\`); K.noStroke(); K.opacity((1 - t) * 0.3 + 0.05);` : `K.noFill(); K.strokeColor(\`rgb(\${cr}, \${cg}, \${cb})\`); K.strokeWidth(${params.strokeWidth});`}
    K.circle(0, 0, Math.abs(r));
  }`;
  },
};
