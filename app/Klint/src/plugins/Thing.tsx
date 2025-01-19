import { KlintOffscreenContext, KlintContext } from "../component/KlintTypes";

interface KlintThing {
  context: KlintContext | KlintOffscreenContext;
  log(): void;
}

class Thing implements KlintThing {
  constructor(public readonly context: KlintContext | KlintOffscreenContext) {}

  log(): void {
    console.log(this.context);
  }
}

export default Thing;
