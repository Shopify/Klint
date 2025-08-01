---
sidebar_position: 5
---

# Troubleshooting

Common issues and solutions when working with Klint.

## Installation Issues

### TypeScript errors after installation

**Problem**: TypeScript can't find Klint types

**Solution**: 
```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["@shopify/klint"]
  }
}
```

### Module not found errors

**Problem**: Can't import Klint
```
Module not found: Can't resolve '@shopify/klint'
```

**Solution**: Ensure you've installed the package:
```bash
npm install @shopify/klint
# or
yarn add @shopify/klint
```

## Runtime Issues

### Canvas not rendering

**Problem**: Blank canvas or no output

**Checklist**:
1. ✅ Is `context` passed to `<Klint>`?
2. ✅ Is the `draw` function provided?
3. ✅ Are width/height set?
4. ✅ Check browser console for errors

**Example fix**:
```tsx
// ❌ Wrong
function MySketch() {
  const draw = (K) => {
    K.circle(100, 100, 50);
  };
  return <Klint draw={draw} />;
}

// ✅ Correct
function MySketch() {
  const { context } = useKlint();
  const draw = (K) => {
    K.background('#000'); // Clear canvas
    K.fillColor('white');
    K.circle(100, 100, 50);
  };
  return <Klint context={context} draw={draw} />;
}
```

### Animation not smooth

**Problem**: Stuttering or inconsistent frame rate

**Solutions**:

1. **Use deltaTime for smooth animations**:
```tsx
const draw = (K) => {
  // ❌ Frame-dependent
  position.x += 2;
  
  // ✅ Time-based
  const speed = 100; // pixels per second
  position.x += speed * (K.deltaTime / 1000);
};
```

2. **Batch similar operations**:
```tsx
// ❌ Changing styles in loop
for (let i = 0; i < 1000; i++) {
  K.fillColor(`hsl(${i}, 70%, 50%)`);
  K.circle(x[i], y[i], 5);
}

// ✅ Set style once
K.fillColor('white');
for (let i = 0; i < 1000; i++) {
  K.circle(x[i], y[i], 5);
}
```

### Mouse position incorrect

**Problem**: Mouse coordinates don't match drawing position

**Solution**: Ensure canvas size matches display size:
```tsx
// ✅ Explicit size
<Klint 
  context={context} 
  draw={draw} 
  width={800} 
  height={600} 
/>

// Or responsive
const canvasRef = useRef();
const [size, setSize] = useState({ width: 800, height: 600 });

useEffect(() => {
  const handleResize = () => {
    if (canvasRef.current) {
      setSize({
        width: canvasRef.current.offsetWidth,
        height: canvasRef.current.offsetHeight
      });
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

## Performance Issues

### High CPU usage

**Problem**: Canvas using too much CPU

**Solutions**:

1. **Reduce draw calls**:
```tsx
// ❌ Drawing every pixel
for (let x = 0; x < K.width; x++) {
  for (let y = 0; y < K.height; y++) {
    K.fillColor(getColor(x, y));
    K.rectangle(x, y, 1, 1);
  }
}

// ✅ Use pixel manipulation
const imageData = K.createImageData(K.width, K.height);
// Manipulate imageData.data
K.putImageData(imageData, 0, 0);
```

2. **Use offscreen canvas for complex operations**:
```tsx
const setup = (K) => {
  const offscreen = K.createOffscreen(200, 200);
  // Draw complex pattern once
  drawComplexPattern(offscreen);
  K.patternCanvas = offscreen;
};

const draw = (K) => {
  // Reuse pre-rendered pattern
  K.image(K.patternCanvas, 0, 0);
};
```

### Memory leaks

**Problem**: Memory usage increases over time

**Common causes**:

1. **Creating objects in draw loop**:
```tsx
// ❌ Creating new arrays every frame
const draw = (K) => {
  const particles = Array(1000).fill().map(() => ({...}));
};

// ✅ Reuse storage
const particles = useStorage({ list: [] });
const setup = (K) => {
  particles.list = Array(1000).fill().map(() => ({...}));
};
```

2. **Not cleaning up resources**:
```tsx
// ✅ Clean up on unmount
useEffect(() => {
  return () => {
    // Cancel any animations
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    // Clear any timers
    clearTimeout(timerId);
  };
}, []);
```

## React Integration Issues

### State updates not reflected

**Problem**: Canvas doesn't update when React state changes

**Solution**: Pass state as props to Klint:
```tsx
function MySketch({ color, size }) {
  const { context } = useKlint();
  
  const draw = (K) => {
    K.background('#000');
    // Access current props through K.props
    K.fillColor(K.props.color);
    K.circle(K.width/2, K.height/2, K.props.size);
  };
  
  return <Klint 
    context={context} 
    draw={draw}
    color={color}  // Pass as props
    size={size}    // Pass as props
  />;
}
```

### Multiple re-renders

**Problem**: Component re-rendering too often

**Solution**: Use `useStorage` for frequently changing values:
```tsx
// ❌ Causes re-renders
function MySketch() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const draw = (K) => {
    setPosition({ x: position.x + 1, y: position.y }); // Re-render!
  };
}

// ✅ No re-renders
function MySketch() {
  const { context, useStorage } = useKlint();
  const position = useStorage({ x: 0, y: 0 });
  
  const draw = (K) => {
    position.x += 1; // Direct mutation, no re-render
  };
}
```

## Common Error Messages

### "Cannot read property 'width' of undefined"

**Cause**: Accessing K properties before initialization

**Fix**: Ensure code runs inside lifecycle functions:
```tsx
// ❌ Wrong
const width = K.width; // K doesn't exist here

const draw = (K) => {
  // ✅ Correct - K exists here
  const width = K.width;
};
```

### "K.someFunction is not a function"

**Possible causes**:
1. Typo in function name
2. Using p5.js function names (see [migration guide](./from-p5js))
3. Missing K prefix

```tsx
// Common mistakes
circle(100, 100, 50);        // ❌ Missing K prefix
K.ellipse(100, 100, 50, 50); // ❌ Wrong function name
K.circle(100, 100, 50);      // ✅ Correct
```

### "Invalid color string"

**Cause**: Incorrect color format

**Valid formats**:
```tsx
K.fillColor('red');              // ✅ Named color
K.fillColor('#ff0000');          // ✅ Hex
K.fillColor('rgb(255, 0, 0)');   // ✅ RGB string
K.fillColor('hsl(0, 100%, 50%)'); // ✅ HSL string
K.fillColor(255, 0, 0);          // ✅ RGB values
K.fillColor(255, 0, 0, 0.5);     // ✅ RGBA values
```

## Getting Help

If you're still having issues:

1. Check the browser console for detailed error messages
2. Review the [API Reference](./api-reference)
3. Look at working [examples](/experiments)
4. Make sure you're using the latest version of Klint

### Debug Helper

Add this to your sketch to see debug info:

```tsx
const draw = (K) => {
  // Your drawing code...
  
  // Debug overlay
  K.push();
  K.fillColor('white');
  K.strokeColor('black');
  K.strokeWidth(2);
  K.textSize(12);
  K.text(`FPS: ${Math.round(1000 / K.deltaTime)}`, 10, 20);
  K.text(`Time: ${(K.time / 1000).toFixed(2)}s`, 10, 35);
  K.text(`Frame: ${K.frame}`, 10, 50);
  K.text(`Size: ${K.width}x${K.height}`, 10, 65);
  K.text(`Mouse: ${mouse.x}, ${mouse.y}`, 10, 80);
  K.pop();
};
```