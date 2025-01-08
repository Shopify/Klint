export async function loadPlugins() {
  const modules = import.meta.glob("./plugins/*.tsx");
  const plugins = [];

  for (const path in modules) {
    try {
      const module = await modules[path]();
      const moduleName = path.replace("./plugins/", "").replace(".tsx", "");
      plugins.push({
        name: moduleName,
        //@ts-expect-error module.default is a function but TypeScript doesn't know its type
        code: module.default.toString(),
        type: moduleName,
      });
    } catch (err) {
      console.error(`Failed to load plugin ${path}:`, err);
    }
  }

  return { plugins, error: null };
}
