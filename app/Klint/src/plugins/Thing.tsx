import { KlintCoreContext, KlintContext } from "../component/KlintTypes";

interface KlintThing {
  context: KlintContext | KlintCoreContext;
}

class Thing implements KlintThing {
  context: KlintContext | KlintCoreContext;
  constructor(ctx: KlintContext | KlintCoreContext) {
    this.context = ctx;
  }
  log = () => {
    console.log(this);
  };
}

export default Thing;
