import { Link } from "@remix-run/react";
import Fuse from "fuse.js";
import { useState, useMemo } from "react";

export function Navigation({
  tree,
}: {
  tree: Record<string, Record<string, string>>;
}) {
  const [search, setSearch] = useState("");

  // Flatten the tree for searching
  const searchableItems = useMemo(() => {
    return Object.entries(tree).flatMap(([folder, files]) =>
      Object.entries(files).map(([name, path]) => ({
        folder,
        name,
        path,
      }))
    );
  }, [tree]);

  // Initialize Fuse instance
  const fuse = useMemo(
    () =>
      new Fuse(searchableItems, {
        keys: ["name", "folder"],
        threshold: 0.4,
      }),
    [searchableItems]
  );

  // Get filtered results
  const results = useMemo(() => {
    if (!search) return null;
    return fuse.search(search).map((result) => result.item);
  }, [search, fuse]);

  return (
    <nav className="w-64 p-4 border-r h-screen overflow-y-auto fixed left-0 top-0 bg-black">
      <input
        type="search"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 bg-gray-800 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
      />

      {results ? (
        <div className="mb-4">
          {results.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              prefetch="intent"
              className="block py-1 hover:text-blue-500 transition-colors"
            >
              <div className="text-sm text-gray-500">{item.folder}</div>
              {item.name}
            </Link>
          ))}
        </div>
      ) : (
        Object.entries(tree).map(([folder, files]) => (
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
        ))
      )}
    </nav>
  );
}
