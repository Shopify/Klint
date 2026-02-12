import React, { useState, useCallback, useEffect } from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import type { KlintCanvasOptions } from "@shopify/klint";
import CodeEditor from "./CodeEditor";
import KlintCanvas from "./KlintCanvas";
import { evaluateCode } from "./evaluateCode";
import styles from "./KlintPlayground.module.css";

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
    <div className={styles.playground}>
      {title && <div className={styles.title}>{title}</div>}

      <div className={styles.grid} style={{ minHeight: canvasHeight }}>
        {/* Editor panel */}
        <div className={styles.editorPanel}>
          <div className={styles.editorScroll}>
            <CodeEditor code={code} onChange={setCode} disabled={!editable} />
          </div>
        </div>

        {/* Canvas panel */}
        <div className={styles.canvasPanel} style={{ minHeight: canvasHeight }}>
          {error ? (
            <div className={styles.errorDisplay}>{error}</div>
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

      {/* Toolbar */}
      {editable && (
        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.runButton}
            onClick={handleRun}
          >
            Run
          </button>
          {isModified && (
            <button
              type="button"
              className={styles.resetButton}
              onClick={handleReset}
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function KlintPlayground(props: KlintPlaygroundProps) {
  return (
    <BrowserOnly
      fallback={
        <div style={{ padding: 16, opacity: 0.5 }}>Loading playground...</div>
      }
    >
      {() => <PlaygroundInner {...props} />}
    </BrowserOnly>
  );
}
