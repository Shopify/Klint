import Klint, { KlintContext } from "~/Klint";
import useKlint from "~/useKlint";
import Easing from "Klint/Klint/dist/plugins/Easing";
import Color from "Klint/Klint/dist/plugins/Color";
import { useState } from "react";

export function KlintCanvas() {
  const { context } = useKlint();
  const fontSize = 20;
  const preload = async (K: KlintContext) => {
    K.extend("E", new Easing(K));
    K.extend("C", new Color(K));
  };
  const setup = (K: KlintContext) => {
    K.textSize(fontSize);
    K.alignText("center", "middle");
    K.textFont("Inter");
    K.noStroke();
  };

  const draw = (K: KlintContext) => {
    const { E, C } = K as unknown as { E: Easing; C: Color };

    K.background("#111");
    K.fillColor("#FF0");

    const a = (K.frame * 0.005) % 1;
    const b = E.normalize(Math.cos(K.frame * 0.03));
    const c = E.normalize(Math.sin(K.frame * 0.03 + Math.PI));
    const d = C.blendColors(C.olive, C.crimson, b);

    K.push();
    K.fillColor(C.olive);
    K.rectangle(0, 0, K.width, K.height / 8);
    K.pop();

    K.push();
    K.fillColor(C.rgb(124, 109, 204));
    K.rectangle(0, K.height / 8, K.width, K.height / 8);
    K.pop();

    K.push();
    K.fillColor(C.hsl(360 * a, 50, 50));
    K.rectangle(0, (K.height / 8) * 2, K.width, K.height / 8);
    K.pop();

    K.push();
    K.fillColor(d);
    K.rectangle(0, (K.height / 8) * 3, K.width, K.height / 8);
    K.pop();

    K.push();
    K.fillColor(C.gray(c * 255));
    K.rectangle(0, (K.height / 8) * 4, K.width, K.height / 8);
    K.pop();
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
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#398575] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
