import { useState } from "react";
import Klint, { type KlintContext } from "~/Klint";
import useKlint, { useProps } from "~/useKlint";

export interface KlintCanvasProps {
  count?: number;
}

export function KlintCanvas(props: KlintCanvasProps) {
  const { context } = useKlint();
  const { count } = props;

  const P = useProps({
    count: count,
    clicks: 0,
  });

  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    console.log(K, "Welcome to Klint ! 🎨");
  };
  const setup = (K: KlintContext) => {
    K.textFont("Inter");
    K.alignText("center", "middle");
  };

  const draw = (K: KlintContext) => {
    K.background("#222");
    K.text(String(P.get("count")), K.width / 2, K.height / 2);
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
      setup={setup}
      options={{
        origin: "center",
        static: "false",
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
        <KlintCanvas count={count} />
      </div>
    </div>
  );
}
