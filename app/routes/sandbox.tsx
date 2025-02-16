import type {
  KlintContext,
  // KlintOffscreenContext,
} from "~/Klint/src/hooks/useKlint";
import useKlint from "~/Klint/src/hooks/useKlint";
import useProps from "~/Klint/src/hooks/useProps";
import { useState } from "react";
import Color from "~/Klint/src/plugins/Color";
import SVGfont, { SVGFontPaths } from "~/Klint/src/plugins/SVGfont";

import svgFont from "~/src/Marcel-semibold.svg?raw";

export function KlintCanvas() {
  const { Klint, context } = useKlint();
  const P = useProps({
    hello: "Klint",
    lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
  });
  const onResize = (/*K: KlintContext*/) => {
    console.log("resize");
  };
  const onClick = (/*K: KlintContext*/) => {
    console.log("click");
  };
  const onMouseIn = (/*K: KlintContext*/) => {
    // K.play();
    console.log("mouse in");
  };
  const onMouseOut = (/*K: KlintContext*/) => {
    // K.pause();
    console.log("mouse out");
  };
  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    // console.log(K, "Welcome to Klint ! 🎨");
    K.extend("C", new Color(K));
    K.extend("SVG", new SVGfont(K));
    K.SVG.parse(svgFont);

    P.set(
      "points",
      K.SVG.getPoints("Ah !", {
        factor: 0.25,
        align: "center",
        center: "middle",
      })
    );

    P.set(
      "lamp",
      await K.loadImage(
        "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960"
      )
    );

    // K.createOffscreen(
    //   "buffer",
    //   K.width,
    //   K.height,
    //   { static: "true" },
    //   (O: KlintOffscreenContext) => {
    //     O.textFont("Inter");
    //     O.textSize(360);
    //     O.noStroke();
    //     O.alignText("center", "middle");
    //     O.computeFont();
    //     const tx = O.measureText(String(P.get("hello")));
    //     console.log(tx);
    //     O.resizeCanvas(
    //       tx.width,
    //       tx.actualBoundingBoxAscent + tx.actualBoundingBoxDescent + 24
    //     );
    //     O.fillColor("#FFF");
    //     O.text(String(P.get("hello")), O.width / 2, (O.height / 2) * 1.18);
    //   }
    // );
  };
  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    // K.textSize(48);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
  };

  const draw = (K: KlintContext) => {
    // const { C } = K as unknown as { E: Easing; C: Color };
    const lamp = P.get("lamp") as HTMLImageElement;
    const rawpoints = P.get("points") as SVGFontPaths;
    const pts = K.SVG.flatten(rawpoints);
    K.background(`rgba(0, 0, 0, 255)`);
    // K.noFill();

    // K.push();
    // K.fillColor("#555");

    // K.pop();

    K.push();
    // K.translate(K.width / 2, K.height / 2);
    K.fillColor("#FFF");
    K.text("Ah !", K.width / 2, K.height / 2);
    K.pop();

    K.push();
    K.strokeColor("#F0F");
    K.translate(K.width / 2, K.height / 2);
    K.SVG.draw(rawpoints, ({ point }) => {
      return {
        x: point.x,
        y: point.y,
      };
    });

    K.pop();

    // for (const point of pts) {
    //   const { x, y } = point;
    //   const px = x * 4 + K.width / 2;
    //   const py = y * 4 + K.height / 2;
    //   K.push();
    //   const d = K.remap(
    //     K.distance(px, py, K.mouse.x, K.mouse.y),
    //     0,
    //     300,
    //     0.25,
    //     0.0
    //   );
    //   const a = Math.atan2(py - K.mouse.y, px - K.mouse.x);
    //   K.translate(px, py);
    //   K.scale(d, d);
    //   K.rotate(a);
    //   K.image(lamp, 0, 0);
    //   K.pop();
    // }

    // const b = K.getOffscreen("buffer");
    // const s = K.scaleTo(b.width, b.height, K.width - 50, 100, true);

    // const _size = Math.min(K.height, K.width) * 0.5;
    // const count = 20;
    // const dx = Math.abs(K.mouse.x / K.width - 0.5);
    // const dy = Math.abs(K.mouse.y / K.height - 0.5);
    // // console.log(d);
    // for (let i = 0; i < count; i++) {
    //   const s = Math.sin(i / 2 + K.time * 0.03 + dx);
    //   const x = K.width / 2 + s * dx * K.width;
    //   const y = K.height / 2 + ((count / 2 - i) * K.height) / count;

    //   const cx = K.width / 2;
    //   const cy = K.height / 2;
    //   const ex = -(cx - K.mouse.x) / 25;
    //   const ey = -(cy - K.mouse.y) / 25;
    //   K.push();
    //   K.translate(x - ex, y - ey);
    //   K.rotate(s / 2);
    //   const size = _size - (1 - i / count) * (_size - 100);
    //   K.fillColor(`rgba(0, 0, 0, 0.25)`);
    //   K.rectangle(-size / 2, -size / 2, size, size);
    //   K.translate(ex, ey);
    //   K.rotate(s / 8);
    //   K.fillColor(C.colors[i % 6]);
    //   K.rectangle(-size / 2, -size / 2, size, size);
    //   K.pop();
    // }
    // // K.push();
    // // K.scale(s, s);
    // // K.image(K.getOffscreen("buffer"), 0, 0);
    // // K.pop();
    // K.fillColor("#FFF");
    // K.textSize(K.width * 0.25);
    // K.text(String(P.get("hello")), K.width / 2, K.width * 0.25);
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "corner",
        noloop: "false",
        // fps: 8,
      }}
      onClick={onClick}
      onResize={onResize}
      onMouseIn={onMouseIn}
      onMouseOut={onMouseOut}
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
