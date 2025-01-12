import Klint, { KlintContext } from "~/Klint/src/component/Klint";
import useKlint from "~/Klint/src/hooks/useKlint";
import Text from "~/Klint/src/plugins/Text";
import Time from "~/Klint/src/plugins/Time";
import Easing from "~/Klint/src/plugins/Easing";
import Color from "~/Klint/src/plugins/Color";
import { useState } from "react";

export function KlintCanvas() {
  const klint = useKlint();
  const fontSize = 20;
  const preload = async (K: KlintContext) => {
    K.extend("T", new Text(K));
    K.extend("P", new Time(K));
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

    // K.push();
    // const side = 200;
    // K.translate(K.width / 2, K.height / 2);
    // K.beginShape();
    // K.vertex(-side, -side);
    // K.vertex(side, -side);
    // K.vertex(side, side);
    // K.vertex(-side, side);
    // K.beginContour();
    // for (let i = Math.PI * 2; i > 0; i -= Math.PI * 0.01) {
    //   K.vertex(Math.sin(i) * side * 0.66, Math.cos(i) * side * 0.66);
    // }
    // K.endContour(true);
    // K.endShape();
    // K.pop();

    // K.push();
    // K.translate(K.width / 2, 0);
    // const nums = Math.floor(K.height / fontSize) - 4;
    // const str = "KLINT KLINT KLINT";

    // for (let i = 0; i < nums; i++) {
    //   const progress = E.normalize(Math.sin(K.frame * 0.03 + i)) * 400;
    //   K.push();
    //   K.textSpacing("word", progress * 0.5);
    //   K.textSpacing("letter", (progress * 2) / 10);
    //   K.translate(0, i * (fontSize * 1.5));
    //   K.text(str, 0, 0);
    //   K.pop();
    // }

    // K.pop();

    // const off = E.normalize(Math.sin(K.frame / 4)) * 0.25 * Math.PI;
    // K.disk(0, 0, 250, off, Math.PI * 2 - off, true);

    // K.push();
    // let offset = 0;
    // let offset2 = 0;
    /*
    const p = P.timeline("default")
      .use(K.frame)
      .for(8 * 60)
      .between(0, 1, (progress) => {
        offset = Math.sin(progress * Math.PI * 8) * 150;
        P.timeline("sub-01")
          .use(progress)
          .for(1)
          .between(0, 0.5, (progress) => {
            const _progress = Math.sin(progress * Math.PI * 32);
            offset2 = E.expand(E.inout(E.normalize(_progress))) * 150;
          });
        K.fillColor("#F00");
      })
      .between(0.5, 1, () => {
        K.fillColor("#0F0");
      })
      .progress();
      */

    // P.timeline("default")
    //   .use(K.frame)
    //   .for(8 * 60)
    //   .between(0, 1, (_progress) => {
    //     const s = _progress < 0.5;
    //     P.timeline("sub-01")
    //       .use(_progress * 2)
    //       .for(1)
    //       .stagger(10, 0.25, (progress, id) => {
    //         const t = s ? E.inout(progress) : 1 - E.inout(progress);
    //         K.push();
    //         K.translate(300 + t * (K.width - 600), K.height / 2);
    //         K.fillColor(`rgba(${(1 - id) * 255},0,0,255)`);
    //         K.circle(0, 0, 200);
    //         K.pop();
    //       });
    //   });

    // const x = 100 + p * (K.width - 200);
    // const y = K.height / 2 + offset;
    // K.circle(x, y, 100);
    // K.fillColor("#00F");
    // K.circle(x, y + offset2, 50);
    // K.pop();

    // const sentence = "Klint";
    // // K.text(sentence, 0, 0);
    // const T = K.T as Text;
    // const letters = T.splitTo(sentence, "letters");
    // const framesForEach = 1 * 60;
    // const frames = letters.length * framesForEach;
    // const progress = (K.frame / frames) % 1;
    // const current = Math.floor(progress * letters.length);
    // const currentProgress =
    //   ((progress * frames) % framesForEach) / framesForEach;
    // // console.log(current, currentProgress);
    // for (const [id, letter] of letters.entries()) {
    //   let movement = 0;
    //   if (id === current) {
    //     const motionin = Math.min(1, currentProgress * 2);
    //     const motionout = Math.max(0, (currentProgress - 0.5) * 2);
    //     movement = motionin - motionout;
    //   }

    //   const x = letter.x;
    //   const y = letter.y - movement * 100;
    //   K.text(letter.char, x, y);
    // }
    // Test letters
    // .forEach((letter) => {
    //   K.text(letter.char, letter.x, letter.y);
    // });
  };

  return (
    <Klint
      context={klint}
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
