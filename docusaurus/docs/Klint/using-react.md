# Using Klint with React

Klint is designed specifically for React, integrating with its component model while carefully avoiding unnecessary re-renders. Understanding this architecture is key to building performant canvas applications.

## Architecture Overview

```jsx
import { Klint, useKlint, useStorage } from 'klint';

function MySketch() {
  const { context } = useKlint();

  const draw = (K) => {
    K.background("#222");
    K.fillColor("red");
    K.circle(K.width/2, K.height/2, 100);
  };

  return <Klint context={context} draw={draw} />;
}
```

### How Klint Avoids Re-renders

Klint's architecture is built around a fundamental principle: **canvas operations should happen outside React's render cycle**.

Here's how it works:

1. The canvas element is created and managed using React's `useRef`
2. The canvas context is initialized and stored in a ref via the `useKlint` hook
3. Drawing operations modify the canvas directly without triggering React re-renders
4. The render loop operates independently of React's update schedule

This approach makes Klint extremely efficient, as canvas drawing operations don't cause component re-renders.

## Data Management

### useStorage: State Without Re-renders

The `useStorage` hook provides persistent state storage that doesn't trigger re-renders:

```jsx
function MySketch() {
  // Create persistent storage for your sketch
  const P = useStorage({
    particles: [],
    activeColor: "red",
    count: 0
  });

  const setup = (K) => {
    // Initialize with 100 particles
    P.particles = Array(100).fill().map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    }));
  };

  const draw = (K) => {
    K.background("#333");
    
    // Update particles
    for (const p of P.particles) {
      p.x += p.vx;
      p.y += p.vy;
      // Bounce off edges
      if (p.x < 0 || p.x > K.width) p.vx *= -1;
      if (p.y < 0 || p.y > K.height) p.vy *= -1;
      
      K.fillColor(P.activeColor);
      K.circle(p.x, p.y, 5);
    }
    
    // Update counter
    P.count++;
  };

  return <Klint setup={setup} draw={draw} />;
}
```

The `useStorage` hook:
- Creates a persistent store for your sketch data
- Changes to this data don't trigger React re-renders
- Values persist between frames and throughout the component lifecycle
- Provides a cleaner alternative to attaching properties directly to the context

### Handling React Props

When you need to pass data from parent React components to Klint:

```jsx
function ControlledSketch({ color, particleCount }) {
  const P = useStorage({
    particles: []
  });

  const setup = (K) => {
    // Initialize particles based on prop
    regenerateParticles(K, particleCount);
  };
  
  const regenerateParticles = (K, count) => {
    P.particles = Array(count).fill().map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    }));
  };

  const draw = (K) => {
    K.background("#333");
    
    // Use the color prop from the parent component
    K.fillColor(color);
    
    for (const p of P.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > K.width) p.vx *= -1;
      if (p.y < 0 || p.y > K.height) p.vy *= -1;
      
      K.circle(p.x, p.y, 5);
    }
  };

  // When particleCount changes, regenerate particles
  useEffect(() => {
    if (P.particles.length !== particleCount) {
      // We access the Klint context through a custom hook
      const { current: K } = useContext(KlintContext);
      if (K) {
        regenerateParticles(K, particleCount);
      }
    }
  }, [particleCount]);

  return <Klint setup={setup} draw={draw} />;
}
```

### Passing Image Resources

When working with images, prefer passing loaded HTML Image elements rather than URLs:

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

This approach:
- Avoids loading images within Klint
- Ensures images are fully loaded before rendering
- Allows for better resource management
- Can leverage React's suspense and error boundaries

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

Avoid using React's `useState` within components that contain Klint, as state changes trigger re-renders. Instead:

- Use `useStorage` for Klint-specific state
- Pass props from parent components when needed
- Keep state changes at higher levels in your component tree

### 3. Handle Window Resize Events

Klint provides built-in hooks for handling window resize events:

```jsx
function MySketch() {
  const { context, useWindow } = useKlint();
  const { onResize } = useWindow();
  
  const P = useStorage({
    scale: 1
  });
  
  onResize(() => {
    // Update sketch parameters on window resize
    P.scale = Math.min(window.innerWidth, window.innerHeight) / 1000;
  });
  
  const draw = (K) => {
    K.background("#333");
    K.circle(K.width/2, K.height/2, 100 * P.scale);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

### 4. Use Error Boundaries

Since Klint operations happen outside React's normal flow, wrap your Klint components in error boundaries:

```jsx
function KlintErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = (event) => {
      console.error('Canvas error:', event.error);
      setHasError(true);
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return <div className="error">Canvas rendering error</div>;
  }
  
  return children;
}

// Usage
<KlintErrorBoundary>
  <MyKlintComponent />
</KlintErrorBoundary>
```

### 5. Beware of Closure Issues

Since Klint functions run outside React's normal update cycle, you need to be careful with closures:

```jsx
// Problematic - uses closed-over props that won't update
function MySketch({ color }) {
  const draw = (K) => {
    K.fillColor(color); // This captures the initial value of color
    K.circle(K.width/2, K.height/2, 100);
  };
  
  return <Klint draw={draw} />;
}

// Better - passes props to Klint so they're accessible in current state
function MySketch({ color }) {
  const draw = (K) => {
    K.fillColor(K.props.color); // Access current value
    K.circle(K.width/2, K.height/2, 100);
  };
  
  return <Klint draw={draw} color={color} />;
}
```

## Advanced Patterns

### Component Composition

For complex visualizations, split functionality across components:

```jsx
function ParticleSystem({ count }) {
  const particles = useStorage({
    items: []
  });
  
  const setup = (K) => {
    particles.items = createParticles(count, K.width, K.height);
  };
  
  const draw = (K) => {
    // Update and draw particles
    updateParticles(particles.items, K);
  };
  
  return { setup, draw, particles };
}

function MySketch() {
  const particleSystem = ParticleSystem({ count: 100 });
  
  const setup = (K) => {
    particleSystem.setup(K);
  };
  
  const draw = (K) => {
    K.background("#333");
    particleSystem.draw(K);
  };
  
  return <Klint setup={setup} draw={draw} />;
}
```

### Custom Hooks for Reusable Behaviors

Create custom hooks for reusable canvas behaviors:

```jsx
function useMouseTrail(options = {}) {
  const { maxPoints = 20, fadeRate = 0.95 } = options;
  
  const trail = useStorage({
    points: []
  });
  
  const update = (K) => {
    if (K.mouse.x && K.mouse.y) {
      trail.points.push({ x: K.mouse.x, y: K.mouse.y, alpha: 1 });
      if (trail.points.length > maxPoints) {
        trail.points.shift();
      }
    }
    
    // Fade points
    trail.points.forEach(p => {
      p.alpha *= fadeRate;
    });
    
    // Remove completely faded points
    trail.points = trail.points.filter(p => p.alpha > 0.01);
  };
  
  const draw = (K) => {
    trail.points.forEach(p => {
      K.fillColor(`rgba(255, 255, 255, ${p.alpha})`);
      K.circle(p.x, p.y, 5);
    });
  };
  
  return { update, draw };
}

// Usage
function MySketch() {
  const mouseTrail = useMouseTrail({ maxPoints: 50 });
  
  const draw = (K) => {
    K.background("#333");
    mouseTrail.update(K);
    mouseTrail.draw(K);
  };
  
  return <Klint draw={draw} />;
}
```

## Performance Monitoring

To monitor your Klint component's performance:

```jsx
function MySketch() {
  const P = useStorage({
    fps: 0,
    frameCount: 0,
    lastTime: 0
  });
  
  const draw = (K) => {
    // Calculate FPS
    const now = performance.now();
    if (now - P.lastTime >= 1000) {
      P.fps = P.frameCount;
      P.frameCount = 0;
      P.lastTime = now;
    }
    P.frameCount++;
    
    // Clear and draw
    K.background("#333");
    
    // Display FPS
    K.fillColor("white");
    K.textSize(16);
    K.text(`FPS: ${P.fps}`, 10, 20);
    
    // Your drawing code here
  };
  
  return <Klint draw={draw} />;
}
```

Remember that Klint's architecture is optimized for canvas rendering performance, but it comes with the responsibility to manage your application's data flow and component updates carefully.
