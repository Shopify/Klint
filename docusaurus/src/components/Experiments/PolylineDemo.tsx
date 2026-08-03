import React from "react";
import { Klint, useKlint, useStorage, type KlintContext } from "@shopify/klint";
import { Bezier, Polyline } from "@shopify/klint/plugins";

export default function PolylineDemo() {
  const { context, useDev, KlintMouse, KlintKeyboard } = useKlint();
  useDev();
  const { mouse, onMouseDown } = KlintMouse();
  const { keyPressed } = KlintKeyboard();

  const storage = useStorage<{
    rawPoints: { x: number; y: number }[];
    mode: number;
  }>({
    rawPoints: [],
    mode: 0,
  });

  const setup = (K: KlintContext) => {
    const w = K.width;
    const h = K.height;
    const cx = w / 2;
    const cy = h / 2;

    // Pre-populate with a nice wavy path
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const t = i / 7;
      pts.push({
        x: 80 + t * (w - 160),
        y: cy + Math.sin(t * Math.PI * 2.5) * (h * 0.25) + (Math.random() - 0.5) * 60,
      });
    }
    storage.set("rawPoints", pts);
  };

  onMouseDown((K: KlintContext) => {
    const pts = storage.get("rawPoints");
    pts.push({ x: mouse.x, y: mouse.y });
    storage.set("rawPoints", pts);
  });

  keyPressed("c", () => {
    storage.set("rawPoints", []);
  });

  keyPressed("m", () => {
    storage.set("mode", (storage.get("mode") + 1) % 4);
  });

  const draw = (K: KlintContext) => {
    K.background("#0a0a1a");
    const pts = storage.get("rawPoints");
    const mode = storage.get("mode");
    const pad = 30;

    if (pts.length < 2) {
      K.fillColor("rgba(255,255,255,0.4)");
      K.textFont("monospace");
      K.textSize(14);
      K.alignText("center", "middle");
      K.text("Click to add points (C to clear, M to cycle modes)", K.width / 2, K.height / 2);
      return;
    }

    const modeNames = ["smooth", "simplify", "offset + outline", "intersections"];
    const linear = Polyline.fromPoints(pts);

    // ─── Draw raw points ──────────────────────────────────────────────
    K.fillColor("rgba(255,255,255,0.25)");
    for (const p of pts) {
      K.circle(p.x, p.y, 4);
    }

    // ─── Draw the linear polyline as reference ────────────────────────
    K.strokeColor("rgba(255,255,255,0.1)");
    K.strokeWidth(1);
    linear.draw(K);

    // ─── MODE 0: smooth ──────────────────────────────────────────────
    if (mode === 0) {
      // Smooth at three tension levels
      const tensions = [0.2, 0.4, 0.7];
      const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d"];
      for (let i = 0; i < tensions.length; i++) {
        const smooth = Polyline.smooth(pts, false, tensions[i]);
        K.strokeColor(colors[i]);
        K.strokeWidth(2);
        smooth.draw(K);

        // Draw normals on the middle one
        if (i === 1) {
          K.strokeColor("rgba(78, 205, 196, 0.3)");
          K.strokeWidth(1);
          smooth.drawNormals(K, 20, 20);
        }
      }

      // Project mouse onto the medium-smooth path
      const smooth = Polyline.smooth(pts, false, 0.4);
      const proj = smooth.project({ x: mouse.x, y: mouse.y });
      K.strokeColor("rgba(255,255,255,0.2)");
      K.strokeWidth(1);
      K.beginPath();
      K.moveTo(mouse.x, mouse.y);
      K.lineTo(proj.x, proj.y);
      K.stroke();
      K.fillColor("#4ecdc4");
      K.circle(proj.x, proj.y, 6);

      // Split visualization
      const { left, right } = smooth.split(proj.t);
      K.strokeWidth(4);
      K.strokeColor("#ffe66d");
      left.draw(K);
      K.strokeColor("#a8e6cf");
      right.draw(K);

      // LUT dots
      const lut = smooth.getLUT(60);
      K.fillColor("rgba(78, 205, 196, 0.2)");
      for (const p of lut) {
        K.circle(p.x, p.y, 2);
      }

      // BBox
      const bb = smooth.bbox();
      K.strokeColor("rgba(255,255,255,0.15)");
      K.strokeWidth(1);
      K.noFill();
      K.beginPath();
      K.rect(bb.x.min, bb.y.min, bb.x.size, bb.y.size);
      K.stroke();

      // Curvature dots
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const p = smooth.get(t);
        const c = smooth.curvature(t);
        const radius = Math.min(Math.abs(c.r) * 0.005, 12);
        K.fillColor(c.k > 0 ? "rgba(255,107,107,0.3)" : "rgba(78,205,196,0.3)");
        K.circle(p.x, p.y, radius);
      }

      // Info
      K.fillColor("rgba(255,255,255,0.5)");
      K.textFont("monospace");
      K.textSize(11);
      K.alignText("left", "top");
      K.text(`smooth path length: ${smooth.length().toFixed(1)}px`, pad, pad);
      K.text(`segments: ${smooth.segments.length}`, pad, pad + 14);
      K.text(`project t: ${proj.t.toFixed(3)}`, pad, pad + 28);
      K.text(`tensions: 0.2 (red), 0.4 (teal), 0.7 (yellow)`, pad, pad + 42);
    }

    // ─── MODE 1: simplify ────────────────────────────────────────────
    if (mode === 1) {
      // Create a dense point cloud from the smooth path, then simplify
      const smooth = Polyline.smooth(pts, false, 0.4);
      const dense = smooth.getLUT(300);

      // Draw the dense cloud
      K.fillColor("rgba(255,255,255,0.05)");
      for (const p of dense) {
        K.circle(p.x, p.y, 1.5);
      }

      // Simplify at different tolerances
      const tolerances = [1, 4, 15];
      const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d"];
      const results: Polyline[] = [];

      for (let i = 0; i < tolerances.length; i++) {
        const simplified = Polyline.simplify(dense, tolerances[i]);
        results.push(simplified);
        K.strokeColor(colors[i]);
        K.strokeWidth(2);
        simplified.draw(K);

        // Draw control point skeleton for the tightest fit
        if (i === 0) {
          K.strokeColor("rgba(255, 107, 107, 0.2)");
          K.strokeWidth(1);
          K.fillColor("rgba(255, 107, 107, 0.3)");
          simplified.drawSkeleton(K, 2);
        }
      }

      K.fillColor("rgba(255,255,255,0.5)");
      K.textFont("monospace");
      K.textSize(11);
      K.alignText("left", "top");
      K.text(`dense points: ${dense.length}`, pad, pad);
      for (let i = 0; i < tolerances.length; i++) {
        K.text(
          `tolerance ${tolerances[i]}: ${results[i].segments.length} segments`,
          pad,
          pad + 14 * (i + 1),
        );
      }
    }

    // ─── MODE 2: offset + outline ────────────────────────────────────
    if (mode === 2) {
      const smooth = Polyline.smooth(pts, false, 0.4);

      // Main curve
      K.strokeColor("#4ecdc4");
      K.strokeWidth(2);
      smooth.draw(K);

      // Offset both sides
      const distances = [15, 30, 50];
      for (const d of distances) {
        const alpha = 1 - d / 70;
        K.strokeColor(`rgba(78, 205, 196, ${alpha * 0.4})`);
        K.strokeWidth(1);
        const offPlus = smooth.offset(d);
        const offMinus = smooth.offset(-d);
        offPlus.draw(K);
        offMinus.draw(K);
      }

      // Graduated outline
      K.fillColor("rgba(255, 107, 107, 0.1)");
      K.strokeColor("rgba(255, 107, 107, 0.4)");
      K.strokeWidth(1);
      smooth.drawOutlineFilled(K, 8, 8, 35, 2);

      // Uniform outline stroke
      K.strokeColor("rgba(255, 230, 109, 0.3)");
      K.strokeWidth(1);
      smooth.drawOutline(K, 20);

      // Evenly spaced points on the path
      K.fillColor("rgba(255, 230, 109, 0.5)");
      smooth.drawPoints(K, 40, 3);

      K.fillColor("rgba(255,255,255,0.5)");
      K.textFont("monospace");
      K.textSize(11);
      K.alignText("left", "top");
      K.text(`path length: ${smooth.length().toFixed(1)}px`, pad, pad);
      K.text(`offsets: ±15, ±30, ±50`, pad, pad + 14);
      K.text(`graduated outline: 8→35 / 8→2`, pad, pad + 28);
    }

    // ─── MODE 3: intersections ───────────────────────────────────────
    if (mode === 3) {
      const smooth = Polyline.smooth(pts, false, 0.4);

      K.strokeColor("#4ecdc4");
      K.strokeWidth(2);
      smooth.draw(K);

      // Horizontal line intersection
      const lineY = K.height / 2;
      const line = {
        p1: { x: 0, y: lineY },
        p2: { x: K.width, y: lineY },
      };
      K.strokeColor("rgba(255,255,255,0.2)");
      K.strokeWidth(1);
      K.beginPath();
      K.moveTo(line.p1.x, line.p1.y);
      K.lineTo(line.p2.x, line.p2.y);
      K.stroke();

      const lineHits = smooth.intersects(line);
      K.fillColor("#ffe66d");
      for (const h of lineHits) {
        const p = smooth.get(parseFloat(h));
        K.circle(p.x, p.y, 6);
      }

      // Second polyline for polyline-polyline intersection
      const pts2: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        pts2.push({
          x: K.width * 0.2 + t * K.width * 0.6,
          y: K.height * 0.3 + Math.cos(t * Math.PI * 3 + K.time * 0.5) * K.height * 0.25,
        });
      }
      const smooth2 = Polyline.smooth(pts2, false, 0.5);
      K.strokeColor("rgba(168, 130, 255, 0.6)");
      K.strokeWidth(2);
      smooth2.draw(K);

      const polyHits = smooth.intersects(smooth2);
      K.fillColor("#a882ff");
      for (const h of polyHits) {
        const t = Math.min(1, Math.max(0, parseFloat(h.split("/")[0])));
        const p = smooth.get(t);
        K.circle(p.x, p.y, 7);
      }

      // Single Bezier intersection
      const testBez = Bezier.cubic(
        { x: K.width * 0.1, y: K.height * 0.8 },
        { x: K.width * 0.4, y: K.height * 0.1 },
        { x: K.width * 0.6, y: K.height * 0.9 },
        { x: K.width * 0.9, y: K.height * 0.2 },
      );
      K.strokeColor("rgba(255, 107, 107, 0.4)");
      K.strokeWidth(1.5);
      testBez.draw(K);

      const bezHits = smooth.intersects(testBez);
      K.fillColor("#ff6b6b");
      for (const h of bezHits) {
        const t = Math.min(1, Math.max(0, parseFloat(h.split("/")[0])));
        const p = smooth.get(t);
        K.circle(p.x, p.y, 6);
      }

      K.fillColor("rgba(255,255,255,0.5)");
      K.textFont("monospace");
      K.textSize(11);
      K.alignText("left", "top");
      K.text(`line intersections: ${lineHits.length} (yellow)`, pad, pad);
      K.text(`polyline-polyline: ${polyHits.length} (purple)`, pad, pad + 14);
      K.text(`polyline-bezier: ${bezHits.length} (red)`, pad, pad + 28);
    }

    // ─── Mode label ──────────────────────────────────────────────────
    K.fillColor("rgba(255,255,255,0.6)");
    K.textFont("monospace");
    K.textSize(13);
    K.alignText("right", "bottom");
    K.text(
      `[M] mode: ${modeNames[mode]}  |  [C] clear  |  click to add points`,
      K.width - pad,
      K.height - pad,
    );
  };

  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
      options={{ fps: 60, dpr: 2 }}
    />
  );
}
