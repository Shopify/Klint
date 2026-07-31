import React, { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import useKlint from "./useKlint";
import type {
  KlintCanvasOptions,
  KlintContext,
  KlintContextWrapper,
} from "./core/KlintTypes";
import { normalizeKlintOptions } from "./core/KlintTypes";
import {
  KlintAnimationLoop,
  resizeKlintCanvas,
} from "./core/KlintRuntime";

export * from "./core/KlintTypes";

export interface KlintProps extends KlintCanvasOptions {
  /** Context bridge returned by useKlint(). Retained for input/resource hooks. */
  context?: KlintContextWrapper;
  /** Preferred grouped canvas options; flattened options remain supported. */
  options?: KlintCanvasOptions;
  preload?: (context: KlintContext) => void | Promise<void>;
  setup?: (context: KlintContext) => void | Promise<void>;
  draw?: (context: KlintContext) => void;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error) => void;
  onReady?: (context: KlintContext) => void;
  onResize?: (context: KlintContext) => void;
  onVisible?: (context: KlintContext, visible: boolean) => void;
  extensionFunction?: Record<
    string,
    (context: KlintContext) => unknown
  >;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  canvasProps?: Omit<
    React.CanvasHTMLAttributes<HTMLCanvasElement>,
    "ref" | "width" | "height"
  >;
}

type KlintStatus = "loading" | "ready" | "error";

const renderError = (
  component: KlintProps["errorComponent"],
  error: Error,
): ReactNode => {
  if (typeof component === "function") return component(error);
  if (component) return component;
  return (
    <div role="alert" style={{ color: "#b42318", padding: 16 }}>
      {error.message}
    </div>
  );
};

const Klint = (props: KlintProps) => {
  const {
    context: providedContext,
    preload,
    setup,
    draw,
    loadingComponent,
    errorComponent,
    onError,
    onReady,
    onResize,
    onVisible,
    extensionFunction,
    children,
    className,
    style,
    canvasProps,
  } = props;

  const hooks = useKlint();

  const callbacksRef = useRef({
    preload,
    setup,
    draw,
    onError,
    onReady,
    onResize,
    onVisible,
  });
  callbacksRef.current = {
    preload,
    setup,
    draw,
    onError,
    onReady,
    onResize,
    onVisible,
  };

  const extensionsRef = useRef(extensionFunction);
  extensionsRef.current = extensionFunction;

  const contextBridgeRef = useRef(providedContext ?? hooks.context);
  const initialOptionsRef = useRef(
    normalizeKlintOptions({ ...props.options, ...props }),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<KlintStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const contextBridge = contextBridgeRef.current;

    let disposed = false;
    const options = initialOptionsRef.current;
    let context: KlintContext;
    try {
      context = contextBridge.initCoreContext(canvas, options);
    } catch (cause) {
      const initError = new Error(
        `Klint failed to initialize: ${cause instanceof Error ? cause.message : String(cause)}`,
        { cause },
      );
      setError(initError);
      setStatus("error");
      callbacksRef.current.onError?.(initError);
      return;
    }

    const reportError = (runtimeError: Error) => {
      if (disposed) return;
      setError(runtimeError);
      setStatus("error");
      callbacksRef.current.onError?.(runtimeError);
    };

    const renderFrame = (current: KlintContext) => {
      callbacksRef.current.draw?.(current);
    };
    const loop = new KlintAnimationLoop(context, renderFrame, reportError);

    context.__redraw = () => {
      if (!context.__isReadyToDraw) return;
      try {
        renderFrame(context);
      } catch (cause) {
        reportError(
          new Error(
            `Klint error in redraw: ${cause instanceof Error ? cause.message : String(cause)}`,
            { cause },
          ),
        );
      }
    };

    const measureAndResize = () => {
      if (disposed) return;
      const rect = container.getBoundingClientRect();
      const width = rect.width || container.clientWidth || canvas.clientWidth || 300;
      const height = rect.height || container.clientHeight || canvas.clientHeight || 150;
      const changed = resizeKlintCanvas(canvas, context, width, height, options);
      if (!changed) return;
      callbacksRef.current.onResize?.(context);
      if (context.__isReadyToDraw && (options.static || options.noloop)) {
        context.__redraw?.();
      }
    };

    measureAndResize();
    let resizeObserver: ResizeObserver | undefined;
    if (!options.ignoreResize && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(measureAndResize);
      resizeObserver.observe(container);
    }

    let intersecting = true;
    let documentVisible = document.visibilityState !== "hidden";
    const updateVisibility = () => {
      const visible = intersecting && documentVisible;
      loop.setVisible(visible);
      callbacksRef.current.onVisible?.(context, visible);
    };

    let intersectionObserver: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver((entries) => {
        intersecting = entries[0]?.isIntersecting ?? true;
        updateVisibility();
      });
      intersectionObserver.observe(canvas);
    }
    const handleVisibilityChange = () => {
      documentVisible = document.visibilityState !== "hidden";
      updateVisibility();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    loop.start();

    const initialize = async () => {
      try {
        const extensions = extensionsRef.current;
        if (extensions) {
          for (const [name, factory] of Object.entries(extensions)) {
            context.extend(name, factory(context));
          }
        }

        await callbacksRef.current.preload?.(context);
        if (disposed) return;
        context.__isPreloaded = true;

        await callbacksRef.current.setup?.(context);
        if (disposed) return;
        context.__isSetup = true;
        context.__isReadyToDraw = true;
        setStatus("ready");
        callbacksRef.current.onReady?.(context);

        if (options.static || options.noloop) {
          context.__redraw?.();
          context.__isPlaying = false;
        } else {
          context.__isPlaying = options.autoplay;
          loop.resetClock();
        }
      } catch (cause) {
        context.__isPlaying = false;
        reportError(
          new Error(
            `Klint lifecycle failed: ${cause instanceof Error ? cause.message : String(cause)}`,
            { cause },
          ),
        );
      }
    };
    void initialize();

    return () => {
      disposed = true;
      loop.stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      context.__redraw = undefined;
      contextBridge.releaseCoreContext(canvas);
    };
  }, []);

  const canvasStyle: CSSProperties = {
    display: initialOptionsRef.current.nocanvas ? "none" : "block",
    touchAction: "none",
    ...(canvasProps?.style ?? {}),
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...style }}
      data-klint-status={status}
    >
      {status === "loading" && loadingComponent}
      {status === "error" && error && renderError(errorComponent, error)}
      <canvas
        {...canvasProps}
        ref={canvasRef}
        tabIndex={canvasProps?.tabIndex ?? 0}
        style={canvasStyle}
        role={canvasProps?.role ?? "img"}
        aria-label={canvasProps?.["aria-label"] ?? "Klint canvas"}
        aria-busy={status === "loading"}
      >
        {canvasProps?.children ?? "Your browser does not support HTML canvas."}
      </canvas>
      {children}
    </div>
  );
};

export type { KlintContextWrapper };
export default Klint;
