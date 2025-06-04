import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function Moire2() {
  const { context, useDev } = useKlint();

  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(36);
  };

  function drawDisk(K: KlintContext, unit, gridSize, radius) {
    K.circle(0, 0, radius);

    let currentRadius = radius;
    while (currentRadius > 100) {
      K.circle(0, 0, currentRadius);
      currentRadius -= unit;
    }
  }

  function drawDisks(
    K: KlintContext,
    unit,
    gridSize,
    radius,
    offsetMultiplier
  ) {
    const offsetX = Math.sin(K.time / 10) * 1;
    const offsetY = Math.cos(K.time / 10) * 1;

    K.push();
    K.translate(offsetX * offsetMultiplier * 1, offsetY * -1);
    drawDisk(K, unit, gridSize, radius);
    K.pop();

    K.push();
    K.translate(offsetX * -offsetMultiplier * 1, offsetY * 1);
    drawDisk(K, unit, gridSize, radius);
    K.pop();
  }

  const draw = (K: KlintContext) => {
    useDev();
    const gridSize = 140;

    const unit = K.width / gridSize / 3;
    const radius = Math.min(K.width, K.height) / 2 - unit;
    K.noStroke;
    K.blend("source-over");
    K.fillColor("white");
    K.rectangle(-K.width / 2, -K.height / 2, K.width * 2, K.height * 2);

    K.fillColor("transparent");
    K.blend("multiply");
    K.strokeWidth(2);

    K.strokeColor("#00ffff99");
    drawDisks(K, unit, gridSize, radius, 1);
    K.strokeColor("#ff00ff99");
    drawDisks(K, unit, gridSize, radius, 2);
    K.strokeColor("#ffff0099");
    drawDisks(K, unit, gridSize, radius, 3);
  };

  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
      options={{ origin: "center" }}
    />
  );
}
