import React from "react";
import type { Layer, LayoutAlgorithmId } from "../algorithms/types";
import { DEFAULT_TRANSFORM } from "../algorithms/types";
import { algorithmRegistry } from "../algorithms/registry";
import SliderControl from "./SliderControl";
import ColorControl from "./ColorControl";
import SelectControl from "./SelectControl";
import ToggleControl from "./ToggleControl";
import styles from "./ParameterPanel.module.css";

interface ParameterPanelProps {
  layer: Layer | null;
  layout: LayoutAlgorithmId;
  onUpdateParam: (layerId: string, paramId: string, value: any) => void;
  onUpdateLayer: (layerId: string, changes: Partial<Layer>) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const BLEND_MODES: { label: string; value: GlobalCompositeOperation }[] = [
  { label: "Normal", value: "source-over" },
  { label: "Multiply", value: "multiply" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Lighten", value: "lighten" },
  { label: "Darken", value: "darken" },
  { label: "Color Dodge", value: "color-dodge" },
  { label: "Difference", value: "difference" },
];

export default function ParameterPanel({
  layer,
  layout,
  onUpdateParam,
  onUpdateLayer,
  collapsed,
  onToggleCollapsed,
}: ParameterPanelProps) {
  return (
    <div className={`${styles.panel} ${collapsed ? styles.collapsed : ""}`}>
      <button className={styles.collapseBtn} onClick={onToggleCollapsed}>
        {collapsed ? "\u25C0" : "\u25B6"}
      </button>
      {!collapsed && (
        <div className={styles.content}>
          {!layer ? (
            <div className={styles.empty}>Select a layer to edit parameters</div>
          ) : (
            <>
              <h3 className={styles.title}>{layer.name}</h3>

              <div className={styles.section}>
                <SliderControl
                  label="Opacity"
                  value={layer.opacity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => onUpdateLayer(layer.id, { opacity: v })}
                />
                <SelectControl
                  label="Blend Mode"
                  value={layer.blendMode}
                  options={BLEND_MODES}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, { blendMode: v as GlobalCompositeOperation })
                  }
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionLabel}>Transform</span>
                  {layout !== "none" && (
                    <span className={styles.sectionHint}>Offsets relative to layout</span>
                  )}
                </div>
                <SliderControl
                  label="X Offset"
                  value={layer.transform.x}
                  min={-1}
                  max={1}
                  step={0.01}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, {
                      transform: { ...layer.transform, x: v },
                    })
                  }
                />
                <SliderControl
                  label="Y Offset"
                  value={layer.transform.y}
                  min={-1}
                  max={1}
                  step={0.01}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, {
                      transform: { ...layer.transform, y: v },
                    })
                  }
                />
                <SliderControl
                  label="Scale"
                  value={layer.transform.scale}
                  min={0.1}
                  max={3}
                  step={0.05}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, {
                      transform: { ...layer.transform, scale: v },
                    })
                  }
                />
                <SliderControl
                  label="Rotation"
                  value={layer.transform.rotation}
                  min={-3.14}
                  max={3.14}
                  step={0.01}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, {
                      transform: { ...layer.transform, rotation: v },
                    })
                  }
                />
                <button
                  className={styles.resetBtn}
                  onClick={() =>
                    onUpdateLayer(layer.id, {
                      transform: { ...DEFAULT_TRANSFORM },
                    })
                  }
                >
                  Reset Transform
                </button>
              </div>

              <div className={styles.divider} />

              <div className={styles.section}>
                {algorithmRegistry[layer.algorithmId]?.parameters.map((param) => {
                  const value = layer.params[param.id] ?? param.defaultValue;
                  const key = `${layer.id}-${param.id}`;

                  switch (param.type) {
                    case "slider":
                      return (
                        <SliderControl
                          key={key}
                          label={param.label}
                          value={value as number}
                          min={param.min!}
                          max={param.max!}
                          step={param.step!}
                          onChange={(v) => onUpdateParam(layer.id, param.id, v)}
                        />
                      );
                    case "color":
                      return (
                        <ColorControl
                          key={key}
                          label={param.label}
                          value={value as string}
                          onChange={(v) => onUpdateParam(layer.id, param.id, v)}
                        />
                      );
                    case "select":
                      return (
                        <SelectControl
                          key={key}
                          label={param.label}
                          value={value as string}
                          options={param.options!}
                          onChange={(v) => onUpdateParam(layer.id, param.id, v)}
                        />
                      );
                    case "toggle":
                      return (
                        <ToggleControl
                          key={key}
                          label={param.label}
                          value={value as boolean}
                          onChange={(v) => onUpdateParam(layer.id, param.id, v)}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
