import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function Stripes() {
  const { context, useDev, KlintImage } = useKlint();
  const { images, loadImages } = KlintImage();
  useDev();

  const preload = async () => {
    await loadImages({
      josh: "https://cdn.shopify.com/s/files/1/0884/4086/5047/files/2533_photo1.jpg?v=1748780455",
    });
  };

  const setup = (K: KlintContext) => {
    K.noStroke();
    K.background("black");
    const josh = images["josh"];

    K.createOffscreen(
      "joshBuffer",
      josh.width,
      josh.height,
      { origin: "corner" },
      (off) => {
        off.image(josh, 0, 0);
        K.extend("josh", {
          width: off.width,
          height: off.height,
          data: off.getImageData(0, 0, off.width, off.height).data,
        });
      }
    );
  };

  const draw = (K: KlintContext) => {
    K.background(K.Color.coral);
    K.push();
    // const joshRato = K.josh.height / K.josh.width;
    // K.image(images.josh, 0, 0, K.width, K.width * joshRato);
    K.noStroke();
    K.fillColor("white");
    const cols = 300;
    const colWidth = 5;
    const canvasSize = Math.floor(K.width / cols);
    const joshSize = Math.floor(K.josh.width / cols);
    for (let i = 0; i < cols; i += colWidth) {
      for (let j = 0; j < cols; j++) {
        const index = (j * joshSize * K.josh.width + i * joshSize) * 2;
        const r = K.josh.data[index];
        const g = K.josh.data[index + 1];
        const b = K.josh.data[index + 2];
        const av = (r + g + b) / 3;
        console.log(av / 255);

        K.noStroke();

        const baseLength = canvasSize * colWidth;
        const offsetLength =
          (baseLength - baseLength * (av / 255)) / 2 - canvasSize * 0.5;
        K.strokeWidth(canvasSize * 1.3);
        K.strokeCap("round");
        K.strokeColor(K.Color.brown);
        const center = i * canvasSize + (canvasSize * colWidth) / 2;
        K.line(
          center - offsetLength,
          j * canvasSize + canvasSize / 2,
          center + offsetLength,
          j * canvasSize + canvasSize / 2
        );
      }
    }
    K.pop();
  };

  return (
    <Klint
      context={context}
      preload={preload}
      setup={setup}
      draw={draw}
      options={{ fps: 120 }}
    />
  );
}
