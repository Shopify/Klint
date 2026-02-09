/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Timeline Element for Klint
 *
 * Keyframe-based animation system with tracks, stagger, and easing callbacks.
 *
 * @example
 * ```tsx
 * // In setup:
 * const anim = K.Timeline.create((t) => ({
 *   x: t.track(t.keyframes((kf) => kf.start(0).at(0.5, 200).at(1, 0))),
 *   y: t.track(t.keyframes((kf) => kf.start(100).then(300, 0.5))),
 * }));
 * storage.set("anim", anim);
 *
 * // In draw:
 * const anim = storage.get("anim");
 * anim.update(K.time / 2); // progress 0→1
 * K.circle(anim.x.current, anim.y.current, 10);
 * ```
 */

interface Segment {
  pos: number;
  value: number;
  type: "start" | "tween";
  easing?: (t: number) => number;
  callback?: () => void;
}

interface CompiledTrack {
  segments: Segment[];
  loopCount: number;
  parentTrack?: any;
}

interface Track {
  currentValue: number;
  getValue: (progress: number) => number;
  readonly current: number;
  value: () => number;
}

export default class Timeline {
  private callbacks: {
    start: Array<() => void>;
    end: Array<() => void>;
    loop: Array<() => void>;
  };

  constructor() {
    this.callbacks = { start: [], end: [], loop: [] };
  }

  onStart(fn: () => void): void {
    this.callbacks.start.push(fn);
  }

  onEnd(fn: () => void): void {
    this.callbacks.end.push(fn);
  }

  onLoop(fn: () => void): void {
    this.callbacks.loop.push(fn);
  }

  create<T extends Record<string, any>>(
    setup: (timeline: any) => T,
    options: {
      defaultEasing?: (t: number) => number;
      defaultLoop?: number;
    } = {},
  ): T & { update: (progress: number) => void } {
    const tracks = new Map<any, CompiledTrack>();
    let currentProgress = 0;
    let hasStarted = false;
    let hasEnded = false;
    const callbacks = this.callbacks;

    const defaultEasing = options.defaultEasing || ((t: number) => t);
    const defaultLoop = options.defaultLoop || 0;

    const executeCallback = (
      callback: () => void,
      errorMsg = "Callback error",
    ) => {
      try {
        callback();
      } catch (e) {
        console.warn(`${errorMsg}:`, e);
      }
    };

    function createKeyframes() {
      const segments: Segment[] = [];
      let currentPos = 0;
      let loopCount = defaultLoop;
      const parentTrack: any = undefined;

      const parseEasingCallback = (
        easing?: ((t: number) => number) | (() => void),
        callback?: () => void,
      ) => {
        if (typeof easing === "function" && typeof callback === "undefined") {
          if (easing.length === 0) {
            return { easing: defaultEasing, callback: easing as () => void };
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
          callback?: () => void,
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
          callback?: () => void,
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

        _compile: (): CompiledTrack => {
          segments.sort((a, b) => a.pos - b.pos);
          return { segments, loopCount, parentTrack };
        },
      };

      return builder;
    }

    function interpolateTrack(
      compiled: CompiledTrack,
      progress: number,
    ): number {
      const { segments } = compiled;
      if (!segments.length) return 0;

      progress = Math.max(0, Math.min(1, progress));

      const valueSegments = segments.filter(
        (seg: Segment) => seg.value !== undefined,
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
      track: (keyframesOrFn: any): Track => {
        const compiled: CompiledTrack =
          typeof keyframesOrFn === "function"
            ? timeline.keyframes(keyframesOrFn)
            : keyframesOrFn;

        const track: Track = {
          ...compiled,
          currentValue: 0,
          getValue: (progress: number) => interpolateTrack(compiled, progress),
          get current(): number {
            return this.currentValue;
          },
          value() {
            return this.currentValue;
          },
        } as any;

        tracks.set(track, compiled);
        return track;
      },

      keyframes: (fn: (kf: any) => void): CompiledTrack => {
        const kf = createKeyframes();
        fn(kf);
        return kf._compile();
      },

      stagger: (count: number, offset: number, keyframesFn: any): Track[] => {
        const compiled = timeline.keyframes(keyframesFn);
        return Array.from({ length: count }, (_, i) => {
          const track: Track = {
            ...compiled,
            currentValue: 0,
            staggerDelay: i * offset,
            getValue: (progress: number) => {
              const staggeredProgress = Math.max(0, progress - i * offset);
              const normalizedProgress = Math.min(
                1,
                staggeredProgress / (1 - i * offset),
              );
              return normalizedProgress > 0
                ? interpolateTrack(compiled, normalizedProgress)
                : 0;
            },
            get current(): number {
              return this.currentValue;
            },
            value() {
              return this.currentValue;
            },
          } as any;
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
          callbacks.start.forEach((cb) =>
            executeCallback(cb, "Start callback error"),
          );
        }

        // Fire timeline end callbacks
        if (!hasEnded && progress >= 1) {
          hasEnded = true;
          callbacks.end.forEach((cb) =>
            executeCallback(cb, "End callback error"),
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
            compiled.segments.forEach((seg) => {
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
  }
}
