import useKlint, { KlintContext } from "~/Klint/src/hooks/useKlint";
import Klint from "~/Klint/src/component/Klint";
export function KlintCanvas() {
  const { context } = useKlint();

  const widths = [0, 1, 2, 3, 10, 100];
  const draw = (K: KlintContext) => {
    K.background("#CCC");
    const margins = K.width * 0.1;
    K.push();
    for (let i = 0; i < widths.length; i++) {
      const x = margins * 2 + i * margins;
      const y = K.height / 2;
      K.strokeWidth(widths[i]);
      K.line(x, y - margins * 2, x, y + margins * 2);
    }
    K.pop();
  };

  return (
    <Klint
      context={context}
      // preload={preload}
      draw={draw}
      // setup={setup}
      options={{
        origin: "corner",
        static: "true",
      }}
    />
  );
}

// const { colors } = useKlint();

//   return (
//     <div className="flex h-screen items-center justify-center flex-col gap-4">
//       <button
//         onClick={() => setCount((c) => c + 1)}
//         className="px-4 py-2 bg-white rounded"
//       >
//         Count: {count}
//       </button>
//       <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#398575] overflow-hidden rounded-[8px]">
//         <KlintCanvas counter={count} />
//       </div>
//     </div>
//   );
// }

const StrokeWidth = () => {
  return (
    <div className="h-screen min-h-screen">
      <div>StrokeWidth</div>
      <div className="w-[80%] h-[50%] rounded-xl overflow-hidden">
        <KlintCanvas />
      </div>
    </div>
  );
};

export default StrokeWidth;
