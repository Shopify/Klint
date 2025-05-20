import { useRef, useCallback, useEffect, useMemo } from "react";
import { KlintFunctions, KlintCoreFunctions } from "./KlintFunctions";
import {
  KlintCanvasOptions,
  KlintContext,
  KlintContexts,
  KlintOffscreenContext,
  CONFIG_PROPS,
  EPSILON,
  KlintConfig,
} from "./Klint";
import { Color, Vector, Easing, State, Time, Text, Thing } from "./elements";

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

export default function useKlint() {
  const contextRef = useRef<KlintContext | null>(null);
  const mouseRef = useRef<KlintMouse | null>(null);
  const scrollRef = useRef<KlintScroll | null>(null);

  const useDev = () => {
    return;
  };

  const KlintImage = () => {
    const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    const loadImage = useCallback(
      async (key: string, url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
            imagesRef.current.set(key, img);
            resolve(img);
          };
          img.onerror = reject;
          img.src = url;
        });
      },
      []
    );

    const loadImages = useCallback(
      async (
        imageMap: Record<string, string>
      ): Promise<Map<string, HTMLImageElement>> => {
        const promises = Object.entries(imageMap).map(([key, url]) =>
          loadImage(key, url).then(
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

      canvas.addEventListener("mousemove", updateMousePosition);
      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseenter", handleMouseEnter);
      canvas.addEventListener("mouseleave", handleMouseLeave);
      canvas.addEventListener("click", handleClick);

      return () => {
        canvas.removeEventListener("mousemove", updateMousePosition);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseenter", handleMouseEnter);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("click", handleClick);
      };
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

      canvas.addEventListener("wheel", handleScroll);
      return () => canvas.removeEventListener("wheel", handleScroll);
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

      window.addEventListener("resize", handleResize);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
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
    context.__textAlignment = {
      horizontal: "left" as CanvasTextAlign,
      vertical: "top" as CanvasTextBaseline,
    };
    context.__offscreens = new Map();
    context.__isPlaying = true;
    context.__currentContext = context;

    // Add Klint Elements
    context.Color = new Color();
    context.createVector = (x = 0, y = 0) => new Vector(x, y);
    context.Easing = new Easing(context);
    context.State = new State();
    context.Time = new Time(context);
    context.Text = new Text(context);
    context.Thing = new Thing(context);

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

  return {
    context: {
      context: contextRef.current,
      initCoreContext,
    },
    KlintMouse,
    KlintScroll,
    KlintWindow,
    KlintImage,
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
