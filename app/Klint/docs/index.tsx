// interface DocItem {
//   name: string;
//   path: string;
//   isDirectory: boolean;
//   children?: DocItem[];
// }

// async function scanDirectory(
//   dirPath: string,
//   basePath: string = ""
// ): Promise<DocItem[]> {
//   const items = await fs.readdir(dirPath, { withFileTypes: true });
//   const result: DocItem[] = [];

//   for (const item of items) {
//     const fullPath = path.join(dirPath, item.name);
//     const relativePath = path.join(basePath, item.name);

//     if (item.isDirectory()) {
//       result.push({
//         name: item.name,
//         path: relativePath,
//         isDirectory: true,
//         children: await scanDirectory(fullPath, relativePath),
//       });
//     } else if (item.name.endsWith(".md")) {
//       result.push({
//         name: item.name.replace(".md", ""),
//         path: relativePath,
//         isDirectory: false,
//       });
//     }
//   }

//   return result;
// }

// const RenderNavItem = ({ item }: { item: NavItem }) => {
//   return (
//     <div className="pl-4">
//       {item.isDirectory ? (
//         <div>
//           <div className="font-bold">{item.name}</div>
//           {item.children?.map((child, i) => (
//             <RenderNavItem key={i} item={child} />
//           ))}
//         </div>
//       ) : (
//         <Link to={item.path} className="hover:text-blue-500">
//           {item.name}
//         </Link>
//       )}
//     </div>
//   );
// };

export default function DocsIndex() {
  return (
    <div className="flex">
      {/* <nav className="w-64 p-4 border-r">
        {navigation.map((item, i) => (
          <RenderNavItem key={i} item={item} />
        ))}
      </nav> */}
      <main className="flex-1 p-4">
        <div>Hello World</div>
      </main>
    </div>
  );
}
