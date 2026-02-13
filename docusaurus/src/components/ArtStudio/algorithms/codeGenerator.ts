import type { Layer, LayoutAlgorithmId } from "./types";
import { algorithmRegistry } from "./registry";
import { layoutFunctions } from "../layouts";

export function generateCode(
  layers: Layer[],
  background: string,
  layout: LayoutAlgorithmId = "none",
): string {
  const visibleLayers = layers.filter((l) => l.visible);
  const layoutFn = layoutFunctions[layout] ?? layoutFunctions.none;
  const layerCount = visibleLayers.length;

  const layerCode = visibleLayers
    .map((layer, visibleIndex) => {
      const algo = algorithmRegistry[layer.algorithmId];
      if (!algo) return "";

      let code = "";

      // Compute final transform (layout + manual)
      const layoutPos = layoutFn(layerCount, visibleIndex);
      const t = layer.transform;
      const finalX = layoutPos.x + t.x;
      const finalY = layoutPos.y + t.y;
      const finalScale = layoutPos.scale * t.scale;
      const finalRotation = layoutPos.rotation + t.rotation;
      const hasTransform =
        finalX !== 0 || finalY !== 0 || finalScale !== 1 || finalRotation !== 0;

      if (layer.opacity < 1) {
        code += `  K.opacity(${layer.opacity});\n`;
      }
      if (layer.blendMode !== "source-over") {
        code += `  K.blendMode("${layer.blendMode}");\n`;
      }
      if (hasTransform) {
        code += `  K.translate(K.width * ${(finalX * 0.5).toFixed(3)}, K.height * ${(finalY * 0.5).toFixed(3)});\n`;
        if (finalRotation !== 0) {
          code += `  K.rotate(${finalRotation.toFixed(3)});\n`;
        }
        if (finalScale !== 1) {
          code += `  K.scale(${finalScale.toFixed(3)}, ${finalScale.toFixed(3)});\n`;
        }
      }
      code += algo.toCode(layer.params);
      return code;
    })
    .filter(Boolean)
    .join("\n\n");

  return `import { Klint, useKlint } from "@shopify/klint";

function MySketch() {
  const { context } = useKlint();

  const draw = (K) => {
    K.background("${background}");

${layerCode}
  };

  return (
    <Klint
      context={context}
      draw={draw}
      options={{ origin: "center" }}
    />
  );
}`;
}
