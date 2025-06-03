import { useState } from "react";
import { Klint, useKlint, KlintContext } from "@shopify/klint";

export function KlintCanvas() {
  const { context, KlintImage, useDev } = useKlint();
  const { loadImages } = KlintImage();
  useDev();

  const preload = async () => {
    await loadImages({
      lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
    });
  };

  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(64);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
    K.setRectOrigin("center");
  };

  const draw = (K: KlintContext) => {
    K.background(`rgba(0, 0, 0, 1)`);

    K.fillColor("rgba(255, 100, 100, 0.8)");
    K.strokeColor("white");
    K.strokeWidth(2);

    // Test 1: Basic bezier curve shape
    K.push();
    K.translate(100, 100);
    K.beginShape();
    K.vertex(0, 0);
    K.bezierVertex(50, -50, 100, 50, 150, 0);
    K.vertex(150, 100);
    K.bezierVertex(100, 150, 50, 150, 0, 100);
    K.endShape(true);
    K.pop();

    // Test 2: Quadratic curve flower
    K.push();
    K.translate(400, 100);
    K.fillColor("rgba(100, 255, 100, 0.8)");
    K.beginShape();
    const petals = 6;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const nextAngle = ((i + 1) * Math.PI * 2) / petals;

      const x1 = Math.cos(angle) * 30;
      const y1 = Math.sin(angle) * 30;
      const x2 = Math.cos(nextAngle) * 30;
      const y2 = Math.sin(nextAngle) * 30;

      // Control point further out
      const cpx = Math.cos(angle + Math.PI / petals) * 60;
      const cpy = Math.sin(angle + Math.PI / petals) * 60;

      if (i === 0) K.vertex(x1, y1);
      K.quadraticVertex(cpx, cpy, x2, y2);
    }
    K.endShape(true);
    K.pop();

    // Test 3: Arc-based rounded rectangle
    K.push();
    K.translate(700, 100);
    K.fillColor("rgba(100, 100, 255, 0.8)");
    K.beginShape();
    const w = 120,
      h = 80,
      r = 20;
    K.vertex(r, 0);
    K.vertex(w - r, 0);
    K.arcVertex(w, 0, w, r, r);
    K.vertex(w, h - r);
    K.arcVertex(w, h, w - r, h, r);
    K.vertex(r, h);
    K.arcVertex(0, h, 0, h - r, r);
    K.vertex(0, r);
    K.arcVertex(0, 0, r, 0, r);
    K.endShape(true);
    K.pop();

    // Test 4: Mixed curve types in one shape
    K.push();
    K.translate(100, 300);
    K.fillColor("rgba(255, 255, 100, 0.8)");
    K.beginShape();
    K.vertex(0, 50);
    K.bezierVertex(0, 0, 50, 0, 50, 50); // bezier curve
    K.vertex(100, 50); // line
    K.quadraticVertex(150, 25, 200, 50); // quadratic curve
    K.vertex(200, 100); // line
    K.arcVertex(175, 125, 150, 100, 25); // arc
    K.vertex(50, 100); // line
    K.endShape(true);
    K.pop();

    // Test 5: Shape with contour (hole) using curves
    K.push();
    K.translate(400, 300);
    K.fillColor("rgba(255, 100, 255, 0.8)");
    K.beginShape();

    // Outer shape - heart-like using bezier curves
    K.vertex(0, 30);
    K.bezierVertex(-30, 0, -60, 0, -60, 30);
    K.bezierVertex(-60, 60, -30, 90, 0, 120);
    K.bezierVertex(30, 90, 60, 60, 60, 30);
    K.bezierVertex(60, 0, 30, 0, 0, 30);

    // Inner contour (hole) - circular using quadratic approximation
    K.beginContour();
    const holeRadius = 25;
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const angle = (i * Math.PI * 2) / steps;
      const nextAngle = ((i + 1) * Math.PI * 2) / steps;
      const midAngle = (angle + nextAngle) / 2;

      const x1 = Math.cos(angle) * holeRadius;
      const y1 = Math.sin(angle) * holeRadius + 50;
      const x2 = Math.cos(nextAngle) * holeRadius;
      const y2 = Math.sin(nextAngle) * holeRadius + 50;

      // Control point slightly outside for smooth curve
      const cpx = Math.cos(midAngle) * (holeRadius * 1.2);
      const cpy = Math.sin(midAngle) * (holeRadius * 1.2) + 50;

      if (i === 0) K.vertex(x1, y1);
      K.quadraticVertex(cpx, cpy, x2, y2);
    }
    K.endContour(false);
    K.endShape(true);
    K.pop();

    // Test 6: Complex shape with multiple contours
    K.push();
    K.translate(700, 300);
    K.fillColor("rgba(100, 255, 255, 0.8)");
    K.beginShape();

    // Outer rectangle with rounded corners using arcs
    const ow = 150,
      oh = 120,
      or = 15;
    K.vertex(or, 0);
    K.vertex(ow - or, 0);
    K.arcVertex(ow, 0, ow, or, or);
    K.vertex(ow, oh - or);
    K.arcVertex(ow, oh, ow - or, oh, or);
    K.vertex(or, oh);
    K.arcVertex(0, oh, 0, oh - or, or);
    K.vertex(0, or);
    K.arcVertex(0, 0, or, 0, or);

    // First hole - bezier blob
    K.beginContour();
    K.vertex(40, 40);
    K.bezierVertex(60, 30, 80, 50, 70, 70);
    K.bezierVertex(60, 80, 40, 70, 30, 60);
    K.bezierVertex(20, 50, 30, 30, 40, 40);
    K.endContour(false);

    // Second hole - star using mixed curves
    K.beginContour();
    const sx = 110,
      sy = 60,
      sr = 15;
    K.vertex(sx, sy - sr);
    K.quadraticVertex(sx + sr * 0.3, sy - sr * 0.3, sx + sr, sy);
    K.quadraticVertex(sx + sr * 0.3, sy + sr * 0.3, sx, sy + sr);
    K.quadraticVertex(sx - sr * 0.3, sy + sr * 0.3, sx - sr, sy);
    K.quadraticVertex(sx - sr * 0.3, sy - sr * 0.3, sx, sy - sr);
    K.endContour(false);

    K.endShape(true);
    K.pop();

    // Test 7: Animated curves
    K.push();
    K.translate(100, 500);
    K.fillColor("rgba(255, 255, 255, 0.9)");
    K.strokeColor("red");
    K.strokeWidth(3);

    const t = K.time * 0.5;
    K.beginShape();
    K.vertex(0, 50);
    K.bezierVertex(
      50 + Math.sin(t) * 20,
      0 + Math.cos(t * 1.3) * 15,
      100 + Math.sin(t * 0.7) * 25,
      100 + Math.cos(t * 0.9) * 20,
      150,
      50
    );
    K.vertex(150, 100);
    K.quadraticVertex(
      100 + Math.sin(t * 1.1) * 30,
      125 + Math.cos(t * 0.8) * 15,
      50,
      100
    );
    K.arcVertex(25, 75, 0, 50, 25 + Math.sin(t * 2) * 5);
    K.endShape(true);
    K.pop();

    // Debug info
    K.fillColor("white");
    K.textSize(16);
    K.alignText("left", "top");
    K.text("Curve Tests:", 20, 20);
    K.text("1. Bezier blob (top-left)", 20, 40);
    K.text("2. Quadratic flower (top-center)", 20, 60);
    K.text("3. Arc rounded rect (top-right)", 20, 80);
    K.text("4. Mixed curves (mid-left)", 20, 100);
    K.text("5. Curves with hole (mid-center)", 20, 120);
    K.text("6. Multiple holes (mid-right)", 20, 140);
    K.text("7. Animated curves (bottom-left)", 20, 160);
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "corner",
        // fps: 8,
      }}
    />
  );
}

export default function Index() {
  const [count, setCount] = useState(0);

  // const { colors } = useKlint();

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 bg-white rounded"
      >
        Count: {count}
      </button>
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#000] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
