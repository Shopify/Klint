import { describe, expect, it, vi } from "vitest";
import Timeline from "../../src/elements/Timeline";

describe("Timeline production implementation", () => {
  it("interpolates tracks and exposes current values", () => {
    const timeline = new Timeline();
    const animation = timeline.create((builder) => ({
      x: builder.track((keyframes) => keyframes.start(0).at(1, 100)),
    }));

    animation.update(0.25);
    expect(animation.x.current).toBe(25);
    animation.update(1);
    expect(animation.x.value()).toBe(100);
    expect(animation.progress()).toBe(1);
  });

  it("handles finite loops and fires loop/end callbacks once per boundary", () => {
    const timeline = new Timeline();
    const onLoop = vi.fn();
    const onEnd = vi.fn();
    timeline.onLoop(onLoop);
    timeline.onEnd(onEnd);
    const animation = timeline.create((builder) => ({
      x: builder.track((keyframes) => keyframes.start(0).at(1, 10).loop(2)),
    }));

    animation.update(2.5);
    expect(onLoop).toHaveBeenCalledTimes(2);
    expect(onEnd).not.toHaveBeenCalled();
    expect(animation.x.current).toBe(5);
    animation.update(3);
    expect(onEnd).toHaveBeenCalledOnce();
    expect(animation.x.current).toBe(10);
  });

  it("fires keyframe callbacks crossed by large forward updates", () => {
    const callback = vi.fn();
    const timeline = new Timeline();
    const animation = timeline.create((builder) => ({
      x: builder.track((keyframes) =>
        keyframes.start(0).at(0.25, 25, callback).at(0.75, 75, callback),
      ),
    }));

    animation.update(1);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("does not produce NaN for zero-duration keyframes or late stagger entries", () => {
    const timeline = new Timeline();
    const animation = timeline.create((builder) => ({
      immediate: builder.track((keyframes) => keyframes.start(1).then(2, 0)),
      items: builder.stagger(3, 0.2, (keyframes) => keyframes.start(5).at(1, 10)),
    }));

    animation.update(0);
    expect(animation.immediate.current).toBe(1);
    expect(animation.items.map((track) => track.current)).toEqual([5, 5, 5]);
    animation.update(0.5);
    expect(animation.items.every((track) => Number.isFinite(track.current))).toBe(true);
  });

  it("rejects non-finite progress", () => {
    const animation = new Timeline().create(() => ({}));
    expect(() => animation.update(Number.NaN)).toThrow(TypeError);
  });
});
