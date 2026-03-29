# Lifecycle

Understanding Klint's lifecycle is essential for creating efficient canvas animations in React. This document explains how Klint components initialize, update, and render.

## Basic Usage: Just Draw

At its simplest, Klint only requires a `draw` function. Klint is thought to go through each frame, which is essential for making creative coding tools and apps. If you are making generative art or long-running sketches, prefer the use of the actual `K.time` (seconds) and `K.deltaTime` (milliseconds) to make frame-independent animations:

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

  const storage = useStorage({
    particles: [],
  });

  const preload = async (K) => {
    await loadImages({
      background: "path/to/background.jpg",
      sprite: "path/to/sprite.png"
    });

    K.extend("myPlugin", new MyPlugin(K));
  };

  const setup = (K) => {
    K.textFont("Arial");
    K.textSize(16);
    K.alignText("center");

    storage.set("particles", Array(100).fill(null).map(() => ({
      x: Math.random() * K.width,
      y: Math.random() * K.height,
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1
    })));
  };

  const draw = (K) => {
    K.background("#333");

    K.image(images.background, 0, 0, K.width, K.height);

    for (const p of storage.get("particles")) {
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

The `preload` function is asynchronous :

```jsx
const preload = async (K) => {
  // Asynchronous resource loading
};
```

Key characteristics:
- **Runs once** when the component mounts
- **Asynchronous** - can use `await` for loading resources
- **Blocks rendering** until completed, if you are loading a lot of stuff and expect a loading time, see the `loading` props.
- **Automatically cleaned up** when component unmounts.

Use preload for:
- Loading images, fonts, and other external resources
- Initializing plugins
- Create custom functions via `K.extend()`
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
- Setting the initial configuration (font, text alignment, etc.)
- Processing resources loaded in preload
- Creating initial state for animation
- Initializing values that don't need to change every frame

If you need complex initialization, do not block the `preload`, initialize your value in `setup`. On top of this, your custom functions and plugins will then be available.

### Draw Phase

The `draw` function runs on every animation frame:

```jsx
const draw = (K) => {
  // Code that runs every frame
};
```

Key characteristics:
- **Runs repeatedly** - Aiming at consistent 60fps, the frame rate can be adjusted in the options.
- **Performance-critical** - Avoid as much as you can to compute anything in the draw loop, sometimes you won't be able to avoid it, i.e. when you draw something on the mouse or do update objects positions. A good practice is to draw anything that doesn't need to be updated, especially text, on an `offscreenContext` and render in layers. Images are cheap to render, when text is memory consuming. 
- **Has access** to all properties set in preload and setup
- **Synchronous** - does not `await`, but you can use `K.deltaTime` to manage frame timing if needed.

Use draw for:
- Clearing/updating the canvas
- Drawing shapes and images
- Updating animation state
- Responding to user input

## Static Mode vs Animation

Klint supports both static rendering and animation. The static mode will render the canvas onto an image and nuke everything else :

```jsx
// Animated sketch (default)
<Klint draw={myDrawFunction} />

// Static sketch (renders once)
<Klint draw={myDrawFunction} options={{ static: "true" }} />
```

In static mode:
- The `draw` function runs only once and convert the canvas to an image before removing it completly.
- No animation loop is started, if you need a specific state of something, you will need to hardcode it.
- Perfect for non-animated visualizations

## Lifecycle and React Rendering

**Important:** Preload and setup functions are cached and run only once when the component mounts. They will not re-run on React re-renders unless the component is unmounted and remounted.

If you need to respond to changing React props, you should:
1. Pass them as additional props to your Klint component using the `useProps`
2. Access them in your draw function

For more advanced React integration patterns, see our [Using Klint with React](/docs/using-react) guide.

## Cleanup and Unmounting

Klint automatically cleans up resources when the component unmounts, including:
- Stopping the animation loop
- Removing event listeners
- Cleaning up any resources loaded in preload
- Reset completely the context, nothing is preserved.

For custom cleanup, you can use React's `useEffect` hook with a cleanup function, it won't be peak efficiency, but you will unsure that it does what you want it to do.