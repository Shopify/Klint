import type { AlgorithmDef } from "./types";

export const roseCurve: AlgorithmDef = {
  id: "rose-curve",
  name: "Rose Curve",
  category: "Petals",
  parameters: [
    { id: "petals", label: "Petals", type: "slider", defaultValue: 5, min: 2, max: 16, step: 1 },
    { id: "amplitude", label: "Amplitude", type: "slider", defaultValue: 1, min: 0.2, max: 2, step: 0.1 },
    { id: "pointiness", label: "Pointiness", type: "slider", defaultValue: 1, min: 0.3, max: 3, step: 0.1 },
    { id: "color", label: "Color", type: "color", defaultValue: "#c38d9e" },
    { id: "rotationSpeed", label: "Rotation Speed", type: "slider", defaultValue: 0.03, min: 0, max: 2, step: 0.05 },
    { id: "filled", label: "Filled", type: "toggle", defaultValue: true },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 2, min: 0.5, max: 6, step: 0.5 },
  ],
  draw(K, params) {
    const { petals, amplitude, pointiness, color, rotationSpeed, filled, strokeWidth } = params;
    const maxR = Math.min(K.width, K.height) * 0.38 * amplitude;
    const n = petals;
    const petalWidth = Math.PI / n;
    const stepsPerPetal = 40;

    K.push();
    K.rotate(K.time * rotationSpeed);

    if (filled) {
      K.fillColor(color);
      K.noStroke();
    } else {
      K.noFill();
      K.strokeColor(color);
      K.strokeWidth(strokeWidth);
    }

    // Draw each petal as a separate closed shape.
    // Each petal is centered at angle i * 2pi/n.
    // The radial profile: r = maxR * cos(n * delta)^pointiness
    // where delta sweeps from -pi/(2n) to pi/(2n).
    // cos(n * delta) ranges from 0 to 1 to 0 over that sweep,
    // so the petal always starts and ends at the origin.
    for (let i = 0; i < n; i++) {
      const centerAngle = (i * 2 * Math.PI) / n;

      K.beginShape();
      K.vertex(0, 0);
      for (let j = 0; j <= stepsPerPetal; j++) {
        const t = j / stepsPerPetal;
        const delta = -petalWidth / 2 + t * petalWidth;
        const theta = centerAngle + delta;
        const cosVal = Math.cos(n * delta);
        const r = maxR * Math.pow(cosVal, pointiness);
        K.vertex(Math.cos(theta) * r, Math.sin(theta) * r);
      }
      K.endShape(true);
    }

    K.pop();
  },
  toCode(params) {
    return `  // Rose Curve
  K.push();
  K.rotate(K.time * ${params.rotationSpeed});
  ${params.filled ? `K.fillColor("${params.color}"); K.noStroke();` : `K.noFill(); K.strokeColor("${params.color}"); K.strokeWidth(${params.strokeWidth});`}
  const maxR = Math.min(K.width, K.height) * 0.38 * ${params.amplitude};
  const n = ${params.petals};
  const petalWidth = Math.PI / n;
  for (let i = 0; i < n; i++) {
    const center = (i * 2 * Math.PI) / n;
    K.beginShape();
    K.vertex(0, 0);
    for (let j = 0; j <= 40; j++) {
      const delta = -petalWidth / 2 + (j / 40) * petalWidth;
      const theta = center + delta;
      const r = maxR * Math.pow(Math.cos(n * delta), ${params.pointiness});
      K.vertex(Math.cos(theta) * r, Math.sin(theta) * r);
    }
    K.endShape(true);
  }
  K.pop();`;
  },
};

export const biomorphic: AlgorithmDef = {
  id: "biomorphic",
  name: "Biomorphic Form",
  category: "Petals",
  parameters: [
    { id: "lobes", label: "Lobes", type: "slider", defaultValue: 6, min: 2, max: 12, step: 1 },
    { id: "warp", label: "Warp", type: "slider", defaultValue: 0.4, min: 0, max: 1, step: 0.05 },
    { id: "color", label: "Color", type: "color", defaultValue: "#85cdca" },
    { id: "rotationSpeed", label: "Rotation Speed", type: "slider", defaultValue: 0.02, min: 0, max: 2, step: 0.05 },
    { id: "breathe", label: "Breathe Speed", type: "slider", defaultValue: 0.1, min: 0, max: 3, step: 0.1 },
    { id: "scale", label: "Scale", type: "slider", defaultValue: 1, min: 0.3, max: 2, step: 0.1 },
  ],
  draw(K, params) {
    const { lobes, warp, color, rotationSpeed, breathe, scale } = params;
    const maxR = Math.min(K.width, K.height) * 0.35 * scale;

    K.push();
    K.rotate(K.time * rotationSpeed);
    K.fillColor(color);
    K.noStroke();

    K.beginShape();
    const steps = 300;
    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const breath = Math.sin(K.time * breathe) * 0.15 + 1;
      const r =
        maxR *
        breath *
        (1 +
          warp * Math.sin(lobes * theta) +
          warp * 0.5 * Math.sin(lobes * 2 * theta + K.time * breathe));
      K.vertex(Math.cos(theta) * r, Math.sin(theta) * r);
    }
    K.endShape(true);
    K.pop();
  },
  toCode(params) {
    return `  // Biomorphic Form
  K.push();
  K.rotate(K.time * ${params.rotationSpeed});
  K.fillColor("${params.color}");
  K.noStroke();
  K.beginShape();
  const maxR = Math.min(K.width, K.height) * 0.35 * ${params.scale};
  for (let i = 0; i <= 300; i++) {
    const theta = (i / 300) * Math.PI * 2;
    const breath = Math.sin(K.time * ${params.breathe}) * 0.15 + 1;
    const r = maxR * breath * (1 + ${params.warp} * Math.sin(${params.lobes} * theta) + ${params.warp} * 0.5 * Math.sin(${params.lobes} * 2 * theta + K.time * ${params.breathe}));
    K.vertex(Math.cos(theta) * r, Math.sin(theta) * r);
  }
  K.endShape(true);
  K.pop();`;
  },
};
