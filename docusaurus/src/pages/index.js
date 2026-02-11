import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";

export default function HomepageFeatures() {
  return (
    <main className="h-screen w-screen flex items-center justify-center">
      <h1>
        <a href={useBaseUrl("/docs")}>Klint Docs</a>
      </h1>
    </main>
  );
}
