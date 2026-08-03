---
sidebar_position: 5
id: klintfunctions-time
title: Time Management
slug: /klintfunctions-time
---

# Time Management in Klint

Klint provides several properties to track and manage time in your animations and interactive sketches. By default, Klint ticks at 60fps, giving you smooth animations while providing different ways to measure and respond to time.

## Animation Loop

By default, Klint attempts to run your `draw` function at 60 frames per second (fps) using the browser's `requestAnimationFrame` API. This provides smooth animations optimized for most displays.

```jsx
// Default behavior - runs at ~60fps
function MySketch() {
  const draw = (K) => {
    // This runs approximately 60 times per second
    K.background("#333");
    K.circle(K.width/2, K.height/2, 50 + Math.sin(K.frame * 0.05) * 25);
  };
  
  return <Klint draw={draw} />;
}
```

You can disable the animation loop using the `static` option, which causes the `draw` function to execute only once:

```jsx
// Static mode - draw runs only once
<Klint draw={myDrawFunction} options={{ static: true }} />
```

## Time Properties

Klint provides three ways to track time, each serving different purposes:

### K.frame

```ts
K.frame: number
```

**The primary time tracking property** for creative coding in Klint. This is the number of frames rendered since the sketch started (after preload and setup completed).

**Characteristics:**
- Integer value that increments by 1 each frame
- Starts at 0
- Most intuitive for creative coding
- Perfect for animation sequencing and keyframes
- Ideal for triggering events at specific frames

**Example:**
```jsx
const draw = (K) => {
  K.background("#333");
  
  // Animation based on frame count
  const angle = K.frame * 0.02;
  const x = K.width/2 + Math.cos(angle) * 100;
  const y = K.height/2 + Math.sin(angle) * 100;
  
  K.fillColor("red");
  K.circle(x, y, 20);
  
  // Trigger events at specific frames
  if (K.frame % 60 === 0) {
    console.log("One second passed!");
  }
};
```

As a general rule, **use K.frame for most animation needs** unless you specifically need the other time properties.

### K.time

```ts
K.time: number
```

The total elapsed time in **seconds** since the animation started.

**Characteristics:**
- Floating-point value in seconds
- Accumulates based on frame rate and performance
- More consistent for longer running animations
- Ideal for real-time simulations
- Use when you need true time-based animation

**Example:**
```jsx
const draw = (K) => {
  K.background("#333");

  // Time-based animation (period of 2 seconds)
  const cycle = (K.time % 2) / 2;
  const size = 20 + Math.sin(cycle * Math.PI * 2) * 15;

  K.fillColor("blue");
  K.circle(K.width/2, K.height/2, size);

  // Display the elapsed time
  K.fillColor("white");
  K.textSize(16);
  K.text(`Time: ${K.time.toFixed(1)}s`, 10, 30);
};
```

### K.deltaTime

```ts
K.deltaTime: number
```

The time in **milliseconds** taken to compute the previous frame.

**Characteristics:**
- Floating-point value in milliseconds
- Varies based on computational complexity and device performance
- Essential for physics simulations and frame-rate independent animations
- Helps make animations consistent regardless of frame rate

**Example:**
```jsx
const P = useStorage({
  position: { x: 100, y: 100 },
  velocity: { x: 50, y: 30 } // pixels per second
});

const draw = (K) => {
  K.background("#333");
  
  // Physics simulation with deltaTime
  // Move object based on velocity and elapsed time
  const timeScale = K.deltaTime / 1000; // Convert to seconds
  
  P.position.x += P.velocity.x * timeScale;
  P.position.y += P.velocity.y * timeScale;
  
  // Bounce off edges
  if (P.position.x < 0 || P.position.x > K.width) P.velocity.x *= -1;
  if (P.position.y < 0 || P.position.y > K.height) P.velocity.y *= -1;
  
  K.fillColor("green");
  K.circle(P.position.x, P.position.y, 20);
  
  // Display delta time
  K.fillColor("white");
  K.textSize(16);
  K.text(`Frame time: ${K.deltaTime.toFixed(2)}ms`, 10, 30);
};
```

## Choosing the Right Time Property

Each time property is designed for specific use cases:

| Property | Best For | Not Great For |
|----------|----------|---------------|
| `K.frame` | **Default choice**: simple animations, creative coding, keyframes | Physics simulations that must be frame-rate independent |
| `K.time` (seconds) | Long-running animations, consistent timing across devices | When exact frame counts matter |
| `K.deltaTime` (ms) | Physics simulations, frame-rate independent behavior | Animation sequencing |

## Time Management Patterns

### Frame-Based Animation (Recommended)

For most creative coding applications, frame-based timing is simplest and most intuitive:

```jsx
const draw = (K) => {
  K.background("#333");
  
  // A 300-frame animation loop
  const animationProgress = (K.frame % 300) / 300;
  const x = K.width * animationProgress;
  
  K.fillColor("orange");
  K.circle(x, K.height/2, 30);
};
```

### Time-Based Animation

For animations that need to run at the same speed regardless of frame rate:

```jsx
const draw = (K) => {
  K.background("#333");

  // A 5-second animation loop (K.time is in seconds)
  const animationProgress = (K.time % 5) / 5;
  const x = K.width * animationProgress;

  K.fillColor("purple");
  K.circle(x, K.height/2, 30);
};
```

### Physics Simulation

For realistic physics that runs consistently:

```jsx
const P = useStorage({
  ball: {
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 98.1 } // gravity in pixels/second²
  }
});

const draw = (K) => {
  K.background("#333");
  
  const dt = K.deltaTime / 1000; // Convert to seconds
  const ball = P.ball;
  
  // Apply acceleration to velocity
  ball.velocity.x += ball.acceleration.x * dt;
  ball.velocity.y += ball.acceleration.y * dt;
  
  // Apply velocity to position
  ball.position.x += ball.velocity.x * dt;
  ball.position.y += ball.velocity.y * dt;
  
  // Bounce off bottom with dampening
  if (ball.position.y > K.height - 15) {
    ball.velocity.y *= -0.8;
    ball.position.y = K.height - 15;
  }
  
  // Bounce off sides
  if (ball.position.x < 15 || ball.position.x > K.width - 15) {
    ball.velocity.x *= -0.9;
  }
  
  K.fillColor("cyan");
  K.circle(ball.position.x, ball.position.y, 30);
};
```

## Performance Considerations

- Complex canvas operations can reduce the actual frame rate below 60fps
- The imperative nature of canvas means longer/more complex code can slow animations
- Use `K.deltaTime` to ensure physics simulations run at consistent speeds
- Monitor performance with a simple FPS counter:

```jsx
const perf = useStorage({ fps: 0, frameCount: 0, lastSecond: 0 });

const draw = (K) => {
  perf.set("frameCount", perf.get("frameCount") + 1);
  if (K.time - perf.get("lastSecond") >= 1) {
    perf.set("fps", perf.get("frameCount"));
    perf.set("frameCount", 0);
    perf.set("lastSecond", K.time);
  }

  K.fillColor("white");
  K.textSize(16);
  K.text(`FPS: ${perf.get("fps")}`, 10, 20);
};
```

By understanding and correctly using Klint's time properties, you can create animations that run smoothly and consistently across different devices and performance levels.

