import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { lazy, Suspense } from "react";

const componentCache = new Map();

interface Example {
  name: string;
  path: string;
}

export const loader: LoaderFunction = async () => {
  const modules = import.meta.glob("../Klint/docs/examples/*.tsx");
  const examples: Example[] = Object.keys(modules).map((path) => {
    const name = path.split("/").pop()?.replace(".tsx", "") || "";
    return { name, path };
  });

  return { examples };
};

export default function DocumentationIndex() {
  const { examples } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 gap-8">
        {examples.map(({ name, path }: Example) => {
          if (!componentCache.has(path)) {
            componentCache.set(
              path,
              lazy(() => import(`../Klint/docs/examples/${name}.tsx`))
            );
          }
          const Component = componentCache.get(path);

          return (
            <div key={name} className="rounded-lg overflow-hidden">
              <div className="w-full h-full">
                <Suspense fallback={<div>Loading example...</div>}>
                  <Component className="w-full h-full" />
                </Suspense>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
