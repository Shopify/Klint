import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";
import patterns from "./drawPatterns";

export default function Mandala2() {
  const { context, useDev } = useKlint();
  useDev();
  const patternsLength = 6;

  function getRandNumber(K: KlintContext, upper: number, lower: number) {
    return Math.floor(K.remap(Math.random(), 0, 1, upper, lower));
  }

  const setup = (K: KlintContext) => {
    K.noStroke();
    K.extend("hueValue", getRandNumber(K, 0, 350));
    K.extend("black", K.Color.oklch(0.1, 0.1, K.hueValue));
    K.extend("white", K.Color.oklch(1, 0.1, getRandNumber(K, 0, 350)));
    K.background(K.black);
    K.extend("petals", getRandNumber(K, 9, 23));
    K.extend("stage", 1);
    K.extend("rings", 1);
  };

  function fillCell(
    K: KlintContext,
    x: number,
    y: number,
    stage: number,
    size: number
  ) {
    const gridSize = size / 9;
    const grid = patterns[stage];
    if (!grid) return;

    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell > 0) {
          K.push();

          K.strokeColor(K.Color.coral);
          K.strokeWidth(gridSize * 0.5);
          K.strokeCap("round");
          K.beginPath();
          K.moveTo(x * size + j * gridSize, y * size + i * gridSize);
          K.lineTo(
            x * size + j * gridSize + gridSize,
            y * size + i * gridSize + gridSize
          );
          K.stroke();
          K.beginPath();
          K.moveTo(x * size + j * gridSize, y * size + i * gridSize + gridSize);
          K.lineTo(x * size + j * gridSize + gridSize, y * size + i * gridSize);
          K.stroke();
          K.pop();
        }
      });
    });
  }

  function makePetals(K: KlintContext, petals: number, stage: number) {
    for (let i = 0; i < petals; i++) {
      K.rotate(Math.PI / (petals / 2));
      fillCell(K, 1, 1, stage, 100 * K.rings);
    }
  }

  const draw = (K: KlintContext) => {
    K.opacity(0.3);
    K.background(K.black);
    K.opacity(1);
    makePetals(K, K.petals, K.stage);

    const newStage = K.stage + 1;
    if (newStage > patternsLength) {
      K.stage = 1;
      K.rotate(Math.PI / K.petals / 2);
      K.rings++;
    } else {
      K.stage = newStage;
    }
  };

  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
      options={{ origin: "center", fps: 10 }}
    />
  );
}
