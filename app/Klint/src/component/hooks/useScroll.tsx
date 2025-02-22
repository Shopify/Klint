import { useCallback } from "react";
import type { KlintContext, KlintScroll } from "../KlintTypes";

export const useScroll = (
  scrollRef: React.RefObject<KlintScroll>,
  contextRef: React.RefObject<KlintContext>,
  onScroll?: (
    context: KlintContext,
    scrollData: { distance: number; velocity: number }
  ) => void
) => {
  return useCallback(
    (wheel: WheelEvent) => {
      if (!scrollRef.current || !contextRef.current) return;

      const now = performance.now();
      const deltaTime = now - scrollRef.current.lastTime;
      const spring = 0.3;
      const damping = 0.75;
      const epsilon = 0.075;

      scrollRef.current.velocity =
        deltaTime > 0
          ? (wheel.deltaY / deltaTime) * spring +
            scrollRef.current.velocity * damping
          : scrollRef.current.velocity * damping;

      if (Math.abs(scrollRef.current.velocity) < epsilon) {
        scrollRef.current.velocity = 0;
      }

      scrollRef.current.distance += scrollRef.current.velocity;
      scrollRef.current.lastTime = now;

      if (Math.abs(wheel.deltaY) < 0.01) {
        scrollRef.current.velocity *= damping;
      }

      onScroll?.(contextRef.current, {
        distance: Math.min(
          Math.max(scrollRef.current.distance, -100000),
          100000
        ),
        velocity: Math.abs(scrollRef.current.velocity),
      });
    },
    [scrollRef, contextRef, onScroll]
  );
};
