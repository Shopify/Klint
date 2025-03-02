import { KlintContexts } from "../component/Klint";
declare module "../component/Klint" {
  interface KlintPlugins {
    Bezier: Bezier;
  }
}

interface BezierType {
  context: KlintContexts;
}

class Bezier implements BezierType {
  context: KlintContexts;
  constructor(ctx: KlintContexts) {
    this.context = ctx;
  }
  log = () => {
    console.log(this.context);
  };
}

export default Bezier;
