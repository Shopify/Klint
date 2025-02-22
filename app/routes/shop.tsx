import type { KlintContext } from "~/Klint/src/hooks/useKlint";
import useKlint from "~/Klint/src/hooks/useKlint";
import useProps from "~/Klint/src/hooks/useProps";
import { useState } from "react";
import Color from "~/Klint/src/plugins/Color";
import Easing from "~/Klint/src/plugins/Easing";
import Klint from "~/Klint/src/component/Klint";

export function KlintCanvas() {
  const { context } = useKlint();
  const P = useProps({
    hello: "Klint",
    headphones:
      "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/headphones.png?v=1734625935",
    lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
  });

  const onResize = (/*K: KlintContext*/) => {
    // console.log("resize");
  };
  const onClick = (/*K: KlintContext*/) => {
    // console.log("click");
  };
  const onMouseIn = (/*K: KlintContext*/) => {
    // K.play();
    // console.log("mouse in");
  };
  const onMouseOut = (/*K: KlintContext*/) => {
    // K.pause();
    // console.log("mouse out");
  };
  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    console.log(K, "Welcome to Klint ! 🎨");
    K.extend("C", new Color(K));
    K.extend("E", new Easing(K));

    const lampImg = await K.loadImage(String(P.get("lamp")));
    const headphonesImg = await K.loadImage(String(P.get("headphones")));

    P.set("lamp", lampImg);
    P.set("headphones", headphonesImg);
  };
  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(64);
    K.noStroke();
    K.alignText("center", "middle");
    K.setImageOrigin("center");
    K.setRectOrigin("center");
  };

  const draw = (K: KlintContext) => {
    // const { C, E } = K as unknown as { E: Easing; C: Color };
    K.background(`rgba(0, 0, 0, 1)`);

    const margins = K.width * 0.2;
    const nx = 10;
    const ny = 10;
    const dx = (K.width - margins * 2) / (nx - 1);
    const dy = (K.height - margins * 2) / (ny - 1);
    const lamp = P.get("lamp") as HTMLImageElement;
    const headphones = P.get("headphones") as HTMLImageElement;
    const ratio = 0.25;
    K.fillColor("#FFF");
    K.push();
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = K.width / 2 - (dx * (nx - 1)) / 2 + i * dx;
        const y = K.height / 2 - (dy * (ny - 1)) / 2 + j * dy;
        const b = K.mouse.x - x;
        const a = K.mouse.y - y;
        const c = Math.sqrt(a * a + b * b) || 1;
        // const a = Math.atan2(y - K.mouse.y, x - K.mouse.x);
        const d = K.remap(
          K.distance(x, y, K.mouse.x, K.mouse.y),
          0,
          K.width * 0.25,
          1,
          0.0
        );

        const e =
          ((Math.acos(b / c) * Math.PI) / Math.PI) * (K.mouse.y > y ? 1 : -1);
        K.push();
        K.translate(x, y);
        K.scale(d, d);
        K.rotate(e);

        if ((i + j) % 2 === 0) {
          //K.text("A", 0, 0);
          K.image(lamp, 0, 0, lamp.width * ratio, lamp.height * ratio);
        } else {
          //K.text("B", 0, 0);
          K.image(headphones, 0, 0, lamp.width * ratio, lamp.height * ratio);
        }
        // K.text("hello", 0, 0);
        // K.image(lamp, 0, 0, lamp.width * ratio, lamp.height * ratio);
        // K.image(headphones, 0, 0, lamp.width * ratio, lamp.height * ratio);
        // K.rectangle(0, 0, 25, 100);
        //
        K.pop();
      }
    }
    K.pop();

    // K.image(lamp, 0, 0, lamp.width * ratio, lamp.height * ratio);
    // K.image(
    //   headphones,
    //   0,
    //   0,
    //   headphones.width * ratio * 1.5,
    //   headphones.height * ratio * 1.5
    // );
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "corner",
        static: "false",
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
