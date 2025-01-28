import { Outlet, useLoaderData } from "@remix-run/react";
import { Navigation } from "~/Klint/docs/components/Navigation";
import { loadNavigation } from "~/Klint/docs/components/addNavigation.server";

export async function loader() {
  const { tree } = await loadNavigation();
  return { tree };
}

export default function DocumentationLayout() {
  const { tree } = useLoaderData<typeof loader>();
  console.log("hey");
  return (
    <div className="flex">
      <Navigation tree={tree} />
      <main className="flex-1 p-4 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
