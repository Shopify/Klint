import { KlintContexts } from "../Klint";

declare module "./index" {
  interface KlintPlugins {
    Thing: Thing;
  }
}

interface KlintThing {
  context: KlintContexts;
  log(): void;
  attach(context: KlintContexts): void;
}

class Thing implements KlintThing {
  public context!: KlintContexts;

  attach(context: KlintContexts): void {
    this.context = context;
  }

  log(): void {
    console.log(this.context);
  }
}

export default Thing;
