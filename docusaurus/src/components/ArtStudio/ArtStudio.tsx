import React, { useState } from "react";
import { useKlint } from "@shopify/klint";
import StudioCanvas from "./StudioCanvas";
import LayerPanel from "./LayerPanel/LayerPanel";
import ParameterPanel from "./ParameterPanel/ParameterPanel";
import ExportPanel from "./ExportPanel/ExportPanel";
import { useStudioState } from "./hooks/useStudioState";
import { useLayerCompositor } from "./hooks/useLayerCompositor";
import styles from "./ArtStudio.module.css";

export default function ArtStudio() {
  const {
    state,
    addLayer,
    removeLayer,
    reorderLayers,
    selectLayer,
    toggleVisibility,
    updateParam,
    updateLayer,
    setBackground,
    togglePlaying,
    duplicateLayer,
    setLayout,
  } = useStudioState();

  const { context } = useKlint();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const draw = useLayerCompositor(state.layers, state.background, state.playing, state.layout);
  const selectedLayer = state.layers.find((l) => l.id === state.selectedLayerId) ?? null;

  return (
    <div className={styles.studio}>
      <div className={styles.canvasWrap}>
        <StudioCanvas context={context} draw={draw} />
      </div>

      <LayerPanel
        layers={state.layers}
        selectedLayerId={state.selectedLayerId}
        onSelectLayer={selectLayer}
        onToggleVisibility={toggleVisibility}
        onRemoveLayer={removeLayer}
        onDuplicateLayer={duplicateLayer}
        onReorderLayers={reorderLayers}
        onAddLayer={addLayer}
        collapsed={leftCollapsed}
        onToggleCollapsed={() => setLeftCollapsed(!leftCollapsed)}
      />

      <ParameterPanel
        layer={selectedLayer}
        layout={state.layout}
        onUpdateParam={updateParam}
        onUpdateLayer={updateLayer}
        collapsed={rightCollapsed}
        onToggleCollapsed={() => setRightCollapsed(!rightCollapsed)}
      />

      <ExportPanel
        layers={state.layers}
        background={state.background}
        playing={state.playing}
        layout={state.layout}
        onTogglePlaying={togglePlaying}
        onSetBackground={setBackground}
        onSetLayout={setLayout}
      />
    </div>
  );
}
