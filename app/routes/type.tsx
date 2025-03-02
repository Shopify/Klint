import type {
  KlintContext,
  KlintOffscreenContext,
} from "~/Klint/src/component/useKlint";
import useKlint, { useProps } from "~/Klint/src/component/useKlint";
import { useState } from "react";
import Color from "~/Klint/src/plugins/Color";
import Easing from "~/Klint/src/plugins/Easing";
import Time from "~/Klint/src/plugins/Time";
import Klint from "~/Klint/src/component/Klint";

export function KlintCanvas() {
  const { context } = useKlint();
  const P = useProps({
    hello: "Klint",
    headphones:
      "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/headphones.png?v=1734625935",
    lamp: "https://cdn.shopify.com/s/files/1/0817/9308/9592/files/lamp.png?v=1734625960",
  });

  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    // console.log(K, "Welcome to Klint ! 🎨");
    K.extend("C", new Color(K));
    K.extend("E", new Easing(K));
    K.extend("T", new Time(K));

    K.createOffscreen(
      "buffer",
      K.width,
      K.height,
      { static: "true" },
      (O: KlintOffscreenContext) => {
        O.textFont("Inter");
        O.textSize(240);
        O.noStroke();
        O.alignText("center", "middle");
        O.computeFont();
        const tx = O.measureText(String(P.get("hello")));

        O.resizeCanvas(
          tx.width,
          tx.actualBoundingBoxAscent + tx.actualBoundingBoxDescent + 24
        );
        O.fillColor("#ECA088");
        O.text(String(P.get("hello")), O.width / 2, (O.height / 2) * 1.18);
      }
    );
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
    const { T, E } = K as unknown as { T: Time; E: Easing };
    K.background(`#E84D37`);
    const buffer = K.getOffscreen("buffer");
    // const s = K.scaleTo(buffer.width, buffer.height, K.width - 50, 100, true);
    // K.fillColor("#FFF");
    const slices = buffer.height - 10;
    K.push();
    K.translate(K.width * 0.5, buffer.height * 1.1);
    T.timeline("main")
      .use(K.frame)
      .for(4 * 60)
      .between(0.1, 0.9, (_progress) => {
        T.timeline("staggerIn")
          .for(1)
          .use(_progress)
          .stagger(slices, 0.5, (progress, id, num) => {
            const index = Math.floor((1 - id) * num);
            const slice = Math.ceil(buffer.height / num);
            const _p = progress;
            const displacement =
              E.inout(progress) * (K.height - buffer.height) * 0.9;
            const y = (index - num / 2) * slice + displacement;
            const x = Math.sin(-_p * Math.PI * 3) * 400;
            const _a = Math.sin(_p * Math.PI * 8) * Math.PI * 0.5;
            K.push();
            K.translate(x, y);
            K.rotate(_a);
            K.translate(-x, -y);
            K.image(
              buffer,
              0,
              index * slice,
              buffer.width,
              slice,
              x,
              y,
              buffer.width,
              slice
            );
            K.pop();
          });
      });
    T.timeline("main").between(0.1, 0.9, (_progress) => {
      T.timeline("staggerOut")
        .for(1)
        .use(1 - _progress)
        .stagger(slices, 0.5, (progress, id, num) => {
          // console.log(progress);
          const index = Math.floor((1 - id) * num);
          const slice = Math.ceil(buffer.height / num);
          const _p = progress;
          const displacement =
            E.inout(progress) * (K.height - buffer.height) * 0.9;
          const y = (index - num / 2) * slice + displacement;
          const x = Math.sin(_p * Math.PI * 4) * 400;
          const _a = Math.sin(_p * Math.PI * 8) * Math.PI * 0.25;
          K.push();
          K.translate(x, y);
          K.rotate(_a);
          K.translate(-x, -y);
          K.image(
            buffer,
            0,
            index * slice,
            buffer.width,
            slice,
            x,
            y,
            buffer.width,
            slice
          );
          K.pop();
        });
    });
    K.pop();
    /*
    K.push();
    
    const count = 5;
    const slice = buffer.height / count;
    for (let i = 0; i < count; i++) {
     
      K.push();
      K.image(
        buffer,
        0,
        i * slice,
        buffer.width,
        slice,
        0,
        y,
        buffer.width,
        slice
      );
      K.pop();
    }
    K.pop();
    // K.push();
    // K.fillColor("#FFF");
    // K.translate(100 + (K.width - 100) * p, K.height * 0.5);
    // K.circle(0, 0, 100);
    // K.pop();
    // K.push();
    // K.scale(s, s);
    // K.image(buffer, 0, 0);
    // K.pop();
    */
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
