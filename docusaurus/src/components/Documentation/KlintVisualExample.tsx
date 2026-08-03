import React, { useEffect, useState } from "react";
import { Klint, type KlintContext } from "@shopify/klint";
import styles from "./KlintVisualExample.module.css";

type SceneName =
  | "circles"
  | "lines"
  | "rectangles"
  | "polygons"
  | "gradient"
  | "transforms";

interface Scene {
  title: string;
  description: string;
  draw: (K: KlintContext) => void;
}

const TAU = Math.PI * 2;

const circles: Scene = {
  title: "Orbiting circles",
  description: "Branded circles orbit and breathe around a responsive center point.",
  draw(K) {
    K.background(K.Color.midnight);
    K.push();
    K.noStroke();

    const colors = [
      K.Color.coral,
      K.Color.mustard,
      K.Color.sky,
      K.Color.peach,
      K.Color.olive,
      K.Color.plum,
    ];
    const centerX = K.width / 2;
    const centerY = K.height / 2;
    const orbit = Math.min(K.width, K.height) * 0.3;

    for (let index = 0; index < 12; index++) {
      const angle = K.time * 0.45 + (index / 12) * TAU;
      const wave = Math.sin(K.time * 1.7 + index * 0.8);
      const distance = orbit * (0.72 + (index % 3) * 0.13);
      const radius = Math.max(6, orbit * 0.085 + wave * orbit * 0.025);

      K.fillColor(colors[index % colors.length]);
      K.circle(
        centerX + Math.cos(angle) * distance,
        centerY + Math.sin(angle) * distance,
        radius,
      );
    }

    K.fillColor(K.Color.golden);
    K.circle(centerX, centerY, Math.max(10, orbit * 0.12));
    K.pop();
  },
};

const lines: Scene = {
  title: "A field of lines",
  description: "Layered line segments turn a simple primitive into a moving woven field.",
  draw(K) {
    K.background(K.Color.charcoal);
    K.push();
    K.noFill();
    K.strokeCap("round");

    const colors = [K.Color.coral, K.Color.mustard, K.Color.sky, K.Color.olive];
    const rows = 9;
    const segments = 32;
    const padding = Math.min(K.width, K.height) * 0.1;
    const usableWidth = K.width - padding * 2;
    const usableHeight = K.height - padding * 2;

    for (let row = 0; row < rows; row++) {
      K.strokeColor(colors[row % colors.length]);
      K.strokeWidth(1 + (row % 3));

      let previousX = padding;
      let previousY = padding + (row / (rows - 1)) * usableHeight;
      for (let segment = 1; segment <= segments; segment++) {
        const progress = segment / segments;
        const x = padding + progress * usableWidth;
        const y =
          padding +
          (row / (rows - 1)) * usableHeight +
          Math.sin(progress * TAU * 2 + K.time * 1.2 + row * 0.55) *
            usableHeight *
            0.055;
        K.line(previousX, previousY, x, y);
        previousX = x;
        previousY = y;
      }
    }

    K.pop();
  },
};

const rectangles: Scene = {
  title: "Rotating rectangles",
  description: "Responsive rectangles share one center while color, scale, and rotation vary.",
  draw(K) {
    K.background(K.Color.slate);
    K.push();
    K.noStroke();
    K.translate(K.width / 2, K.height / 2);

    const colors = [
      K.Color.peach,
      K.Color.coral,
      K.Color.mustard,
      K.Color.olive,
      K.Color.sky,
      K.Color.plum,
    ];
    const base = Math.min(K.width, K.height) * 0.12;

    for (let index = colors.length - 1; index >= 0; index--) {
      const scale = 1 + index * 0.38;
      const width = base * scale;
      const height = base * (0.55 + index * 0.15);

      K.push();
      K.rotate(K.time * (0.08 + index * 0.015) + index * 0.32);
      K.fillColor(colors[index]);
      K.rectangle(-width / 2, -height / 2, width, height);
      K.pop();
    }

    K.pop();
  },
};

const polygons: Scene = {
  title: "Polygon bloom",
  description: "Regular and alternating-radius polygons build a gently rotating bloom.",
  draw(K) {
    K.background(K.Color.navy);
    K.push();
    K.translate(K.width / 2, K.height / 2);
    K.noStroke();

    const radius = Math.min(K.width, K.height) * 0.3;
    const layers = [
      { color: K.Color.plum, sides: 9, outer: 1, inner: 0.72, speed: 0.08 },
      { color: K.Color.coral, sides: 7, outer: 0.78, inner: 0.5, speed: -0.13 },
      { color: K.Color.mustard, sides: 5, outer: 0.5, inner: 0.27, speed: 0.2 },
      { color: K.Color.peach, sides: 3, outer: 0.22, inner: 0.22, speed: -0.28 },
    ];

    for (const layer of layers) {
      K.fillColor(layer.color);
      K.polygon(
        0,
        0,
        radius * layer.outer,
        layer.sides,
        radius * layer.inner,
        K.time * layer.speed,
      );
    }

    K.pop();
  },
};

const gradient: Scene = {
  title: "Branded gradient light",
  description: "A linear gradient blends Klint coral, mustard, sky, and plum.",
  draw(K) {
    const wash = K.gradient(0, 0, K.width, K.height);
    K.addColorStop(wash, 0, K.Color.coral);
    K.addColorStop(wash, 0.34, K.Color.mustard);
    K.addColorStop(wash, 0.68, K.Color.sky);
    K.addColorStop(wash, 1, K.Color.plum);
    K.fillColor(wash);
    K.noStroke();
    K.rectangle(0, 0, K.width, K.height);

    K.push();
    K.globalAlpha = 0.72;
    K.fillColor(K.Color.peach);
    const radius = Math.min(K.width, K.height) * 0.24;
    K.circle(
      K.width * 0.5 + Math.cos(K.time * 0.45) * K.width * 0.13,
      K.height * 0.5 + Math.sin(K.time * 0.6) * K.height * 0.12,
      radius,
    );
    K.pop();
  },
};

const transforms: Scene = {
  title: "Nested transforms",
  description: "Push, translate, rotate, and pop compose a kinetic radial system.",
  draw(K) {
    K.background(K.Color.taupe);
    K.push();
    K.translate(K.width / 2, K.height / 2);
    K.noStroke();

    const colors = [K.Color.coral, K.Color.mustard, K.Color.sky, K.Color.olive];
    const orbit = Math.min(K.width, K.height) * 0.27;
    const size = Math.max(8, orbit * 0.16);

    for (let index = 0; index < 12; index++) {
      K.push();
      K.rotate(K.time * 0.35 + (index / 12) * TAU);
      K.translate(orbit, 0);
      K.rotate(-K.time * 0.8 + index * 0.22);
      K.fillColor(colors[index % colors.length]);
      K.rectangle(-size / 2, -size / 2, size, size);
      K.pop();
    }

    K.fillColor(K.Color.peach);
    K.polygon(0, 0, orbit * 0.22, 6, orbit * 0.22, -K.time * 0.3);
    K.pop();
  },
};

const scenes: Record<SceneName, Scene> = {
  circles,
  lines,
  rectangles,
  polygons,
  gradient,
  transforms,
};

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
};

export interface KlintVisualExampleProps {
  scene: SceneName;
}

export default function KlintVisualExample({ scene: sceneName }: KlintVisualExampleProps) {
  const scene = scenes[sceneName];
  const reducedMotion = useReducedMotion();

  return (
    <figure className={styles.example}>
      <div className={styles.canvas}>
        <Klint
          key={reducedMotion ? "reduced" : "animated"}
          draw={scene.draw}
          options={{
            fps: 30,
            maxDpr: 2,
            static: reducedMotion,
          }}
          canvasProps={{
            "aria-label": `${scene.title}. ${scene.description}`,
          }}
        />
      </div>
      <figcaption className={styles.caption}>
        <strong>{scene.title}</strong>
        <span>{scene.description}</span>
      </figcaption>
    </figure>
  );
}
