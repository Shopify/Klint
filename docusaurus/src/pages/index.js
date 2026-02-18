import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Marbling from "../components/Marbling/Marbling";

export default function Home() {
  return (
    <Layout
      title="Klint"
      description="A modern 2D Canvas made for React"
      noFooter
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "calc(100vh - 60px)",
          overflow: "hidden",
        }}
      >
        <Marbling />
        <a
          href={useBaseUrl("/docs")}
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            padding: "10px 24px",
            borderRadius: 20,
            color: "rgba(255,255,255,0.8)",
            textDecoration: "none",
            fontSize: 14,
            letterSpacing: 0.5,
            userSelect: "none",
            textWrap: "nowrap",
          }}
        >
          Read the docs →
        </a>
      </div>
    </Layout>
  );
}
