import Klint, { KlintContext } from "~/Klint/src/component/Klint";
import useKlint, { useProps } from "~/Klint/src/component/useKlint";

import Easing from "~/Klint/src/plugins/Easing";
import Color from "~/Klint/src/plugins/Color";

export function KlintCanvas({ ...props }: { count?: number }) {
  const { context } = useKlint();
  const { count } = props;

  const P = useProps({
    count: count,
  });

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
    const _count = Number(P.get("count"));
    K.background("#111");
    K.fillColor("#FF0");
    const t = (Math.sin(K.frame * 0.03 + _count) * K.height) / 8;
    K.fillColor(C.colors[_count % C.colors.length]);
    K.circle(K.width * 0.5, K.height * 0.5 + t, 100);

    // const a = (K.frame * 0.005) % 1;
    // const b = E.normalize(Math.cos(K.frame * 0.03));
    // const c = E.normalize(Math.sin(K.frame * 0.03 + Math.PI));
    // const d = C.blendColors(C.olive, C.crimson, b);

    // K.push();
    // K.fillColor(C.olive);
    // K.rectangle(0, 0, K.width, K.height / 8);
    // K.pop();

    // K.push();
    // K.fillColor(C.rgb(124, 109, 204));
    // K.rectangle(0, K.height / 8, K.width, K.height / 8);
    // K.pop();

    // K.push();
    // K.fillColor(C.hsl(360 * a, 50, 50));
    // K.rectangle(0, (K.height / 8) * 2, K.width, K.height / 8);
    // K.pop();

    // K.push();
    // K.fillColor(d);
    // K.rectangle(0, (K.height / 8) * 3, K.width, K.height / 8);
    // K.pop();

    // K.push();
    // K.fillColor(C.gray(c * 255));
    // K.rectangle(0, (K.height / 8) * 4, K.width, K.height / 8);
    // K.pop();
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

export default function SquaresOnSine({
  className,
  count,
}: {
  className?: string;
  count?: number;
}) {
  // const { colors } = useKlint();

  return (
    <div className={`${className} h-[240px]`}>
      <KlintCanvas count={count} />
    </div>
  );
}
