import React, { memo, useMemo, useRef } from "react";
import { Klint, useKlint, type KlintContext, type KlintCanvasOptions } from "@shopify/klint";
import { evaluateCode } from "./evaluateCode";

interface KlintCanvasProps {
  source: string;
  options?: KlintCanvasOptions;
  onError: (error: string) => void;
}

export default memo(function KlintCanvas({ source, options, onError }: KlintCanvasProps) {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  const errorRef = useRef(false);

  // Evaluate with mouse in scope so user code can reference `mouse` directly,
  // matching the real KlintMouse hook API (mouse.x, mouse.isPressed, etc.).
  // mouse is a stable mutable ref — safe to omit from deps.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const userCode = useMemo(() => {
    errorRef.current = false;
    const result = evaluateCode(source, { mouse });
    if (result.error) {
      onError(result.error);
      return null;
    }
    return result.code;
  }, [source]);

  if (!userCode) return null;

  const wrappedDraw = userCode.draw
    ? (K: KlintContext) => {
        if (errorRef.current) return;
        try {
          userCode.draw!(K);
        } catch (err) {
          errorRef.current = true;
          onError(err instanceof Error ? err.message : String(err));
        }
      }
    : undefined;

  const wrappedSetup = userCode.setup
    ? (K: KlintContext) => {
        if (errorRef.current) return;
        try {
          userCode.setup!(K);
        } catch (err) {
          errorRef.current = true;
          onError(err instanceof Error ? err.message : String(err));
        }
      }
    : undefined;

  const wrappedPreload = userCode.preload
    ? async (K: KlintContext) => {
        if (errorRef.current) return;
        try {
          await userCode.preload!(K);
        } catch (err) {
          errorRef.current = true;
          onError(err instanceof Error ? err.message : String(err));
        }
      }
    : undefined;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Klint
        context={context}
        draw={wrappedDraw}
        setup={wrappedSetup}
        preload={wrappedPreload}
        options={{ ...options, unsafemode: true }}
      />
    </div>
  );
});
