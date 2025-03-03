import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { lazy, Suspense } from "react";

const componentCache = new Map();

interface Example {
  name: string;
  path: string;
  count: number;
}

export const loader: LoaderFunction = async () => {
  const modules = import.meta.glob("../Klint/docs/examples/*.tsx");
  const examples: Example[] = Object.keys(modules).flatMap((path) => {
    const name = path.split("/").pop()?.replace(".tsx", "") || "";
    return Array.from({ length: 10 }, (_, i) => ({
      name: `${name}-${i}`,
      path,
      count: i,
    }));
  });

  return { examples };
};

export default function DocumentationIndex() {
  const { examples } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 gap-8">
        {examples.map(({ name, path, count }: Example) => {
          if (!componentCache.has(name)) {
            componentCache.set(
              name,
              lazy(
                () =>
                  import(
                    `../Klint/docs/examples/${path
                      .split("/")
                      .pop()
                      ?.replace(".tsx", "")}.tsx`
                  )
              )
            );
          }
          const Component = componentCache.get(name);

          return (
            <div key={name} className="border rounded-lg overflow-hidden">
              <div className="w-full" style={{ height: "400px" }}>
                <Suspense fallback={<div>Loading example...</div>}>
                  <Component className="w-full h-full" count={count} />
                </Suspense>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
