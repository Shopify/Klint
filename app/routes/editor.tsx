import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
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
  K.background('rgba(0, 0, 0, 1)');
  K.fillColor("#FFF");
  K.text("Hello Klint!", K.width/2, K.height/2);
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
    draw: (K: KlintContext) => {
      K.background("rgba(0, 0, 0, 1)");
    },
    setup: (K: KlintContext) => {
      K.textFont("Inter");
    },
  });

  const evaluateCode = (sourceCode: string) => {
    try {
      // Create a new context for evaluation
      const context = {};
      const evaluatedCode = new Function(`
        "use strict";
        return (function() {
          ${sourceCode}
          return { preload, setup, draw };
        })();
      `).call(context);
      console.log(sourceCode);
      setKlintFunctions(evaluatedCode);
    } catch (error) {
      console.error("Error evaluating code:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log(code);
      evaluateCode(code);
    }, 500);
    return () => clearTimeout(timer);
  }, [code]);

  const preload = async (K: KlintContext) => {
    // Initialize all plugins
    Object.entries(Plugins).forEach(([name, Plugin]) => {
      K.extend(name.charAt(0), new Plugin(K));
    });

    // Call user's preload if exists
    if (klintFunctions.preload) {
      await klintFunctions.preload(K);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
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
          context={context}
          preload={preload}
          setup={klintFunctions.setup}
          draw={klintFunctions.draw!}
          options={{
            origin: "corner",
            static: "false",
          }}
        />
      </div>
    </div>
  );
}
