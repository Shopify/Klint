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
      <div className="max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold mb-6">Klint Examples</h1>
        <p className="text-gray-600">
          A collection of interactive examples showcasing Klint&apos;s
          capabilities.
        </p>
      </div>

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
            <div key={name} className="border rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="text-xl font-semibold">{name}</h2>
              </div>
              <div className="w-full" style={{ height: "400px" }}>
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
