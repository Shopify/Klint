import { useParams } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { lazy, Suspense } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const { folder, file } = params;
  try {
    const modules = import.meta.glob("../Klint/docs/documentation/*/*.tsx");
    const modulePath = `../Klint/docs/documentation/${folder}/${file}.tsx`;

    if (!modules[modulePath]) {
      throw new Response("Documentation not found", { status: 404 });
    }

    return { success: true };
  } catch (error) {
    throw new Response("Documentation not found", { status: 404 });
  }
}

// Create a component map to cache loaded components
const componentCache = new Map();

export default function DocPage() {
  const params = useParams();
  const key = `${params.folder}/${params.file}`;

  // Get or create lazy component
  if (!componentCache.has(key)) {
    componentCache.set(
      key,
      lazy(
        () =>
          import(
            `../Klint/docs/documentation/${params.folder}/${params.file}.tsx`
          )
      )
    );
  }

  const Component = componentCache.get(key);

  return (
    <Suspense fallback={<div>Loading documentation...</div>}>
      <Component />
    </Suspense>
  );
}
