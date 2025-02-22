import { RefObject } from "react";
import { KlintContext, KlintMouse, KlintScroll } from "../component/KlintTypes";
import { useMouse } from "./useMouse";
import { useScroll } from "./useScroll";

type EventCallbacks = {
  onMouseIn?: (context: KlintContext) => void;
  onMouseOut?: (context: KlintContext) => void;
  onClick?: (context: KlintContext) => void;
  onScroll?: (
    context: KlintContext,
    scrollData: { distance: number; velocity: number }
  ) => void;
  onKeyPressed?: (context: KlintContext, key: string) => void;
  onRelease?: (context: KlintContext) => void;
};

export const useEventHandlers = (
  mouseRef: RefObject<KlintMouse>,
  contextRef: RefObject<KlintContext>,
  containerRef: RefObject<HTMLDivElement>,
  callbacks: EventCallbacks,
  scrollRef: RefObject<KlintScroll>
) => {
  const updateMousePosition = useMouse(mouseRef, contextRef, containerRef);
  const updateScroll = useScroll(scrollRef, contextRef, callbacks.onScroll);

  return {
    move: (e: Event) => {
      if (!mouseRef.current) return;
      const event = e as MouseEvent | TouchEvent;
      const { clientX, clientY } =
        event instanceof TouchEvent ? event.touches[0] : event;
      updateMousePosition(clientX, clientY);
      if (event instanceof TouchEvent) event.preventDefault();
    },
    down: () => mouseRef.current && (mouseRef.current.isPressed = true),
    up: () => mouseRef.current && (mouseRef.current.isPressed = false),
    enter: () => {
      if (!mouseRef.current) return;
      mouseRef.current.isHover = true;
      if (contextRef.current) callbacks.onMouseIn?.(contextRef.current);
    },
    leave: () => {
      if (!mouseRef.current) return;
      mouseRef.current.isHover = false;
      if (contextRef.current) callbacks.onMouseOut?.(contextRef.current);
    },
    click: () => {
      if (contextRef.current) callbacks.onClick?.(contextRef.current);
    },
    scroll: (e: Event) => {
      const wheel = e as WheelEvent;
      updateScroll(wheel);
      wheel.preventDefault();
    },
    keypress: (e: Event) => {
      const event = e as KeyboardEvent;
      if (contextRef.current)
        callbacks.onKeyPressed?.(contextRef.current, event.key);
    },
    release: () => {
      if (contextRef.current) callbacks.onRelease?.(contextRef.current);
    },
  };
};
