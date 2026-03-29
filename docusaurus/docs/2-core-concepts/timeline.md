# Timeline

The Timeline provides advanced animation sequencing capabilities with keyframe-based animations. Unlike other elements, Timeline is accessed through the `useKlint` hook for optimal performance.

## Access

```tsx
function MyCanvas() {
  const { KlintTimeline } = useKlint();
  const { Timeline, onStart, onEnd } = KlintTimeline();

  // Create timeline once (outside draw function)
  const { scaleIn, scaleOut, staggerTracks } = Timeline.create((timeline) => {
    const scaleIn = timeline.track((kf) =>
      kf.start(0)
        .then(1, 0.5)
        .then(0, 1)
    );

    const scaleOut = timeline.track((kf) =>
      kf.start(0.5)
        .then(1.5, 0.3)
        .then(1, 0.2)
    );

    const staggerTracks = timeline.stagger(5, 0.1, (keyframes) => {
      keyframes.start(0).at(0.5, 1).at(1, 0);
    });

    return { scaleIn, scaleOut, staggerTracks };
  });

  const draw = (K: KlintContext) => {
    const progress = K.time % 1; // 0-1 over 1 second

    // Update timeline
    scaleIn.update(progress);
    
    // Use timeline values
    const a = scaleIn.current - scaleOut.current;
    K.circle(100, 100, a * 50);
  };
}
```

## Core Methods

### Timeline.create(setup, options?)

Creates a timeline with tracks and returns an object with your tracks and an update method.

```tsx
const { fadeIn, slideIn } = Timeline.create((timeline) => {
  const fadeIn = timeline.track((kf) =>
    kf.start(0)
      .then(1, 0.5)
      .at(1, 0)
  );

  const slideIn = timeline.track((kf) =>
    kf.start(-100)
      .then(0, 0.8, K.Easing.elasticOut)
  );

  return { fadeIn, slideIn };
});
```

### track.current / track.value()

Access the current value of a track. Both methods return the same value.

```tsx
// Using .current property
const alpha = fadeIn.current;

// Using .value() method  
const position = slideIn.value();

// Combined values
const scale = fadeIn.current * slideIn.value();
```

### track.update(progress)

Updates the timeline with progress (0-1). Call this once per frame.

```tsx
const draw = (K: KlintContext) => {
  const progress = K.time % 1;
  fadeIn.update(progress);
  
  K.globalAlpha(fadeIn.current);
  K.circle(100, 100, 50);
};
```

## Advanced Methods

### timeline.stagger(count, offset, keyframes)

Creates multiple tracks with staggered timing offsets.

```tsx
const { staggeredItems } = Timeline.create((timeline) => {
  const staggeredItems = timeline.stagger(10, 0.1, (kf) => {
    kf.start(0)
      .then(1, 0.3)
      .then(0, 0.7);
  });

  return { staggeredItems };
});

const draw = (K: KlintContext) => {
  const progress = K.time % 1;
  staggeredItems.update(progress);

  staggeredItems.forEach((track, i) => {
    const value = track.current;
    K.fillColor(`hsl(${i * 36}, 70%, 60%)`);
    K.circle(50 + i * 80, 200 + value * 100, 20);
  });
};
```

### Keyframe Builder Methods

#### start(value, delay?, callback?)
Sets the starting value of a track.

#### then(value, duration, easing?, callback?)
Animates to a value over a duration.

#### at(position, value, easing?, callback?)
Sets a value at a specific position (0-1).

```tsx
const { complexAnim } = Timeline.create((timeline) => {
  const complexAnim = timeline.track((kf) =>
    kf.start(0, 0.1)           // Start at 0 after 0.1 delay
      .then(100, 0.3)          // Move to 100 over 0.3 duration
      .at(0.8, 50)             // At position 0.8, be at value 50
      .then(0, 0.2)            // End at 0 over 0.2 duration
  );

  return { complexAnim };
});
```

## Animation Patterns

### Sequential Animation

```tsx
function SequenceCanvas() {
  const { KlintTimeline } = useKlint();
  const { Timeline } = KlintTimeline();

  const { fadeIn, scaleUp, rotateAnim, fadeOut } = Timeline.create((timeline) => {
    const fadeIn = timeline.track((kf) =>
      kf.start(0).at(0.25, 1)
    );
    
    const scaleUp = timeline.track((kf) =>
      kf.start(1).at(0.25, 1).at(0.5, 1.5)
    );
    
    const rotateAnim = timeline.track((kf) =>
      kf.start(0).at(0.5, 0).at(0.75, Math.PI * 2)
    );
    
    const fadeOut = timeline.track((kf) =>
      kf.start(1).at(0.75, 1).at(1, 0)
    );

    return { fadeIn, scaleUp, rotateAnim, fadeOut };
  });

  const draw = (K: KlintContext) => {
    K.background("#222");
    
    const progress = (K.time / 8) % 1; // 8-second cycle
    fadeIn.update(progress);

    K.push();
    K.translate(K.width / 2, K.height / 2);
    
    // Apply all animations
    K.globalAlpha(fadeIn.current * fadeOut.current);
    K.scale(scaleUp.current, scaleUp.current);
    K.rotate(rotateAnim.current);
    
    K.fillColor("white");
    K.alignText("center", "middle");
    K.textSize(48);
    K.text("Animated", 0, 0);
    
    K.pop();
  };
}
```

### Callbacks and Events

```tsx
function CallbackCanvas() {
  const { KlintTimeline } = useKlint();
  const { Timeline, onStart, onEnd } = KlintTimeline();

  // Setup global callbacks
  onStart(() => console.log("Animation started!"));
  onEnd(() => console.log("Animation completed!"));

  const { bounce } = Timeline.create((timeline) => {
    const bounce = timeline.track((kf) =>
      kf.start(0)
        .then(100, 0.5, K.Easing.bounceOut, () => console.log("Bounced!"))
        .then(0, 0.5)
    );

    return { bounce };
  });

  const draw = (K: KlintContext) => {
    const progress = K.time % 1;
    bounce.update(progress);
    
    K.circle(K.width / 2, K.height / 2 + bounce.current, 20);
  };
}
```

## Best Practices

### ✅ **DO: Create timelines outside draw function**
```tsx
// ✅ Good - created once
const { anim } = Timeline.create((timeline) => { ... });

const draw = (K) => {
  anim.update(progress);
  K.circle(100, 100, anim.current);
};
```

### ❌ **DON'T: Create timelines inside draw function**
```tsx
// ❌ Bad - creates new timeline every frame
const draw = (K) => {
  const { anim } = Timeline.create(...); // Performance issue!
  K.circle(100, 100, anim.current);
};
```

### ✅ **DO: Use meaningful track names**
```tsx
const { fadeIn, slideOut, pulseEffect } = Timeline.create(...);
```

### ✅ **DO: Combine tracks for complex animations**
```tsx
const opacity = fadeIn.current * fadeOut.current;
const position = slideIn.current + offsetTrack.current;
```

### ✅ **DO: Use callbacks for synchronization**
```tsx
onStart(() => setState("animating"));
onEnd(() => setState("complete"));
```

## Performance Notes

- **Timeline creation is expensive** - Always create outside draw function
- **Updates are cheap** - Call `track.update(progress)` every frame
- **Value access is instant** - `track.current` and `track.value()` are O(1)
- **Memory efficient** - Tracks persist between frames, no recreation
- **Callback safe** - Error handling prevents crashes from user callbacks

