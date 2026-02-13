import React from "react";
import type { Layer } from "../algorithms/types";
import styles from "./LayerPanel.module.css";

interface LayerItemProps {
  layer: Layer;
  selected: boolean;
  index: number;
  totalLayers: number;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export default function LayerItem({
  layer,
  selected,
  index,
  totalLayers,
  onSelect,
  onToggleVisibility,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: LayerItemProps) {
  return (
    <div
      className={`${styles.layerItem} ${selected ? styles.selected : ""} ${!layer.visible ? styles.hidden : ""}`}
      onClick={onSelect}
    >
      <div className={styles.layerInfo}>
        <button
          className={styles.visibilityBtn}
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          title={layer.visible ? "Hide" : "Show"}
        >
          {layer.visible ? "\u25C9" : "\u25CB"}
        </button>
        <span className={styles.layerName}>{layer.name}</span>
      </div>
      <div className={styles.layerActions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
          disabled={index === 0}
          title="Move up"
        >
          {"\u25B2"}
        </button>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
          disabled={index === totalLayers - 1}
          title="Move down"
        >
          {"\u25BC"}
        </button>
        <button
          className={styles.actionBtn}
          onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          title="Duplicate"
        >
          {"\u29C9"}
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          title="Delete"
        >
          {"\u2715"}
        </button>
      </div>
    </div>
  );
}
