# Easing

The Easing element provides animation easing functions for smooth transitions and motion effects.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Access the Easing element
  const t = K.time * 0.5; // 0 to 1 over 2 seconds  
  const eased = K.Easing.inout(t); // Apply easing
}
```

## Basic Functions

### in(val, power?)

```ts
in(val: number, power?: number) => number
```

Ease-in (slow start, fast end). Default power is 2.

```tsx
const t = (K.time % 2) / 2; // 0 to 1 over 2 seconds
const eased = K.Easing.in(t, 3); // Cubic ease-in

K.fillColor("red");
K.circle(100 + eased * 300, 200, 20);
```

### out(val, power?)

```ts
out(val: number, power?: number) => number
```

Ease-out (fast start, slow end). Default power is 2.

```tsx
const t = (K.time % 2) / 2;
const eased = K.Easing.out(t, 2); // Quadratic ease-out

K.fillColor("blue");
K.circle(100, 200 + eased * 200, 20);
```

### inout(val, power?)

```ts
inout(val: number, power?: number) => number
```

Ease-in-out (slow start and end, fast middle). Default power is 2.

```tsx
const t = (K.time % 3) / 3;
const eased = K.Easing.inout(t, 4); // Quartic ease-in-out

K.fillColor("green");
K.circle(100 + eased * 400, 100, 25);
```

## Utility Functions

### normalize(val)

```ts
normalize(val: number) => number
```

Converts range [-1, 1] to [0, 1].

```tsx
const oscillation = Math.sin(K.time * 2); // -1 to 1
const normalized = K.Easing.normalize(oscillation); // 0 to 1
K.opacity(normalized);
```

### expand(val)

```ts
expand(val: number) => number
```

Converts range [0, 1] to [-1, 1].

```tsx
const progress = (K.time % 4) / 4; // 0 to 1
const expanded = K.Easing.expand(progress); // -1 to 1
const rotation = expanded * Math.PI; // -π to π
```

## Overshoot Easing

### overshootIn(val)

```ts
overshootIn(val: number) => number
```

Backs up before moving forward.

```tsx
const t = (K.time % 2) / 2;
const eased = K.Easing.overshootIn(t);
K.fillColor("purple");
K.circle(200 + eased * 200, 300, 15);
```

### overshootOut(val)

```ts
overshootOut(val: number) => number
```

Overshoots the target then settles back.

```tsx
const t = (K.time % 2) / 2;
const eased = K.Easing.overshootOut(t);
K.fillColor("orange");
K.circle(200, 300 + eased * 200, 15);
```

### overshootInOut(val)

```ts
overshootInOut(val: number) => number
```

Combines overshoot in and out.

## Bounce Easing

### bounceIn(val)

```ts
bounceIn(val: number) => number
```

Bouncing motion that starts.

### bounceOut(val)

```ts
bounceOut(val: number) => number
```

Bouncing motion that settles.

### bounceInOut(val)

```ts
bounceInOut(val: number) => number
```

Bounce at both start and end.

```tsx
const t = (K.time % 3) / 3;
const bounced = K.Easing.bounceOut(t);

K.fillColor("cyan");
K.circle(100, 100 + bounced * 300, 20);
```

## Elastic Easing

### elasticIn(val)

```ts
elasticIn(val: number) => number
```

Elastic motion at the start.

### elasticOut(val)

```ts
elasticOut(val: number) => number
```

Elastic motion at the end.

### elasticInOut(val)

```ts
elasticInOut(val: number) => number
```

Elastic motion at both ends.

```tsx
const t = (K.time % 4) / 4;
const elastic = K.Easing.elasticOut(t);

K.strokeColor("yellow");
K.strokeWidth(3);
K.line(200, 400, 200 + elastic * 200, 400);
```

## Smoothstep

### smoothstep(val, x0?, x1?)

```ts
smoothstep(val: number, x0?: number, x1?: number) => number
```

Smooth Hermite interpolation. Default range is [0, 1].

```tsx
// Custom range smoothstep
const t = K.time % 5;
const smooth = K.Easing.smoothstep(t, 1, 4); // Smooth between t=1 and t=4

K.fillColor("white");
K.opacity(smooth);
K.rectangle(50, 50, 100, 100);
```

## Animation Examples

### Staggered Animation

```tsx
const draw = (K: KlintContext) => {
  K.background("#222");
  
  const numBoxes = 10;
  const duration = 2; // seconds
  
  for (let i = 0; i < numBoxes; i++) {
    // Stagger the timing
    const delay = i * 0.1;
    const t = Math.max(0, (K.time - delay) % (duration + 1)) / duration;
    const clampedT = Math.min(1, t);
    
    // Different easing for each box
    const easings = [
      K.Easing.in(clampedT),
      K.Easing.out(clampedT),
      K.Easing.inout(clampedT),
      K.Easing.bounceOut(clampedT),
      K.Easing.elasticOut(clampedT)
    ];
    
    const eased = easings[i % easings.length];
    
    K.fillColor(`hsl(${i * 36}, 70%, 60%)`);
    K.rectangle(50 + i * 80, 200 + eased * 200, 60, 40);
  }
}
```

### UI Transitions

```tsx
const draw = (K: KlintContext) => {
  const { mouse } = KlintMouse();
  
  // hoverAmount should be stored via useStorage outside the draw function
  // e.g. const store = useStorage({ buttonHover: 0 });
  
  const buttonX = 200;
  const buttonY = 300;
  const buttonW = 120;
  const buttonH = 50;
  
  // Check if mouse is over button
  const isHover = mouse.x > buttonX && mouse.x < buttonX + buttonW &&
                  mouse.y > buttonY && mouse.y < buttonY + buttonH;
  
  // Animate hover state
  let hoverAmount = store.get('buttonHover');
  const speed = 0.1;
  hoverAmount += (isHover ? 1 : 0 - hoverAmount) * speed;
  store.set('buttonHover', hoverAmount);
  
  // Apply easing to hover animation
  const easedHover = K.Easing.overshootOut(hoverAmount);
  
  K.background("#333");
  
  // Draw button with eased hover effect
  K.fillColor(`rgba(100, 150, 255, ${0.3 + easedHover * 0.7})`);
  K.strokeColor("white");
  K.strokeWidth(2 + easedHover * 2);
  
  K.push();
  K.translate(buttonX + buttonW/2, buttonY + buttonH/2);
  K.scale(1 + easedHover * 0.1);
  K.roundedRectangle(-buttonW/2, -buttonH/2, buttonW, 10, buttonH);
  K.pop();
  
  // Button text
  K.fillColor("white");
  K.alignText("center", "middle");
  K.textSize(16);
  K.text("Click Me", buttonX + buttonW/2, buttonY + buttonH/2);
}
```

### Complex Motion

```tsx
const draw = (K: KlintContext) => {
  K.background("#111");
  
  const centerX = K.width / 2;
  const centerY = K.height / 2;
  const numParticles = 12;
  
  for (let i = 0; i < numParticles; i++) {
    // Multiple overlapping time cycles
    const t1 = (K.time * 0.3 + i * 0.5) % 1;
    const t2 = (K.time * 0.7 + i * 0.3) % 1;
    const t3 = (K.time * 1.1 + i * 0.1) % 1;
    
    // Apply different easing functions
    const r = 50 + K.Easing.elasticOut(t1) * 100;
    const angle = t2 * Math.PI * 2;
    const scale = 0.5 + K.Easing.bounceOut(t3) * 1.5;
    
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    
    K.fillColor(`hsl(${i * 30 + K.time * 50}, 80%, 70%)`);
    K.circle(x, y, 10 * scale);
  }
}
```

## Spring

### spring(val, tension?, friction?)

```ts
spring(val: number, tension?: number, friction?: number) => number
```

Damped spring easing. More physically expressive than elastic — feels "alive."

- `tension` (0-1, default 0.5): Higher = faster oscillation.
- `friction` (0-1, default 0.5): Higher = more bouncy (less damping).

```tsx
const t = (K.time % 2) / 2;

// Bouncy spring
const bouncy = K.Easing.spring(t, 0.5, 0.8);

// Critically damped (no overshoot)
const smooth = K.Easing.spring(t, 0.5, 0);
```

## Steps

### steps(val, n?)

```ts
steps(val: number, n?: number) => number
```

Staircase easing — quantizes to N discrete steps. Great for pixel art aesthetics or snapping animations.

```tsx
const t = (K.time % 3) / 3;
const stepped = K.Easing.steps(t, 8); // 8 distinct levels

K.fillColor('#fff');
K.rectangle(50, 50 + stepped * 300, 40, 40);
```

## Damp

### damp(current, target, smoothing, deltaTime)

```ts
damp(current: number, target: number, smoothing: number, deltaTime: number) => number
```

Frame-rate independent exponential smoothing. Use instead of `lerp(a, b, 0.1)` which breaks at different FPS.

```tsx
// Smooth camera follow (in your draw loop)
cameraX = K.Easing.damp(cameraX, player.x, 5, K.deltaTime / 1000);
cameraY = K.Easing.damp(cameraY, player.y, 5, K.deltaTime / 1000);

// Smooth mouse trailing
trailX = K.Easing.damp(trailX, mouse.x, 8, K.deltaTime / 1000);
trailY = K.Easing.damp(trailY, mouse.y, 8, K.deltaTime / 1000);
```

## Impulse

### impulse(val, k?)

```ts
impulse(val: number, k?: number) => number
```

Quick rise then decay. Perfect for hit effects, flashes, particles. Peak is at `val = 1/k`.

```tsx
const t = (K.time % 1);
const flash = K.Easing.impulse(t, 6);

K.fillColor(`rgba(255, 255, 255, ${flash})`);
K.circle(K.width / 2, K.height / 2, 50 + flash * 30);
```

## Parabola

### parabola(val, k?)

```ts
parabola(val: number, k?: number) => number
```

Symmetric arc — 0 at edges, 1 at center. Useful for jump arcs, throw curves.

```tsx
const t = (K.time % 2) / 2;
const arc = K.Easing.parabola(t);

// Jump arc
const jumpHeight = 200;
const playerY = groundY - arc * jumpHeight;
K.circle(playerX, playerY, 15);
```

## Notes

- All easing functions expect input values between 0 and 1
- Output typically ranges from 0 to 1, but some functions (like overshoot, spring) may go beyond this range
- `damp` is the exception — it takes current/target values and returns the smoothed result
- Combine multiple easing functions for complex animations
- Use `normalize()` and `expand()` to convert between different ranges
- For UI animations, overshoot easing feels responsive and modern
- Bounce and elastic easings work well for playful, attention-grabbing effects
- Smoothstep is excellent for crossfades and smooth transitions
- Chain easing functions: `K.Easing.inout(K.Easing.bounceOut(t))`
- `damp` is frame-rate independent — prefer it over naive `lerp(a, b, 0.1)` 