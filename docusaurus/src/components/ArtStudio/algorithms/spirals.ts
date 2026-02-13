import type { AlgorithmDef } from "./types";

export const parametricSpiral: AlgorithmDef = {
  id: "parametric-spiral",
  name: "Parametric Spiral",
  category: "Spirals",
  parameters: [
    { id: "turns", label: "Turns", type: "slider", defaultValue: 8, min: 1, max: 30, step: 0.5 },
    { id: "growth", label: "Growth", type: "slider", defaultValue: 3, min: 0.5, max: 10, step: 0.1 },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 2, min: 0.5, max: 8, step: 0.5 },
    { id: "color", label: "Color", type: "color", defaultValue: "#e8a87c" },
    { id: "rotationSpeed", label: "Rotation Speed", type: "slider", defaultValue: 0.05, min: 0, max: 3, step: 0.05 },
    { id: "scale", label: "Scale", type: "slider", defaultValue: 1, min: 0.2, max: 3, step: 0.1 },
  ],
  draw(K, params) {
    const { turns, growth, strokeWidth, color, rotationSpeed, scale } = params;
    const cx = 0;
    const cy = 0;
    const maxR = Math.min(K.width, K.height) * 0.4 * scale;

    K.push();
    K.rotate(K.time * rotationSpeed);
    K.strokeColor(color);
    K.strokeWidth(strokeWidth);
    K.noFill();

    K.beginShape();
    const steps = Math.floor(turns * 120);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = t * turns * Math.PI * 2;
      const r = Math.pow(t, growth / 3) * maxR;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) {
        K.vertex(x, y);
      } else {
        K.vertex(x, y);
      }
    }
    K.endShape();
    K.pop();
  },
  toCode(params) {
    return `  // Parametric Spiral
  K.push();
  K.rotate(K.time * ${params.rotationSpeed});
  K.strokeColor("${params.color}");
  K.strokeWidth(${params.strokeWidth});
  K.noFill();
  K.beginShape();
  const steps = ${Math.floor(params.turns * 120)};
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * ${params.turns} * Math.PI * 2;
    const r = Math.pow(t, ${params.growth} / 3) * Math.min(K.width, K.height) * 0.4 * ${params.scale};
    K.vertex(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  K.endShape();
  K.pop();`;
  },
};

export const fibonacciSpiral: AlgorithmDef = {
  id: "fibonacci-spiral",
  name: "Fibonacci Spiral",
  category: "Spirals",
  parameters: [
    { id: "segments", label: "Segments", type: "slider", defaultValue: 10, min: 4, max: 18, step: 1 },
    { id: "strokeWidth", label: "Stroke Width", type: "slider", defaultValue: 2, min: 0.5, max: 6, step: 0.5 },
    { id: "color", label: "Color", type: "color", defaultValue: "#c38d9e" },
    { id: "showSquares", label: "Show Squares", type: "toggle", defaultValue: true },
    { id: "rotationSpeed", label: "Rotation Speed", type: "slider", defaultValue: 0.03, min: 0, max: 2, step: 0.05 },
    { id: "scale", label: "Scale", type: "slider", defaultValue: 1, min: 0.3, max: 2, step: 0.1 },
  ],
  draw(K, params) {
    const { segments, strokeWidth, color, showSquares, rotationSpeed, scale } = params;

    K.push();
    K.rotate(K.time * rotationSpeed);
    K.strokeColor(color);
    K.strokeWidth(strokeWidth);
    K.noFill();

    // Generate Fibonacci numbers
    const fibs: number[] = [1, 1];
    for (let i = 2; i < segments; i++) {
      fibs.push(fibs[i - 1] + fibs[i - 2]);
    }

    // Build square tiling by tracking the bounding rectangle.
    // Squares are added in cycling directions: 0=first, 1=right, 2=down, 3=left, 0=up, ...
    let bx1 = 0, by1 = 0, bx2 = fibs[0], by2 = fibs[0];
    const squares: { x: number; y: number; size: number }[] = [
      { x: 0, y: 0, size: fibs[0] },
    ];

    for (let i = 1; i < fibs.length; i++) {
      const size = fibs[i];
      const dir = i % 4;
      let sx = 0, sy = 0;
      switch (dir) {
        case 1: sx = bx2; sy = by2 - size; bx2 += size; break;
        case 2: sx = bx2 - size; sy = by2; by2 += size; break;
        case 3: sx = bx1 - size; sy = by1; bx1 -= size; break;
        case 0: sx = bx1; sy = by1 - size; by1 -= size; break;
      }
      squares.push({ x: sx, y: sy, size });
    }

    // Center and scale to fit canvas
    const cx = (bx1 + bx2) / 2;
    const cy = (by1 + by2) / 2;
    const maxDim = Math.max(bx2 - bx1, by2 - by1);
    const unit = (Math.min(K.width, K.height) * 0.75 * scale) / maxDim;

    // Draw squares (faded)
    if (showSquares) {
      K.strokeWidth(strokeWidth * 0.5);
      K.opacity(0.3);
      for (const sq of squares) {
        K.rectangle(
          (sq.x - cx) * unit,
          (sq.y - cy) * unit,
          sq.size * unit,
          sq.size * unit,
        );
      }
      K.opacity(1);
      K.strokeWidth(strokeWidth);
    }

    // Draw quarter-circle arcs.
    // Arc center and start angle per direction so consecutive arcs connect:
    //   dir 0: center = bottom-right (x+s, y+s), start = pi
    //   dir 1: center = bottom-left  (x,   y+s), start = 3pi/2
    //   dir 2: center = top-left     (x,   y),   start = 0
    //   dir 3: center = top-right    (x+s, y),   start = pi/2
    for (let i = 0; i < squares.length; i++) {
      const sq = squares[i];
      const s = sq.size * unit;
      const ox = (sq.x - cx) * unit;
      const oy = (sq.y - cy) * unit;
      const dir = i % 4;

      let acx: number, acy: number, startAngle: number;
      switch (dir) {
        case 0: acx = ox + s; acy = oy + s; startAngle = Math.PI; break;
        case 1: acx = ox;     acy = oy + s; startAngle = Math.PI * 1.5; break;
        case 2: acx = ox;     acy = oy;     startAngle = 0; break;
        default: acx = ox + s; acy = oy;     startAngle = Math.PI * 0.5; break;
      }

      K.beginShape();
      for (let j = 0; j <= 40; j++) {
        const t = j / 40;
        const ang = startAngle + t * Math.PI / 2;
        K.vertex(acx + Math.cos(ang) * s, acy + Math.sin(ang) * s);
      }
      K.endShape();
    }

    K.pop();
  },
  toCode(params) {
    return `  // Fibonacci Spiral
  K.push();
  K.rotate(K.time * ${params.rotationSpeed});
  K.strokeColor("${params.color}");
  K.strokeWidth(${params.strokeWidth});
  K.noFill();
  const fibs = [1, 1];
  for (let i = 2; i < ${params.segments}; i++) fibs.push(fibs[i-1] + fibs[i-2]);
  let bx1 = 0, by1 = 0, bx2 = 1, by2 = 1;
  const squares = [{ x: 0, y: 0, size: 1 }];
  for (let i = 1; i < fibs.length; i++) {
    const size = fibs[i], dir = i % 4;
    let sx = 0, sy = 0;
    if (dir === 1) { sx = bx2; sy = by2 - size; bx2 += size; }
    else if (dir === 2) { sx = bx2 - size; sy = by2; by2 += size; }
    else if (dir === 3) { sx = bx1 - size; sy = by1; bx1 -= size; }
    else { sx = bx1; sy = by1 - size; by1 -= size; }
    squares.push({ x: sx, y: sy, size });
  }
  const cx = (bx1 + bx2) / 2, cy = (by1 + by2) / 2;
  const maxDim = Math.max(bx2 - bx1, by2 - by1);
  const unit = Math.min(K.width, K.height) * 0.75 * ${params.scale} / maxDim;
  ${params.showSquares ? `K.strokeWidth(${params.strokeWidth} * 0.5); K.opacity(0.3);
  for (const sq of squares) K.rectangle((sq.x - cx) * unit, (sq.y - cy) * unit, sq.size * unit, sq.size * unit);
  K.opacity(1); K.strokeWidth(${params.strokeWidth});` : ""}
  for (let i = 0; i < squares.length; i++) {
    const sq = squares[i], s = sq.size * unit;
    const ox = (sq.x - cx) * unit, oy = (sq.y - cy) * unit, dir = i % 4;
    let acx, acy, sa;
    if (dir === 0) { acx = ox+s; acy = oy+s; sa = Math.PI; }
    else if (dir === 1) { acx = ox; acy = oy+s; sa = Math.PI*1.5; }
    else if (dir === 2) { acx = ox; acy = oy; sa = 0; }
    else { acx = ox+s; acy = oy; sa = Math.PI*0.5; }
    K.beginShape();
    for (let j = 0; j <= 40; j++) {
      const ang = sa + (j/40) * Math.PI/2;
      K.vertex(acx + Math.cos(ang) * s, acy + Math.sin(ang) * s);
    }
    K.endShape();
  }
  K.pop();`;
  },
};
