import { useCallback, useRef } from "react";
import type { KlintContext } from "@shopify/klint";
import type { Layer, LayoutAlgorithmId } from "../algorithms/types";
import { algorithmRegistry } from "../algorithms/registry";
import { layoutFunctions } from "../layouts";

export function useLayerCompositor(
  layers: Layer[],
  background: string,
  playing: boolean,
  layout: LayoutAlgorithmId,
) {
  const layersRef = useRef(layers);
  layersRef.current = layers;

  const backgroundRef = useRef(background);
  backgroundRef.current = background;

  const playingRef = useRef(playing);
  playingRef.current = playing;

  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  // When paused, we freeze time/frame so algorithms see the same moment
  const frozenTimeRef = useRef<number | null>(null);
  const frozenFrameRef = useRef<number | null>(null);

  const draw = useCallback((K: KlintContext) => {
    const bg = backgroundRef.current;
    K.background(bg);

    const isPaused = !playingRef.current;

    // Capture the frozen moment on first paused frame
    if (isPaused && frozenTimeRef.current === null) {
      frozenTimeRef.current = K.time;
      frozenFrameRef.current = K.frame;
    } else if (!isPaused) {
      frozenTimeRef.current = null;
      frozenFrameRef.current = null;
    }

    // Swap in frozen values while drawing
    let realTime: number | undefined;
    let realFrame: number | undefined;
    if (isPaused && frozenTimeRef.current !== null) {
      realTime = K.time;
      realFrame = K.frame;
      K.time = frozenTimeRef.current;
      K.frame = frozenFrameRef.current!;
    }

    const currentLayers = layersRef.current;
    const currentLayout = layoutRef.current;
    const layoutFn = layoutFunctions[currentLayout] ?? layoutFunctions.none;
    const visibleLayers = currentLayers.filter((l) => l.visible);
    const layerCount = visibleLayers.length;

    let visibleIndex = 0;
    for (const layer of currentLayers) {
      if (!layer.visible) continue;
      const algo = algorithmRegistry[layer.algorithmId];
      if (!algo) {
        visibleIndex++;
        continue;
      }

      // Compute layout position for this layer
      const layoutPos = layoutFn(layerCount, visibleIndex);
      const t = layer.transform;

      // Combine: layout base + manual offset (additive x/y, multiplicative scale, additive rotation)
      const finalX = layoutPos.x + t.x;
      const finalY = layoutPos.y + t.y;
      const finalScale = layoutPos.scale * t.scale;
      const finalRotation = layoutPos.rotation + t.rotation;

      K.push();
      K.opacity(layer.opacity);
      if (layer.blendMode !== "source-over") {
        K.blend(layer.blendMode);
      }

      // Apply transforms: translate, rotate, scale
      const hasTransform =
        finalX !== 0 || finalY !== 0 || finalScale !== 1 || finalRotation !== 0;
      if (hasTransform) {
        K.translate(finalX * K.width * 0.5, finalY * K.height * 0.5);
        if (finalRotation !== 0) {
          K.rotate(finalRotation);
        }
        if (finalScale !== 1) {
          K.scale(finalScale, finalScale);
        }
      }

      try {
        algo.draw(K, layer.params);
      } catch (err) {
        console.error(`[ArtStudio] Layer "${layer.name}" error:`, err);
      }
      K.pop();
      visibleIndex++;
    }

    // Restore real values so Klint's internal bookkeeping isn't corrupted
    if (realTime !== undefined) {
      K.time = realTime;
      K.frame = realFrame!;
    }
  }, []);

  return draw;
}
