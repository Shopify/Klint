import { KlintCoreContext, KlintContext } from "../component/KlintTypes";

interface ThingType {
  context: KlintContext | KlintCoreContext;
}

class Thing implements ThingType {
  context: KlintContext | KlintCoreContext;
  constructor(ctx: KlintContext | KlintCoreContext) {
    this.context = ctx;
  }
  log = () => {
    console.log(this);
  };
}

export default Thing;
