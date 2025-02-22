import { useCallback } from "react";
import type { KlintContext, KlintMouse } from "../component/KlintTypes";

export const useMouse = (
  mouseRef: React.RefObject<KlintMouse>,
  contextRef: React.RefObject<KlintContext>,
  containerRef: React.RefObject<HTMLDivElement>
) => {
  return useCallback(
    (clientX: number, clientY: number) => {
      if (!contextRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const context = contextRef.current;
      const dpr = context.__dpr;
      const mouse = mouseRef.current;
      const origin = context.__canvasOrigin;

      if (mouse) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x =
          origin === "center"
            ? (clientX - rect.left) * dpr - context.canvas.width / 2
            : (clientX - rect.left) * dpr;
        mouse.y =
          origin === "center"
            ? (clientY - rect.top) * dpr - context.canvas.height / 2
            : (clientY - rect.top) * dpr;
        mouse.vx = mouse.x - mouse.px;
        mouse.vy = mouse.y - mouse.py;
        mouse.angle = Number(
          ((Math.atan2(mouse.vy, mouse.vx) * 180) / Math.PI).toFixed(4)
        );

        contextRef.current.mouse = mouse;
      }
    },
    [mouseRef, contextRef, containerRef]
  );
};
