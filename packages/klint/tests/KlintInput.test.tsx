import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Klint from "../src/Klint";
import useKlint, {
  type KlintKeyboard,
  type KlintMouse,
  type KlintScroll,
} from "../src/useKlint";

class Observer {
  constructor(_callback: unknown) {}
  observe() {}
  disconnect() {}
}

describe("Klint production input hooks", () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.stubGlobal("ResizeObserver", Observer);
    vi.stubGlobal("IntersectionObserver", Observer);
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 100,
      top: 20,
      left: 10,
      right: 210,
      bottom: 120,
      x: 10,
      y: 20,
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

  it("maps pointer input to logical pixels and scopes keyboard input to canvas focus", async () => {
    let mouse!: KlintMouse;
    let keyboard!: KlintKeyboard;
    const keyPressed = vi.fn();

    function Sketch({ canvasKey = 1 }: { canvasKey?: number }) {
      const klint = useKlint();
      const mouseApi = klint.useMouse();
      const keyboardApi = klint.useKeyboard();
      mouse = mouseApi.mouse;
      keyboard = keyboardApi.keyboard;
      keyboardApi.keyPressed("a", keyPressed);
      return <Klint key={canvasKey} context={klint.context} options={{ dpr: 2 }} />;
    }

    await act(async () => root.render(<Sketch />));
    const canvas = host.querySelector("canvas")!;
    canvas.dispatchEvent(
      new MouseEvent("pointermove", {
        bubbles: true,
        clientX: 110,
        clientY: 70,
      }),
    );

    expect(mouse.x).toBe(100);
    expect(mouse.y).toBe(50);
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(200);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(keyPressed).not.toHaveBeenCalled();
    canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(keyPressed).toHaveBeenCalledOnce();
    expect(keyboard.pressedKeys.has("a")).toBe(true);
    canvas.dispatchEvent(new FocusEvent("blur"));
    expect(keyboard.pressedKeys.size).toBe(0);

    await act(async () => root.render(<Sketch canvasKey={2} />));
    const replacement = host.querySelector("canvas")!;
    expect(replacement).not.toBe(canvas);
    canvas.dispatchEvent(
      new MouseEvent("pointermove", { clientX: 210, clientY: 120 }),
    );
    expect(mouse.x).toBe(100);
    replacement.dispatchEvent(
      new MouseEvent("pointermove", { clientX: 210, clientY: 120 }),
    );
    expect(mouse.x).toBe(200);
    expect(mouse.y).toBe(100);
  });

  it("normalizes wheel line deltas to pixel-like distances", async () => {
    let scroll!: KlintScroll;
    const onScroll = vi.fn();

    function Sketch() {
      const klint = useKlint();
      const scrollApi = klint.useScroll();
      scroll = scrollApi.scroll;
      scrollApi.onScroll(onScroll);
      return <Klint context={klint.context} />;
    }

    await act(async () => root.render(<Sketch />));
    const canvas = host.querySelector("canvas")!;
    canvas.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaY: 2,
        deltaMode: WheelEvent.DOM_DELTA_LINE,
      }),
    );

    expect(scroll.distance).toBe(32);
    expect(onScroll).toHaveBeenCalledOnce();
  });
});
