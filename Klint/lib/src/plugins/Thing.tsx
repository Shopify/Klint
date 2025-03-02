import { KlintContexts } from "../Klint";

declare module "../Klint" {
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
