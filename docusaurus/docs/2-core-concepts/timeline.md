---
sidebar_position: 5
---

# Timeline

Every Klint context includes `K.Timeline`, a numeric keyframe timeline. It is an element on the context, not a React hook.

```tsx
const animation = K.Timeline.create((timeline) => ({
  x: timeline.track((keyframes) => {
    keyframes
      .start(0)
      .then(100, 0.5, (t) => K.Easing.out(t, 3))
      .then(0, 0.5);
  }),
  scale: timeline.track((keyframes) => {
    keyframes.start(1).then(2, 1);
  }),
}));

animation.update(0.25);
K.circle(animation.x.current, 100, animation.scale.current * 20);
```

A timeline does not own a clock. Call `update(progress)` with whatever progress model your sketch needs. A single pass normally runs from 0 to 1; looped tracks can consume progress beyond 1.

## Keyframes

### `start(value, delay?, callback?)`

Sets the initial value and optional normalized delay.

```ts
keyframes.start(0);
keyframes.start(0, 0.2); // hold until progress 0.2
```

### `then(value, duration, easing?, callback?)`

Adds a tween relative to the previous keyframe.

```ts
keyframes
  .start(0)
  .then(100, 0.4, (t) => K.Easing.out(t, 3))
  .then(50, 0.6);
```

### `at(progress, value, easing?, callback?)`

Adds a tween ending at an absolute progress position.

```ts
keyframes
  .start(0)
  .at(0.25, 20)
  .at(1, 100, (t) => K.Easing.inout(t, 3));
```

### `loop(count?)`

Repeats a track after its initial pass. `count` is the number of additional repeats; omitting it loops forever.

```ts
keyframes.start(0).then(1, 1).loop(2); // three total passes
```

## Read track values

```ts
animation.update(progress);
animation.x.current;
animation.x.value();
animation.x.getValue(0.75); // sample without changing current
animation.progress();       // most recently supplied progress
```

## Reuse keyframes

Compile a definition once and bind it to multiple tracks:

```ts
const animation = K.Timeline.create((timeline) => {
  const fade = timeline.keyframes((keyframes) => {
    keyframes.start(0).then(1, 1);
  });

  return {
    opacity: timeline.track(fade),
    items: timeline.stagger(5, 0.1, (keyframes) => {
      keyframes.start(0).then(1, 1);
    }),
  };
});
```

`stagger(count, offset, build)` creates tracks with progressively delayed starts.

## Defaults and callbacks

```ts
K.Timeline.onStart(() => console.log('started'));
K.Timeline.onLoop(() => console.log('loop boundary'));
K.Timeline.onEnd(() => console.log('finished'));

const animation = K.Timeline.create(
  (timeline) => ({
    x: timeline.track((keyframes) => {
      keyframes
        .start(0, 0, () => console.log('first frame'))
        .then(100, 1, () => console.log('keyframe reached'));
    }),
  }),
  {
    defaultEasing: (t) => K.Easing.inout(t, 3),
    defaultLoop: 1,
  },
);
```

Callbacks run when forward progress crosses their boundary. Rewinding progress resets start/end state so the timeline can be played again. Callback errors are reported as warnings without stopping other tracks.

## Driving a timeline with Klint time

```tsx
let animation;

const setup = (K: KlintContext) => {
  animation = K.Timeline.create((timeline) => ({
    x: timeline.track((keyframes) => {
      keyframes.start(0).then(K.width, 1).loop();
    }),
  }));
};

const draw = (K: KlintContext) => {
  animation.update(K.time / 2); // one pass every two seconds
  K.circle(animation.x.current, K.height / 2, 20);
};
```

Use `K.frame`, `K.time`, scroll distance, pointer distance, or any other finite number as progress. `update()` rejects `NaN` and infinite values.
