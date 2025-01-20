import { loadNavigation } from "../components/server/addPlugins.server";
import useKlintPlugins from "../components/server/useKlintPlugins";

export async function loader() {
  const { modules, error } = await loadNavigation();
  return { modules, error };
}

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
  const P = useKlintPlugins();
  console.log(P);
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
