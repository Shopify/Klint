import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import useKlint from "~/Klint/src/hooks/useKlint";
import useProps from "~/Klint/src/hooks/useProps";
import * as Plugins from "~/Klint/src/plugins/Plugins";
import type { KlintContext } from "~/Klint/src/hooks/useKlint";

const defaultCode = `function preload(K) {
  console.log(K, "Welcome to Klint ! 🎨");
}

function setup(K) {
  K.textFont("Inter");
  K.textSize(64);
  K.noStroke();
  K.alignText("center", "middle");
}

function draw(K) {
  K.background('rgba(125, 0, 255, 255)');
  K.fillColor("#FFF");
  K.circle(K.width * .5, K.height / 2 + Math.sin(K.frame * 0.03) * 300, 100)
 
}`;

export default function KlintEditor() {
  const [code, setCode] = useState(defaultCode);
  const { Klint, context } = useKlint();
  const P = useProps({});
  const [klintFunctions, setKlintFunctions] = useState<{
    preload?: (K: KlintContext) => Promise<void>;
    setup?: (K: KlintContext) => void;
    draw?: (K: KlintContext) => void;
  }>({
    preload: undefined,
    setup: undefined,
    draw: undefined,
  });
  const [runCount, setRunCount] = useState(0);

  const evaluateCode = (sourceCode: string) => {
    try {
      const context = {};
      const evaluatedCode = new Function(`
        "use strict";
        return (function() {
          ${sourceCode}
          return { preload, setup, draw };
        })();
      `).call(context);

      if (evaluatedCode.draw) {
        setKlintFunctions({ ...evaluatedCode });
        // Reset context when code changes
        if (Klint?.reset) {
          Klint.reset();
        }
      }
    } catch (error) {
      console.error("Error evaluating code:", error);
    }
  };

  const preload = async (K: KlintContext) => {
    console.log("Main preload called");
    // Initialize all plugins
    Object.entries(Plugins).forEach(([name, Plugin]) => {
      // console.log(`Initializing plugin: ${name}`);
      K.extend(name.charAt(0), new Plugin(K));
    });

    // Call user's preload if exists
    if (klintFunctions.preload) {
      console.log("Calling user preload");
      await klintFunctions.preload(K);
    }
  };

  useEffect(() => {
    evaluateCode(defaultCode);
  }, []);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (Klint?.reset) {
        Klint.reset();
      }
    };
  }, [Klint]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <button
        onClick={() => {
          evaluateCode(code);
          setRunCount((prev) => prev + 1);
        }}
        style={{
          padding: "8px 16px",
          margin: "8px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Run
      </button>
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
            }}
          />
        </div>
        <div style={{ flex: 1, background: "#000" }}>
          <Klint
            key={runCount}
            context={context}
            preload={preload}
            setup={klintFunctions.setup}
            draw={klintFunctions.draw!}
            options={{
              origin: "corner",
              unsafemode: "true",
            }}
          />
        </div>
      </div>
    </div>
  );
}
