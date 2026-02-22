# Using Klint with React

Klint is designed specifically for React, integrating with its component model while carefully avoiding unnecessary re-renders. Understanding this architecture is key to building performant Klint applications.

## Architecture Overview

```jsx
import { Klint, useKlint, useStorage } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();

  const draw = (K) => {
    K.background("#222");
    K.fillColor("red");
    K.circle(K.width/2, K.height/2, 100);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

### How Klint Avoids Re-renders

Klint's architecture is built around a fundamental principle: **canvas operations should happen outside React's render cycle**.

Here's how it works:

1. The canvas element is created and managed using React's `useRef`
2. The canvas context is separated from the canvas, initialized and stored in a ref via the `useKlint` hook
3. Drawing operations modify the canvas directly without triggering React re-renders
4. The render loop operates independently of React's update schedule

This approach makes Klint extremely efficient, as canvas drawing operations don't cause component re-renders.

## Data Management

### useStorage: State Without Re-renders

The `useStorage` hook provides persistent state storage that doesn't trigger re-renders:

```jsx
function MySketch() {
  const { context } = useKlint();

  const storage = useStorage({
    particles: [],
    activeColor: "red",
    count: 0
  });

  const setup = (K) => {
    storage.set("particles", Array(100).fill(null).map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    })));
  };

  const draw = (K) => {
    K.background("#333");

    for (const p of storage.get("particles")) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > K.width) p.vx *= -1;
      if (p.y < 0 || p.y > K.height) p.vy *= -1;

      K.fillColor(storage.get("activeColor"));
      K.circle(p.x, p.y, 5);
    }

    storage.set("count", storage.get("count") + 1);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Klint context={context} setup={setup} draw={draw} />
    </div>
  );
}
```

The `useStorage` hook:
- Creates a persistent store for your sketch data using `get(key)` and `set(key, value)` methods
- Changes to this data don't trigger React re-renders
- Values persist between frames and throughout the component lifecycle
- Also exposes `has(key)` and `remove(key)` for checking and deleting entries

### Handling React Props

When you need to pass data from parent React components to Klint:

```jsx
function ControlledSketch({ color, particleCount }) {
  const { context } = useKlint();
  const storage = useStorage({ particles: [] });
  const props = useProps({ color, particleCount });

  const setup = (K) => {
    storage.set("particles", Array(props.particleCount).fill(null).map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    })));
  };

  const draw = (K) => {
    K.background("#333");
    K.fillColor(props.color);

    for (const p of storage.get("particles")) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > K.width) p.vx *= -1;
      if (p.y < 0 || p.y > K.height) p.vy *= -1;

      K.circle(p.x, p.y, 5);
    }
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Klint context={context} setup={setup} draw={draw} />
    </div>
  );
}
```

### Passing Image and Video Resources

When working with images or videos, prefer the KlintImage and KlintVideo hook. Unless you really need it, i.e. an image needs to appear in HTML and on the Klint canvas, it's better to consider ressources loaded in Klint as completly independent from the DOM tree. Klint will always make sure you medias are ready when they hit the draw loop.

If you need to pass the image from the parent component, pass it as a prop.

Loaded in the preload :

```jsx
function KlintSketch({ image }) {
  const draw = (K) => {
    K.background("#333");
    if (image) {
      K.image(image, K.width/2, K.height/2);
    }
  };
  
  return <Klint draw={draw} />;
}
```

Loaded from the parent : 

```jsx
function ParentComponent() {
  const [img, setImg] = useState(null);
  
  useEffect(() => {
    const image = new Image();
    image.onload = () => setImg(image);
    image.src = 'path/to/image.jpg';
  }, []);
  
  return (
    <div>
      {img && <KlintSketch image={img} />}
    </div>
  );
}

function KlintSketch({ image }) {
  const draw = (K) => {
    K.background("#333");
    if (image) {
      K.image(image, K.width/2, K.height/2);
    }
  };
  
  return <Klint draw={draw} />;
}
```


## Best Practices

### 1. Treat Klint as the End of Your Rendering Pipeline

Klint is designed to be the final step in your application's rendering flow:

```
Data Fetching → Data Processing → React UI Components → Klint Visualization
```

Avoid using Klint for:
- Data fetching
- Complex state management
- Business logic

Instead, handle these aspects in your React components, and pass the final data to Klint for visualization.

### 2. Minimize React State Within Klint Components

Do not use React's `useState` within components that contain Klint, as state changes trigger re-renders. Instead:

- Use `useStorage` for Klint-specific state
- Pass props from parent components when needed
- Keep state changes at higher levels in your component tree

### 3. Handle Window Resize Events

Klint provides built-in hooks for handling window resize events, if you are on tight resources, consider using an `Observer`:

```jsx
function MySketch() {
  const { context, KlintWindow } = useKlint();
  const { onResize } = KlintWindow();

  const storage = useStorage({ scale: 1 });

  onResize(() => {
    storage.set("scale", Math.min(window.innerWidth, window.innerHeight) / 1000);
  });

  const draw = (K) => {
    K.background("#333");
    K.circle(K.width/2, K.height/2, 100 * storage.get("scale"));
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```


### 4. Beware of Closure Issues

Since Klint functions run outside React's normal update cycle, you need to be careful with closures:

```jsx
// Problematic - uses closed-over props that won't update
function MySketch({ color }) {
  const { context } = useKlint();
  const draw = (K) => {
    K.fillColor(color); // This captures the initial value of color
    K.circle(K.width/2, K.height/2, 100);
  };
  return <Klint context={context} draw={draw} />;
}

// Better - passes props via useProps so they're always current
function MySketch({ color }) {
  const { context } = useKlint();
  const props = useProps({ color });
  const draw = (K) => {
    K.fillColor(props.color); // Access current value
    K.circle(K.width/2, K.height/2, 100);
  };
  return <Klint context={context} draw={draw} />;
}
```

## Advanced Patterns

### Component Composition

For complex visualizations, split functionality across components:

```jsx
function useParticleSystem(count) {
  const storage = useStorage({ items: [] });

  const setup = (K) => {
    storage.set("items", createParticles(count, K.width, K.height));
  };

  const draw = (K) => {
    updateParticles(storage.get("items"), K);
  };

  return { setup, draw, storage };
}

function MySketch() {
  const { context } = useKlint();
  const particleSystem = useParticleSystem(100);

  const setup = (K) => {
    particleSystem.setup(K);
  };

  const draw = (K) => {
    K.background("#333");
    particleSystem.draw(K);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Klint context={context} setup={setup} draw={draw} />
    </div>
  );
}
```

### Custom Hooks for Reusable Behaviors

Create custom hooks for reusable canvas behaviors:

```jsx
function useMouseTrail(mouse, options = {}) {
  const { maxPoints = 20, fadeRate = 0.95 } = options;
  const trail = useStorage({ points: [] });

  const update = () => {
    const points = trail.get("points");
    if (mouse.x && mouse.y) {
      points.push({ x: mouse.x, y: mouse.y, alpha: 1 });
      if (points.length > maxPoints) points.shift();
    }
    points.forEach(p => { p.alpha *= fadeRate; });
    trail.set("points", points.filter(p => p.alpha > 0.01));
  };

  const draw = (K) => {
    for (const p of trail.get("points")) {
      K.fillColor(`rgba(255, 255, 255, ${p.alpha})`);
      K.circle(p.x, p.y, 5);
    }
  };

  return { update, draw };
}

// Usage
function MySketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  const mouseTrail = useMouseTrail(mouse, { maxPoints: 50 });

  const draw = (K) => {
    K.background("#333");
    mouseTrail.update();
    mouseTrail.draw(K);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

## Performance Monitoring

To monitor your Klint component's performance:

```jsx
function MySketch() {
  const { context } = useKlint();
  const perf = useStorage({ fps: 0, frameCount: 0, lastTime: 0 });

  const draw = (K) => {
    const now = performance.now();
    perf.set("frameCount", perf.get("frameCount") + 1);
    if (now - perf.get("lastTime") >= 1000) {
      perf.set("fps", perf.get("frameCount"));
      perf.set("frameCount", 0);
      perf.set("lastTime", now);
    }

    K.background("#333");
    K.fillColor("white");
    K.textSize(16);
    K.text(`FPS: ${perf.get("fps")}`, 10, 20);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

Remember that Klint's architecture is optimized for canvas rendering performance and does what i cans to save precious CPU cycles, but it comes with the responsibility to manage your application's data flow and component updates carefully.
