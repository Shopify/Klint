import { KlintContexts } from "../component/KlintTypes";

declare module "../component/KlintTypes" {
  interface KlintPlugins {
    Thing: Thing;
  }
}

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
