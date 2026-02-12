import type { KlintContext } from "@shopify/klint";

export interface UserCode {
  preload?: (ctx: KlintContext) => Promise<void>;
  setup?: (ctx: KlintContext) => void;
  draw?: (ctx: KlintContext) => void;
}

export interface EvalResult {
  code: UserCode | null;
  error: string | null;
}

export function evaluateCode(
  source: string,
  scope: Record<string, unknown> = {},
): EvalResult {
  try {
    const scopeKeys = Object.keys(scope);
    const scopeValues = scopeKeys.map((k) => scope[k]);

    const fn = new Function(
      "exports",
      ...scopeKeys,
      '"use strict";\n' +
        source +
        "\n" +
        'if (typeof preload !== "undefined") exports.preload = preload;\n' +
        'if (typeof setup !== "undefined") exports.setup = setup;\n' +
        'if (typeof draw !== "undefined") exports.draw = draw;\n',
    );

    const exports: UserCode = {};
    fn(exports, ...scopeValues);

    return { code: exports, error: null };
  } catch (err) {
    return {
      code: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
