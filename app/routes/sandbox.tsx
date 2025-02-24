import type {
  KlintContext,
  // KlintOffscreenContext,
} from "~/Klint/src/hooks/useKlint";
import useKlint from "~/Klint/src/hooks/useKlint";
import useProps from "~/Klint/src/hooks/useProps";
import { useState } from "react";
import Color from "~/Klint/src/plugins/Color";
// import SVGfont, { SVGFontPaths } from "~/Klint/src/plugins/SVGfont";
import Easing from "~/Klint/src/plugins/Easing";
import Klint from "~/Klint/src/component/Klint";
// import svgFont from "~/src/Marcel-semibold.svg?raw";

export function KlintCanvas() {
  const { context, useMouse, useScroll } = useKlint();
  const { mouse, onClick, onMouseIn, onMouseOut, onMouseDown, onMouseUp } =
    useMouse();
  onClick(() => {
    console.log("mouse click !");
  });
  const { scroll, onScroll } = useScroll();

  // onMouseIn((ctx, e) => console.log("mouse entered"));
  // onMouseOut((ctx, e) => console.log("mouse left"));
  // onMouseDown((ctx, e) => console.log("pressed"));
  // onMouseUp((ctx, e) => console.log("released"));
  const P = useProps({
    hello: "Klint",
    lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
    scroll: { distance: 0, velocity: 0 },
  });

  // const onClick = (/*K: KlintContext*/) => {
  //   console.log("click");
  // };
  // const onMouseIn = (/*K: KlintContext*/) => {
  //   // K.play();
  //   console.log("mouse in");
  // };
  // const onMouseOut = (/*K: KlintContext*/) => {
  //   // K.pause();
  //   console.log("mouse out");
  // };

  // const { mouse, onClick } = useMouse();
  // onClick((ctx: KlintContext) => {
  //   console.log(`click at ${mouse.x},${mouse.y}`);
  //   console.log("Klint", ctx);
  // });
  // onMouseMove((ctx: KlintContext) => {
  //   console.log(`moved at ${mouse.x},${mouse.y}`);
  //   // console.log("Klint", ctx);
  // });
  // const { scroll, onScroll } = useScroll();
  // onScroll(() => {
  //   console.log("Look at me, i'm scrolling !");
  //   console.log(`distance ${scroll.distance}`);
  // });

  // const onScroll = (
  //   K: KlintContext,
  //   { distance, velocity }: { distance: number; velocity: number }
  // ) => {
  //   // K.pause();
  //   P.set("scroll", { distance, velocity });
  //   // console.log("scroll");
  //   // console.table({ distance, velocity });
  // };

  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    // console.log(K, "Welcome to Klint ! 🎨");
    K.extend("E", new Easing(K));
    K.extend("C", new Color(K));
    // K.extend("SVG", new SVGfont(K));
    // K.SVG.parse(svgFont);

    // P.set(
    //   "points",
    //   K.SVG.getPoints("Ah !", {
    //     factor: 0.1,
    //     align: "center",
    //     center: "middle",
    //   })
    // );

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
    K.textFont("Marcel");
    K.textSize(512);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
  };

  const draw = (K: KlintContext) => {
    const { C } = K as unknown as { C: Color };

    // const scrollAmount = P.get("scroll") as {
    //   distance: number;
    //   velocity: number;
    // };
    // console.log(x, y);
    // const lamp = P.get("lamp") as HTMLImageElement;
    // const rawpoints = P.get("points") as SVGFontPaths;
    // const pts = K.SVG.flatten(rawpoints, ({ point }) => {
    //   return {
    //     x: point.x * 2,
    //     y: point.y * 2 + 72,
    //   };
    // });

    const col = C.hsl(scroll.velocity * 360, 100, 50);
    K.background(col);

    K.push();
    K.fillColor(mouse.isPressed ? "#FFF" : "#000");
    // console.log(mouse);
    K.circle(mouse.x, mouse.y, 100);
    // K.text("Ah !", K.width / 2, K.height / 2);
    K.pop();

    K.push();
    for (let i = 0; i < 10; i++) {
      K.fillColor(C.colors[i % 6]);

      K.circle(
        -K.width / 2 + (K.width * i) / 9,
        Math.sin(K.frame * 0.03 + i / 10) * 240,
        100
      );
    }
    K.pop();

    // K.push();
    // K.strokeColor("#F0F");
    // K.translate(K.width / 2, K.height / 2);
    // K.SVG.draw(rawpoints, ({ point }) => {
    //   return {
    //     x: point.x,
    //     y: point.y + 72,
    //   };
    // });

    // K.pop();

    // for (const point of pts) {
    //   const { x, y } = point;
    //   const px = x + K.width / 2;
    //   const py = y + K.height / 2;
    //   K.push();
    //   const d =
    //     E.inout(
    //       K.remap(K.distance(px, py, K.mouse.x, K.mouse.y), 0, 400, 1, 0.0)
    //     ) * 0.4;
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
        origin: "center",
        noloop: "false",
        ignoreScroll: "false",
        // fps: 8,
      }}
      // onClick={onClick}
      // onResize={onResize}
      // onMouseIn={onMouseIn}
      // onMouseOut={onMouseOut}
      // onScroll={onScroll}
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
