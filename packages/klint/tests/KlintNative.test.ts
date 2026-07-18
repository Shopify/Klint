import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createKlint } from "../src/native";

class Observer {
  constructor(_callback: unknown) {}
  observe() {}
  disconnect() {}
}

describe("native Klint adapter", () => {
  beforeEach(() => {
    vi.stubGlobal("ResizeObserver", Observer);
    vi.stubGlobal("IntersectionObserver", Observer);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 240,
      height: 120,
      top: 0,
      left: 0,
      right: 240,
      bottom: 120,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("creates and owns a canvas without importing React lifecycle state", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const setup = vi.fn();
    const draw = vi.fn();
    const sketch = createKlint({
      container,
      width: 240,
      height: 120,
      static: true,
      setup,
      draw,
    });

    await sketch.ready;
    expect(sketch.canvas.parentElement).toBe(container);
    expect(sketch.context.width).toBe(240);
    expect(sketch.context.height).toBe(120);
    expect(setup).toHaveBeenCalledWith(sketch.context);
    expect(draw).toHaveBeenCalledOnce();

    sketch.canvas.dispatchEvent(
      new MouseEvent("pointermove", { clientX: 120, clientY: 60 }),
    );
    expect(sketch.mouse.x).toBe(120);
    expect(sketch.mouse.y).toBe(60);
    expect(sketch.context.mouse).toBe(sketch.mouse);
    sketch.canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(sketch.keyboard.pressedKeys.has("a")).toBe(true);

    sketch.redraw();
    expect(draw).toHaveBeenCalledTimes(2);
    sketch.destroy();
    expect(sketch.canvas.isConnected).toBe(false);
  });
});
