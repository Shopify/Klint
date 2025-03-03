import { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import useKlint from "@/Klint/src/useKlint";
import * as Plugins from "~/plugins";
import Klint, { type KlintContext } from "@/Klint/src/Klint";
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

// Separate Klint Canvas component
function KlintCanvas({ code }: { code: string }) {
  const { context } = useKlint();
  // const P = useProps({});
  const [klintFunctions, setKlintFunctions] = useState<{
    preload?: (K: KlintContext) => Promise<void>;
    setup?: (K: KlintContext) => void;
    draw?: (K: KlintContext) => void;
  }>({
    preload: undefined,
    setup: undefined,
    draw: undefined,
  });

  useEffect(() => {
    try {
      const context = {};
      const evaluatedCode = new Function(`
        "use strict";
        return (function() {
          ${code}
          return { preload, setup, draw };
        })();
      `).call(context);

      setKlintFunctions(evaluatedCode);
    } catch (error) {
      console.error("Error evaluating code:", error);
    }
  }, [code]);

  const preload = async (K: KlintContext) => {
    Object.entries(Plugins).forEach(([name, Plugin]) => {
      K.extend(name.charAt(0), new Plugin(K));
    });

    if (klintFunctions.preload) {
      await klintFunctions.preload(K);
    }
  };

  // Only render Klint when we have a valid draw function
  if (!klintFunctions.draw) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000" }}></div>
    );
  }

  return (
    <Klint
      context={context}
      preload={preload}
      setup={klintFunctions.setup}
      draw={klintFunctions.draw}
      options={{
        origin: "corner",
        unsafemode: "true",
      }}
    />
  );
}

/*
{
  "acceptSuggestionOnCommitCharacter": true,
  "acceptSuggestionOnEnter": "on",
  "accessibilitySupport": "auto",
  "autoIndent": false,
  "automaticLayout": true,
  "codeLens": true,
  "colorDecorators": true,
  "contextmenu": true,
  "cursorBlinking": "blink",
  "cursorSmoothCaretAnimation": false,
  "cursorStyle": "line",
  "disableLayerHinting": false,
  "disableMonospaceOptimizations": false,
  "dragAndDrop": false,
  "fixedOverflowWidgets": false,
  "folding": true,
  "foldingStrategy": "auto",
  "fontLigatures": false,
  "formatOnPaste": false,
  "formatOnType": false,
  "hideCursorInOverviewRuler": false,
  "highlightActiveIndentGuide": true,
  "links": true,
  "mouseWheelZoom": false,
  "multiCursorMergeOverlapping": true,
  "multiCursorModifier": "alt",
  "overviewRulerBorder": true,
  "overviewRulerLanes": 2,
  "quickSuggestions": true,
  "quickSuggestionsDelay": 100,
  "readOnly": false,
  "renderControlCharacters": false,
  "renderFinalNewline": true,
  "renderIndentGuides": true,
  "renderLineHighlight": "all",
  "renderWhitespace": "none",
  "revealHorizontalRightPadding": 30,
  "roundedSelection": true,
  "rulers": [],
  "scrollBeyondLastColumn": 5,
  "scrollBeyondLastLine": true,
  "selectOnLineNumbers": true,
  "selectionClipboard": true,
  "selectionHighlight": true,
  "showFoldingControls": "mouseover",
  "smoothScrolling": false,
  "suggestOnTriggerCharacters": true,
  "wordBasedSuggestions": true,
  "wordSeparators": "~!@#$%^&*()-=+[{]}|;:'\",.<>/?",
  "wordWrap": "off",
  "wordWrapBreakAfterCharacters": "\t})]?|&,;",
  "wordWrapBreakBeforeCharacters": "{([+",
  "wordWrapBreakObtrusiveCharacters": ".",
  "wordWrapColumn": 80,
  "wordWrapMinified": true,
  "wrappingIndent": "none"
}
*/

export default function KlintEditor() {
  const [code, setCode] = useState(defaultCode);
  const [runningCode, setRunningCode] = useState(defaultCode);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <button
        onClick={() => setRunningCode(code)}
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
              theme: "vs-dark",
            }}
          />
        </div>
        <div style={{ flex: 1, background: "#000" }}>
          <KlintCanvas key={runningCode} code={runningCode} />
        </div>
      </div>
    </div>
  );
}
