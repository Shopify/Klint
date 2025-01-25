export async function loadNavigation() {
  const modules = import.meta.glob("../../Klint/docs/documentation/*/*.tsx");
  const paths = Object.keys(modules);

  const tree: Record<string, Record<string, string>> = {};

  paths.forEach((path) => {
    const cleanPath = path
      .replace("../../Klint/docs/documentation/", "")
      .replace(".tsx", "");

    const [folder, file] = cleanPath.split("/");
    if (!tree[folder]) {
      tree[folder] = {};
    }
    // Updated to match the /documentation route prefix
    tree[folder][file] = `/documentation/${folder}/${file}`;
  });

  return { tree, error: null };
}
