import type { KlintContext } from "../hooks/useKlint";
import useKlint from "../hooks/useKlint";
import useProps from "../hooks/useProps";

export function KlintCanvas() {
  const { Klint, context } = useKlint();
  const P = useProps({
    hello: "hello world",
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
    K.alignText("center", "middle");
  };

  const draw = (K: KlintContext) => {
    K.background("#222");
    K.text(String(P.get("hello")), K.width / 2, K.height / 2);
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
      onClick={onClick}
      onResize={onResize}
      onMouseIn={onMouseIn}
      onMouseOut={onMouseOut}
    />
  );
}
