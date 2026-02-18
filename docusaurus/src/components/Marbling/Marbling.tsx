import { useEffect } from "react";
import { Klint, useKlint, useStorage, type KlintContext } from "@shopify/klint";
import FontParser from "@shopify/klint/plugins/FontParser";
import useBaseUrl from "@docusaurus/useBaseUrl";
import {
  type Drop,
  createDrop,
  createFlower,
  createBlob,
  createStar,
  createCrescent,
  createSupershape,
  displaceForDrop,
  applyTineLine,
} from "./tine";

// Curated color sets: [background, ...foreground]
// Foreground colors are shuffled per load; background is fixed per set.
const COLOR_SETS = [
  {
    bg: "orange",
    fg: ["sky", "golden", "mustard", "peach", "charcoal", "rose"],
  },
  { bg: "peach", fg: ["sky", "mustard", "coral", "plum", "rose", "golden"] },
  { bg: "navy", fg: ["peach", "rose", "orange", "mustard", "midnight"] },
  { bg: "sage", fg: ["olive", "midnight", "golden", "plum", "peach", "navy"] },
];

const TEXT_COLOR = "#ffffff";
const STRENGTH = 1.5;
const TINE_U = 0.4;
const TINE_SCALE = 150;
const STROKE_DECAY = 4800; // drag distance (px) at which strength halves
const GOLDEN_ANGLE = 2.39996322; // 137.508° — the angle that never repeats
const DROP_COUNT = 18;
const FRAMES_PER_DROP = 10;
const LERP_EASE_FAST = 0.22; // near center
const LERP_EASE_SLOW = 0.04; // at edges
const LERP_SNAP = 0.25; // snap to target when within this distance²

type ShapeType =
  | "circle"
  | "flower"
  | "blob"
  | "star"
  | "crescent"
  | "supershape";

interface DropSpec {
  cx: number;
  cy: number;
  r: number;
  color: string;
  shape: ShapeType;
  // flower
  petals?: number;
  amplitude?: number;
  // blob
  harmonics?: { amp: number; freq: number; phase: number }[];
  // star
  points?: number;
  innerRatio?: number;
  sharpness?: number;
  // crescent
  offset?: number;
  rotation?: number;
  // supershape
  m?: number;
  n1?: number;
  n2?: number;
  n3?: number;
}

interface TextResult {
  drops: Drop[];
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function textToDrops(
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

export default function Marbling() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  const fontUrl = useBaseUrl("/fonts/Jost-Regular.ttf");

  const storage = useStorage<{
    fontData: any;
    specs: DropSpec[] | null;
    textResult: TextResult | null;
    drops: Drop[];
    targets: { x: number; y: number }[][];
    placed: number;
    textPlaced: boolean;
    frame: number;
    initSize: { w: number; h: number } | null;
    bg: string;
    seed: number;
    lastTineX: number;
    lastTineY: number;
    wasPressed: boolean;
    strokeDist: number;
    settledFrames: number;
  }>({
    fontData: null,
    specs: null,
    textResult: null,
    drops: [],
    targets: [],
    placed: 0,
    textPlaced: false,
    frame: 0,
    initSize: null,
    bg: "#ECA088",
    seed: Date.now(),
    lastTineX: 0,
    lastTineY: 0,
    wasPressed: false,
    strokeDist: 0,
    settledFrames: 0,
  });

  useEffect(() => {
    const parser = new FontParser();
    parser.load(fontUrl).then((data: any) => {
      storage.set("fontData", data);
    });
  }, [fontUrl, storage]);

  const draw = (K: KlintContext) => {
    // Keep mouse tracking current even when idle, so stale positions
    // don't cause phantom tine displacements on the next click.
    if (!mouse.isPressed) {
      storage.set("wasPressed", false);
      storage.set("lastTineX", mouse.x);
      storage.set("lastTineY", mouse.y);
    }

    // Skip all work if canvas has been idle and no interaction is happening
    const settled = storage.get("settledFrames");
    if (settled > 3 && !mouse.isPressed && storage.get("textPlaced")) {
      const initSize = storage.get("initSize");
      if (initSize && initSize.w === K.width && initSize.h === K.height) return;
    }

    const initSize = storage.get("initSize");
    const sizeChanged =
      !initSize || initSize.w !== K.width || initSize.h !== K.height;

    let dirty = false;

    if ((!storage.get("specs") || sizeChanged) && storage.get("fontData")) {
      dirty = true;
      storage.set("initSize", { w: K.width, h: K.height });
      const rand = mulberry32(storage.get("seed"));
      const hw = K.width * 0.5;
      const hh = K.height * 0.5;

      const set = COLOR_SETS[Math.floor(rand() * COLOR_SETS.length)];
      storage.set("bg", K.Color[set.bg as keyof typeof K.Color] as string);
      const fg = set.fg.map(
        (name) => K.Color[name as keyof typeof K.Color] as string,
      );
      // Shuffle foreground colors
      for (let i = fg.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [fg[i], fg[j]] = [fg[j], fg[i]];
      }
      const palette = fg;

      // Phyllotaxis spiral — golden angle ensures no two drops align
      const baseR = Math.max(hw, hh) * 0.35;
      const spiralSpacing = Math.min(hw, hh) * 0.15;
      const circleSpecs: DropSpec[] = [];
      for (let i = 0; i < DROP_COUNT; i++) {
        const angle = i * GOLDEN_ANGLE;
        const dist = Math.sqrt(i) * spiralSpacing;
        const t = i / (DROP_COUNT - 1);
        const r = baseR * Math.pow(1 - t * 0.85, 1.5);
        const jx = (rand() - 0.5) * 30; // ±15px subtle jitter
        const jy = (rand() - 0.5) * 30;

        // Pick a shape from 6 types
        const cx = Math.cos(angle) * dist + jx;
        const cy = Math.sin(angle) * dist + jy;
        const color = palette[i % palette.length];
        const roll = rand();
        let spec: DropSpec;

        if (roll < 0.2) {
          // Flower — rose curve, 3–6 petals
          spec = {
            cx,
            cy,
            r,
            color,
            shape: "flower",
            petals: 3 + Math.floor(rand() * 4),
            amplitude: 0.2 + rand() * 0.25,
          };
        } else if (roll < 0.35) {
          // Star — sharp points that become tendrils when displaced
          spec = {
            cx,
            cy,
            r,
            color,
            shape: "star",
            points: 3 + Math.floor(rand() * 5), // 3–7 points
            innerRatio: 0.3 + rand() * 0.3, // 0.3–0.6
            sharpness: 0.4 + rand() * 0.6,
          };
        } else if (roll < 0.5) {
          // Crescent — asymmetric limaçon, rotated randomly
          spec = {
            cx,
            cy,
            r,
            color,
            shape: "crescent",
            offset: 0.3 + rand() * 0.4, // 0.3–0.7
            rotation: rand() * Math.PI * 2,
          };
        } else if (roll < 0.7) {
          // Supershape — Gielis formula, wild organic forms
          const presets = [
            { m: 3, n1: 0.5, n2: 1, n3: 1 }, // rounded triangle
            { m: 5, n1: 0.3, n2: 1, n3: 1 }, // 5-lobe bloom
            { m: 4, n1: 2, n2: 2, n3: 2 }, // squircle
            { m: 6, n1: 0.2, n2: 1.7, n3: 1.7 }, // hexagonal bloom
            { m: 3, n1: 5, n2: 2, n3: 7 }, // organic 3-lobe
            { m: 7, n1: 0.3, n2: 1, n3: 1 }, // 7-petal soft
            { m: 8, n1: 0.5, n2: 0.5, n3: 8 }, // spiky asymmetric
          ];
          const p = presets[Math.floor(rand() * presets.length)];
          spec = { cx, cy, r, color, shape: "supershape", ...p };
        } else if (roll < 0.85) {
          // Blob — layered harmonics, every one unique
          spec = {
            cx,
            cy,
            r,
            color,
            shape: "blob",
            harmonics: [
              {
                amp: 0.05 + rand() * 0.12,
                freq: 2,
                phase: rand() * Math.PI * 2,
              },
              {
                amp: 0.03 + rand() * 0.1,
                freq: 3,
                phase: rand() * Math.PI * 2,
              },
              {
                amp: 0.02 + rand() * 0.08,
                freq: 5,
                phase: rand() * Math.PI * 2,
              },
            ],
          };
        } else {
          // Circle — clean contrast
          spec = { cx, cy, r, color, shape: "circle" };
        }
        circleSpecs.push(spec);
      }

      // Force the first drop to be a blob (it's the largest)
      const first = circleSpecs[0];
      if (first.shape !== "blob") {
        circleSpecs[0] = {
          cx: first.cx,
          cy: first.cy,
          r: first.r,
          color: first.color,
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
      const refResult = storage.get("fontData").toPoints("Klint", refSize, {
        anchor: "center",
        align: "center",
        baseline: "center",
        sampling: 0.5,
      });
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
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

      storage.set(
        "textResult",
        textToDrops(storage.get("fontData"), "Klint", fontSize, TEXT_COLOR),
      );

      // Ensure the largest drops (first in array, last after reverse)
      // have enough contrast with white text — pick darkest foreground colors
      const withLum = fg.map((c) => {
        const r = parseInt(c.slice(1, 3), 16) / 255;
        const g = parseInt(c.slice(3, 5), 16) / 255;
        const b = parseInt(c.slice(5, 7), 16) / 255;
        return { color: c, lum: 0.299 * r + 0.587 * g + 0.114 * b };
      });
      withLum.sort((a, b) => a.lum - b.lum); // darkest first
      circleSpecs[0].color = withLum[0].color;
      if (circleSpecs.length > 1) {
        circleSpecs[1].color = withLum[Math.min(1, withLum.length - 1)].color;
      }

      circleSpecs.reverse(); // small outer drops first → large center drops last
      storage.set("specs", circleSpecs);
      storage.set("drops", []);
      storage.set("targets", []);
      storage.set("placed", 0);
      storage.set("textPlaced", false);
      storage.set("frame", 0);
    }

    const specs = storage.get("specs");
    const drops = storage.get("drops");
    const targets = storage.get("targets");

    if (specs && storage.get("placed") < DROP_COUNT) {
      if (storage.get("frame") % FRAMES_PER_DROP === 0) {
        const spec = specs[storage.get("placed")];

        // Save current vertex positions (may be mid-lerp)
        const saved = drops.map((drop) =>
          drop.vertices.map((v) => ({ x: v.x, y: v.y })),
        );

        // Displace existing drops (mutates vertices to displaced positions)
        displaceForDrop(drops, spec.cx, spec.cy, spec.r);

        // Capture displaced positions as new lerp targets
        for (let i = 0; i < drops.length; i++) {
          targets[i] = drops[i].vertices.map((v) => ({
            x: v.x,
            y: v.y,
          }));
        }

        // Restore old positions — vertices will lerp toward targets
        for (let i = 0; i < drops.length; i++) {
          const verts = drops[i].vertices;
          for (let j = 0; j < verts.length; j++) {
            verts[j].x = saved[i][j].x;
            verts[j].y = saved[i][j].y;
          }
        }

        // New drop appears instantly — targets match vertices
        let newDrop: Drop;
        switch (spec.shape) {
          case "flower":
            newDrop = createFlower(
              spec.cx,
              spec.cy,
              spec.r,
              spec.color,
              spec.petals!,
              spec.amplitude!,
            );
            break;
          case "star":
            newDrop = createStar(
              spec.cx,
              spec.cy,
              spec.r,
              spec.color,
              spec.points!,
              spec.innerRatio!,
              spec.sharpness,
            );
            break;
          case "crescent":
            newDrop = createCrescent(
              spec.cx,
              spec.cy,
              spec.r,
              spec.color,
              spec.offset!,
              spec.rotation!,
            );
            break;
          case "supershape":
            newDrop = createSupershape(
              spec.cx,
              spec.cy,
              spec.r,
              spec.color,
              spec.m!,
              spec.n1!,
              spec.n2!,
              spec.n3!,
            );
            break;
          case "blob":
            newDrop = createBlob(
              spec.cx,
              spec.cy,
              spec.r,
              spec.color,
              spec.harmonics!,
            );
            break;
          default:
            newDrop = createDrop(spec.cx, spec.cy, spec.r, spec.color);
        }
        drops.push(newDrop);
        targets.push(newDrop.vertices.map((v) => ({ x: v.x, y: v.y })));

        storage.set("placed", storage.get("placed") + 1);
        dirty = true;
      }
      storage.set("frame", storage.get("frame") + 1);
    }

    if (
      specs &&
      storage.get("placed") >= DROP_COUNT &&
      !storage.get("textPlaced") &&
      storage.get("textResult")
    ) {
      if (storage.get("frame") % FRAMES_PER_DROP === 0) {
        const { drops: textDrops } = storage.get("textResult")!;

        for (const drop of textDrops) {
          drops.push(drop);
          targets.push(drop.vertices.map((v) => ({ x: v.x, y: v.y })));
        }

        storage.set("textPlaced", true);
        dirty = true;
      }
      storage.set("frame", storage.get("frame") + 1);
    }

    // Tick position lerps — center vertices animate faster, edges slower
    const allDrops = drops;
    const allTargets = targets;
    const maxDist = K.distance(0, 0, K.width, K.height) * 0.5;
    for (let i = 0; i < allDrops.length; i++) {
      const verts = allDrops[i].vertices;
      const tgt = allTargets[i];
      if (!tgt) continue;
      for (let j = 0; j < verts.length; j++) {
        if (
          K.squareDistance(verts[j].x, verts[j].y, tgt[j].x, tgt[j].y) >
          LERP_SNAP
        ) {
          const dist = K.distance(0, 0, verts[j].x, verts[j].y);
          const t = K.constrain(dist / maxDist, 0, 1);
          const ease = K.lerp(LERP_EASE_FAST, LERP_EASE_SLOW, t);
          verts[j].x = K.lerp(verts[j].x, tgt[j].x, ease);
          verts[j].y = K.lerp(verts[j].y, tgt[j].y, ease);
          dirty = true;
        } else if (verts[j].x !== tgt[j].x || verts[j].y !== tgt[j].y) {
          verts[j].x = tgt[j].x;
          verts[j].y = tgt[j].y;
        }
      }
    }

    if (storage.get("textPlaced") && mouse.isPressed && mouse.isHover) {
      // On initial press, reset tine origin and stroke distance
      if (!storage.get("wasPressed")) {
        storage.set("wasPressed", true);
        storage.set("strokeDist", 0);
        storage.set("lastTineX", mouse.x);
        storage.set("lastTineY", mouse.y);
      }

      const lx = storage.get("lastTineX");
      const ly = storage.get("lastTineY");
      const dx = mouse.x - lx;
      const dy = mouse.y - ly;
      const dragDist = K.distance(mouse.x, mouse.y, lx, ly);

      if (dragDist > 3) {
        // Full power for 75% of max distance, then fade to zero
        const sd = storage.get("strokeDist");
        const fadeStart = STROKE_DECAY * 0.75;
        const decay = sd < fadeStart ? 1 : Math.max(0, 1 - (sd - fadeStart) / (STROKE_DECAY - fadeStart));
        const strength = STRENGTH * decay;

        applyTineLine(
          drops,
          lx,
          ly,
          dx,
          dy,
          dragDist * strength,
          TINE_U,
          TINE_SCALE,
        );
        storage.set("strokeDist", sd + dragDist);
        storage.set("lastTineX", mouse.x);
        storage.set("lastTineY", mouse.y);
        // Sync targets after tine (subdivision may change vertex count)
        for (let i = 0; i < drops.length; i++) {
          targets[i] = drops[i].vertices.map((v) => ({
            x: v.x,
            y: v.y,
          }));
        }
        dirty = true;
      }
    }

    if (!dirty) {
      storage.set("settledFrames", storage.get("settledFrames") + 1);
      return;
    }

    storage.set("settledFrames", 0);

    K.background(storage.get("bg"));
    K.noStroke();

    for (const drop of drops) {
      K.fillColor(drop.color);
      K.beginShape();
      for (const v of drop.vertices) {
        K.vertex(v.x, v.y);
      }
      K.endShape(true);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", cursor: "crosshair" }}>
      <Klint
        context={context}
        draw={draw}
        options={{
          origin: "center",
          fps: 60,
          dpr: Math.min(2, 4096 / Math.max(window.innerWidth, window.innerHeight)),
        }}
      />
    </div>
  );
}
