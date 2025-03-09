import { KlintContexts } from "../Klint";

interface KlintTime {
  context: KlintContexts;
  timeline(key: string): KlintTime;
  use(progress: number): KlintTime;
  for(duration: number): KlintTime;
}

interface KlintTimeline {
  progress: number;
  duration: number;
}

class Time implements KlintTime {
  context: KlintContexts;
  private timelines: Map<string, KlintTimeline> = new Map();
  private currentTimeline: string = "default";
  private readonly DEFAULT_DURATION = 8 * 60;
  private staggers: { id: number; progress: number }[] = [];
  constructor(ctx: KlintContexts) {
    this.context = ctx;
    this.timelines.set("default", {
      progress: 0,
      duration: this.DEFAULT_DURATION,
    });
  }

  timeline(key: string) {
    if (!this.timelines.has(key)) {
      this.timelines.set(key, { progress: 0, duration: this.DEFAULT_DURATION });
    }
    this.currentTimeline = key;
    return this;
  }

  use(progress: number) {
    const timeline = this.timelines.get(this.currentTimeline)!;
    if (timeline.duration <= 0) {
      timeline.progress = 0;
      return this;
    }
    timeline.progress =
      timeline.duration === 1
        ? Math.min(progress, 1)
        : (progress / timeline.duration) % 1;
    return this;
  }

  for(duration: number) {
    const timeline = this.timelines.get(this.currentTimeline)!;
    timeline.duration = duration;
    // timeline.progress =
    // ((timeline.progress * timeline.duration) % timeline.duration) /
    // timeline.duration;

    return this;
  }

  stagger(
    num: number,
    offset = 0,
    callback?: (progress: number, id: number, num: number) => void
  ) {
    const timeline = this.timelines.get(this.currentTimeline)!;

    const totalduration = this.context.remap(
      timeline.progress,
      0,
      1,
      0,
      1 + offset
    );

    for (let i = 0; i < num; i++) {
      const id = 1 - i / (num - 1);
      const progress = this.context.constrain(
        totalduration - id * offset,
        0,
        1
      );

      if (!callback) {
        if (this.staggers[i]) {
          this.staggers[i].progress = progress;
        } else {
          this.staggers[i] = { progress: progress, id: id };
        }
      } else {
        callback?.(progress, id, num);
      }
    }
    return callback ? this : this.staggers;
  }

  between(from = 0, to = 1, callback: (progress: number) => void) {
    const timeline = this.timelines.get(this.currentTimeline)!;
    const localProgress = this.context.remap(
      timeline.progress,
      Math.max(0, from),
      Math.min(1, to),
      0,
      1
    );
    callback(localProgress);
    return this;
  }

  progress() {
    return this.timelines.get(this.currentTimeline)?.progress || 0;
  }
}

export default Time;
