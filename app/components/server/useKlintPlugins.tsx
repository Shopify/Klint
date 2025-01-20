import { useLoaderData } from "@remix-run/react";
import type { loader } from "~/routes/documentation";

export default function useKlintPlugins() {
  const { modules, error } = useLoaderData<typeof loader>();
  console.log(modules, error!);
  return {};
}
