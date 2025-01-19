import { KlintContexts } from "../component/KlintTypes";

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
