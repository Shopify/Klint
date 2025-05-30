import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function Miore() {
  const { context, useDev } = useKlint();

  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(36);
    K.noStroke();
  };

  function drawGrid(K: KlintContext, unit, gridSize) {
    for (let i = 0; i < gridSize + 1; i++) {
      for (let j = 0; j < gridSize + 1; j++) {
        K.circle(
          (i - gridSize / 2) * unit * 10,
          (j - gridSize / 2) * unit * 10,
          unit * 5
        );
      }
    }
    K.fillColor("red");
    K.circle(0, 0, unit);
  }

  const draw = (K: KlintContext) => {
    useDev();
    const gridSize = 100;
    const unit = (K.width / gridSize) * 1.5;
    K.blend("source-over");
    K.fillColor("white");
    K.rectangle(-K.width / 2, -K.height / 2, K.width * 2, K.height * 2);

    K.blend("multiply");
    K.fillColor("#00ffff");
    K.push();
    K.rotate(-(K.time * Math.PI) / 500);
    drawGrid(K, unit, gridSize);
    K.pop();

    K.fillColor("#ff00ff");
    K.push();
    drawGrid(K, unit, gridSize);
    K.pop();

    K.fillColor("#ffff00");
    K.push();
    K.rotate((K.time * Math.PI) / 500);
    drawGrid(K, unit, gridSize);
    K.pop();

    const buffer = K.createOffscreen(
      "myBuffer",
      K.width,
      K.height,
      { origin: "corner" },
      (off) => {
        off.noStroke();
        off.fillColor("white");
        off.rectangle(0, 0, off.width, off.height);
        off.blend("xor");
        off.fillColor("black");
        off.circle(off.width / 1.335, off.height / 1.335, off.width / 10);
        off.blend("source-over");
      }
    );

    // Draw the buffer onto the main canvas
    K.blend("source-over");
    K.image(buffer, -K.width / 2, -K.height / 2);
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
