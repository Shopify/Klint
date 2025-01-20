import Klint, { KlintContext } from "./Klint";
import useKlint from "../hooks/useKlint";
import useProps from "../hooks/useProps";

export function KlintCanvas() {
  const klint = useKlint();
  const P = useProps({
    hello: "world",
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
      onClick={onClick}
      onResize={onResize}
      onMouseIn={onMouseIn}
      onMouseOut={onMouseOut}
    />
  );
}
