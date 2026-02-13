import { useReducer, useCallback } from "react";
import type { StudioState, StudioAction, Layer, LayoutAlgorithmId } from "../algorithms/types";
import { DEFAULT_TRANSFORM } from "../algorithms/types";

let layerCounter = 0;

function generateId(): string {
  return `layer-${++layerCounter}-${Date.now().toString(36)}`;
}

function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "ADD_LAYER": {
      const defaults: Record<string, any> = {};
      for (const p of action.algorithm.parameters) {
        defaults[p.id] = p.defaultValue;
      }
      const layer: Layer = {
        id: generateId(),
        algorithmId: action.algorithmId,
        name: action.algorithm.name,
        visible: true,
        params: defaults,
        blendMode: "source-over",
        opacity: 1,
        transform: { ...DEFAULT_TRANSFORM },
      };
      return {
        ...state,
        layers: [...state.layers, layer],
        selectedLayerId: layer.id,
      };
    }

    case "REMOVE_LAYER": {
      const layers = state.layers.filter((l) => l.id !== action.layerId);
      return {
        ...state,
        layers,
        selectedLayerId:
          state.selectedLayerId === action.layerId
            ? (layers[layers.length - 1]?.id ?? null)
            : state.selectedLayerId,
      };
    }

    case "REORDER_LAYERS": {
      const layers = [...state.layers];
      const [moved] = layers.splice(action.fromIndex, 1);
      layers.splice(action.toIndex, 0, moved);
      return { ...state, layers };
    }

    case "SELECT_LAYER":
      return { ...state, selectedLayerId: action.layerId };

    case "TOGGLE_VISIBILITY":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, visible: !l.visible } : l,
        ),
      };

    case "UPDATE_PARAM":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId
            ? { ...l, params: { ...l.params, [action.paramId]: action.value } }
            : l,
        ),
      };

    case "UPDATE_LAYER":
      return {
        ...state,
        layers: state.layers.map((l) =>
          l.id === action.layerId ? { ...l, ...action.changes } : l,
        ),
      };

    case "SET_BACKGROUND":
      return { ...state, background: action.color };

    case "TOGGLE_PLAYING":
      return { ...state, playing: !state.playing };

    case "DUPLICATE_LAYER": {
      const source = state.layers.find((l) => l.id === action.layerId);
      if (!source) return state;
      const idx = state.layers.indexOf(source);
      const dupe: Layer = {
        ...source,
        id: generateId(),
        name: `${source.name} (copy)`,
        params: { ...source.params },
        transform: { ...source.transform },
      };
      const layers = [...state.layers];
      layers.splice(idx + 1, 0, dupe);
      return { ...state, layers, selectedLayerId: dupe.id };
    }

    case "SET_LAYOUT":
      return { ...state, layout: action.layout };

    default:
      return state;
  }
}

const initialState: StudioState = {
  layers: [],
  selectedLayerId: null,
  background: "#0a0a0f",
  playing: true,
  layout: "none",
};

export function useStudioState() {
  const [state, dispatch] = useReducer(studioReducer, initialState);

  const addLayer = useCallback(
    (algorithmId: string, algorithm: any) =>
      dispatch({ type: "ADD_LAYER", algorithmId, algorithm }),
    [],
  );
  const removeLayer = useCallback(
    (layerId: string) => dispatch({ type: "REMOVE_LAYER", layerId }),
    [],
  );
  const reorderLayers = useCallback(
    (fromIndex: number, toIndex: number) =>
      dispatch({ type: "REORDER_LAYERS", fromIndex, toIndex }),
    [],
  );
  const selectLayer = useCallback(
    (layerId: string | null) => dispatch({ type: "SELECT_LAYER", layerId }),
    [],
  );
  const toggleVisibility = useCallback(
    (layerId: string) => dispatch({ type: "TOGGLE_VISIBILITY", layerId }),
    [],
  );
  const updateParam = useCallback(
    (layerId: string, paramId: string, value: any) =>
      dispatch({ type: "UPDATE_PARAM", layerId, paramId, value }),
    [],
  );
  const updateLayer = useCallback(
    (layerId: string, changes: Partial<Layer>) =>
      dispatch({ type: "UPDATE_LAYER", layerId, changes }),
    [],
  );
  const setBackground = useCallback(
    (color: string) => dispatch({ type: "SET_BACKGROUND", color }),
    [],
  );
  const togglePlaying = useCallback(
    () => dispatch({ type: "TOGGLE_PLAYING" }),
    [],
  );
  const duplicateLayer = useCallback(
    (layerId: string) => dispatch({ type: "DUPLICATE_LAYER", layerId }),
    [],
  );
  const setLayout = useCallback(
    (layout: LayoutAlgorithmId) => dispatch({ type: "SET_LAYOUT", layout }),
    [],
  );

  return {
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
  };
}
