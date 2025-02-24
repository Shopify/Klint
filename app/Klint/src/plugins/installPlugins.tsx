import type { KlintContext } from "../hooks/useKlint";

const plugins = {
  Color: () => import("./Color").then((m) => m.default),
  Easing: () => import("./Easing").then((m) => m.default),
} as const;

type PluginKeys = keyof typeof plugins;

export function installPlugins(K: KlintContext, pluginNames: PluginKeys[]) {
  const loadPlugins = async () => {
    for (const name of pluginNames) {
      const Plugin = await plugins[name]();
      console.log(Plugin);
      K.extend(name, new Plugin(K));
    }
  };
  return loadPlugins;
}
