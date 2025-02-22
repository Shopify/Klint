import { RefObject } from "react";
import { KlintContext, KlintMouse, KlintScroll } from "../component/KlintTypes";

export function useEventHandlers(
  mouseRef: RefObject<KlintMouse>,
  contextRef: RefObject<KlintContext>,
  containerRef: RefObject<HTMLDivElement>,
  callbacks: {
    onScroll?: () => void;
    onKeyPressed?: (key: string) => void;
  },
  scrollRef: RefObject<KlintScroll>
) {
  const scroll = (e: WheelEvent) => {
    if (!scrollRef.current) return;
    const now = performance.now();
    const deltaTime = now - scrollRef.current.lastTime;
    scrollRef.current.distance += e.deltaY;
    scrollRef.current.velocity = deltaTime > 0 ? e.deltaY / deltaTime : 0;
    scrollRef.current.lastTime = now;
    callbacks.onScroll?.();
  };

  const keypress = (e: KeyboardEvent) => {
    callbacks.onKeyPressed?.(e.key);
  };

  return {
    scroll,
    keypress,
  };
}
