import { useRef, useCallback, useEffect, useMemo } from "react";
import { createKlintContext } from "./KlintContext";
import type Vector from "./elements/Vector";
import type {
  KlintCanvasOptions,
  KlintContext,
  KlintContextWrapper,
  KlintKeyboardState,
  KlintPointerState,
  KlintScrollState,
} from "./KlintTypes";

// Export Vector type as KlintVector
export type KlintVector = Vector;

export type KlintMouse = KlintPointerState;

const DEFAULT_MOUSE_STATE: KlintMouse = {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  vx: 0,
  vy: 0,
  angle: 0,
  isPressed: false,
  isHover: false,
};

export type KlintScroll = KlintScrollState;

const DEFAULT_SCROLL_STATE: KlintScroll = {
  distance: 0,
  velocity: 0,
  lastTime: 0,
};

export interface KlintGesture {
  active: boolean;
  touches: TouchList | null;
  startTouches: TouchList | null;
  startDistance: number;
  currentDistance: number;
  scale: number;
  rotation: number;
  startTime: number;
  startX: number;
  startY: number;
  startRotation: number;
  deltaX: number;
  deltaY: number;
  totalX: number;
  totalY: number;
  velocityX: number;
  velocityY: number;
  lastTime: number;
  lastX: number;
  lastY: number;
}

const DEFAULT_GESTURE_STATE: KlintGesture = {
  active: false,
  touches: null,
  startTouches: null,
  startDistance: 0,
  currentDistance: 0,
  scale: 1,
  rotation: 0,
  startTime: 0,
  startX: 0,
  startY: 0,
  startRotation: 0,
  deltaX: 0,
  deltaY: 0,
  totalX: 0,
  totalY: 0,
  velocityX: 0,
  velocityY: 0,
  lastTime: 0,
  lastX: 0,
  lastY: 0,
};

export type KlintKeyboard = KlintKeyboardState;

const DEFAULT_KEYBOARD_STATE: KlintKeyboard = {
  pressedKeys: new Set(),
  modifiers: {
    alt: false,
    shift: false,
    ctrl: false,
    meta: false,
  },
  lastKey: null,
  lastKeyTime: 0,
};

export default function useKlint() {
  const contextRef = useRef<KlintContext | null>(null);
  const mouseRef = useRef<KlintMouse | null>(null);
  const scrollRef = useRef<KlintScroll | null>(null);
  const gestureRef = useRef<KlintGesture | null>(null);
  const keyboardRef = useRef<KlintKeyboard | null>(null);
  const contextSubscribersRef = useRef(
    new Set<(context: KlintContext | null) => void>(),
  );

  const subscribeContext = useCallback(
    (listener: (context: KlintContext | null) => void) => {
      contextSubscribersRef.current.add(listener);
      return () => contextSubscribersRef.current.delete(listener);
    },
    [],
  );

  const notifyContextSubscribers = useCallback((value: KlintContext | null) => {
    contextSubscribersRef.current.forEach((listener) => listener(value));
  }, []);

  const useDev = () => {
    // Re-enable drawing on every render when a sketch opts into HMR support.
    useEffect(() => {
      if (contextRef.current) contextRef.current.__isReadyToDraw = true;
    });
  };

  const KlintImage = () => {
    const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    const loadImage = useCallback(
      async (
        key: string,
        url: string,
        options?: { crossOrigin?: string },
      ): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            imagesRef.current.set(key, img);
            resolve(img);
          };
          img.onerror = reject;
          // Set crossOrigin to 'anonymous' by default
          img.crossOrigin = options?.crossOrigin || "anonymous";
          img.src = url;
        });
      },
      [],
    );

    const loadImages = useCallback(
      async (
        imageMap: Record<string, string>,
        options?: { crossOrigin?: string },
      ): Promise<Map<string, HTMLImageElement>> => {
        const promises = Object.entries(imageMap).map(([key, url]) =>
          loadImage(key, url, options).then(
            (img: HTMLImageElement) => [key, img] as [string, HTMLImageElement],
          ),
        );

        const results = await Promise.all(promises);
        return new Map(results);
      },
      [loadImage],
    );

    // Proxy to allow both images['key'] and images.get('key') access patterns
    const imagesProxy = useMemo(() => {
      return new Proxy({} as Record<string, HTMLImageElement>, {
        get: (_, prop) => {
          if (prop === "get") {
            return (key: string) => imagesRef.current.get(key);
          }
          if (typeof prop === "string") {
            return imagesRef.current.get(prop);
          }
          return undefined;
        },
        has: (_, prop) => {
          if (typeof prop === "string") {
            return imagesRef.current.has(prop);
          }
          return false;
        },
      });
    }, []);

    return {
      images: imagesProxy,
      loadImage,
      loadImages,
      getImage: useCallback((key: string) => imagesRef.current.get(key), []),
      hasImage: useCallback((key: string) => imagesRef.current.has(key), []),
      clearImages: useCallback(() => imagesRef.current.clear(), []),
    };
  };

  const KlintMouse = () => {
    if (!mouseRef.current) mouseRef.current = { ...DEFAULT_MOUSE_STATE };

    type PointerCallback = (ctx: KlintContext, event: PointerEvent) => void;
    const clickCallbackRef = useRef<PointerCallback | null>(null);
    const mouseInCallbackRef = useRef<PointerCallback | null>(null);
    const mouseOutCallbackRef = useRef<PointerCallback | null>(null);
    const mouseDownCallbackRef = useRef<PointerCallback | null>(null);
    const mouseUpCallbackRef = useRef<PointerCallback | null>(null);

    useEffect(() => {
      let controller: AbortController | undefined;
      const attach = (nextContext: KlintContext | null) => {
        controller?.abort();
        if (!nextContext) return;
        const canvas = nextContext.canvas;
        const ctx = nextContext;
        ctx.mouse = mouseRef.current!;
        controller = new AbortController();
        const { signal } = controller;

      const updateMousePosition = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (!mouseRef.current || rect.width === 0 || rect.height === 0) return;

        // Drawing coordinates are logical pixels. The ratio accounts for a
        // transformed/scaled canvas without exposing backing-store pixels.
        let x = (event.clientX - rect.left) * (ctx.width / rect.width);
        let y = (event.clientY - rect.top) * (ctx.height / rect.height);
        if (ctx.__canvasOrigin === "center") {
          x -= ctx.width * 0.5;
          y -= ctx.height * 0.5;
        }

        const mouse = mouseRef.current;
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = x;
        mouse.y = y;
        mouse.vx = x - mouse.px;
        mouse.vy = y - mouse.py;
        mouse.angle = Math.atan2(mouse.vy, mouse.vx);
      };

      const handlePointerDown = (event: PointerEvent) => {
        updateMousePosition(event);
        mouseRef.current!.isPressed = true;
        canvas.focus({ preventScroll: true });
        canvas.setPointerCapture?.(event.pointerId);
        mouseDownCallbackRef.current?.(ctx, event);
      };

      const handlePointerUp = (event: PointerEvent) => {
        updateMousePosition(event);
        mouseRef.current!.isPressed = false;
        if (canvas.hasPointerCapture?.(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
        mouseUpCallbackRef.current?.(ctx, event);
      };

      const handlePointerCancel = (event: PointerEvent) => {
        mouseRef.current!.isPressed = false;
        mouseUpCallbackRef.current?.(ctx, event);
      };

      const handlePointerEnter = (event: PointerEvent) => {
        updateMousePosition(event);
        mouseRef.current!.isHover = true;
        mouseInCallbackRef.current?.(ctx, event);
      };

      const handlePointerLeave = (event: PointerEvent) => {
        updateMousePosition(event);
        mouseRef.current!.isHover = false;
        mouseOutCallbackRef.current?.(ctx, event);
      };

      const handleClick = (event: PointerEvent) => {
        updateMousePosition(event);
        clickCallbackRef.current?.(ctx, event);
      };

      canvas.addEventListener("pointermove", updateMousePosition, { signal });
      canvas.addEventListener("pointerdown", handlePointerDown, { signal });
      canvas.addEventListener("pointerup", handlePointerUp, { signal });
      canvas.addEventListener("pointercancel", handlePointerCancel, { signal });
      canvas.addEventListener("pointerenter", handlePointerEnter, { signal });
      canvas.addEventListener("pointerleave", handlePointerLeave, { signal });
      canvas.addEventListener("click", handleClick, { signal });
      };

      const unsubscribe = subscribeContext(attach);
      attach(contextRef.current);
      return () => {
        unsubscribe();
        controller?.abort();
      };
    }, []);

    return {
      mouse: mouseRef.current,
      onClick: (callback: PointerCallback) => (clickCallbackRef.current = callback),
      onMouseIn: (callback: PointerCallback) =>
        (mouseInCallbackRef.current = callback),
      onMouseOut: (callback: PointerCallback) =>
        (mouseOutCallbackRef.current = callback),
      onMouseDown: (callback: PointerCallback) =>
        (mouseDownCallbackRef.current = callback),
      onMouseUp: (callback: PointerCallback) =>
        (mouseUpCallbackRef.current = callback),
    };
  };

  const KlintScroll = () => {
    if (!scrollRef.current) {
      scrollRef.current = { ...DEFAULT_SCROLL_STATE };
    }
    const scrollCallbackRef = useRef<
      ((ctx: KlintContext, scroll: KlintScroll, e: WheelEvent) => void) | null
    >(null);

    useEffect(() => {
      let controller: AbortController | undefined;
      const attach = (nextContext: KlintContext | null) => {
        controller?.abort();
        if (!nextContext) return;
        const canvas = nextContext.canvas;
        const ctx = nextContext;
        ctx.scroll = scrollRef.current!;
        controller = new AbortController();
        const { signal } = controller;

      const handleScroll = (event: WheelEvent) => {
        event.preventDefault();
        if (!scrollRef.current) return;

        const unit =
          event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? 16
            : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
              ? Math.max(ctx.height, 1)
              : 1;
        const delta = event.deltaY * unit;
        const currentTime = performance.now();
        const deltaTime = scrollRef.current.lastTime
          ? currentTime - scrollRef.current.lastTime
          : 0;

        scrollRef.current.distance += delta;
        scrollRef.current.velocity = deltaTime > 0 ? delta / deltaTime : 0;
        scrollRef.current.lastTime = currentTime;
        scrollCallbackRef.current?.(ctx, scrollRef.current, event);
      };

      canvas.addEventListener("wheel", handleScroll, {
        signal,
        passive: false,
      });
      };

      const unsubscribe = subscribeContext(attach);
      attach(contextRef.current);
      return () => {
        unsubscribe();
        controller?.abort();
      };
    }, []);

    return {
      scroll: scrollRef.current,
      onScroll: (
        callback: (
          ctx: KlintContext,
          scroll: KlintScroll,
          e: WheelEvent,
        ) => void,
      ) => (scrollCallbackRef.current = callback),
    };
  };

  const KlintGesture = () => {
    if (!gestureRef.current) {
      gestureRef.current = { ...DEFAULT_GESTURE_STATE };
    }

    const tapCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);
    const swipeCallbackRef = useRef<
      | ((
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
          direction: "left" | "right" | "up" | "down",
        ) => void)
      | null
    >(null);
    const pinchCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);
    const rotateCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);
    const touchStartCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);
    const touchMoveCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);
    const touchEndCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);
    const touchCancelCallbackRef = useRef<
      ((ctx: KlintContext, e: TouchEvent, gesture: KlintGesture) => void) | null
    >(null);

    useEffect(() => {
      let controller: AbortController | undefined;
      const attach = (nextContext: KlintContext | null) => {
        controller?.abort();
        if (!nextContext) return;
        const canvas = nextContext.canvas;
        const ctx = nextContext;

      const getDistance = (first: Touch, second: Touch): number =>
        Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);

      const getAngle = (first: Touch, second: Touch): number =>
        (Math.atan2(
          second.clientY - first.clientY,
          second.clientX - first.clientX,
        ) *
          180) /
        Math.PI;

      const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
        const rect = canvas.getBoundingClientRect();
        let sumX = 0;
        let sumY = 0;
        for (let index = 0; index < touches.length; index++) {
          sumX += touches[index].clientX;
          sumY += touches[index].clientY;
        }
        const count = Math.max(1, touches.length);
        let x = (sumX / count - rect.left) * (ctx.width / Math.max(rect.width, 1));
        let y = (sumY / count - rect.top) * (ctx.height / Math.max(rect.height, 1));
        if (ctx.__canvasOrigin === "center") {
          x -= ctx.width * 0.5;
          y -= ctx.height * 0.5;
        }
        return { x, y };
      };

      const handleTouchStart = (event: TouchEvent) => {
        event.preventDefault();
        const gesture = gestureRef.current;
        if (!gesture || event.touches.length === 0) return;

        const now = performance.now();
        const center = getTouchCenter(event.touches);
        gesture.active = true;
        gesture.touches = event.touches;
        gesture.startTouches = event.touches;
        gesture.startTime = now;
        gesture.lastTime = now;
        gesture.startX = gesture.lastX = center.x;
        gesture.startY = gesture.lastY = center.y;
        gesture.deltaX = gesture.deltaY = 0;
        gesture.totalX = gesture.totalY = 0;
        gesture.velocityX = gesture.velocityY = 0;
        gesture.scale = 1;
        gesture.rotation = 0;

        if (event.touches.length >= 2) {
          gesture.startDistance = getDistance(event.touches[0], event.touches[1]);
          gesture.currentDistance = gesture.startDistance;
          gesture.startRotation = getAngle(event.touches[0], event.touches[1]);
        }

        touchStartCallbackRef.current?.(ctx, event, gesture);
      };

      const handleTouchMove = (event: TouchEvent) => {
        event.preventDefault();
        const gesture = gestureRef.current;
        if (!gesture?.active || event.touches.length === 0) return;

        const now = performance.now();
        const deltaTime = now - gesture.lastTime;
        const center = getTouchCenter(event.touches);
        gesture.touches = event.touches;
        gesture.deltaX = center.x - gesture.lastX;
        gesture.deltaY = center.y - gesture.lastY;
        gesture.totalX = center.x - gesture.startX;
        gesture.totalY = center.y - gesture.startY;
        if (deltaTime > 0) {
          gesture.velocityX = gesture.deltaX / deltaTime;
          gesture.velocityY = gesture.deltaY / deltaTime;
        }
        gesture.lastTime = now;
        gesture.lastX = center.x;
        gesture.lastY = center.y;

        if (event.touches.length >= 2) {
          gesture.currentDistance = getDistance(event.touches[0], event.touches[1]);
          if (gesture.startDistance > 0) {
            gesture.scale = gesture.currentDistance / gesture.startDistance;
          }
          gesture.rotation =
            getAngle(event.touches[0], event.touches[1]) - gesture.startRotation;
          pinchCallbackRef.current?.(ctx, event, gesture);
          if (Math.abs(gesture.rotation) > 5) {
            rotateCallbackRef.current?.(ctx, event, gesture);
          }
        }

        touchMoveCallbackRef.current?.(ctx, event, gesture);
      };

      const handleTouchEnd = (event: TouchEvent) => {
        const gesture = gestureRef.current;
        if (!gesture?.active) return;

        const duration = performance.now() - gesture.startTime;
        if (duration < 300 && Math.hypot(gesture.totalX, gesture.totalY) < 10) {
          tapCallbackRef.current?.(ctx, event, gesture);
        }

        const horizontal = Math.abs(gesture.totalX) > Math.abs(gesture.totalY);
        if (swipeCallbackRef.current && duration < 500) {
          if (horizontal && Math.abs(gesture.totalX) > 50) {
            swipeCallbackRef.current(
              ctx,
              event,
              gesture,
              gesture.totalX > 0 ? "right" : "left",
            );
          } else if (!horizontal && Math.abs(gesture.totalY) > 50) {
            swipeCallbackRef.current(
              ctx,
              event,
              gesture,
              gesture.totalY > 0 ? "down" : "up",
            );
          }
        }

        touchEndCallbackRef.current?.(ctx, event, gesture);
        if (event.touches.length === 0) gesture.active = false;
      };

      const handleTouchCancel = (event: TouchEvent) => {
        const gesture = gestureRef.current;
        if (!gesture) return;
        gesture.active = false;
        touchCancelCallbackRef.current?.(ctx, event, gesture);
      };

      controller = new AbortController();
      const { signal } = controller;

      canvas.addEventListener("touchstart", handleTouchStart, {
        passive: false,
        signal,
      });
      canvas.addEventListener("touchmove", handleTouchMove, {
        passive: false,
        signal,
      });
      canvas.addEventListener("touchend", handleTouchEnd, { signal });
      canvas.addEventListener("touchcancel", handleTouchCancel, { signal });
      };

      const unsubscribe = subscribeContext(attach);
      attach(contextRef.current);
      return () => {
        unsubscribe();
        controller?.abort();
      };
    }, []);

    return {
      gesture: gestureRef.current,
      onTap: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (tapCallbackRef.current = callback),
      onSwipe: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
          direction: "left" | "right" | "up" | "down",
        ) => void,
      ) => (swipeCallbackRef.current = callback),
      onPinch: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (pinchCallbackRef.current = callback),
      onRotate: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (rotateCallbackRef.current = callback),
      onTouchStart: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (touchStartCallbackRef.current = callback),
      onTouchMove: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (touchMoveCallbackRef.current = callback),
      onTouchEnd: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (touchEndCallbackRef.current = callback),
      onTouchCancel: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
        ) => void,
      ) => (touchCancelCallbackRef.current = callback),
    };
  };

  const KlintKeyboard = () => {
    if (!keyboardRef.current) {
      keyboardRef.current = { ...DEFAULT_KEYBOARD_STATE };
    }

    const keyPressedCallbackRef = useRef<
      Map<string, (ctx: KlintContext, e: KeyboardEvent) => void>
    >(new Map());
    const keyReleasedCallbackRef = useRef<
      Map<string, (ctx: KlintContext, e: KeyboardEvent) => void>
    >(new Map());
    const keyComboCallbackRef = useRef<
      Map<string, (ctx: KlintContext, e: KeyboardEvent) => void>
    >(new Map());

    const normalizeKey = (key: string): string => {
      const keyMap: Record<string, string> = {
        " ": "Space",
        Control: "Ctrl",
        Escape: "Esc",
      };
      return keyMap[key] || key;
    };

    const createComboKey = (keys: string[]): string => {
      return keys.map(normalizeKey).sort().join("+");
    };

    useEffect(() => {
      let controller: AbortController | undefined;
      const attach = (nextContext: KlintContext | null) => {
        controller?.abort();
        if (!nextContext) return;
        const ctx = nextContext;
        const canvas = ctx.canvas;
        ctx.keyboard = keyboardRef.current!;
        controller = new AbortController();
        const { signal } = controller;

      const updateModifiers = (e: KeyboardEvent) => {
        if (!keyboardRef.current) return;
        keyboardRef.current.modifiers.alt = e.altKey;
        keyboardRef.current.modifiers.shift = e.shiftKey;
        keyboardRef.current.modifiers.ctrl = e.ctrlKey;
        keyboardRef.current.modifiers.meta = e.metaKey;
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (!keyboardRef.current) return;

        const normalizedKey = normalizeKey(e.key);

        // Update state
        keyboardRef.current.pressedKeys.add(normalizedKey);
        keyboardRef.current.lastKey = normalizedKey;
        keyboardRef.current.lastKeyTime = performance.now();
        updateModifiers(e);

        // Check for individual key callbacks
        const keyCallback = keyPressedCallbackRef.current.get(normalizedKey);
        if (keyCallback) {
          keyCallback(ctx, e);
        }

        // Check for combination callbacks
        const pressedKeysArray = Array.from(
          keyboardRef.current.pressedKeys,
        ).sort();
        const comboKey = pressedKeysArray.join("+");
        const comboCallback = keyComboCallbackRef.current.get(comboKey);
        if (comboCallback) {
          comboCallback(ctx, e);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (!keyboardRef.current) return;

        const normalizedKey = normalizeKey(e.key);

        // Update state
        keyboardRef.current.pressedKeys.delete(normalizedKey);
        updateModifiers(e);

        // Check for individual key callbacks
        const keyCallback = keyReleasedCallbackRef.current.get(normalizedKey);
        if (keyCallback) {
          keyCallback(ctx, e);
        }
      };

      const clearPressedKeys = () => {
        if (!keyboardRef.current) return;
        keyboardRef.current.pressedKeys.clear();
        keyboardRef.current.modifiers = {
          alt: false,
          shift: false,
          ctrl: false,
          meta: false,
        };
      };

      // Keyboard input is scoped to the focusable canvas instead of capturing
      // keys globally from forms and assistive-technology controls.
      canvas.addEventListener("keydown", handleKeyDown, { signal });
      canvas.addEventListener("keyup", handleKeyUp, { signal });
      canvas.addEventListener("blur", clearPressedKeys, { signal });
      window.addEventListener("blur", clearPressedKeys, { signal });
      };

      const unsubscribe = subscribeContext(attach);
      attach(contextRef.current);
      return () => {
        unsubscribe();
        controller?.abort();
      };
    }, []);

    return {
      keyboard: keyboardRef.current,

      // Register callback for single key press
      keyPressed: (
        key: string,
        callback: (ctx: KlintContext, e: KeyboardEvent) => void,
      ) => {
        keyPressedCallbackRef.current.set(normalizeKey(key), callback);
      },

      // Register callback for single key release
      keyReleased: (
        key: string,
        callback: (ctx: KlintContext, e: KeyboardEvent) => void,
      ) => {
        keyReleasedCallbackRef.current.set(normalizeKey(key), callback);
      },

      // Register callback for key combination (e.g., ['Alt', 'Shift'])
      keyCombo: (
        keys: string[],
        callback: (ctx: KlintContext, e: KeyboardEvent) => void,
      ) => {
        const comboKey = createComboKey(keys);
        keyComboCallbackRef.current.set(comboKey, callback);
      },

      // Utility functions
      isPressed: (key: string): boolean => {
        return keyboardRef.current?.pressedKeys.has(normalizeKey(key)) || false;
      },

      arePressed: (keys: string[]): boolean => {
        if (!keyboardRef.current) return false;
        return keys.every((key) =>
          keyboardRef.current!.pressedKeys.has(normalizeKey(key)),
        );
      },

      // Clear all callbacks
      clearCallbacks: () => {
        keyPressedCallbackRef.current.clear();
        keyReleasedCallbackRef.current.clear();
        keyComboCallbackRef.current.clear();
      },
    };
  };

  const KlintWindow = () => {
    const resizeCallbackRef = useRef<((ctx: KlintContext) => void) | null>(
      null,
    );
    const blurCallbackRef = useRef<((ctx: KlintContext) => void) | null>(null);
    const focusCallbackRef = useRef<((ctx: KlintContext) => void) | null>(null);
    const visibilityChangeCallbackRef = useRef<
      ((ctx: KlintContext, isVisible: boolean) => void) | null
    >(null);

    useEffect(() => {
      let controller: AbortController | undefined;
      const attach = (nextContext: KlintContext | null) => {
        controller?.abort();
        if (!nextContext) return;
        const ctx = nextContext;
        controller = new AbortController();
        const { signal } = controller;

      const handleResize = () => {
        if (resizeCallbackRef.current) resizeCallbackRef.current(ctx);
      };

      const handleBlur = () => {
        if (blurCallbackRef.current) blurCallbackRef.current(ctx);
      };

      const handleFocus = () => {
        if (focusCallbackRef.current) focusCallbackRef.current(ctx);
      };

      const handleVisibilityChange = () => {
        const isVisible = document.visibilityState === "visible";
        if (visibilityChangeCallbackRef.current) {
          visibilityChangeCallbackRef.current(ctx, isVisible);
        }
      };

      window.addEventListener("resize", handleResize, { signal });
      window.addEventListener("blur", handleBlur, { signal });
      window.addEventListener("focus", handleFocus, { signal });
      document.addEventListener("visibilitychange", handleVisibilityChange, {
        signal,
      });
      };

      const unsubscribe = subscribeContext(attach);
      attach(contextRef.current);
      return () => {
        unsubscribe();
        controller?.abort();
      };
    }, []);

    return {
      onResize: (callback: (ctx: KlintContext) => void) =>
        (resizeCallbackRef.current = callback),
      onBlur: (callback: (ctx: KlintContext) => void) =>
        (blurCallbackRef.current = callback),
      onFocus: (callback: (ctx: KlintContext) => void) =>
        (focusCallbackRef.current = callback),
      onVisibilityChange: (
        callback: (ctx: KlintContext, isVisible: boolean) => void,
      ) => (visibilityChangeCallbackRef.current = callback),
    };
  };

  const initCoreContext = useCallback(
    (canvas: HTMLCanvasElement, options: KlintCanvasOptions): KlintContext => {
      if (contextRef.current?.canvas !== canvas) {
        if (contextRef.current) {
          contextRef.current.__isPlaying = false;
          contextRef.current.__offscreens.clear();
        }
        contextRef.current = createKlintContext(canvas, options);
        notifyContextSubscribers(contextRef.current);
      }
      return contextRef.current;
    },
    [notifyContextSubscribers],
  );

  const releaseCoreContext = useCallback((canvas: HTMLCanvasElement) => {
    if (contextRef.current?.canvas !== canvas) return;
    contextRef.current.__isPlaying = false;
    contextRef.current.__offscreens.clear();
    contextRef.current = null;
    notifyContextSubscribers(null);
  }, [notifyContextSubscribers]);

  const context = useMemo<KlintContextWrapper>(
    () => ({
      get context() {
        return contextRef.current;
      },
      initCoreContext,
      releaseCoreContext,
      subscribe: subscribeContext,
    }),
    [initCoreContext, releaseCoreContext, subscribeContext],
  );

  const togglePlay = useCallback((playing?: boolean) => {
    if (!contextRef.current) return;

    if (playing !== undefined) {
      contextRef.current.__isPlaying = playing;
    } else {
      contextRef.current.__isPlaying = !contextRef.current.__isPlaying;
    }
  }, []);

  return {
    context,
    KlintMouse,
    KlintScroll,
    KlintGesture,
    KlintKeyboard,
    KlintWindow,
    KlintImage,
    useMouse: KlintMouse,
    useScroll: KlintScroll,
    useGesture: KlintGesture,
    useKeyboard: KlintKeyboard,
    useWindow: KlintWindow,
    useImage: KlintImage,
    togglePlay,
    useDev,
  };
}

export const useProps = <T extends object = Record<string, unknown>>(
  props: T,
) => {
  const propsRef = useRef<T>(props);

  // Update ref when props change
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const get = useCallback(<K extends keyof T>(key: K): T[K] => {
    return propsRef.current[key];
  }, []);

  const has = useCallback(<K extends keyof T>(key: K): boolean => {
    return key in propsRef.current;
  }, []);

  return {
    get,
    has,
    props: propsRef.current,
  };
};

export const useStorage = <T extends object = Record<string, unknown>>(
  initialProps: T = {} as T,
) => {
  const storeRef = useRef<T>(initialProps);

  const get = useCallback(<K extends keyof T>(key: K): T[K] => {
    return storeRef.current[key];
  }, []);

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]): void => {
    storeRef.current[key] = value;
  }, []);

  const has = useCallback(<K extends keyof T>(key: K): boolean => {
    return key in storeRef.current;
  }, []);

  const remove = useCallback(<K extends keyof T>(key: K): void => {
    delete storeRef.current[key];
  }, []);

  return {
    get,
    set,
    has,
    remove,
    store: storeRef.current,
  };
};
