import { useCallback, useEffect, useRef } from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";
import FontParser from "@shopify/klint/plugins/FontParser";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { type Drop, createDrop, displaceForDrop, applyTineLine } from "./tine";

// Indices into K.Color.colors for lighter background-suitable colors
// peach(8), rose(9), drab(12), mustard(2), sky(5), sage(11)
const BG_INDICES = [8, 9, 12, 2, 5, 11];

const TEXT_COLOR = "#ffffff";
const STRENGTH = 1.5;
const TINE_U = 0.4;
const TINE_SCALE = 150;
const CIRCLE_COUNT = 5;
const FRAMES_PER_DROP = 20;
const LERP_EASE_FAST = 0.22; // near center
const LERP_EASE_SLOW = 0.04; // at edges
const LERP_SNAP = 0.25; // snap to target when within this distance²

interface DropSpec {
  cx: number;
  cy: number;
  r: number;
  color: string;
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

function pickPalette(rand: () => number, allColors: string[], bg: string): string[] {
  const available = allColors.filter((c) => c !== bg);
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, 7);
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

  const fontDataRef = useRef<any>(null);
  const specsRef = useRef<DropSpec[] | null>(null);
  const textResultRef = useRef<TextResult | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const targetsRef = useRef<{ x: number; y: number }[][]>([]);
  const placedRef = useRef(0);
  const textPlacedRef = useRef(false);
  const frameRef = useRef(0);
  const initSizeRef = useRef<{ w: number; h: number } | null>(null);
  const bgRef = useRef("#ECA088");
  const seedRef = useRef(Date.now());

  useEffect(() => {
    const parser = new FontParser();
    parser.load(fontUrl).then((data: any) => {
      fontDataRef.current = data;
    });
  }, [fontUrl]);

  const draw = useCallback(
    (K: KlintContext) => {
      const sizeChanged =
        !initSizeRef.current ||
        initSizeRef.current.w !== K.width ||
        initSizeRef.current.h !== K.height;

      let dirty = false;

      if ((!specsRef.current || sizeChanged) && fontDataRef.current) {
        dirty = true;
        initSizeRef.current = { w: K.width, h: K.height };
        const rand = mulberry32(seedRef.current);
        const hw = K.width * 0.5;
        const hh = K.height * 0.5;

        const allColors = [...K.Color.colors];
        const bgOptions = BG_INDICES.map((i) => allColors[i]);
        bgRef.current = bgOptions[Math.floor(rand() * bgOptions.length)];
        const palette = pickPalette(rand, allColors, bgRef.current);

        const baseR = Math.max(hw, hh) * 1.05;
        const jitter = () => (rand() - 0.5) * 400; // ±200px
        const circleSpecs: DropSpec[] = [
          { cx: jitter(), cy: jitter(), r: baseR, color: palette[0] },
          { cx: jitter(), cy: jitter(), r: baseR * 0.75, color: palette[1] },
          { cx: jitter(), cy: jitter(), r: baseR * 0.55, color: palette[2] },
          { cx: jitter(), cy: jitter(), r: baseR * 0.38, color: palette[3] },
          { cx: jitter(), cy: jitter(), r: baseR * 0.22, color: palette[4] },
        ];

        const fontSize = Math.min(hw, hh) * 0.55;
        textResultRef.current = textToDrops(
          fontDataRef.current,
          "Klint",
          fontSize,
          TEXT_COLOR,
        );

        specsRef.current = circleSpecs;
        dropsRef.current = [];
        targetsRef.current = [];
        placedRef.current = 0;
        textPlacedRef.current = false;
        frameRef.current = 0;
      }

      if (specsRef.current && placedRef.current < CIRCLE_COUNT) {
        if (frameRef.current % FRAMES_PER_DROP === 0) {
          const spec = specsRef.current[placedRef.current];

          // Save current vertex positions (may be mid-lerp)
          const saved = dropsRef.current.map((drop) =>
            drop.vertices.map((v) => ({ x: v.x, y: v.y })),
          );

          // Displace existing drops (mutates vertices to displaced positions)
          displaceForDrop(dropsRef.current, spec.cx, spec.cy, spec.r);

          // Capture displaced positions as new lerp targets
          for (let i = 0; i < dropsRef.current.length; i++) {
            targetsRef.current[i] = dropsRef.current[i].vertices.map((v) => ({
              x: v.x,
              y: v.y,
            }));
          }

          // Restore old positions — vertices will lerp toward targets
          for (let i = 0; i < dropsRef.current.length; i++) {
            const verts = dropsRef.current[i].vertices;
            for (let j = 0; j < verts.length; j++) {
              verts[j].x = saved[i][j].x;
              verts[j].y = saved[i][j].y;
            }
          }

          // New drop appears instantly — targets match vertices
          const newDrop = createDrop(spec.cx, spec.cy, spec.r, spec.color);
          dropsRef.current.push(newDrop);
          targetsRef.current.push(
            newDrop.vertices.map((v) => ({ x: v.x, y: v.y })),
          );

          placedRef.current++;
          dirty = true;
        }
        frameRef.current++;
      }

      if (
        specsRef.current &&
        placedRef.current >= CIRCLE_COUNT &&
        !textPlacedRef.current &&
        textResultRef.current
      ) {
        if (frameRef.current % FRAMES_PER_DROP === 0) {
          const { drops: textDrops } = textResultRef.current;

          for (const drop of textDrops) {
            dropsRef.current.push(drop);
            targetsRef.current.push(
              drop.vertices.map((v) => ({ x: v.x, y: v.y })),
            );
          }

          textPlacedRef.current = true;
          dirty = true;
        }
        frameRef.current++;
      }

      // Tick position lerps — center vertices animate faster, edges slower
      const allDrops = dropsRef.current;
      const allTargets = targetsRef.current;
      const maxDist = Math.sqrt(K.width * K.width + K.height * K.height) * 0.5;
      for (let i = 0; i < allDrops.length; i++) {
        const verts = allDrops[i].vertices;
        const tgt = allTargets[i];
        if (!tgt) continue;
        for (let j = 0; j < verts.length; j++) {
          const dx = tgt[j].x - verts[j].x;
          const dy = tgt[j].y - verts[j].y;
          if (dx * dx + dy * dy > LERP_SNAP) {
            const dist = Math.sqrt(verts[j].x * verts[j].x + verts[j].y * verts[j].y);
            const t = Math.min(1, dist / maxDist);
            const ease = LERP_EASE_FAST + (LERP_EASE_SLOW - LERP_EASE_FAST) * t;
            verts[j].x += dx * ease;
            verts[j].y += dy * ease;
            dirty = true;
          } else if (dx !== 0 || dy !== 0) {
            verts[j].x = tgt[j].x;
            verts[j].y = tgt[j].y;
          }
        }
      }

      if (textPlacedRef.current && mouse.isPressed) {
        const dx = mouse.x - mouse.px;
        const dy = mouse.y - mouse.py;
        const dragDist = Math.sqrt(dx * dx + dy * dy);

        if (dragDist > 1) {
          applyTineLine(
            dropsRef.current,
            mouse.px,
            mouse.py,
            dx,
            dy,
            dragDist * STRENGTH,
            TINE_U,
            TINE_SCALE,
          );
          // Sync targets after tine (subdivision may change vertex count)
          for (let i = 0; i < dropsRef.current.length; i++) {
            targetsRef.current[i] = dropsRef.current[i].vertices.map((v) => ({
              x: v.x,
              y: v.y,
            }));
          }
          dirty = true;
        }
      }

      if (!dirty) return;

      K.background(bgRef.current);
      K.noStroke();

      for (const drop of dropsRef.current) {
        K.fillColor(drop.color);
        K.beginShape();
        for (const v of drop.vertices) {
          K.vertex(v.x, v.y);
        }
        K.endShape(true);
      }
    },
    [mouse],
  );

  return (
    <div style={{ width: "100vw", height: "100vh", cursor: "crosshair" }}>
      <Klint context={context} draw={draw} options={{ origin: "center" }} />
    </div>
  );
}
