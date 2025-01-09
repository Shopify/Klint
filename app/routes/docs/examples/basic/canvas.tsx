import Klint, { KlintContext } from "../../../../../Klint/src/component/Klint";
import useKlint from "../../../../../Klint/src/hooks/useKlint";
import Vector from "../../../../../Klint/src/plugins/Vector";

export function KlintCanvas() {
  const cols = ["#F00", "#0F0", "#00F"];

  const klint = useKlint();

  const preload = async (Klint: KlintContext) => {
    Klint.extend("createVector", (x: number, y: number): Vector => {
      return new Vector(x, y);
    });
  };

  const setup = (Klint: KlintContext) => {
    const { setImageOrigin, alignText, textFont, strokeJoin } = Klint;
    alignText("center", "middle");
    textFont("Inter");
    setImageOrigin("corner");
    strokeJoin("round");
    Klint.noStroke();
    Klint.fillColor(cols[2]);
    Klint.textQuality("auto");
    Klint.background("#888");
  };

  const draw = (K: KlintContext) => {
    K.background("#888");
    K.textFont("Inter");
    K.push();
    const gradient = K.conicGradient();
    K.addColor(gradient, 0, cols[0]);
    K.addColor(gradient, 1, cols[2]);
    K.fillColor(gradient);
    K.rectangle(0, 0, K.width, K.height);
    K.pop();
  };
  return (
    <Klint
      context={klint}
      draw={draw}
      setup={setup}
      preload={preload}
      options={{
        origin: "corner",
        fps: 60,
        noloop: "true",
      }}
    />
  );
}
