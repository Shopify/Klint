// import { KlintContext } from "~/components/KlintTypes";
import Klint, { KlintContext } from "~/components/Klint";
import useKlint from "~/hooks/useKlint";
// import Vector from "~/components/plugins/Vector";
import Text from "~/components/plugins/Text";
import Time from "~/components/plugins/Time";
import Easing from "~/components/plugins/Easing";
export function KlintCanvas() {
  const klint = useKlint();

  const preload = async (K: KlintContext) => {
    K.extend("T", new Text(K));
    K.extend("P", new Time(K));
    K.extend("E", new Easing(K));
  };
  const setup = (K: KlintContext) => {
    K.textSize(180);
    K.alignText("center", "middle");
    K.textFont("Inter");
    K.noStroke();
  };

  const draw = (K: KlintContext) => {
    K.background("#222");
    K.fillColor("#fff");
    const P = K.P as Time;
    const E = K.E as Easing;
    K.push();
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

    P.timeline("default")
      .use(K.frame)
      .for(8 * 60)
      .between(0, 1, (_progress) => {
        const s = _progress < 0.5;
        P.timeline("sub-01")
          .use(_progress * 2)
          .for(1)
          .stagger(10, 0.5, (progress, id) => {
            const t = s ? E.inout(progress) : 1 - E.inout(progress);
            K.push();
            K.translate(300 + t * (K.width - 600), K.height / 2);
            K.fillColor(`rgba(${(1 - id) * 255},0,0,255)`);
            K.circle(0, 0, 200);
            K.pop();
          });
      });

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
        static: "false",
      }}
    />
  );
}
