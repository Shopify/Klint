import type { AlgorithmDef } from "./types";

export const radialSymmetry: AlgorithmDef = {
  id: "radial-symmetry",
  name: "Radial N-fold",
  category: "Symmetry",
  parameters: [
    { id: "folds", label: "Folds", type: "slider", defaultValue: 8, min: 3, max: 24, step: 1 },
    { id: "innerPattern", label: "Inner Pattern", type: "select", defaultValue: "lines", options: [
      { label: "Lines", value: "lines" },
      { label: "Dots", value: "dots" },
      { label: "Arcs", value: "arcs" },
    ]},
    { id: "scale", label: "Scale", type: "slider", defaultValue: 1, min: 0.3, max: 2, step: 0.1 },
    { id: "rotationSpeed", label: "Rotation Speed", type: "slider", defaultValue: 0.03, min: 0, max: 2, step: 0.05 },
    { id: "color", label: "Color", type: "color", defaultValue: "#41b3a3" },
    { id: "detail", label: "Detail", type: "slider", defaultValue: 8, min: 3, max: 20, step: 1 },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 1.5, min: 0.5, max: 6, step: 0.5 },
  ],
  draw(K, params) {
    const { folds, innerPattern, scale, rotationSpeed, color, detail, strokeWidth } = params;
    const maxR = Math.min(K.width, K.height) * 0.38 * scale;

    K.push();
    K.rotate(K.time * rotationSpeed);
    K.strokeColor(color);
    K.strokeWidth(strokeWidth);
    K.noFill();

    const angleStep = (Math.PI * 2) / folds;

    for (let f = 0; f < folds; f++) {
      K.push();
      K.rotate(f * angleStep);

      if (innerPattern === "lines") {
        for (let d = 0; d < detail; d++) {
          const t = (d + 1) / detail;
          const r = t * maxR;
          const wobble = Math.sin(K.time * 0.2 + d * 0.7) * maxR * 0.05;
          K.line(0, 0, r + wobble, angleStep * 0.3 * r);
        }
      } else if (innerPattern === "dots") {
        for (let d = 0; d < detail; d++) {
          const t = (d + 1) / detail;
          const r = t * maxR;
          const pulse = Math.sin(K.time * 0.2 + d * 0.5) * 3 + 5;
          K.fillColor(color);
          K.circle(r, 0, pulse);
          K.noFill();
        }
      } else {
        // Arcs
        for (let d = 0; d < detail; d++) {
          const t = (d + 1) / detail;
          const r = t * maxR;
          const sweep = angleStep * 0.7 * Math.sin(K.time + d * 0.4);
          K.beginShape();
          for (let a = 0; a <= 20; a++) {
            const ang = (a / 20) * sweep;
            K.vertex(Math.cos(ang) * r, Math.sin(ang) * r);
          }
          K.endShape();
        }
      }

      K.pop();
    }
    K.pop();
  },
  toCode(params) {
    return `  // Radial N-fold Symmetry
  K.push();
  K.rotate(K.time * ${params.rotationSpeed});
  K.strokeColor("${params.color}");
  K.strokeWidth(${params.strokeWidth});
  K.noFill();
  const folds = ${params.folds};
  const angleStep = (Math.PI * 2) / folds;
  const maxR = Math.min(K.width, K.height) * 0.38 * ${params.scale};
  for (let f = 0; f < folds; f++) {
    K.push();
    K.rotate(f * angleStep);
    for (let d = 0; d < ${params.detail}; d++) {
      const t = (d + 1) / ${params.detail};
      const r = t * maxR;
      ${params.innerPattern === "lines" ? "K.line(0, 0, r + Math.sin(K.time * 0.2 + d * 0.7) * maxR * 0.05, angleStep * 0.3 * r);" : params.innerPattern === "dots" ? `K.fillColor("${params.color}"); K.circle(r, 0, Math.sin(K.time * 0.2 + d * 0.5) * 3 + 5); K.noFill();` : "const sweep = angleStep * 0.7 * Math.sin(K.time + d * 0.4); K.beginShape(); for (let a = 0; a <= 20; a++) { const ang = (a / 20) * sweep; K.vertex(Math.cos(ang) * r, Math.sin(ang) * r); } K.endShape();"}
    }
    K.pop();
  }
  K.pop();`;
  },
};
