// import { KlintOffscreenContext, KlintContext } from "../component/KlintTypes";
import { KlintContexts } from "../component/KlintTypes";

interface KlintThing {
  context: KlintContexts;
  log(): void;
}

class Thing implements KlintThing {
  constructor(public readonly context: KlintContexts) {}

  log(): void {
    console.log(this.context);
  }
}

export default Thing;
