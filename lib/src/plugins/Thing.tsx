import { KlintContexts } from "../Klint";

interface KlintThing {
  context: KlintContexts;
  log(): void;
}

class Thing implements KlintThing {
  public context!: KlintContexts;

  constructor(ctx: KlintContexts) {
    this.context = ctx;
  }

  log(): void {
    console.log(this.context);
  }
}

export default Thing;
