import React, { useState } from "react";
import type { Layer, AlgorithmDef } from "../algorithms/types";
import { algorithmsByCategory, categoryOrder } from "../algorithms/registry";
import LayerItem from "./LayerItem";
import styles from "./LayerPanel.module.css";

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onRemoveLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onReorderLayers: (from: number, to: number) => void;
  onAddLayer: (algorithmId: string, algorithm: AlgorithmDef) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onRemoveLayer,
  onDuplicateLayer,
  onReorderLayers,
  onAddLayer,
  collapsed,
  onToggleCollapsed,
}: LayerPanelProps) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ""}`}>
      <button className={styles.collapseBtn} onClick={onToggleCollapsed}>
        {collapsed ? "\u25B6" : "\u25C0"}
      </button>
      {!collapsed && (
        <div className={styles.content}>
          <div className={styles.header}>
            <h3 className={styles.title}>Layers</h3>
            <button
              className={styles.addBtn}
              onClick={() => setShowAdd(!showAdd)}
            >
              {showAdd ? "\u2715" : "+"}
            </button>
          </div>

          {showAdd && (
            <div className={styles.addMenu}>
              {categoryOrder.map((cat) => {
                const algos = algorithmsByCategory[cat];
                if (!algos) return null;
                return (
                  <div key={cat} className={styles.category}>
                    <div className={styles.categoryName}>{cat}</div>
                    {algos.map((algo) => (
                      <button
                        key={algo.id}
                        className={styles.algoBtn}
                        onClick={() => {
                          onAddLayer(algo.id, algo);
                          setShowAdd(false);
                        }}
                      >
                        {algo.name}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          <div className={styles.layerList}>
            {layers.length === 0 && (
              <div className={styles.empty}>
                Click + to add your first layer
              </div>
            )}
            {[...layers].reverse().map((layer, reverseIndex) => {
              const actualIndex = layers.length - 1 - reverseIndex;
              return (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  selected={layer.id === selectedLayerId}
                  index={actualIndex}
                  totalLayers={layers.length}
                  onSelect={() => onSelectLayer(layer.id)}
                  onToggleVisibility={() => onToggleVisibility(layer.id)}
                  onRemove={() => onRemoveLayer(layer.id)}
                  onDuplicate={() => onDuplicateLayer(layer.id)}
                  onMoveUp={() => {
                    if (actualIndex < layers.length - 1) onReorderLayers(actualIndex, actualIndex + 1);
                  }}
                  onMoveDown={() => {
                    if (actualIndex > 0) onReorderLayers(actualIndex, actualIndex - 1);
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
