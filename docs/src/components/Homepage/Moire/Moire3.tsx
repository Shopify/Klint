import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function Moire3() {
  const { context, useDev } = useKlint();

  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(36);
  };

  function drawLines(K: KlintContext, unit, gridSize) {
    for (let i = 0; i < gridSize; i++) {
      const x = (i - gridSize / 2) * unit;
      K.beginPath();
      K.moveTo(x, -K.height / 3);
      K.lineTo(x, K.height / 3);
      K.stroke();
    }
  }

  function drawLiness(K: KlintContext, unit, gridSize, offsetMultiplier) {
    const offsetX = Math.sin(K.time / 50) * 2;
    const offsetY = Math.cos(K.time / 50) * 2;

    K.push();
    K.translate(offsetX * offsetMultiplier * 1, offsetY * -1);
    K.rotate(offsetX / 100);
    drawLines(K, unit, gridSize);
    K.pop();

    K.push();
    K.translate(offsetX * -offsetMultiplier * 1, offsetY * 1);
    K.rotate(offsetY / 100);
    drawLines(K, unit, gridSize);
    K.pop();
  }

  const draw = (K: KlintContext) => {
    useDev();
    const gridSize = 200;
    const unit = K.width / gridSize / 2;
    K.noStroke;
    K.blend("source-over");
    K.fillColor("white");
    K.rectangle(-K.width / 2, -K.height / 2, K.width * 2, K.height * 2);

    K.fillColor("transparent");
    K.blend("multiply");
    K.strokeWidth(5);

    K.strokeColor("#00ffff99");
    drawLiness(K, unit, gridSize, 1);
    K.strokeColor("#ff00ff99");
    drawLiness(K, unit, gridSize, 2);
    K.strokeColor("#ffff0099");
    drawLiness(K, unit, gridSize, 3);

    const buffer = K.createOffscreen(
      "myBuffer",
      K.width * 0.5,
      K.height * 0.5,
      { origin: "corner" },
      (off) => {
        off.fillColor("white");
        off.noStroke();
        off.rectangle(0, 0, off.width, off.height);
        off.blend("xor");
        off.textFont("sans-serif");
        off.textSize(300);
        off.textSpacing("letter", -50);
        off.textWeight("900");
        off.fillColor("black");
        off.alignText("center", "middle");
        off.text("hello.", off.width / 2, off.height / 2);
        off.blend("source-over");
      }
    );

    // Draw the buffer onto the main canvas
    K.blend("source-over");
    K.image(buffer, 0, 0);
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
