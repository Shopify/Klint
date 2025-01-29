import type {
  KlintContext,
  KlintOffscreenContext,
} from "~/Klint/src/hooks/useKlint";
import useKlint from "~/Klint/src/hooks/useKlint";
import useProps from "~/Klint/src/hooks/useProps";
import { useState } from "react";
import Color from "~/Klint/src/plugins/Color";

export function KlintCanvas() {
  const { Klint, context } = useKlint();
  const P = useProps({
    hello: "Klint",
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
    console.log(K, "Welcome to Klint ! 🎨");
    K.extend("C", new Color(K));

    K.createOffscreen(
      "buffer",
      K.width,
      K.height,
      { static: "true" },
      (O: KlintOffscreenContext) => {
        O.textFont("Inter");
        O.textSize(360);
        O.noStroke();
        O.alignText("center", "middle");
        O.computeFont();
        const tx = O.measureText(String(P.get("hello")));
        console.log(tx);
        O.resizeCanvas(
          tx.width,
          tx.actualBoundingBoxAscent + tx.actualBoundingBoxDescent + 24
        );
        O.fillColor("#FFF");
        O.text(String(P.get("hello")), O.width / 2, (O.height / 2) * 1.18);
      }
    );
  };
  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.textSize(240);
    K.noStroke();
    K.alignText("center", "middle");
  };

  const draw = (K: KlintContext) => {
    const { C } = K as unknown as { E: Easing; C: Color };
    K.background(`rgba(0, 0, 0, 1)`);
    const b = K.getOffscreen("buffer");
    const s = K.scaleTo(b.width, b.height, K.width - 50, 100, true);

    const _size = Math.min(K.height, K.width) * 0.5;
    const count = 20;
    const dx = Math.abs(K.mouse.x / K.width - 0.5);
    const dy = Math.abs(K.mouse.y / K.height - 0.5);
    // console.log(d);
    for (let i = 0; i < count; i++) {
      const s = Math.sin(i / 2 + K.frame * 0.03 + dx);
      const x = K.width / 2 + s * dx * K.width;
      const y = K.height / 2 + ((count / 2 - i) * K.height) / count;

      const cx = K.width / 2;
      const cy = K.height / 2;
      const ex = -(cx - K.mouse.x) / 25;
      const ey = -(cy - K.mouse.y) / 25;
      K.push();
      K.translate(x - ex, y - ey);
      K.rotate(s / 2);
      const size = _size - (1 - i / count) * (_size - 100);
      K.fillColor(`rgba(0, 0, 0, 0.25)`);
      K.rectangle(-size / 2, -size / 2, size, size);
      K.translate(ex, ey);
      K.rotate(s / 8);
      K.fillColor(C.colors[i % 6]);
      K.rectangle(-size / 2, -size / 2, size, size);
      K.pop();
    }
    K.push();
    K.scale(s, s);
    K.image(K.getOffscreen("buffer"), 0, 0);
    K.pop();
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
        static: "false",
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
