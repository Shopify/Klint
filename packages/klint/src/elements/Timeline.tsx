export interface TimelineSegment {
  pos: number;
  value: number;
  type: "start" | "tween";
  easing?: (progress: number) => number;
  callback?: () => void;
}

export interface CompiledTimelineTrack {
  segments: TimelineSegment[];
  /** Number of repeats after the initial pass. */
  loopCount: number;
}

export interface TimelineTrack {
  currentValue: number;
  getValue: (progress: number) => number;
  readonly current: number;
  value: () => number;
}

export interface KeyframeBuilder {
  start(value: number, delay?: number, callback?: () => void): KeyframeBuilder;
  at(
    progress: number,
    value: number,
    easing?: ((progress: number) => number) | (() => void),
    callback?: () => void,
  ): KeyframeBuilder;
  then(
    value: number,
    duration: number,
    easing?: ((progress: number) => number) | (() => void),
    callback?: () => void,
  ): KeyframeBuilder;
  loop(count?: number): KeyframeBuilder;
}

export interface TimelineBuilder {
  track(keyframes: CompiledTimelineTrack): TimelineTrack;
  track(build: (keyframes: KeyframeBuilder) => void): TimelineTrack;
  keyframes(build: (keyframes: KeyframeBuilder) => void): CompiledTimelineTrack;
  stagger(
    count: number,
    offset: number,
    build: (keyframes: KeyframeBuilder) => void,
  ): TimelineTrack[];
}

interface TrackBinding {
  track: TimelineTrack;
  compiled: CompiledTimelineTrack;
  delay: number;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const localProgress = (
  compiled: CompiledTimelineTrack,
  progress: number,
): number => {
  const clamped = Math.max(0, progress);
  if (compiled.loopCount === 0) return clamp01(clamped);
  const passes = compiled.loopCount === Infinity ? Infinity : compiled.loopCount + 1;
  if (clamped >= passes) return 1;
  return clamped % 1;
};

const interpolateTrack = (
  compiled: CompiledTimelineTrack,
  progress: number,
): number => {
  const segments = compiled.segments;
  if (segments.length === 0) return 0;

  const current = localProgress(compiled, progress);
  let previous = segments[0];
  if (current <= previous.pos) return previous.value;

  for (let index = 1; index < segments.length; index++) {
    const segment = segments[index];
    if (current <= segment.pos) {
      if (segment.type !== "tween") return segment.value;
      const duration = segment.pos - previous.pos;
      if (duration <= 0) return segment.value;
      const raw = clamp01((current - previous.pos) / duration);
      const eased = segment.easing?.(raw) ?? raw;
      return previous.value + (segment.value - previous.value) * eased;
    }
    previous = segment;
  }
  return previous.value;
};

export default class Timeline {
  private readonly callbacks = {
    start: [] as Array<() => void>,
    end: [] as Array<() => void>,
    loop: [] as Array<() => void>,
  };

  onStart(callback: () => void): void {
    this.callbacks.start.push(callback);
  }

  onEnd(callback: () => void): void {
    this.callbacks.end.push(callback);
  }

  onLoop(callback: () => void): void {
    this.callbacks.loop.push(callback);
  }

  create<T extends Record<string, unknown>>(
    setup: (timeline: TimelineBuilder) => T,
    options: {
      defaultEasing?: (progress: number) => number;
      defaultLoop?: number;
    } = {},
  ): T & { update: (progress: number) => void; progress: () => number } {
    const bindings: TrackBinding[] = [];
    let currentProgress = 0;
    let hasStarted = false;
    let hasEnded = false;
    const defaultEasing = options.defaultEasing ?? ((progress: number) => progress);
    const defaultLoop = Math.max(0, options.defaultLoop ?? 0);

    const execute = (callback: () => void, label: string) => {
      try {
        callback();
      } catch (error) {
        console.warn(`${label}:`, error);
      }
    };

    const compile = (build: (keyframes: KeyframeBuilder) => void) => {
      const segments: TimelineSegment[] = [];
      let position = 0;
      let loopCount = defaultLoop;

      const parseCallbacks = (
        easing?: ((progress: number) => number) | (() => void),
        callback?: () => void,
      ) => {
        if (easing && callback === undefined && easing.length === 0) {
          return { easing: defaultEasing, callback: easing as () => void };
        }
        return {
          easing: (easing as ((progress: number) => number) | undefined) ?? defaultEasing,
          callback,
        };
      };

      const keyframes: KeyframeBuilder = {
        start(value, delay = 0, callback) {
          position = Math.max(0, delay);
          segments.push({ pos: position, value, callback, type: "start" });
          return keyframes;
        },
        at(progress, value, easing, callback) {
          const parsed = parseCallbacks(easing, callback);
          position = Math.max(0, progress);
          segments.push({
            pos: position,
            value,
            easing: parsed.easing,
            callback: parsed.callback,
            type: "tween",
          });
          return keyframes;
        },
        then(value, duration, easing, callback) {
          const parsed = parseCallbacks(easing, callback);
          position += Math.max(0, duration);
          segments.push({
            pos: position,
            value,
            easing: parsed.easing,
            callback: parsed.callback,
            type: "tween",
          });
          return keyframes;
        },
        loop(count = Infinity) {
          loopCount = count === Infinity ? Infinity : Math.max(0, Math.floor(count));
          return keyframes;
        },
      };

      build(keyframes);
      segments.sort((first, second) => first.pos - second.pos);
      return { segments, loopCount };
    };

    const bindTrack = (compiled: CompiledTimelineTrack, delay = 0) => {
      const track: TimelineTrack = {
        currentValue: interpolateTrack(compiled, 0),
        getValue(progress) {
          const adjusted = delay >= 1 ? 0 : Math.max(0, progress - delay) / (1 - delay);
          return interpolateTrack(compiled, adjusted);
        },
        get current() {
          return this.currentValue;
        },
        value() {
          return this.currentValue;
        },
      };
      bindings.push({ track, compiled, delay });
      return track;
    };

    const timeline: TimelineBuilder = {
      track(keyframesOrBuild) {
        const compiled =
          typeof keyframesOrBuild === "function"
            ? compile(keyframesOrBuild)
            : keyframesOrBuild;
        return bindTrack(compiled);
      },
      keyframes: compile,
      stagger(count, offset, build) {
        const compiled = compile(build);
        return Array.from({ length: Math.max(0, Math.floor(count)) }, (_, index) =>
          bindTrack(compiled, Math.max(0, index * offset)),
        );
      },
    };

    const result = setup(timeline);

    const update = (progress: number) => {
      if (!Number.isFinite(progress)) {
        throw new TypeError("Timeline progress must be a finite number");
      }
      const previous = currentProgress;
      currentProgress = Math.max(0, progress);

      if (!hasStarted && currentProgress > 0) {
        hasStarted = true;
        this.callbacks.start.forEach((callback) => execute(callback, "Start callback error"));
      }

      const finitePasses = bindings
        .map(({ compiled }) => compiled.loopCount)
        .filter((count) => count !== Infinity)
        .map((count) => count + 1);
      const hasInfiniteTrack = bindings.some(
        ({ compiled }) => compiled.loopCount === Infinity,
      );
      const endAt = finitePasses.length ? Math.max(...finitePasses) : 1;
      if (!hasInfiniteTrack && !hasEnded && currentProgress >= endAt) {
        hasEnded = true;
        this.callbacks.end.forEach((callback) => execute(callback, "End callback error"));
      }

      if (currentProgress < previous) {
        hasStarted = currentProgress > 0;
        hasEnded = false;
      } else {
        const firstBoundary = Math.max(1, Math.floor(previous) + 1);
        const lastBoundary = Math.floor(currentProgress);
        for (let boundary = firstBoundary; boundary <= lastBoundary; boundary++) {
          if (bindings.some(({ compiled }) => compiled.loopCount >= boundary)) {
            this.callbacks.loop.forEach((callback) => execute(callback, "Loop callback error"));
          }
        }
      }

      for (const binding of bindings) {
        binding.track.currentValue = binding.track.getValue(currentProgress);
        if (currentProgress <= previous) continue;

        const passes =
          binding.compiled.loopCount === Infinity
            ? Math.floor(currentProgress) + 1
            : binding.compiled.loopCount + 1;
        for (let pass = 0; pass < passes; pass++) {
          for (const segment of binding.compiled.segments) {
            if (!segment.callback) continue;
            const localThreshold = pass + segment.pos;
            const threshold =
              binding.delay + localThreshold * Math.max(0, 1 - binding.delay);
            const crossed =
              (threshold > previous && threshold <= currentProgress) ||
              (threshold === 0 && previous === 0 && currentProgress > 0);
            if (crossed) execute(segment.callback, "Keyframe callback error");
          }
        }
      }
    };

    return {
      ...result,
      update,
      progress: () => currentProgress,
    };
  }
}
