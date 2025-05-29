import React from "react";
import { Klint, useKlint, type KlintContext } from "@shopify/klint";

export default function Draw() {
  const { context, useDev } = useKlint();
  useDev();

  function getRandNumber(K: KlintContext, upper: number, lower: number) {
    return Math.floor(K.remap(Math.random(), 0, 1, upper, lower));
  }

  const setup = (K: KlintContext) => {
    K.noStroke();
    K.extend("hue", getRandNumber(K, 0, 350));
    K.extend("black", K.Color.oklch(0.1, 0.1, K.hue));
    K.extend("white", K.Color.oklch(1, 0.1, getRandNumber(K, 0, 350)));
    K.background(K.black);
    K.extend("petals", getRandNumber(K, 5, 25));
    K.extend("vals", {
      a: getRandNumber(K, 1, 25) * getRandNumber(K, -100, 100),
      b: getRandNumber(K, 1, 25) * getRandNumber(K, -100, 100),
      c: getRandNumber(K, 1, 25) * getRandNumber(K, -100, 100),
      d: getRandNumber(K, 1, 25) * getRandNumber(K, -100, 100),
      e: getRandNumber(K, 1, 25) * getRandNumber(K, -100, 100),
      f: getRandNumber(K, 1, 25) * getRandNumber(K, -100, 100),
    });
  };

  function makePetals(
    K: KlintContext,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    petals: number
  ) {
    for (let i = 0; i < petals; i++) {
      K.rotate(Math.PI / (petals / 2));
      K.beginPath();
      K.moveTo(x1, y1);
      K.bezierCurveTo(x1, y1, x2, y2, x3, y3);
      K.bezierCurveTo(x3, y3, y2, x2, x1, y1);
      K.closePath();
      K.fill();
    }
  }

  const draw = (K: KlintContext) => {
    const s = Math.sin(K.frame * 0.1);
    K.opacity(0.9 + s * 0.3);
    K.background(K.black);

    // Outer petals
    K.push();
    K.fillColor(K.white);
    K.rotate(K.frame * -0.02);
    makePetals(
      K,
      K.vals.a,
      K.vals.b,
      K.vals.c,
      K.vals.d,
      K.vals.e,
      K.vals.f,
      K.petals
    );
    K.pop();

    // Mid-level petals
    K.scale(0.8, 0.8);
    K.push();
    K.fillColor(K.black);
    K.rotate(K.frame * 0.02);
    makePetals(
      K,
      K.vals.b,
      K.vals.b,
      K.vals.d,
      K.vals.c,
      K.vals.f,
      K.vals.e,
      K.petals
    );
    K.pop();

    // Inner petals
    K.push();
    K.scale(0.5, 0.5);
    K.fillColor(K.white);
    K.rotate(K.frame * -0.02);
    makePetals(
      K,
      K.vals.a,
      K.vals.b,
      K.vals.c,
      K.vals.d,
      K.vals.e,
      K.vals.f,
      K.petals
    );

    // Inner petals
    K.push();
    K.scale(0.5, 0.5);
    K.fillColor(K.black);
    K.rotate(K.frame * 0.02);
    makePetals(
      K,
      K.vals.a,
      K.vals.b,
      K.vals.c,
      K.vals.d,
      K.vals.e,
      K.vals.f,
      K.petals
    );

    K.vals.b += s * 10;
    K.vals.c += s * 10;
    K.vals.d += s * 10;
    K.vals.e += s * 10;
    K.vals.f += s * 10;
    K.hue = (K.hue + 1 + s) % 360;
    K.black = K.Color.oklch(0.1, 0.2, K.hue);
  };

  return (
    <Klint
      context={context}
      setup={setup}
      draw={draw}
      options={{ origin: "center", fps: 24 }}
    />
  );
}
