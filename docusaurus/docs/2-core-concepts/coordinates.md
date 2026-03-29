---
sidebar_position: 4
---

# Canvas Coordinates

Understanding the canvas coordinate system is essential for positioning elements correctly in Klint.

## Coordinate System Basics

The canvas uses a coordinate system where:
- **(0, 0)** is the **top-left corner**
- **X** increases to the **right**
- **Y** increases **downward**

```tsx
const draw = (K) => {
  K.background('#f0f0f0');
  K.fillColor('black');
  
  // Top-left corner
  K.circle(0, 0, 10);
  K.text('(0, 0)', 20, 20);
  
  // Top-right corner
  K.circle(K.width, 0, 10);
  K.text(`(${K.width}, 0)`, K.width - 80, 20);
  
  // Bottom-left corner
  K.circle(0, K.height, 10);
  K.text(`(0, ${K.height})`, 20, K.height - 10);
  
  // Bottom-right corner
  K.circle(K.width, K.height, 10);
  K.text(`(${K.width}, ${K.height})`, K.width - 100, K.height - 10);
  
  // Center
  K.circle(K.width/2, K.height/2, 10);
  K.text('Center', K.width/2 - 25, K.height/2 - 15);
};
```

## Common Positions

### Canvas Boundaries

```tsx
const draw = (K) => {
  // Useful position references
  const left = 0;
  const right = K.width;
  const top = 0;
  const bottom = K.height;
  const centerX = K.width / 2;
  const centerY = K.height / 2;
  
  // Draw cross at center
  K.strokeColor('red');
  K.line(centerX - 20, centerY, centerX + 20, centerY);
  K.line(centerX, centerY - 20, centerX, centerY + 20);
};
```

### Grid Positions

```tsx
const draw = (K) => {
  K.background('#fff');
  
  // Create a 3x3 grid
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x = (col + 0.5) * (K.width / 3);
      const y = (row + 0.5) * (K.height / 3);
      
      K.fillColor('#333');
      K.circle(x, y, 20);
      
      K.alignText('center', 'middle');
      K.text(`${col},${row}`, x, y);
    }
  }
};
```

## Shape Anchor Points

Different shapes use different anchor points:

### Circles - Center Point

```tsx
const draw = (K) => {
  // Circle is drawn from its center
  const x = 100;
  const y = 100;
  const radius = 50;
  
  K.fillColor('lightblue');
  K.circle(x, y, radius);
  
  // Mark the center
  K.fillColor('red');
  K.circle(x, y, 3);
};
```

### Rectangles - Top-Left Corner

```tsx
const draw = (K) => {
  // Rectangle is drawn from top-left corner
  const x = 100;
  const y = 100;
  const width = 100;
  const height = 50;
  
  K.fillColor('lightgreen');
  K.rectangle(x, y, width, height);
  
  // Mark the anchor point
  K.fillColor('red');
  K.circle(x, y, 3);
};
```

### Text - Varies by Alignment

```tsx
const draw = (K) => {
  const x = K.width / 2;
  const y = K.height / 2;
  
  // Default: left, alphabetic
  K.fillColor('black');
  K.text('Default', x, y);
  
  // Center, middle
  K.alignText('center', 'middle');
  K.text('Centered', x, y + 50);
  
  // Mark anchor points
  K.fillColor('red');
  K.circle(x, y, 3);
  K.circle(x, y + 50, 3);
};
```

## Transformations

Transformations change the coordinate system:

### Translation

```tsx
const draw = (K) => {
  K.background('#f0f0f0');
  
  // Draw at origin
  K.fillColor('blue');
  K.rectangle(0, 0, 50, 50);
  
  // Translate coordinate system
  K.push();
  K.translate(100, 100);
  
  // Now (0,0) is at (100,100)
  K.fillColor('red');
  K.rectangle(0, 0, 50, 50);
  
  K.pop();
};
```

### Rotation

```tsx
const draw = (K) => {
  K.background('#f0f0f0');
  
  // Rotate around origin (0,0)
  K.push();
  K.rotate(Math.PI / 4); // 45 degrees
  K.fillColor('green');
  K.rectangle(0, 0, 100, 50);
  K.pop();
  
  // Rotate around center
  K.push();
  K.translate(K.width/2, K.height/2);
  K.rotate(Math.PI / 4);
  K.fillColor('purple');
  K.rectangle(-50, -25, 100, 50); // Centered rectangle
  K.pop();
};
```

## Useful Patterns

### Converting Mouse to Canvas Coordinates

```tsx
function CanvasSketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  
  const draw = (K) => {
    K.background('#fff');
    
    // Mouse coordinates are already in canvas space
    K.fillColor('black');
    K.text(`Mouse: ${mouse.x}, ${mouse.y}`, 10, 20);
    
    K.fillColor('red');
    K.circle(mouse.x, mouse.y, 10);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

### Centering Objects

```tsx
const draw = (K) => {
  // Center a rectangle
  const rectWidth = 200;
  const rectHeight = 100;
  const x = (K.width - rectWidth) / 2;
  const y = (K.height - rectHeight) / 2;
  K.rectangle(x, y, rectWidth, rectHeight);
  
  // Center a circle (already centered by default)
  K.circle(K.width/2, K.height/2, 50);
  
  // Center text
  K.alignText('center', 'middle');
  K.text('Centered Text', K.width/2, K.height/2);
};
```

### Responsive Positioning

```tsx
const draw = (K) => {
  // Position elements as percentage of canvas
  const margin = 0.1; // 10% margin
  
  // Draw in corners with margin
  const cornerSize = 30;
  
  // Top-left
  K.circle(K.width * margin, K.height * margin, cornerSize);
  
  // Top-right
  K.circle(K.width * (1 - margin), K.height * margin, cornerSize);
  
  // Bottom-left
  K.circle(K.width * margin, K.height * (1 - margin), cornerSize);
  
  // Bottom-right
  K.circle(K.width * (1 - margin), K.height * (1 - margin), cornerSize);
};
```

### Circular Positioning

```tsx
const draw = (K) => {
  K.background('#000');
  
  const centerX = K.width / 2;
  const centerY = K.height / 2;
  const radius = 100;
  const count = 12;
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    K.fillColor(`hsl(${i * 30}, 70%, 50%)`);
    K.circle(x, y, 20);
  }
};
```

## Debugging Coordinates

```tsx
const draw = (K) => {
  K.background('#fff');
  
  // Draw grid
  K.strokeColor('#ddd');
  K.strokeWidth(1);
  
  // Vertical lines
  for (let x = 0; x <= K.width; x += 50) {
    K.line(x, 0, x, K.height);
    K.fillColor('#999');
    K.textSize(10);
    K.text(x.toString(), x + 2, 12);
  }
  
  // Horizontal lines
  for (let y = 0; y <= K.height; y += 50) {
    K.line(0, y, K.width, y);
    K.fillColor('#999');
    K.textSize(10);
    K.text(y.toString(), 2, y - 2);
  }
  
  // Your drawing code here
  K.fillColor('red');
  K.circle(150, 200, 30);
};
```

## Common Pitfalls

1. **Y-axis direction** - Remember Y increases downward, not upward
2. **Rectangle anchor** - Rectangles draw from top-left, not center
3. **Rotation origin** - Rotation happens around (0,0) unless you translate first
4. **Text baseline** - Default text baseline is 'alphabetic', not 'top'

## Next Steps

- [Function Reference](../3-functions/drawing/circle) - Learn shape drawing functions
- [Transformations](../3-functions/transforms/translate) - Master coordinate transformations
- [React Integration](./react-integration) - Handle responsive canvases