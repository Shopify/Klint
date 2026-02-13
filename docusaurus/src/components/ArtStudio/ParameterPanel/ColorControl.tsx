import React, { useState } from "react";
import ColorPalette from "../ColorPalette/ColorPalette";
import styles from "./ParameterPanel.module.css";

interface ColorControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorControl({ label, value, onChange }: ColorControlProps) {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <div className={styles.control}>
      <div className={styles.controlHeader}>
        <label className={styles.label}>{label}</label>
        <span className={styles.value}>{value}</span>
      </div>
      <div className={styles.colorRow}>
        <input
          type="color"
          className={styles.colorInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          className={styles.paletteToggle}
          onClick={() => setShowPalette(!showPalette)}
        >
          {showPalette ? "Hide" : "Palettes"}
        </button>
      </div>
      {showPalette && (
        <ColorPalette onSelect={(c) => { onChange(c); setShowPalette(false); }} />
      )}
    </div>
  );
}
