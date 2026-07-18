import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function Swans17() {
  const { context } = useKlint();

  const draw = (K: KlintContext) => {
    K.background(K.Color.coral);
    K.fillColor("white");
    K.circle(0, 0, K.width / 3);
    K.fillColor("black");
    K.disk(0, 0, K.width / 4, Math.PI / 2, Math.PI * 1.5);
    K.fillColor(K.Color.navy);
    K.disk(0, 0, K.width / 3, Math.PI * 1.5, Math.PI / 2);
    K.fillColor(K.Color.mustard);
    K.disk(0, 0, K.width / 4, Math.PI * 1.5, Math.PI / 2);
    K.fillColor(K.Color.peach);
    K.disk(0, 0, K.width / 7, Math.PI * 1.5, Math.PI / 2);

    const grad = K.radialGradient(0, 0, 0, 0, 0, K.width / 9);
    K.addColorStop(grad, 0, K.Color.crimson);
    K.addColorStop(grad, 1, K.Color.peach);
    K.fillColor(grad);
    K.disk(0, 0, K.width / 9, Math.PI * 1.5, Math.PI / 2, false);
  };

  return (
    <Klint
      context={context}
      draw={draw}
      options={{ origin: "center", static: true }}
    />
  );
}
