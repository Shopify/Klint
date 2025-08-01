---
sidebar_position: 2
---

# The Klint Context (K)

The Klint Context, typically named `K`, is the enhanced canvas context that provides all drawing and utility functions.

## What is the K Object?

The `K` parameter passed to your `setup`, `draw`, and `preload` functions is an enhanced version of the HTML Canvas 2D context. It includes:

- All standard Canvas 2D API methods
- Klint's creative coding functions
- Canvas properties (width, height)
- Animation properties (time, frame, deltaTime)
- Utility functions

```tsx
const draw = (K) => {
  // K is your gateway to everything
  K.background('#000');        // Klint function
  K.fillStyle = 'red';        // Native canvas property
  K.circle(100, 100, 50);     // Klint function
  K.fillRect(200, 200, 50, 50); // Native canvas method
};
```

## Canvas Properties

### Dimensions

```tsx
const draw = (K) => {
  // Canvas dimensions
  console.log(K.width);   // Canvas width in pixels
  console.log(K.height);  // Canvas height in pixels
  
  // Center of canvas
  const centerX = K.width / 2;
  const centerY = K.height / 2;
  
  K.circle(centerX, centerY, 50);
};
```

### Animation Properties

```tsx
const draw = (K) => {
  // Time in milliseconds since start
  const seconds = K.time / 1000;
  
  // Frame count since start
  const frameNumber = K.frame;
  
  // Time since last frame (ms)
  const dt = K.deltaTime;
  
  // Use for smooth animations
  const x = K.width/2 + Math.sin(K.time * 0.001) * 100;
  K.circle(x, K.height/2, 30);
};
```

## Function Categories

### Drawing Functions

```tsx
// Shapes
K.circle(x, y, radius);
K.rectangle(x, y, width, height);
K.line(x1, y1, x2, y2);
K.point(x, y);
K.polygon(x, y, sides, radius);

// Paths
K.beginShape();
K.vertex(x, y);
K.bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y);
K.endShape();
```

### Style Functions

```tsx
// Colors
K.fillColor('red');          // CSS color
K.fillColor(255, 0, 0);      // RGB
K.fillColor(255, 0, 0, 0.5); // RGBA

K.strokeColor('#00ff00');
K.strokeWidth(2);

// Remove fill/stroke
K.noFill();
K.noStroke();
```

### Transform Functions

```tsx
// Save current transform state
K.push();

// Apply transformations
K.translate(100, 100);
K.rotate(Math.PI / 4);
K.scale(2, 2);

// Draw transformed
K.rectangle(0, 0, 50, 50);

// Restore previous state
K.pop();
```

## Accessing Native Canvas

The K object extends the native Canvas 2D context, so all standard methods are available:

```tsx
const draw = (K) => {
  // Klint way
  K.fillColor('red');
  K.circle(100, 100, 50);
  
  // Native canvas way (also works)
  K.fillStyle = 'blue';
  K.beginPath();
  K.arc(200, 100, 50, 0, Math.PI * 2);
  K.fill();
  
  // Mix and match as needed
  K.save();
  K.globalAlpha = 0.5;
  K.fillColor('green');
  K.rectangle(150, 150, 100, 100);
  K.restore();
};
```

## Utility Functions

### Math Utilities

```tsx
const draw = (K) => {
  // Distance between two points
  const dist = K.distance(x1, y1, x2, y2);
  
  // Linear interpolation
  const value = K.lerp(start, end, 0.5);
  
  // Map value from one range to another
  const mapped = K.map(value, 0, 100, 0, K.width);
  
  // Constrain value to range
  const clamped = K.constrain(value, 0, 100);
  
  // Angle between two points
  const angle = K.angle(x1, y1, x2, y2);
};
```

### Color Utilities

```tsx
const draw = (K) => {
  // HSL to RGB conversion
  K.fillColor(K.hsl(180, 100, 50)); // Cyan
  
  // Color with alpha
  K.fillColor(K.rgba(255, 0, 0, 0.5));
  
  // Random color
  K.fillColor(K.randomColor());
};
```

## Context State Management

The K object maintains drawing state that can be saved and restored:

```tsx
const draw = (K) => {
  // Current state
  K.fillColor('red');
  K.strokeWidth(2);
  K.opacity(0.5);
  
  // Save state
  K.push();
  
  // Change state
  K.fillColor('blue');
  K.strokeWidth(5);
  K.opacity(1);
  K.rectangle(100, 100, 50, 50);
  
  // Restore previous state
  K.pop();
  
  // Back to red, width 2, opacity 0.5
  K.circle(200, 100, 25);
};
```

## Performance Considerations

### Batch Similar Operations

```tsx
const draw = (K) => {
  K.background('#000');
  
  // Good: Set style once, draw many
  K.fillColor('white');
  K.noStroke();
  for (let i = 0; i < 1000; i++) {
    K.circle(Math.random() * K.width, Math.random() * K.height, 2);
  }
  
  // Bad: Changing styles in loop
  for (let i = 0; i < 1000; i++) {
    K.fillColor(`hsl(${i}, 70%, 50%)`); // Avoid this
    K.circle(Math.random() * K.width, Math.random() * K.height, 2);
  }
};
```

### Use Frame and DeltaTime

```tsx
const draw = (K) => {
  // Frame-independent animation
  const speed = 100; // pixels per second
  const distance = speed * (K.deltaTime / 1000);
  
  // This moves at same speed regardless of framerate
  position.x += distance;
  
  // Framerate-dependent (avoid)
  position.x += 2; // Speed varies with framerate
};
```

## Custom Properties

You can access custom props passed to the Klint component:

```tsx
function MySketch({ particleCount, color }) {
  const { context } = useKlint();
  
  const draw = (K) => {
    // Access props through K.props
    K.fillColor(K.props.color);
    
    for (let i = 0; i < K.props.particleCount; i++) {
      // Draw particles
    }
  };
  
  return <Klint 
    context={context} 
    draw={draw}
    color={color}
    particleCount={particleCount}
  />;
}
```

## Debug Information

```tsx
const draw = (K) => {
  // Show debug info
  K.fillColor('white');
  K.textSize(12);
  K.text(`FPS: ${Math.round(1000 / K.deltaTime)}`, 10, 20);
  K.text(`Frame: ${K.frame}`, 10, 35);
  K.text(`Time: ${(K.time / 1000).toFixed(2)}s`, 10, 50);
  K.text(`Canvas: ${K.width}x${K.height}`, 10, 65);
};
```

## Best Practices

1. **Use K prefix consistently** - Always access functions through `K.`
2. **Prefer Klint functions** - They're optimized and more readable
3. **Batch operations** - Set styles once, draw many times
4. **Use push/pop** - Isolate transformations and style changes
5. **Access props via K.props** - For dynamic component properties

## Next Steps

- [Lifecycle Functions](./lifecycle) - Understanding setup, draw, and preload
- [React Integration](./react-integration) - Using Klint with React
- [Function Reference](../3-functions/drawing/circle) - Explore all K functions