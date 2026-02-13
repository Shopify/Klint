import React from "react";
import { palettes } from "./palettes";
import styles from "./ColorPalette.module.css";

interface ColorPaletteProps {
  onSelect: (color: string) => void;
}

export default function ColorPalette({ onSelect }: ColorPaletteProps) {
  return (
    <div className={styles.palettes}>
      {palettes.map((p) => (
        <div key={p.name} className={styles.palette}>
          <span className={styles.paletteName}>{p.name}</span>
          <div className={styles.swatches}>
            {p.colors.map((c) => (
              <button
                key={c}
                className={styles.swatch}
                style={{ backgroundColor: c }}
                onClick={() => onSelect(c)}
                title={c}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
