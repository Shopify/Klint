export async function loadNavigation() {
  const modules = import.meta.glob("../../Klint/docs/documentation/*/*.tsx");
  // const plugins = [];
  console.log(modules);

  return { modules, error: null };
}

/*
interface NavItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: NavItem[];
}

export async function loadNavigation() {
  // const modules = import.meta.glob("../../Klint/docs/documentation/*);
  const navigation: NavItem[] = [];
  console.log(modules);
  for (const path in modules) {
    const isDirectory = !path.includes(".");
    const name = path
      .replace("../../Klint/docs/documentation/", "")
      .replace(/\.(mdx?|tsx?)$/, "")
      .split("/")
      .pop();

    navigation.push({
      name: (name ?? "").charAt(0).toUpperCase() + (name ?? "").slice(1),
      path: `/docs/${path
        .replace("../../Klint/docs/documentation/", "")
        .replace(/\.(mdx?|tsx?)$/, "")}`,
      isDirectory,
      ...(isDirectory && { children: [] }),
    });
  }

  // Build tree structure
  const tree = navigation.filter((item) => !item.path.includes("/"));
  navigation.forEach((item) => {
    if (item.path.includes("/")) {
      const parentPath = item.path.split("/").slice(0, -1).join("/");
      const parent = navigation.find((p) => p.path === parentPath);
      if (parent?.children) {
        parent.children.push(item);
      }
    }
  });

  return { navigation: tree, error: null };
}

*/
