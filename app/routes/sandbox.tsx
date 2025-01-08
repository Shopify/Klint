import { KlintCanvas } from "~/routes/typography";
import { useState } from "react";
//import { loadPlugins } from "../components/addPlugins.server";
// import useKlintPlugins from "~/components/useKlintPlugins";

// export async function loader() {
//   const { plugins, error } = await loadPlugins();
//   return { plugins, error };
// }

/*
🤯
if DEV.production, then create read the Ctx.plugins
bundle the needed files in plugin-bundle.js at bundling time
minify, discard the others
then on the front, replace the src by plugin-bundle.js

// export function links() {
//   return [
//     { rel: "prefetch", href: "/plugin-bundle.js" },
//   ];
// }
*/

export default function Index() {
  const [count, setCount] = useState(0);

  // const { colors } = useKlint();

  return (
    <div className="flex h-screen items-center justify-center flex-col gap-4">
      <button
        onClick={() => setCount((c) => c + 1)}
        className="px-4 py-2 bg-white rounded"
      >
        Count: {count}
      </button>
      <div className="w-4/5 h-4/5 flex justify-center items-center bg-[#398575] overflow-hidden rounded-[8px]">
        <KlintCanvas />
      </div>
    </div>
  );
}
