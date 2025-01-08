import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/./routes/_index";

export default function useKlintPlugins() {
  const { plugins, error } = useLoaderData<typeof loader>();
  if (error) return;
  const rawPlugins = plugins.map((plugin) =>
    new Function(`return ${plugin.code}`)()
  );
  type PluginType = (typeof rawPlugins)[number];
  return plugins.reduce<Record<string, PluginType>>(
    (acc, plugin) => ({
      ...acc,
      [plugin.name]: rawPlugins[plugins.indexOf(plugin)],
    }),
    {}
  );
}
