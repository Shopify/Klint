import { useState, useEffect, useRef, useCallback } from "react";
import { Editor } from "@monaco-editor/react";
// import  from "@/Klint/src/useKlint";
// import * as Plugins from "~/plugins";
import { useKlint, Klint, type KlintContext } from "klint";
const defaultCode = `
const {mouse} = K.useMouse();

function preload(K) {
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
}

`;

// Separate Klint Canvas component
function KlintCanvas({ code }: { code: string }) {
  const { context, useMouse } = useKlint();
  const mouseHook = useMouse();
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Create a sandbox environment with hooks available
  const createSandbox = useCallback(() => {
    try {
      // Create a sandbox with hooks available
      const sandbox = {
        K: {
          ...context,
          useMouse: () => mouseHook,
          log: (val: unknown) => {
            console.log(val);
          },
          // Add other hooks here
        },
        console: console,
      };

      // Evaluate the code in the sandbox
      const userCode = new Function(
        "K",
        `
        "use strict";
        let userPreload, userSetup, userDraw;
        
        // Make hooks available in global scope
        const useMouse = K.useMouse;
        
        // Execute user code
        ${code}
        
        // Return the lifecycle functions
        return { 
          preload: preload || userPreload, 
          setup: setup || userSetup, 
          draw: draw || userDraw 
        };
      `
      );

      // Execute the code with the sandbox
      const result = userCode(sandbox.K);
      setError(null);
      return result;
    } catch (err) {
      console.error("Error evaluating code:", err);
      setError(err instanceof Error ? err.message : String(err));
      return { preload: undefined, setup: undefined, draw: undefined };
    }
  }, [code, context, mouseHook]);

  // Create a ref to hold the evaluated code
  const userCodeRef = useRef(null);

  // Update the code when it changes
  useEffect(() => {
    if (isClient) {
      userCodeRef.current = createSandbox();
    }
  }, [isClient, createSandbox]);

  const preload = useCallback(
    async (K: KlintContext) => {
      // Extend K with the entire hook, not just mouse
      K.extend("useMouse", () => mouseHook);
      // Add other hooks here

      if (userCodeRef.current?.preload) {
        try {
          await userCodeRef.current.preload(K);
        } catch (err) {
          console.error("Error in preload:", err);
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    },
    [mouseHook]
  );

  const setup = useCallback((K: KlintContext) => {
    if (userCodeRef.current?.setup) {
      try {
        userCodeRef.current.setup(K);
      } catch (err) {
        console.error("Error in setup:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []);

  const draw = useCallback((K: KlintContext) => {
    if (userCodeRef.current?.draw) {
      try {
        userCodeRef.current.draw(K);
      } catch (err) {
        console.error("Error in draw:", err);
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, []);

  if (!isClient) {
    return (
      <div style={{ width: "100%", height: "100%", background: "#000" }}></div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#300",
          color: "#f88",
          padding: "20px",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <Klint
      context={context}
      preload={preload}
      setup={setup}
      draw={draw}
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
  const [isClient, setIsClient] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // Add a key to force remount

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to run code and clear console
  const runCode = useCallback(() => {
    // Clear the console before running new code
    console.clear();
    setRunningCode(code);
    // Increment the key to force a complete remount of the KlintCanvas
    setCanvasKey((prev) => prev + 1);
  }, [code]);

  if (!isClient) {
    return <div style={{ height: "100vh", background: "#1e1e1e" }}></div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <button
        onClick={runCode}
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
            onMount={(editor) => {
              editor.updateOptions({ theme: "vs-dark" });
            }}
          />
        </div>
        <div style={{ flex: 1, background: "#000" }}>
          <KlintCanvas key={`${canvasKey}-${runningCode}`} code={runningCode} />
        </div>
      </div>
    </div>
  );
}
