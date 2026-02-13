import React from "react";
import { createRoot } from "react-dom/client";
import ArtStudio from "@art-studio/ArtStudio";
import "./overrides.css";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ArtStudio />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
