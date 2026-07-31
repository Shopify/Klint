import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Klint from "../src/Klint";
import type { KlintContext } from "../src/core/KlintTypes";

class TestResizeObserver {
  static instances: TestResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    TestResizeObserver.instances.push(this);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

class TestIntersectionObserver {
  static instances: TestIntersectionObserver[] = [];
  readonly callback: IntersectionObserverCallback;
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    TestIntersectionObserver.instances.push(this);
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = () => [];
  root = null;
  rootMargin = "0px";
  thresholds = [0];
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

describe("Klint React lifecycle", () => {
  let host: HTMLDivElement;
  let root: Root;
  let frameCallbacks: Map<number, FrameRequestCallback>;
  let frameId: number;

  const flushFrame = async (timestamp: number) => {
    const callbacks = [...frameCallbacks.values()];
    frameCallbacks.clear();
    await act(async () => {
      callbacks.forEach((callback) => callback(timestamp));
    });
  };

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    TestResizeObserver.instances = [];
    TestIntersectionObserver.instances = [];
    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    vi.stubGlobal("IntersectionObserver", TestIntersectionObserver);

    frameCallbacks = new Map();
    frameId = 0;
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback: FrameRequestCallback) => {
      const id = ++frameId;
      frameCallbacks.set(id, callback);
      return id;
    }));
    vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => {
      frameCallbacks.delete(id);
    }));

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      right: 200,
      bottom: 100,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    host.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("runs preload, setup, ready, then draw on one stable canvas", async () => {
    const order: string[] = [];
    let context: KlintContext | undefined;
    await act(async () => {
      root.render(
        <Klint
          preload={async () => {
            order.push("preload");
          }}
          setup={() => order.push("setup")}
          onReady={(K) => {
            context = K;
            order.push("ready");
          }}
          draw={() => order.push("draw")}
        />,
      );
    });

    expect(order).toEqual(["preload", "setup", "ready"]);
    expect(context?.width).toBe(200);
    expect(context?.height).toBe(100);
    const canvas = host.querySelector("canvas");
    expect(context?.canvas).toBe(canvas);

    await flushFrame(1);
    await flushFrame(18);
    expect(order).toEqual(["preload", "setup", "ready", "draw"]);
    expect(host.querySelector("canvas")).toBe(canvas);
  });

  it("uses the latest draw prop without restarting setup or replacing the canvas", async () => {
    const firstDraw = vi.fn();
    const secondDraw = vi.fn();
    const setup = vi.fn();
    let context: KlintContext | undefined;

    await act(async () => {
      root.render(<Klint setup={setup} draw={firstDraw} onReady={(K) => (context = K)} />);
    });
    const canvas = host.querySelector("canvas");
    await flushFrame(1);
    await flushFrame(18);
    expect(firstDraw).toHaveBeenCalledOnce();

    await act(async () => {
      root.render(<Klint setup={setup} draw={secondDraw} onReady={(K) => (context = K)} />);
    });
    await flushFrame(35);

    expect(setup).toHaveBeenCalledOnce();
    expect(firstDraw).toHaveBeenCalledOnce();
    expect(secondDraw).toHaveBeenCalledOnce();
    expect(host.querySelector("canvas")).toBe(canvas);
    expect(context?.canvas).toBe(canvas);
  });

  it("pauses offscreen work and resets timing when play resumes", async () => {
    const draw = vi.fn();
    let context!: KlintContext;
    await act(async () => {
      root.render(<Klint draw={draw} onReady={(K) => (context = K)} />);
    });

    await flushFrame(1);
    TestIntersectionObserver.instances[0].trigger(false);
    await flushFrame(1000);
    expect(draw).not.toHaveBeenCalled();

    TestIntersectionObserver.instances[0].trigger(true);
    await flushFrame(1010);
    await flushFrame(1027);
    expect(draw).toHaveBeenCalledOnce();
    expect(context.deltaTime).toBe(17);

    context.pause();
    await flushFrame(2000);
    context.play();
    await flushFrame(3000);
    await flushFrame(3017);
    expect(draw).toHaveBeenCalledTimes(2);
    expect(context.deltaTime).toBe(17);
  });

  it("renders once in static mode and redraws without data URL conversion", async () => {
    const draw = vi.fn();
    let context!: KlintContext;
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, "toDataURL");
    await act(async () => {
      root.render(
        <Klint static draw={draw} onReady={(K) => (context = K)} />,
      );
    });

    expect(draw).toHaveBeenCalledOnce();
    expect(context.__isPlaying).toBe(false);
    context.redraw();
    expect(draw).toHaveBeenCalledTimes(2);
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it("surfaces lifecycle failures and calls onError", async () => {
    const onError = vi.fn();
    await act(async () => {
      root.render(
        <Klint
          setup={() => {
            throw new Error("setup exploded");
          }}
          onError={onError}
          errorComponent={(error) => <p>{error.message}</p>}
        />,
      );
    });

    expect(onError).toHaveBeenCalledOnce();
    expect(host.textContent).toContain("setup exploded");
    expect(host.firstElementChild?.getAttribute("data-klint-status")).toBe("error");
  });
});
