import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";
import { Bezier } from "@shopify/klint/plugins";

export default function BezierDemo() {
  const { context, useDev, KlintMouse } = useKlint();
  useDev();
  const { mouse } = KlintMouse();

  const draw = (K: KlintContext) => {
    K.background("#111");
    const w = K.width;
    const h = K.height;
    const cx = w / 2;
    const cy = h / 2;
    const pad = w * 0.05;

    const curve = Bezier.cubic(
      { x: pad, y: cy + h * 0.1 },
      { x: cx * 0.6, y: cy - h * 0.35 },
      { x: cx * 1.4, y: cy + h * 0.35 },
      { x: w - pad, y: cy - h * 0.1 },
    );

    // Skeleton
    K.strokeColor("rgba(255,255,255,0.15)");
    K.strokeWidth(1);
    curve.drawSkeleton(K, 4);

    // Main curve
    K.strokeColor("#4ecdc4");
    K.strokeWidth(3);
    curve.draw(K);

    // LUT dots
    K.fillColor("rgba(78, 205, 196, 0.3)");
    const lut = curve.getLUT(40);
    for (const p of lut) {
      K.circle(p.x, p.y, 2);
    }

    // Normals
    K.strokeColor("rgba(255, 107, 107, 0.5)");
    K.strokeWidth(1);
    curve.drawNormals(K, 16, 25);

    // BBox
    const bb = curve.bbox();
    K.strokeColor("rgba(255, 255, 255, 0.2)");
    K.strokeWidth(1);
    K.noFill();
    K.rectangle(bb.x.min, bb.y.min, bb.x.size, bb.y.size);

    // Project mouse
    const proj = curve.project({ x: mouse.x, y: mouse.y });
    K.strokeColor("rgba(255,255,255,0.3)");
    K.strokeWidth(1);
    K.line(mouse.x, mouse.y, proj.x, proj.y);
    K.fillColor("#ff6b6b");
    K.noStroke();
    K.circle(proj.x, proj.y, 6);

    // Split at projected t
    const { left, right } = curve.split(proj.t);
    K.strokeWidth(4);
    K.strokeColor("#ffe66d");
    left.draw(K);
    K.strokeColor("#a8e6cf");
    right.draw(K);

    // Offset curves
    K.strokeWidth(1);
    K.strokeColor("rgba(78, 205, 196, 0.25)");
    const offPlus = curve.offset(30);
    const offMinus = curve.offset(-30);
    for (const seg of offPlus) seg.draw(K);
    for (const seg of offMinus) seg.draw(K);

    // Graduated outline
    K.fillColor("rgba(255, 107, 107, 0.08)");
    K.strokeColor("rgba(255,107,107,0.3)");
    K.strokeWidth(1);
    curve.drawOutlineFilled(K, 15, 15, 40, 5);

    // Reduced segments
    const reduced = curve.reduce();
    K.strokeColor("rgba(168, 230, 207, 0.15)");
    K.strokeWidth(1);
    for (const seg of reduced) seg.draw(K);

    // Curvature
    K.noStroke();
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const p = curve.get(t);
      const c = curve.curvature(t);
      const radius = Math.min(Math.abs(c.r) * 0.01, 20);
      K.fillColor(
        c.k > 0 ? "rgba(255,230,109,0.3)" : "rgba(168,230,207,0.3)",
      );
      K.circle(p.x, p.y, radius);
    }

    // Arc approximation
    K.strokeColor("rgba(255, 230, 109, 0.2)");
    K.strokeWidth(1);
    curve.drawArcs(K, 0.5);

    // Curve-line intersection
    K.strokeColor("rgba(255,255,255,0.15)");
    K.strokeWidth(1);
    K.line(pad, cy, w - pad, cy);

    const hits = curve.intersects({ p1: { x: pad, y: cy }, p2: { x: w - pad, y: cy } });
    K.fillColor("#ffe66d");
    K.noStroke();
    for (const h of hits) {
      const t = parseFloat(h);
      const p = curve.get(t);
      K.circle(p.x, p.y, 5);
    }

    // Second curve for curve-curve intersection
    const curve2 = Bezier.cubic(
      { x: cx - w * 0.12, y: pad },
      { x: cx + w * 0.25, y: cy },
      { x: cx - w * 0.25, y: cy },
      { x: cx + w * 0.12, y: h - pad },
    );
    K.strokeColor("rgba(168, 130, 255, 0.5)");
    K.strokeWidth(2);
    curve2.draw(K);

    const ccHits = curve.intersects(curve2);
    K.fillColor("#a882ff");
    K.noStroke();
    for (const h of ccHits) {
      const t1 = parseFloat(h.split("/")[0]);
      const p = curve.get(t1);
      K.circle(p.x, p.y, 7);
    }

    // Info text
    K.fillColor("rgba(255,255,255,0.5)");
    K.textFont("monospace");
    K.textSize(12);
    K.alignText("left", "top");
    K.text(`length: ${curve.length().toFixed(1)}px`, pad, pad);
    K.text(`project t: ${proj.t.toFixed(3)}  d: ${proj.d.toFixed(1)}px`, pad, pad + 16);
    K.text(`segments (reduce): ${reduced.length}`, pad, pad + 32);
    K.text(`line intersections: ${hits.length}`, pad, pad + 48);
    K.text(`curve intersections: ${ccHits.length}`, pad, pad + 64);

    // Outlineshapes
    const shapes = curve.outlineshapes(12);
    K.strokeColor("rgba(255, 230, 109, 0.1)");
    K.strokeWidth(1);
    for (const shape of shapes) {
      shape.forward.draw(K);
      shape.back.draw(K);
    }
  };

  return (
    <Klint context={context} draw={draw} options={{ fps: 60 }} />
  );
}
