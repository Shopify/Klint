import React, { useState } from "react";
import type { Layer, LayoutAlgorithmId } from "../algorithms/types";
import { generateCode } from "../algorithms/codeGenerator";
import { LAYOUT_OPTIONS } from "../layouts";
import styles from "./ExportPanel.module.css";

interface ExportPanelProps {
  layers: Layer[];
  background: string;
  playing: boolean;
  layout: LayoutAlgorithmId;
  onTogglePlaying: () => void;
  onSetBackground: (color: string) => void;
  onSetLayout: (layout: LayoutAlgorithmId) => void;
}

export default function ExportPanel({
  layers,
  background,
  playing,
  layout,
  onTogglePlaying,
  onSetBackground,
  onSetLayout,
}: ExportPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleExportPNG = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "klint-composition.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleCopyCode = async () => {
    const code = generateCode(layers, background, layout);
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.left}>
        <button
          className={`${styles.btn} ${styles.playBtn}`}
          onClick={onTogglePlaying}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? "\u23F8" : "\u25B6"}
        </button>
        <div className={styles.bgControl}>
          <span className={styles.bgLabel}>BG</span>
          <input
            type="color"
            className={styles.bgInput}
            value={background}
            onChange={(e) => onSetBackground(e.target.value)}
          />
        </div>
        <div className={styles.layoutControl}>
          <span className={styles.layoutLabel}>Layout</span>
          <select
            className={styles.layoutSelect}
            value={layout}
            onChange={(e) => onSetLayout(e.target.value as LayoutAlgorithmId)}
          >
            {LAYOUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.center}>
        <span className={styles.branding}>Klint Art Studio</span>
      </div>

      <div className={styles.right}>
        <button className={styles.btn} onClick={handleExportPNG} title="Export PNG">
          PNG
        </button>
        <button
          className={`${styles.btn} ${copied ? styles.copied : ""}`}
          onClick={handleCopyCode}
          title="Copy Code"
        >
          {copied ? "Copied!" : "Code"}
        </button>
      </div>
    </div>
  );
}
