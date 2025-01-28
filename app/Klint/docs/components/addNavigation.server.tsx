export async function loadNavigation() {
  const modules = import.meta.glob("../documentation/*/*.tsx");
  const paths = Object.keys(modules);

  let tree: Record<string, Record<string, string>> = {};
  paths.forEach((path) => {
    const cleanPath = path.replace("../documentation/", "").replace(".tsx", "");

    const [folder, file] = cleanPath.split("/");
    if (!tree[folder]) {
      tree[folder] = {};
    }
    // Updated to match the /documentation route prefix
    if (folder === "Klint" && Object.keys(tree).length > 0) {
      const klintSection = tree["Klint"];
      delete tree["Klint"];
      const newTree = { Klint: klintSection, ...tree };
      tree = newTree;
    }
    tree[folder][file] = `/documentation/${folder}/${file}`;
  });

  return { tree, error: null };
}
