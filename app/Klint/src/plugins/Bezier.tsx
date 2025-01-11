import { KlintCoreContext, KlintContext } from "../component/KlintTypes";

interface BezierType {
  context: KlintContext | KlintCoreContext;
}

class Bezier implements BezierType {
  context: KlintContext | KlintCoreContext;
  constructor(ctx: KlintContext | KlintCoreContext) {
    this.context = ctx;
  }
  log = () => {
    console.log(this.context);
  };
}

export default Bezier;
