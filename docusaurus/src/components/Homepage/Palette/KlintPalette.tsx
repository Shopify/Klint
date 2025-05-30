import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function KlintPalette() {
  const { context } = useKlint();

  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(36);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
  };

  const draw = (K: KlintContext) => {
    const colors = [
      "coral",
      "brown",
      "mustard",
      "crimson",
      "navy",
      "sky",
      "olive",
      "charcoal",
      "peach",
      "rose",
      "plum",
      "sage",
      "drab",
      "taupe",
      "midnight",
      "golden",
      "orange",
      "slate",
    ];
    const cols = 6;
    const size = K.width / cols;

    K.background("white");
    colors.forEach((color: string, index: number) => {
      const col = Math.floor(index % cols);
      const row = Math.floor(index / cols);
      K.fillColor(K.Color[color]);
      K.rectangle(size * col, 0 + size * row, size, size);
      K.fillColor("black");
      K.text(color, size / 2 + size * col, size / 2 + size * row, size);
    });
  };

  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
      options={{ static: "true" }}
    />
  );
}
