import { Link } from "@remix-run/react";

export function Navigation({
  tree,
}: {
  tree: Record<string, Record<string, string>>;
}) {
  return (
    <nav className="w-64 p-4 border-r h-screen overflow-y-auto fixed left-0 top-0 bg-black">
      {Object.entries(tree).map(([folder, files]) => (
        <div key={folder} className="mb-4">
          <h2 className="font-bold text-lg mb-2">{folder}</h2>
          <div className="pl-4">
            {Object.entries(files).map(([name, path]) => (
              <Link
                key={path}
                to={path}
                prefetch="intent"
                className="block py-1 hover:text-blue-500 transition-colors"
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
