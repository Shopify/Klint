import { useCallback, useRef } from "react";
import { KlintContext } from "../KlintTypes";

const DEFAULT_FPS = 60;

export function useAnimate(
  contextRef: React.RefObject<KlintContext | null>,
  draw: (context: KlintContext) => void,
  isVisible: boolean
) {
  const animationFrameId = useRef<number>();

  const animate = useCallback(() => {
    if (!contextRef.current || !isVisible) return;
    if (!contextRef.current.__isReadyToDraw) return;
    if (!contextRef.current.__isPlaying) {
      animationFrameId.current = requestAnimationFrame(animate);
      return;
    }

    const context = contextRef.current;
    const now = performance.now();
    const target = 1000 / context.fps;

    if (!context.__lastTargetTime) {
      context.__lastTargetTime = now;
      context.__lastRealTime = now;
    }

    const sinceLast = now - context.__lastTargetTime;
    const epsilon = 5;

    if (sinceLast >= target - epsilon) {
      context.deltaTime = now - context.__lastRealTime;
      draw(context);
      if (context.time > 1e7) context.time = 0;
      if (context.frame > 1e7) context.frame = 0;
      context.time += context.deltaTime / DEFAULT_FPS;
      context.frame++;
      context.__lastTargetTime = Math.max(
        context.__lastTargetTime + target,
        now
      );
      context.__lastRealTime = now;
    }

    animationFrameId.current = requestAnimationFrame(animate);
  }, [draw, isVisible, contextRef]);

  return {
    animate,
    animationFrameId,
  };
}
