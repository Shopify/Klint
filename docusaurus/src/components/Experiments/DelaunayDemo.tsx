import React from "react";
import { Klint, useKlint, useStorage, type KlintContext } from "@shopify/klint";
import { Delaunay, type Triangle } from "@shopify/klint/plugins";

type Point = { x: number; y: number };

interface Store {
  pointCloud: Point[];
  delaunayTris: Triangle[];
  voronoiEdges: { x1: number; y1: number; x2: number; y2: number }[];
  outerRing: Point[];
  holes: Point[][];
  earcutTris: Triangle[];
  letterOuter: Point[];
  letterHoles: Point[][];
  letterTris: Triangle[];
}

function makeRegularPolygon(cx: number, cy: number, r: number, n: number, startAngle = -Math.PI / 2): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const a = startAngle + (i / n) * Math.PI * 2;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

function makeRoundedRect(cx: number, cy: number, w: number, h: number, r: number, n = 8): Point[] {
  const pts: Point[] = [];
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const corners = [
    { cx: cx + hw, cy: cy - hh, sa: -Math.PI / 2, ea: 0 },
    { cx: cx + hw, cy: cy + hh, sa: 0, ea: Math.PI / 2 },
    { cx: cx - hw, cy: cy + hh, sa: Math.PI / 2, ea: Math.PI },
    { cx: cx - hw, cy: cy - hh, sa: Math.PI, ea: Math.PI * 1.5 },
  ];
  for (const c of corners) {
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const a = c.sa + t * (c.ea - c.sa);
      pts.push({ x: c.cx + Math.cos(a) * r, y: c.cy + Math.sin(a) * r });
    }
  }
  return pts;
}

function makeStar(cx: number, cy: number, outerR: number, innerR: number, points: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

export default function DelaunayDemo() {
  const { context, useDev, KlintMouse } = useKlint();
  useDev();
  const { mouse } = KlintMouse();
  const storage = useStorage<Store>({
    pointCloud: [],
    delaunayTris: [],
    voronoiEdges: [],
    outerRing: [],
    holes: [],
    earcutTris: [],
    letterOuter: [],
    letterHoles: [],
    letterTris: [],
  });

  const setup = (K: KlintContext) => {
    const w = K.width;
    const h = K.height;
    const colW = w / 3;

    // ── Column 1: Delaunay point cloud ──
    const rng = (seed: number) => {
      let s = seed;
      return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    };
    const rand = rng(777);
    const pts: Point[] = [];
    const margin = 40;
    for (let i = 0; i < 60; i++) {
      pts.push({
        x: margin + rand() * (colW - margin * 2),
        y: margin + rand() * (h - margin * 2),
      });
    }
    storage.set("pointCloud", pts);
    const tris = Delaunay.triangulate(pts);
    storage.set("delaunayTris", tris);
    storage.set("voronoiEdges", Delaunay.voronoi(tris));

    // ── Column 2: Polygon with holes (rounded rect + star hole + circle hole) ──
    const c2x = colW + colW / 2;
    const c2y = h / 2;
    const outer = makeRoundedRect(c2x, c2y, colW * 0.8, h * 0.7, 30, 6);
    const hole1 = makeStar(c2x - colW * 0.12, c2y - h * 0.1, 60, 28, 5);
    const hole2 = makeRegularPolygon(c2x + colW * 0.12, c2y + h * 0.08, 45, 24);
    storage.set("outerRing", outer);
    storage.set("holes", [hole1, hole2]);
    storage.set("earcutTris", Delaunay.triangulatePolygon(outer, [hole1, hole2]));

    // ── Column 3: Letter-like shape with hole ──
    const c3x = colW * 2 + colW / 2;
    const c3y = h / 2;
    const sz = Math.min(colW * 0.75, h * 0.65) / 2;
    const letterOuter = makeRoundedRect(c3x, c3y, sz * 2, sz * 2.4, sz * 0.25, 8);
    const innerHoles: Point[][] = [];
    const rows = 3;
    const cols = 2;
    const cellW = (sz * 1.4) / cols;
    const cellH = (sz * 1.8) / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hx = c3x - (sz * 0.7) + cellW * c + cellW / 2;
        const hy = c3y - (sz * 0.9) + cellH * r + cellH / 2;
        const holeR = Math.min(cellW, cellH) * 0.32;
        innerHoles.push(makeRegularPolygon(hx, hy, holeR, 16));
      }
    }
    storage.set("letterOuter", letterOuter);
    storage.set("letterHoles", innerHoles);
    storage.set("letterTris", Delaunay.triangulatePolygon(letterOuter, innerHoles));
  };

  const draw = (K: KlintContext) => {
    K.background("#0e1117");
    const w = K.width;
    const h = K.height;
    const colW = w / 3;
    const t = K.time;

    // ── Dividers ──
    K.strokeColor("rgba(255,255,255,0.08)");
    K.strokeWidth(1);
    K.line(colW, 0, colW, h);
    K.line(colW * 2, 0, colW * 2, h);

    // ── Column headers ──
    K.fillColor("rgba(255,255,255,0.4)");
    K.noStroke();
    K.textFont("monospace");
    K.textSize(11 * K.dpr);
    K.alignText("center", "top");
    K.text("Delaunay + Voronoi", colW / 2, 14);
    K.text("Earcut: polygon with holes", colW + colW / 2, 14);
    K.text("Earcut: multiple holes", colW * 2 + colW / 2, 14);

    // ════════════════════════════════════════════════
    // Column 1: Delaunay triangulation + Voronoi
    // ════════════════════════════════════════════════

    const delaunayTris = storage.get("delaunayTris");
    const voronoiEdges = storage.get("voronoiEdges");
    const pointCloud = storage.get("pointCloud");

    // Triangles with animated fill
    for (let i = 0; i < delaunayTris.length; i++) {
      const tri = delaunayTris[i];
      const cx = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
      const cy = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;
      const distToMouse = Math.hypot(cx - mouse.x, cy - mouse.y);
      const glow = Math.max(0, 1 - distToMouse / 200);
      const alpha = 0.03 + glow * 0.15;
      const hue = (i * 7 + t * 20) % 360;

      K.fillColor(`hsla(${hue}, 60%, 60%, ${alpha})`);
      K.strokeColor(`hsla(${hue}, 50%, 50%, ${0.15 + glow * 0.4})`);
      K.strokeWidth(1);
      K.beginShape();
      K.vertex(tri.p1.x, tri.p1.y);
      K.vertex(tri.p2.x, tri.p2.y);
      K.vertex(tri.p3.x, tri.p3.y);
      K.endShape(true);
    }

    // Voronoi edges
    K.strokeColor("rgba(78, 205, 196, 0.3)");
    K.strokeWidth(1);
    for (const e of voronoiEdges) {
      K.line(e.x1, e.y1, e.x2, e.y2);
    }

    // Points
    K.noStroke();
    for (const p of pointCloud) {
      const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      const s = d < 100 ? 4 + (1 - d / 100) * 4 : 4;
      K.fillColor(d < 100 ? "#4ecdc4" : "rgba(255,255,255,0.6)");
      K.circle(p.x, p.y, s);
    }

    // ════════════════════════════════════════════════
    // Column 2: Earcut with holes
    // ════════════════════════════════════════════════

    const earcutTris = storage.get("earcutTris");
    const outerRing = storage.get("outerRing");
    const holes = storage.get("holes");
    const mx2 = mouse.x - colW;

    for (let i = 0; i < earcutTris.length; i++) {
      const tri = earcutTris[i];
      const cx = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
      const cy = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;
      const d = Math.hypot(cx - colW - mx2, cy - mouse.y);
      const glow = Math.max(0, 1 - d / 180);
      const hue = (210 + i * 3) % 360;

      K.fillColor(`hsla(${hue}, 55%, 55%, ${0.04 + glow * 0.2})`);
      K.strokeColor(`hsla(${hue}, 45%, 50%, ${0.12 + glow * 0.35})`);
      K.strokeWidth(1);
      K.beginShape();
      K.vertex(tri.p1.x, tri.p1.y);
      K.vertex(tri.p2.x, tri.p2.y);
      K.vertex(tri.p3.x, tri.p3.y);
      K.endShape(true);
    }

    // Draw outer contour
    K.strokeColor("rgba(255, 107, 107, 0.6)");
    K.strokeWidth(2);
    K.noFill();
    K.beginShape();
    for (const p of outerRing) K.vertex(p.x, p.y);
    K.endShape(true);

    // Draw holes
    K.strokeColor("rgba(255, 230, 109, 0.6)");
    K.strokeWidth(2);
    for (const hole of holes) {
      K.beginShape();
      for (const p of hole) K.vertex(p.x, p.y);
      K.endShape(true);
    }

    // ════════════════════════════════════════════════
    // Column 3: Multiple holes grid
    // ════════════════════════════════════════════════

    const letterTris = storage.get("letterTris");
    const letterOuter = storage.get("letterOuter");
    const letterHoles = storage.get("letterHoles");
    const mx3 = mouse.x - colW * 2;

    for (let i = 0; i < letterTris.length; i++) {
      const tri = letterTris[i];
      const cx = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
      const cy = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;
      const d = Math.hypot(cx - colW * 2 - mx3, cy - mouse.y);
      const glow = Math.max(0, 1 - d / 150);
      const hue = (120 + i * 5 + t * 15) % 360;

      K.fillColor(`hsla(${hue}, 50%, 55%, ${0.05 + glow * 0.25})`);
      K.strokeColor(`hsla(${hue}, 40%, 50%, ${0.1 + glow * 0.4})`);
      K.strokeWidth(1);
      K.beginShape();
      K.vertex(tri.p1.x, tri.p1.y);
      K.vertex(tri.p2.x, tri.p2.y);
      K.vertex(tri.p3.x, tri.p3.y);
      K.endShape(true);
    }

    K.strokeColor("rgba(168, 230, 207, 0.6)");
    K.strokeWidth(2);
    K.noFill();
    K.beginShape();
    for (const p of letterOuter) K.vertex(p.x, p.y);
    K.endShape(true);

    K.strokeColor("rgba(168, 130, 255, 0.5)");
    K.strokeWidth(1.5);
    for (const hole of letterHoles) {
      K.beginShape();
      for (const p of hole) K.vertex(p.x, p.y);
      K.endShape(true);
    }

    // ── Stats ──
    K.fillColor("rgba(255,255,255,0.3)");
    K.textSize(10 * K.dpr);
    K.alignText("center", "bottom");
    K.text(`${pointCloud.length} pts → ${delaunayTris.length} tris, ${voronoiEdges.length} voronoi edges`, colW / 2, h - 14);
    K.text(`outer: ${outerRing.length} pts, 2 holes → ${earcutTris.length} tris`, colW + colW / 2, h - 14);
    K.text(`outer: ${letterOuter.length} pts, ${letterHoles.length} holes → ${letterTris.length} tris`, colW * 2 + colW / 2, h - 14);
  };

  return (
    <Klint context={context} draw={draw} setup={setup} options={{ fps: 60 }} />
  );
}
