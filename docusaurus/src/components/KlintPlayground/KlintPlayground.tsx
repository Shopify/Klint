import React, { useState, useCallback, useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import type { KlintCanvasOptions } from "@shopify/klint";
import CodeEditor from "./CodeEditor";
import KlintCanvas from "./KlintCanvas";
import { evaluateCode } from "./evaluateCode";

interface KlintPlaygroundProps {
  code: string;
  options?: KlintCanvasOptions;
  canvasHeight?: number;
  editable?: boolean;
  title?: string;
}

function PlaygroundInner({
  code: initialCode,
  options,
  canvasHeight = 400,
  editable = true,
  title,
}: KlintPlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | null>(null);
  const [canvasKey, setCanvasKey] = useState(0);
  const [runCode, setRunCode] = useState<string | null>(null);

  // Auto-run on mount
  useEffect(() => {
    const result = evaluateCode(initialCode);
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      setRunCode(initialCode);
    }
  }, [initialCode]);

  const handleRun = useCallback(() => {
    const result = evaluateCode(code);
    if (result.error) {
      setError(result.error);
      setRunCode(null);
    } else {
      setError(null);
      setRunCode(code);
      setCanvasKey((k) => k + 1);
    }
  }, [code]);

  const handleRuntimeError = useCallback((msg: string) => {
    setError(msg);
  }, []);

  const handleReset = useCallback(() => {
    setCode(initialCode);
    const result = evaluateCode(initialCode);
    if (result.error) {
      setError(result.error);
      setRunCode(null);
    } else {
      setError(null);
      setRunCode(initialCode);
      setCanvasKey((k) => k + 1);
    }
  }, [initialCode]);

  const isModified = code !== initialCode;

  return (
    <div
      style={{
        border: "1px solid var(--ifm-color-emphasis-300)",
        borderRadius: "var(--ifm-code-border-radius, 6px)",
        overflow: "hidden",
        marginBottom: "var(--ifm-leading)",
      }}
    >
      {title && (
        <div
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: 14,
            borderBottom: "1px solid var(--ifm-color-emphasis-300)",
            background: "var(--ifm-color-emphasis-100)",
          }}
        >
          {title}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: canvasHeight,
        }}
        className="klint-playground-grid"
      >
        {/* Editor panel */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid var(--ifm-color-emphasis-300)",
            minWidth: 0,
          }}
        >
          <div style={{ flex: 1, overflow: "auto" }}>
            <CodeEditor
              code={code}
              onChange={setCode}
              disabled={!editable}
            />
          </div>
        </div>

        {/* Canvas panel */}
        <div style={{ position: "relative", minHeight: canvasHeight, height: "100%" }}>
          {error ? (
            <div
              style={{
                padding: 16,
                color: "#ff4444",
                fontFamily: "var(--ifm-font-family-monospace)",
                fontSize: 13,
                whiteSpace: "pre-wrap",
                overflow: "auto",
                height: "100%",
                background: "var(--ifm-color-emphasis-100)",
              }}
            >
              {error}
            </div>
          ) : runCode ? (
            <KlintCanvas
              key={canvasKey}
              source={runCode}
              options={options}
              onError={handleRuntimeError}
            />
          ) : null}
        </div>
      </div>

      {/* Toolbar — full width */}
      {editable && (
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid var(--ifm-color-emphasis-300)",
            display: "flex",
            gap: 8,
            alignItems: "center",
            background: "var(--ifm-color-emphasis-100)",
          }}
        >
          <button
            type="button"
            onClick={handleRun}
            style={{
              padding: "4px 16px",
              borderRadius: 4,
              border: "none",
              background: "var(--ifm-color-primary)",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Run
          </button>
          {isModified && (
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: "4px 16px",
                borderRadius: 4,
                border: "1px solid var(--ifm-color-emphasis-300)",
                background: "transparent",
                color: "var(--ifm-font-color-base)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Reset
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .klint-playground-grid {
            grid-template-columns: 1fr !important;
          }
          .klint-playground-grid > div:first-child {
            border-right: none !important;
            border-bottom: 1px solid var(--ifm-color-emphasis-300);
          }
        }
      `}</style>
    </div>
  );
}

export default function KlintPlayground(props: KlintPlaygroundProps) {
  return (
    <BrowserOnly fallback={<div style={{ padding: 16, opacity: 0.5 }}>Loading playground...</div>}>
      {() => <PlaygroundInner {...props} />}
    </BrowserOnly>
  );
}
