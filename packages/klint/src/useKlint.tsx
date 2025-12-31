import { useRef, useCallback, useEffect, useMemo } from "react";
import { KlintFunctions, KlintCoreFunctions } from "./KlintFunctions";
import { KlintCanvasOptions, KlintContext } from "./Klint";
import {
  Color,
  Vector,
  Easing,
  Text,
  Thing,
  Grid,
  Strip,
  Noise,
  Hotspot,
  Performance,
  SSR,
} from "./elements";

// Export Vector type as KlintVector
export type KlintVector = Vector;

export interface KlintMouse {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  angle: number;
  isPressed: boolean;
  isHover: boolean;
}

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

export interface KlintScroll {
  distance: number;
  velocity: number;
  lastTime: number;
}

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
  deltaX: number;
  deltaY: number;
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
  deltaX: 0,
  deltaY: 0,
  velocityX: 0,
  velocityY: 0,
  lastTime: 0,
  lastX: 0,
  lastY: 0,
};

export interface KlintKeyboard {
  pressedKeys: Set<string>;
  modifiers: {
    alt: boolean;
    shift: boolean;
    ctrl: boolean;
    meta: boolean;
  };
  lastKey: string | null;
  lastKeyTime: number;
}

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

  const useDev = () => {
    useEffect(() => {
      if (process.env.NODE_ENV === "development") {
        if (typeof import.meta !== "undefined" && (import.meta as any).hot) {
          console.log("[Klint] hot updated - clearing non-context state");
          if (contextRef.current) {
            const ctx = contextRef.current;
            ctx.frame = 0;
            ctx.time = 0;
            ctx.__offscreens?.clear();
            ctx.__startedShape = false;
            ctx.__currentShape = null;
            ctx.__startedContour = false;
            ctx.__currentContours = null;
            ctx.__currentContour = null;
            ctx.__isReadyToDraw = true;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          }
        }
      }
    }, []);
    useEffect(() => {
      if (process.env.NODE_ENV === "development" && contextRef.current) {
        console.log("[Klint] hot updated - clearing context state");
        contextRef.current.__isReadyToDraw = true;
      }
    });
  };

  const KlintImage = () => {
    const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    const loadImage = useCallback(
      async (
        key: string,
        url: string,
        options?: { crossOrigin?: string }
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
      []
    );

    const loadImages = useCallback(
      async (
        imageMap: Record<string, string>,
        options?: { crossOrigin?: string }
      ): Promise<Map<string, HTMLImageElement>> => {
        const promises = Object.entries(imageMap).map(([key, url]) =>
          loadImage(key, url, options).then(
            (img: HTMLImageElement) => [key, img] as [string, HTMLImageElement]
          )
        );

        const results = await Promise.all(promises);
        return new Map(results);
      },
      [loadImage]
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
    if (!mouseRef.current) {
      mouseRef.current = { ...DEFAULT_MOUSE_STATE };
    }
    const clickCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseInCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseOutCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseDownCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);
    const mouseUpCallbackRef = useRef<
      ((ctx: KlintContext, e: MouseEvent) => void) | null
    >(null);

    useEffect(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;
      const controller = new AbortController();
      const { signal } = controller;

      const updateMousePosition = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const origin = contextRef.current?.__canvasOrigin || "corner";

        const x =
          origin === "center"
            ? (e.clientX - rect.left) * dpr - canvas.width / 2
            : (e.clientX - rect.left) * dpr;
        const y =
          origin === "center"
            ? (e.clientY - rect.top) * dpr - canvas.height / 2
            : (e.clientY - rect.top) * dpr;

        if (mouseRef.current) {
          mouseRef.current.px = mouseRef.current.x;
          mouseRef.current.py = mouseRef.current.y;
          mouseRef.current.x = x;
          mouseRef.current.y = y;
          mouseRef.current.vx = x - mouseRef.current.px;
          mouseRef.current.vy = y - mouseRef.current.py;
          mouseRef.current.angle = Math.atan2(
            mouseRef.current.vy,
            mouseRef.current.vx
          );
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isPressed = true;
        if (mouseDownCallbackRef.current) mouseDownCallbackRef.current(ctx, e);
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isPressed = false;
        if (mouseUpCallbackRef.current) mouseUpCallbackRef.current(ctx, e);
      };

      const handleMouseEnter = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isHover = true;
        if (mouseInCallbackRef.current) mouseInCallbackRef.current(ctx, e);
      };

      const handleMouseLeave = (e: MouseEvent) => {
        if (mouseRef.current) mouseRef.current.isHover = false;
        if (mouseOutCallbackRef.current) mouseOutCallbackRef.current(ctx, e);
      };

      const handleClick = (e: MouseEvent) => {
        if (clickCallbackRef.current) clickCallbackRef.current(ctx, e);
      };

      canvas.addEventListener("mousemove", updateMousePosition, { signal });
      canvas.addEventListener("mousedown", handleMouseDown, { signal });
      canvas.addEventListener("mouseup", handleMouseUp, { signal });
      canvas.addEventListener("mouseenter", handleMouseEnter, { signal });
      canvas.addEventListener("mouseleave", handleMouseLeave, { signal });
      canvas.addEventListener("click", handleClick, { signal });

      return () => controller.abort();
    });

    return {
      mouse: mouseRef.current,
      onClick: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (clickCallbackRef.current = callback),
      onMouseIn: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseInCallbackRef.current = callback),
      onMouseOut: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseOutCallbackRef.current = callback),
      onMouseDown: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
        (mouseDownCallbackRef.current = callback),
      onMouseUp: (callback: (ctx: KlintContext, e: MouseEvent) => void) =>
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
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;
      const controller = new AbortController();
      const { signal } = controller;

      const handleScroll = (e: WheelEvent) => {
        e.preventDefault();
        if (!scrollRef.current) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - scrollRef.current.lastTime;

        scrollRef.current.distance += e.deltaY;
        scrollRef.current.velocity = deltaTime > 0 ? e.deltaY / deltaTime : 0;
        scrollRef.current.lastTime = currentTime;

        if (scrollCallbackRef.current) {
          scrollCallbackRef.current(ctx, scrollRef.current, e);
        }
      };

      canvas.addEventListener("wheel", handleScroll, { signal });
      return () => controller.abort();
    });

    return {
      scroll: scrollRef.current,
      onScroll: (
        callback: (
          ctx: KlintContext,
          scroll: KlintScroll,
          e: WheelEvent
        ) => void
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
          direction: "left" | "right" | "up" | "down"
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

    useEffect(() => {
      if (!contextRef.current?.canvas) return;
      const canvas = contextRef.current.canvas;
      const ctx = contextRef.current;

      // Calculate distance between two touch points
      const getDistance = (t1: Touch, t2: Touch): number => {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      };

      // Calculate angle/rotation between two touch points
      const getAngle = (t1: Touch, t2: Touch): number => {
        return (
          (Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * 180) /
          Math.PI
        );
      };

      const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
        if (touches.length === 1) {
          return {
            x: touches[0].clientX,
            y: touches[0].clientY,
          };
        }

        let sumX = 0;
        let sumY = 0;

        for (let i = 0; i < touches.length; i++) {
          sumX += touches[i].clientX;
          sumY += touches[i].clientY;
        }

        return {
          x: sumX / touches.length,
          y: sumY / touches.length,
        };
      };

      const handleTouchStart = (e: TouchEvent) => {
        if (!gestureRef.current) return;

        const now = performance.now();
        const touchCenter = getTouchCenter(e.touches);

        gestureRef.current.active = true;
        gestureRef.current.touches = e.touches;
        gestureRef.current.startTouches = e.touches;
        gestureRef.current.startTime = now;
        gestureRef.current.lastTime = now;
        gestureRef.current.lastX = touchCenter.x;
        gestureRef.current.lastY = touchCenter.y;
        gestureRef.current.deltaX = 0;
        gestureRef.current.deltaY = 0;
        gestureRef.current.velocityX = 0;
        gestureRef.current.velocityY = 0;

        // For pinch gesture
        if (e.touches.length >= 2) {
          gestureRef.current.startDistance = getDistance(
            e.touches[0],
            e.touches[1]
          );
          gestureRef.current.currentDistance = gestureRef.current.startDistance;
          gestureRef.current.scale = 1;

          // Initial rotation
          gestureRef.current.rotation = getAngle(e.touches[0], e.touches[1]);
        }

        if (touchStartCallbackRef.current) {
          touchStartCallbackRef.current(ctx, e, gestureRef.current);
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!gestureRef.current || !gestureRef.current.active) return;

        const now = performance.now();
        const deltaTime = now - gestureRef.current.lastTime;
        const touchCenter = getTouchCenter(e.touches);

        // Update touch list
        gestureRef.current.touches = e.touches;

        // Calculate deltas and velocities
        gestureRef.current.deltaX = touchCenter.x - gestureRef.current.lastX;
        gestureRef.current.deltaY = touchCenter.y - gestureRef.current.lastY;

        if (deltaTime > 0) {
          gestureRef.current.velocityX = gestureRef.current.deltaX / deltaTime;
          gestureRef.current.velocityY = gestureRef.current.deltaY / deltaTime;
        }

        gestureRef.current.lastTime = now;
        gestureRef.current.lastX = touchCenter.x;
        gestureRef.current.lastY = touchCenter.y;

        // For pinch gesture
        if (e.touches.length >= 2) {
          const currentDistance = getDistance(e.touches[0], e.touches[1]);
          gestureRef.current.currentDistance = currentDistance;

          // Calculate scale
          if (gestureRef.current.startDistance > 0) {
            gestureRef.current.scale =
              currentDistance / gestureRef.current.startDistance;
          }

          // Calculate rotation
          const currentAngle = getAngle(e.touches[0], e.touches[1]);
          const startAngle = gestureRef.current.rotation;
          gestureRef.current.rotation = currentAngle - startAngle;

          if (pinchCallbackRef.current) {
            pinchCallbackRef.current(ctx, e, gestureRef.current);
          }

          if (
            rotateCallbackRef.current &&
            Math.abs(gestureRef.current.rotation) > 5
          ) {
            rotateCallbackRef.current(ctx, e, gestureRef.current);
          }
        }

        if (touchMoveCallbackRef.current) {
          touchMoveCallbackRef.current(ctx, e, gestureRef.current);
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        if (
          !gestureRef.current ||
          !gestureRef.current.active ||
          !gestureRef.current.startTouches
        )
          return;

        const now = performance.now();
        const touchDuration = now - gestureRef.current.startTime;

        // Detect tap
        if (
          touchDuration < 300 &&
          Math.abs(gestureRef.current.deltaX) < 10 &&
          Math.abs(gestureRef.current.deltaY) < 10
        ) {
          if (tapCallbackRef.current) {
            tapCallbackRef.current(ctx, e, gestureRef.current);
          }
        }

        // Detect swipe
        const swipeThreshold = 50;
        const isHorizontalSwipe =
          Math.abs(gestureRef.current.deltaX) >
          Math.abs(gestureRef.current.deltaY);

        if (swipeCallbackRef.current && touchDuration < 300) {
          if (
            isHorizontalSwipe &&
            Math.abs(gestureRef.current.deltaX) > swipeThreshold
          ) {
            const direction = gestureRef.current.deltaX > 0 ? "right" : "left";
            swipeCallbackRef.current(ctx, e, gestureRef.current, direction);
          } else if (
            !isHorizontalSwipe &&
            Math.abs(gestureRef.current.deltaY) > swipeThreshold
          ) {
            const direction = gestureRef.current.deltaY > 0 ? "down" : "up";
            swipeCallbackRef.current(ctx, e, gestureRef.current, direction);
          }
        }

        if (touchEndCallbackRef.current) {
          touchEndCallbackRef.current(ctx, e, gestureRef.current);
        }

        // Reset state if no more touches
        if (e.touches.length === 0) {
          gestureRef.current.active = false;
        }
      };

      const handleTouchCancel = (e: TouchEvent) => {
        if (!gestureRef.current) return;

        gestureRef.current.active = false;

        if (touchEndCallbackRef.current) {
          touchEndCallbackRef.current(ctx, e, gestureRef.current);
        }
      };

      const controller = new AbortController();
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

      return () => controller.abort();
    }, []);

    return {
      gesture: gestureRef.current,
      onTap: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture
        ) => void
      ) => (tapCallbackRef.current = callback),
      onSwipe: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture,
          direction: "left" | "right" | "up" | "down"
        ) => void
      ) => (swipeCallbackRef.current = callback),
      onPinch: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture
        ) => void
      ) => (pinchCallbackRef.current = callback),
      onRotate: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture
        ) => void
      ) => (rotateCallbackRef.current = callback),
      onTouchStart: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture
        ) => void
      ) => (touchStartCallbackRef.current = callback),
      onTouchMove: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture
        ) => void
      ) => (touchMoveCallbackRef.current = callback),
      onTouchEnd: (
        callback: (
          ctx: KlintContext,
          e: TouchEvent,
          gesture: KlintGesture
        ) => void
      ) => (touchEndCallbackRef.current = callback),
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

    useEffect(() => {
      if (!contextRef.current) return;
      const ctx = contextRef.current;
      const controller = new AbortController();
      const { signal } = controller;

      const updateModifiers = (e: KeyboardEvent) => {
        if (!keyboardRef.current) return;
        keyboardRef.current.modifiers.alt = e.altKey;
        keyboardRef.current.modifiers.shift = e.shiftKey;
        keyboardRef.current.modifiers.ctrl = e.ctrlKey;
        keyboardRef.current.modifiers.meta = e.metaKey;
      };

      const normalizeKey = (key: string): string => {
        // Normalize common key variations
        const keyMap: Record<string, string> = {
          " ": "Space",
          Control: "Ctrl",
          Escape: "Esc",
        };
        return keyMap[key] || key;
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
          keyboardRef.current.pressedKeys
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

      // Listen on window for global keyboard events
      window.addEventListener("keydown", handleKeyDown, { signal });
      window.addEventListener("keyup", handleKeyUp, { signal });

      return () => controller.abort();
    }, []);

    // Helper to create combo key string
    const createComboKey = (keys: string[]): string => {
      return keys.map(normalizeKey).sort().join("+");
    };

    const normalizeKey = (key: string): string => {
      const keyMap: Record<string, string> = {
        " ": "Space",
        Control: "Ctrl",
        Escape: "Esc",
      };
      return keyMap[key] || key;
    };

    return {
      keyboard: keyboardRef.current,

      // Register callback for single key press
      keyPressed: (
        key: string,
        callback: (ctx: KlintContext, e: KeyboardEvent) => void
      ) => {
        keyPressedCallbackRef.current.set(normalizeKey(key), callback);
      },

      // Register callback for single key release
      keyReleased: (
        key: string,
        callback: (ctx: KlintContext, e: KeyboardEvent) => void
      ) => {
        keyReleasedCallbackRef.current.set(normalizeKey(key), callback);
      },

      // Register callback for key combination (e.g., ['Alt', 'Shift'])
      keyCombo: (
        keys: string[],
        callback: (ctx: KlintContext, e: KeyboardEvent) => void
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
          keyboardRef.current!.pressedKeys.has(normalizeKey(key))
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

  const KlintTimeline = () => {
    const timelinesRef = useRef<Map<string, any>>(new Map());
    const callbacksRef = useRef<{
      start: Array<() => void>;
      end: Array<() => void>;
      loop: Array<() => void>;
    }>({ start: [], end: [], loop: [] });

    const Timeline = {
      create: <T extends Record<string, any>>(
        setup: (timeline: any) => T,
        options: {
          defaultEasing?: (t: number) => number;
          defaultLoop?: number;
        } = {}
      ): T & { update: (progress: number) => void } => {
        const tracks = new Map<any, any>();
        const parents = new Set<any>();
        let currentProgress = 0;
        let hasStarted = false;
        let hasEnded = false;

        const defaultEasing = options.defaultEasing || ((t: number) => t);
        const defaultLoop = options.defaultLoop || 0;

        // Helper for safe callback execution
        const executeCallback = (
          callback: () => void,
          errorMsg = "Callback error"
        ) => {
          try {
            callback();
          } catch (e) {
            console.warn(`${errorMsg}:`, e);
          }
        };

        // Keyframe builder
        function createKeyframes() {
          const segments: any[] = [];
          let currentPos = 0;
          let loopCount = defaultLoop;
          let parentTrack: any = undefined;

          const parseEasingCallback = (
            easing?: ((t: number) => number) | (() => void),
            callback?: () => void
          ) => {
            if (
              typeof easing === "function" &&
              typeof callback === "undefined"
            ) {
              if (easing.length === 0) {
                return {
                  easing: defaultEasing,
                  callback: easing as () => void,
                };
              }
              return {
                easing: easing as (t: number) => number,
                callback: undefined,
              };
            }
            return {
              easing: (easing as (t: number) => number) || defaultEasing,
              callback,
            };
          };

          const builder = {
            start(value: number, delay = 0, callback?: () => void) {
              segments.push({ pos: delay, value, callback, type: "start" });
              currentPos = delay;
              return builder;
            },

            at(
              progress: number,
              value: number,
              easing?: (t: number) => number,
              callback?: () => void
            ) {
              const { easing: finalEasing, callback: finalCallback } =
                parseEasingCallback(easing, callback);
              segments.push({
                pos: progress,
                value,
                easing: finalEasing,
                callback: finalCallback,
                type: "tween",
              });
              currentPos = progress;
              return builder;
            },

            then(
              value: number,
              duration: number,
              easing?: (t: number) => number,
              callback?: () => void
            ) {
              const { easing: finalEasing, callback: finalCallback } =
                parseEasingCallback(easing, callback);
              const nextPos = currentPos + duration;
              segments.push({
                pos: nextPos,
                value,
                easing: finalEasing,
                callback: finalCallback,
                type: "tween",
              });
              currentPos = nextPos;
              return builder;
            },

            loop(count = Infinity) {
              loopCount = count;
              return builder;
            },

            _compile: () => {
              segments.sort((a, b) => a.pos - b.pos);
              return { segments, loopCount, parentTrack };
            },
          };

          return builder;
        }

        function interpolateTrack(compiled: any, progress: number): number {
          const { segments } = compiled;
          if (!segments.length) return 0;

          progress = Math.max(0, Math.min(1, progress));

          const valueSegments = segments.filter(
            (seg: any) => seg.type !== "callback"
          );
          if (!valueSegments.length) return 0;

          let prevSeg = valueSegments[0];

          for (let i = 1; i < valueSegments.length; i++) {
            const seg = valueSegments[i];

            if (progress <= seg.pos) {
              if (
                seg.type === "tween" &&
                prevSeg.value !== undefined &&
                seg.value !== undefined
              ) {
                const t = (progress - prevSeg.pos) / (seg.pos - prevSeg.pos);
                const easedT = seg.easing ? seg.easing(t) : t;
                return prevSeg.value + (seg.value - prevSeg.value) * easedT;
              }
              return seg.value || 0;
            }

            if (seg.value !== undefined) {
              prevSeg = seg;
            }
          }

          return prevSeg.value || 0;
        }

        const timeline = {
          track: (keyframesOrFn: any): any => {
            const compiled =
              typeof keyframesOrFn === "function"
                ? timeline.keyframes(keyframesOrFn)
                : keyframesOrFn;

            const track = {
              ...compiled,
              currentValue: 0,
              getValue: (progress: number) =>
                interpolateTrack(compiled, progress),
              get current(): number {
                return this.currentValue;
              },
              value: function () {
                return this.currentValue;
              },
            };

            tracks.set(track, compiled);
            return track;
          },

          keyframes: (fn: (kf: any) => void) => {
            const kf = createKeyframes();
            fn(kf);
            return kf._compile();
          },

          stagger: (count: number, offset: number, keyframesFn: any): any[] => {
            const compiled = timeline.keyframes(keyframesFn);
            return Array.from({ length: count }, (_, i) => {
              const track = {
                ...compiled,
                currentValue: 0,
                staggerDelay: i * offset,
                getValue: (progress: number) => {
                  const staggeredProgress = Math.max(0, progress - i * offset);
                  const normalizedProgress = Math.min(
                    1,
                    staggeredProgress / (1 - i * offset)
                  );
                  return normalizedProgress > 0
                    ? interpolateTrack(compiled, normalizedProgress)
                    : 0;
                },
                get current(): number {
                  return this.currentValue;
                },
                value: function () {
                  return this.currentValue;
                },
              };
              tracks.set(track, compiled);
              return track;
            });
          },

          update: (progress: number) => {
            const prevProgress = currentProgress;
            currentProgress = progress;

            // Fire timeline start callbacks
            if (!hasStarted && progress > 0) {
              hasStarted = true;
              callbacksRef.current.start.forEach((cb) =>
                executeCallback(cb, "Start callback error")
              );
            }

            // Fire timeline end callbacks
            if (!hasEnded && progress >= 1) {
              hasEnded = true;
              callbacksRef.current.end.forEach((cb) =>
                executeCallback(cb, "End callback error")
              );
            }

            // Reset flags if rewinding
            if (progress < prevProgress) {
              if (progress === 0) {
                hasStarted = false;
                hasEnded = false;
              } else if (progress < 1) {
                hasEnded = false;
              }
            }

            for (const [track, compiled] of tracks) {
              track.currentValue = track.getValue(progress);

              // Handle callbacks
              if (compiled.segments) {
                compiled.segments.forEach((seg: any) => {
                  if (
                    seg.callback &&
                    seg.pos <= progress &&
                    seg.pos > prevProgress
                  ) {
                    executeCallback(seg.callback);
                  }
                });
              }
            }
          },

          progress: () => currentProgress,
        };

        // Execute setup
        const result = setup(timeline);
        return { ...result, update: timeline.update };
      },
    };

    return {
      Timeline,
      onStart: (fn: () => void) => callbacksRef.current.start.push(fn),
      onEnd: (fn: () => void) => callbacksRef.current.end.push(fn),
      onLoop: (fn: () => void) => callbacksRef.current.loop.push(fn),
    };
  };

  const KlintWindow = () => {
    const resizeCallbackRef = useRef<((ctx: KlintContext) => void) | null>(
      null
    );
    const blurCallbackRef = useRef<((ctx: KlintContext) => void) | null>(null);
    const focusCallbackRef = useRef<((ctx: KlintContext) => void) | null>(null);
    const visibilityChangeCallbackRef = useRef<
      ((ctx: KlintContext, isVisible: boolean) => void) | null
    >(null);

    useEffect(() => {
      if (!contextRef.current) return;
      const ctx = contextRef.current;
      const controller = new AbortController();
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

      return () => controller.abort();
    }, []);

    return {
      onResize: (callback: (ctx: KlintContext) => void) =>
        (resizeCallbackRef.current = callback),
      onBlur: (callback: (ctx: KlintContext) => void) =>
        (blurCallbackRef.current = callback),
      onFocus: (callback: (ctx: KlintContext) => void) =>
        (focusCallbackRef.current = callback),
      onVisibilityChange: (
        callback: (ctx: KlintContext, isVisible: boolean) => void
      ) => (visibilityChangeCallbackRef.current = callback),
    };
  };

  const buildKlintContext = (
    ctx: CanvasRenderingContext2D,
    options: KlintCanvasOptions
  ): KlintContext => {
    const context = ctx as unknown as KlintContext;
    // Initialize core properties
    context.__isMainContext = true;
    context.fps = 60;
    context.frame = 0;
    context.time = 0;
    context.deltaTime = 0;

    // Initialize defaults

    context.__imageOrigin = options.origin === "center" ? "center" : "corner";
    context.__rectangleOrigin =
      options.origin === "center" ? "center" : "corner";
    context.__canvasOrigin = options.origin === "center" ? "center" : "corner";
    context.__textFont = "sans-serif";
    context.__textWeight = "normal";
    context.__textStyle = "normal";
    context.__textSize = 72;
    context.__textLeading = undefined;
    context.__textAlignment = {
      horizontal: "left" as CanvasTextAlign,
      vertical: "top" as CanvasTextBaseline,
    };
    context.__fillRule = "nonzero";
    context.__offscreens = new Map();
    context.__isPlaying = true;
    context.__currentContext = context;

    // Add Klint Elements
    context.Color = new Color();
    context.createVector = (x = 0, y = 0) => new Vector(x, y);
    context.Vector = new Vector();
    context.Easing = new Easing();
    context.Text = new Text(context);
    context.Thing = new Thing(context);
    context.Grid = new Grid(context);
    context.Strip = new Strip(context);
    context.Noise = new Noise(context);
    context.Hotspot = new Hotspot(context);
    context.Performance = new Performance(context);
    context.SSR = new SSR(context);

    // Add Klint core functions
    Object.entries(KlintCoreFunctions).forEach(([name, fn]) => {
      context[name] = fn(context as unknown as KlintContext);
    });
    // Add Klint functions
    Object.entries(KlintFunctions).forEach(([name, fn]) => {
      context[name] = fn(context as unknown as KlintContext);
    });

    return context;
  };

  const initCoreContext = useCallback(
    (canvas: HTMLCanvasElement, options: KlintCanvasOptions): KlintContext => {
      if (!contextRef.current) {
        const ctx = canvas.getContext("2d", {
          alpha: options.alpha ?? true,
          willReadFrequently: options.willreadfrequently ?? true,
        }) as CanvasRenderingContext2D;
        if (!ctx) throw new Error("Failed to get canvas context");
        contextRef.current = buildKlintContext(ctx, options);
      }
      return contextRef.current;
    },
    []
  );

  const togglePlay = useCallback((playing?: boolean) => {
    if (!contextRef.current) return;

    if (playing !== undefined) {
      contextRef.current.__isPlaying = playing;
    } else {
      contextRef.current.__isPlaying = !contextRef.current.__isPlaying;
    }
  }, []);

  const KlintPerformance = () => {
    const metricsRef = useRef<{
      fps: number;
      frameTime: number;
      averageFrameTime: number;
      minFrameTime: number;
      maxFrameTime: number;
      droppedFrames: number;
      memoryUsage?: number;
    } | null>(null);

    useEffect(() => {
      if (!contextRef.current?.__performance) return;

      // Update metrics ref when performance data changes
      const updateMetrics = () => {
        if (contextRef.current?.__performance) {
          metricsRef.current = { ...contextRef.current.__performance };
        }
      };

      // Poll for updates (performance data is updated in animation loop)
      const interval = setInterval(updateMetrics, 100);
      return () => clearInterval(interval);
    }, []);

    return {
      metrics: metricsRef.current,
      getMetrics: () => contextRef.current?.__performance || null,
      reset: () => {
        if (contextRef.current?.__performance) {
          contextRef.current.__performance.droppedFrames = 0;
          contextRef.current.__performance.minFrameTime = Infinity;
          contextRef.current.__performance.maxFrameTime = 0;
        }
      },
    };
  };

  return {
    context: {
      context: contextRef.current,
      initCoreContext,
    },
    KlintMouse,
    KlintScroll,
    KlintGesture,
    KlintKeyboard,
    KlintWindow,
    KlintImage,
    KlintTimeline,
    KlintPerformance,
    togglePlay,
    useDev,
  };
}

export const useProps = <T extends object = Record<string, unknown>>(
  props: T
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
  initialProps: T = {} as T
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
