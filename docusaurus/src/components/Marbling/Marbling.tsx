import { useEffect, useRef } from "react";
import { Klint, useKlint, useStorage, type KlintContext } from "@shopify/klint";
import FontParser from "@shopify/klint/plugins/FontParser";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { displaceForDrop, applyTineLine } from "./engine";
import { buildScene, createDropFromSpec } from "./scene";
import {
  STRENGTH,
  TINE_U,
  TINE_SCALE,
  STROKE_DECAY,
  DROP_COUNT,
  FRAMES_PER_DROP,
  LERP_EASE_FAST,
  LERP_EASE_SLOW,
  LERP_SNAP,
  type Drop,
  type DropSpec,
  type TextResult,
} from "./config";

export default function Marbling() {
  const { context, KlintMouse, KlintGesture } = useKlint();
  const { mouse } = KlintMouse();
  const gesture = KlintGesture();
  const fontUrl = useBaseUrl("/fonts/Jost-Regular.ttf");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const touchActiveRef = useRef(false);
  const touchPosRef = useRef({ x: 0, y: 0 });

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

  gesture.onTouchStart((K, e, g) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const canvas = K.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * 2 - canvas.width / 2;
    const y = (touch.clientY - rect.top) * 2 - canvas.height / 2;
    touchActiveRef.current = true;
    touchPosRef.current = { x, y };
    storage.set("wasPressed", true);
    storage.set("strokeDist", 0);
    storage.set("lastTineX", x);
    storage.set("lastTineY", y);
  });

  gesture.onTouchMove((K, e, g) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    const canvas = K.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * 2 - canvas.width / 2;
    const y = (touch.clientY - rect.top) * 2 - canvas.height / 2;
    touchPosRef.current = { x, y };
  });

  gesture.onTouchEnd((K, e, g) => {
    touchActiveRef.current = false;
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
    if (!mouse.isPressed && !touchActiveRef.current) {
      storage.set("wasPressed", false);
      storage.set("lastTineX", mouse.x);
      storage.set("lastTineY", mouse.y);
    }

    const settled = storage.get("settledFrames");
    if (settled > 3 && !mouse.isPressed && !touchActiveRef.current && storage.get("textPlaced")) {
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

      const { specs, textResult, bg } = buildScene(
        K,
        storage.get("fontData"),
        storage.get("seed"),
      );

      storage.set("specs", specs);
      storage.set("textResult", textResult);
      storage.set("bg", bg);
      if (wrapperRef.current) wrapperRef.current.style.backgroundColor = bg;
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

        const saved = drops.map((drop) =>
          drop.vertices.map((v) => ({ x: v.x, y: v.y })),
        );

        displaceForDrop(drops, spec.cx, spec.cy, spec.r);

        for (let i = 0; i < drops.length; i++) {
          targets[i] = drops[i].vertices.map((v) => ({ x: v.x, y: v.y }));
        }

        // Restore pre-displacement positions so vertices lerp toward targets
        for (let i = 0; i < drops.length; i++) {
          const verts = drops[i].vertices;
          for (let j = 0; j < verts.length; j++) {
            verts[j].x = saved[i][j].x;
            verts[j].y = saved[i][j].y;
          }
        }

        const newDrop = createDropFromSpec(spec);
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
    const maxDist = K.distance(0, 0, K.width, K.height) * 0.5;
    for (let i = 0; i < drops.length; i++) {
      const verts = drops[i].vertices;
      const tgt = targets[i];
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

    const isTineActive =
      (mouse.isPressed && mouse.isHover) || touchActiveRef.current;
    const tineX = touchActiveRef.current ? touchPosRef.current.x : mouse.x;
    const tineY = touchActiveRef.current ? touchPosRef.current.y : mouse.y;

    if (storage.get("textPlaced") && isTineActive) {
      if (!storage.get("wasPressed")) {
        storage.set("wasPressed", true);
        storage.set("strokeDist", 0);
        storage.set("lastTineX", tineX);
        storage.set("lastTineY", tineY);
      }

      const lx = storage.get("lastTineX");
      const ly = storage.get("lastTineY");
      const dx = tineX - lx;
      const dy = tineY - ly;
      const dragDist = K.distance(tineX, tineY, lx, ly);

      if (dragDist > 3) {
        // Scale tine and stroke decay relative to canvas size so they
        // feel the same proportion on mobile and desktop.
        const refWidth = 1920 * 2; // reference desktop canvas width at 2× DPR
        const sizeRatio = K.width / refWidth;
        const strokeDecay = STROKE_DECAY * sizeRatio;
        const tineScale = TINE_SCALE * sizeRatio;

        // Full power for 75% of max distance, then fade to zero
        const sd = storage.get("strokeDist");
        const fadeStart = strokeDecay * 0.75;
        const decay =
          sd < fadeStart
            ? 1
            : Math.max(0, 1 - (sd - fadeStart) / (strokeDecay - fadeStart));
        const strength = STRENGTH * decay;

        applyTineLine(
          drops,
          lx,
          ly,
          dx,
          dy,
          dragDist * strength,
          TINE_U,
          tineScale,
        );
        storage.set("strokeDist", sd + dragDist);
        storage.set("lastTineX", tineX);
        storage.set("lastTineY", tineY);

        // Sync targets after tine (subdivision may change vertex count)
        for (let i = 0; i < drops.length; i++) {
          targets[i] = drops[i].vertices.map((v) => ({ x: v.x, y: v.y }));
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
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: storage.get("bg"),
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: 1920,
          margin: "0 auto",
          cursor: "crosshair",
        }}
      >
        <Klint
          context={context}
          draw={draw}
          options={{
            origin: "center",
            fps: 30,
            dpr: 2,
          }}
        />
      </div>
    </div>
  );
}
