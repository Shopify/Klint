# Lifecycle

Understanding Klint's lifecycle is essential for creating efficient canvas animations in React. This document explains how Klint components initialize, update, and render.

## Basic Usage: Just Draw

At its simplest, Klint only requires a `draw` function:

```jsx
function SimpleSketch() {
  const draw = (K) => {
    K.background("#333");
    K.fillColor("red");
    K.circle(K.width/2, K.height/2, 100);
  };
  
  return <Klint draw={draw} />;
}
```

In this basic setup:
- The canvas automatically sizes to its container (100% width and height)
- The `draw` function runs at 60fps (by default)
- No explicit initialization or resource loading occurs

## Canvas Sizing

Klint automatically handles canvas sizing for you:

```jsx
<div style={{ width: "500px", height: "300px" }}>
  <Klint draw={myDrawFunction} />
</div>
```

The Klint component takes 100% of its parent's dimensions, so to control the size, simply adjust the parent container. This approach works well with responsive layouts and CSS frameworks.

## Complete Lifecycle: Preload → Setup → Draw

For more complex applications, Klint supports a three-phase lifecycle:

```jsx
function ComplexSketch() {

  const props = useStorage({
        particles : [],
    }) 

  const preload = async (K) => {
    // Load resources asynchronously
    
    await K.loadImages({
      background: "path/to/background.jpg",
      sprite: "path/to/sprite.png"
    });
    
    // Initialize plugins
    K.extend("myPlugin", new MyPlugin(K));
  };
  
  const setup = (K) => {
    // One-time initialization
    K.textFont("Arial");
    K.textSize(16);
    K.alignText("center");
    
    // Create persistent objects
    props.particles = Array(100).fill().map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    }));
  };
  
  const draw = (K) => {
    // Animation loop (runs every frame)
    K.background("#333");
    
    // Use resources loaded in preload
    K.image(K.images.background, 0, 0, K.width, K.height);
    
    // Update and draw objects initialized in setup
    for (const p of props.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > K.width) p.vx *= -1;
      if (p.y < 0 || p.y > K.height) p.vy *= -1;
      
      K.fillColor("white");
      K.circle(p.x, p.y, 5);
    }
  };
  
  return <Klint preload={preload} setup={setup} draw={draw} />;
}
```

## Lifecycle Phases in Detail

### Preload Phase

The `preload` function is asynchronous and runs before the first render:

```jsx
const preload = async (K) => {
  // Asynchronous resource loading
};
```

Key characteristics:
- **Runs once** when the component mounts
- **Asynchronous** - can use `await` for loading resources
- **Blocks rendering** until completed
- **Automatically cleaned up** when component unmounts

Use preload for:
- Loading images, fonts, and other external resources
- Initializing plugins via `K.extend()`
- Creating offscreen buffers
- Initializing large data structures
- Fetching data from APIs

### Setup Phase

The `setup` function initializes the sketch once resources are loaded:

```jsx
const setup = (K) => {
  // One-time initialization code
};
```

Key characteristics:
- **Runs once** after preload completes
- **Synchronous** - does not `await`
- **Cached** - values set here persist across frames

Use setup for:
- Setting static configuration (font, text alignment, etc.)
- Processing resources loaded in preload
- Creating initial state for animation
- Initializing values that don't need to change every frame

### Draw Phase

The `draw` function runs on every animation frame:

```jsx
const draw = (K) => {
  // Code that runs every frame
};
```

Key characteristics:
- **Runs repeatedly** (typically at 60fps)
- **Performance-critical** - keep operations minimal
- **Has access** to all properties set in preload and setup
- **Synchronous** - doest not `await`, but you can use K.deltaTime to block the frames if needed.

Use draw for:
- Clearing/updating the canvas
- Drawing shapes and images
- Updating animation state
- Responding to user input

## Static Mode vs Animation

Klint supports both static rendering and animation:

```jsx
// Animated sketch (default)
<Klint draw={myDrawFunction} />

// Static sketch (renders once)
<Klint draw={myDrawFunction} options={{ static: "true" }} />
```

In static mode:
- The `draw` function runs only once
- No animation loop is started
- Perfect for non-animated visualizations

## Lifecycle and React Rendering

**Important:** Preload and setup functions are cached and run only once when the component mounts. They will not re-run on React re-renders unless the component is unmounted and remounted.

If you need to respond to changing React props, you should:
1. Pass them as additional props to your Klint component
2. Access them in your draw function

```jsx
function SketchWithProps({ color, size }) {
  const draw = (K) => {
    K.background("#333");
    K.fillColor(color); // Use the prop directly
    K.circle(K.width/2, K.height/2, size); // Use the prop directly
  };
  
  return <Klint draw={draw} color={color} size={size} />;
}
```

For more advanced React integration patterns, see our [Using Klint with React](/docs/using-react) guide.

## Cleanup and Unmounting

Klint automatically cleans up resources when the component unmounts, including:
- Stopping the animation loop
- Removing event listeners
- Cleaning up any resources loaded in preload

For custom cleanup, you can use React's `useEffect` hook with a cleanup function.