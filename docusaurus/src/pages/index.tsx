import React from "react";
import Layout from "@theme/Layout";
import BrowserOnly from "@docusaurus/BrowserOnly";

export default function Home() {
  return (
    <Layout
      title="Art Studio"
      description="Interactive generative art studio powered by Klint"
      noFooter
    >
      <BrowserOnly fallback={<div style={{ height: "100vh", background: "#0a0a0f" }} />}>
        {() => {
          const ArtStudio = require("../components/ArtStudio/ArtStudio").default;
          return <ArtStudio />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
