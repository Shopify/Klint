import React, { memo } from "react";
import { Klint, type KlintContext } from "@shopify/klint";

interface StudioCanvasProps {
  context: { context: any; initCoreContext: any };
  draw: (K: KlintContext) => void;
}

export default memo(function StudioCanvas({ context, draw }: StudioCanvasProps) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Klint
        context={context}
        draw={draw}
        options={{ unsafemode: "true", origin: "center" }}
      />
    </div>
  );
});
