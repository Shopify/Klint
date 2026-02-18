import type { KlintContext } from "@shopify/klint";
import type { Drop } from "./config";
import {
  createDrop,
  createFlower,
  createBlob,
  createStar,
  createCrescent,
  createSupershape,
} from "./engine";
import {
  COLOR_SETS,
  TEXT_COLOR,
  GOLDEN_ANGLE,
  DROP_COUNT,
  type DropSpec,
  type TextResult,
} from "./config";

/**
 * Seeded PRNG (Mulberry32) — deterministic across reloads for a given seed.
 */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function textToDrops(
  fontData: any,
  text: string,
  fontSize: number,
  color: string,
): TextResult {
  const result = fontData.toPoints(text, fontSize, {
    anchor: "center",
    align: "center",
    baseline: "center",
    sampling: 0.5,
  });

  const drops: Drop[] = [];

  for (const letter of result.letters) {
    const contours = new Map<number, { x: number; y: number }[]>();
    for (const point of letter.shape) {
      if (!contours.has(point.contour)) {
        contours.set(point.contour, []);
      }
      contours.get(point.contour)!.push({
        x: letter.center.x + point.x,
        y: letter.center.y + point.y,
      });
    }

    for (const vertices of contours.values()) {
      if (vertices.length >= 3) {
        drops.push({ color, vertices: vertices.map((v) => ({ ...v })) });
      }
    }
  }

  return { drops };
}

export function createDropFromSpec(spec: DropSpec): Drop {
  switch (spec.shape) {
    case "flower":
      return createFlower(
        spec.cx,
        spec.cy,
        spec.r,
        spec.color,
        spec.petals!,
        spec.amplitude!,
      );
    case "star":
      return createStar(
        spec.cx,
        spec.cy,
        spec.r,
        spec.color,
        spec.points!,
        spec.innerRatio!,
        spec.sharpness,
      );
    case "crescent":
      return createCrescent(
        spec.cx,
        spec.cy,
        spec.r,
        spec.color,
        spec.offset!,
        spec.rotation!,
      );
    case "supershape":
      return createSupershape(
        spec.cx,
        spec.cy,
        spec.r,
        spec.color,
        spec.m!,
        spec.n1!,
        spec.n2!,
        spec.n3!,
      );
    case "blob":
      return createBlob(
        spec.cx,
        spec.cy,
        spec.r,
        spec.color,
        spec.harmonics!,
      );
    default:
      return createDrop(spec.cx, spec.cy, spec.r, spec.color);
  }
}

/**
 * Build the full scene: phyllotaxis spiral of drop specs + scaled text drops.
 * Returns everything needed to kick off the placement animation.
 */
export function buildScene(
  K: KlintContext,
  fontData: any,
  seed: number,
): { specs: DropSpec[]; textResult: TextResult; bg: string } {
  const rand = mulberry32(seed);
  const hw = K.width * 0.5;
  const hh = K.height * 0.5;

  const set = COLOR_SETS[Math.floor(rand() * COLOR_SETS.length)];
  const bg = K.Color[set.bg as keyof typeof K.Color] as string;
  const fg = set.fg.map(
    (name) => K.Color[name as keyof typeof K.Color] as string,
  );

  for (let i = fg.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [fg[i], fg[j]] = [fg[j], fg[i]];
  }

  // Phyllotaxis spiral — golden angle ensures no two drops align
  const baseR = Math.max(hw, hh) * 0.35;
  const spiralSpacing = Math.min(hw, hh) * 0.15;
  const circleSpecs: DropSpec[] = [];

  for (let i = 0; i < DROP_COUNT; i++) {
    const angle = i * GOLDEN_ANGLE;
    const dist = Math.sqrt(i) * spiralSpacing;
    const t = i / (DROP_COUNT - 1);
    const r = baseR * Math.pow(1 - t * 0.85, 1.5);
    const jx = (rand() - 0.5) * 30;
    const jy = (rand() - 0.5) * 30;

    const cx = Math.cos(angle) * dist + jx;
    const cy = Math.sin(angle) * dist + jy;
    const color = fg[i % fg.length];
    const roll = rand();
    let spec: DropSpec;

    if (roll < 0.2) {
      spec = {
        cx, cy, r, color, shape: "flower",
        petals: 3 + Math.floor(rand() * 4),
        amplitude: 0.2 + rand() * 0.25,
      };
    } else if (roll < 0.35) {
      spec = {
        cx, cy, r, color, shape: "star",
        points: 3 + Math.floor(rand() * 5),
        innerRatio: 0.3 + rand() * 0.3,
        sharpness: 0.4 + rand() * 0.6,
      };
    } else if (roll < 0.5) {
      spec = {
        cx, cy, r, color, shape: "crescent",
        offset: 0.3 + rand() * 0.4,
        rotation: rand() * Math.PI * 2,
      };
    } else if (roll < 0.7) {
      const presets = [
        { m: 3, n1: 0.5, n2: 1, n3: 1 },
        { m: 5, n1: 0.3, n2: 1, n3: 1 },
        { m: 4, n1: 2, n2: 2, n3: 2 },
        { m: 6, n1: 0.2, n2: 1.7, n3: 1.7 },
        { m: 3, n1: 5, n2: 2, n3: 7 },
        { m: 7, n1: 0.3, n2: 1, n3: 1 },
        { m: 8, n1: 0.5, n2: 0.5, n3: 8 },
      ];
      const p = presets[Math.floor(rand() * presets.length)];
      spec = { cx, cy, r, color, shape: "supershape", ...p };
    } else if (roll < 0.85) {
      spec = {
        cx, cy, r, color, shape: "blob",
        harmonics: [
          { amp: 0.05 + rand() * 0.12, freq: 2, phase: rand() * Math.PI * 2 },
          { amp: 0.03 + rand() * 0.1, freq: 3, phase: rand() * Math.PI * 2 },
          { amp: 0.02 + rand() * 0.08, freq: 5, phase: rand() * Math.PI * 2 },
        ],
      };
    } else {
      spec = { cx, cy, r, color, shape: "circle" };
    }
    circleSpecs.push(spec);
  }

  // Force the first drop to be a blob (it's the largest)
  const first = circleSpecs[0];
  if (first.shape !== "blob") {
    circleSpecs[0] = {
      cx: first.cx, cy: first.cy, r: first.r, color: first.color,
      shape: "blob",
      harmonics: [
        { amp: 0.05 + rand() * 0.12, freq: 2, phase: rand() * Math.PI * 2 },
        { amp: 0.03 + rand() * 0.1, freq: 3, phase: rand() * Math.PI * 2 },
        { amp: 0.02 + rand() * 0.08, freq: 5, phase: rand() * Math.PI * 2 },
      ],
    };
  }

  // Measure text at reference size, then scale to fit canvas with margin
  const refSize = 100;
  const refResult = fontData.toPoints("Klint", refSize, {
    anchor: "center",
    align: "center",
    baseline: "center",
    sampling: 0.5,
  });
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const letter of refResult.letters) {
    for (const point of letter.shape) {
      const px = letter.center.x + point.x;
      const py = letter.center.y + point.y;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  }
  const margin = 0.32;
  const scaleX = (K.width * (1 - margin * 2)) / (maxX - minX);
  const scaleY = (K.height * (1 - margin * 2)) / (maxY - minY);
  const fontSize = refSize * Math.min(scaleX, scaleY);

  const textResult = textToDrops(fontData, "Klint", fontSize, TEXT_COLOR);

  // Ensure the largest drops have enough contrast with white text
  const withLum = fg.map((c) => {
    const r = parseInt(c.slice(1, 3), 16) / 255;
    const g = parseInt(c.slice(3, 5), 16) / 255;
    const b = parseInt(c.slice(5, 7), 16) / 255;
    return { color: c, lum: 0.299 * r + 0.587 * g + 0.114 * b };
  });
  withLum.sort((a, b) => a.lum - b.lum);
  circleSpecs[0].color = withLum[0].color;
  if (circleSpecs.length > 1) {
    circleSpecs[1].color = withLum[Math.min(1, withLum.length - 1)].color;
  }

  circleSpecs.reverse(); // small outer drops first, large center drops last

  return { specs: circleSpecs, textResult, bg };
}
