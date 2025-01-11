import Klint, { KlintContext } from "./Klint";
import useKlint from "../hooks/useKlint";

export function KlintCanvas() {
  const klint = useKlint();

  const preload = async (K: KlintContext) => {
    //K.extend("T", new Text(K));
    console.log(K, "hello there");
  };
  const setup = (K: KlintContext) => {
    K.textFont("Inter");
  };

  const draw = (K: KlintContext) => {
    K.background("#222");
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
