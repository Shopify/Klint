import { KlintCoreContext, KlintContext } from "../KlintTypes";

interface ThingType {
  context: KlintContext | KlintCoreContext;
}

class Thing implements ThingType {
  context: KlintContext | KlintCoreContext;
  constructor(ctx: KlintContext | KlintCoreContext) {
    this.context = ctx;
  }
  log = () => {
    console.log(this.context);
  };
}

export default Thing;
