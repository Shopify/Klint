# opacity

```ts
opacity(value: number) => void
```

Sets the global alpha (transparency) for all subsequent drawing operations.

## Parameters
- `value`: Alpha value between 0 (transparent) and 1 (opaque) 

## Example
```tsx
// Basic opacity usage
K.fillColor("red")
K.circle(100, 100, 50) // Fully opaque

K.opacity(0.5)
K.fillColor("blue")
K.circle(150, 100, 50) // 50% transparent

K.opacity(0.2)
K.fillColor("green")
K.circle(200, 100, 50) // 20% transparent

// Animated fade effects
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Pulsing opacity
  const alpha = 0.3 + Math.sin(K.time * 2) * 0.7
  K.opacity(alpha)
  K.fillColor("yellow")
  K.circle(K.width/2, K.height/2, 100)
  
  // Reset opacity for UI elements
  K.opacity(1)
  K.fillColor("white")
  K.text(`Alpha: ${alpha.toFixed(2)}`, 20, 30)
}

// Layered transparency effects
const draw = (K: KlintContext) => {
  K.background("black")
  
  // Background circles with varying opacity
  for (let i = 0; i < 10; i++) {
    K.opacity(0.1 + i * 0.05)
    K.fillColor(`hsl(${i * 30}, 70%, 60%)`)
    K.circle(
      K.width/2 + Math.cos(i * 0.8) * 150,
      K.height/2 + Math.sin(i * 0.8) * 150,
      80 - i * 5
    )
  }
  
  // Foreground text (full opacity)
  K.opacity(1)
  K.fillColor("white")
  K.alignText("center", "middle")
  K.textSize(24)
  K.text("Transparency Demo", K.width/2, K.height/2)
}
```

## Opacity with Push/Pop

```tsx
// Isolated opacity changes
const draw = (K: KlintContext) => {
  K.background("#f0f0f0")
  
  // Normal drawing
  K.fillColor("red")
  K.rectangle(50, 50, 100, 100)
  
  // Temporarily change opacity
  K.push()
  K.opacity(0.3)
  K.fillColor("blue")
  K.rectangle(100, 100, 100, 100)
  K.pop() // Opacity restored to 1.0
  
  // Back to normal opacity
  K.fillColor("green")
  K.rectangle(150, 150, 100, 100)
}
```

## Opacity with Colors

```tsx
// Combining opacity with RGBA colors
const draw = (K: KlintContext) => {
  K.background("white")
  
  // Method 1: Global opacity
  K.opacity(0.5)
  K.fillColor("rgb(255, 0, 0)")
  K.circle(100, 100, 50)
  
  // Method 2: RGBA color (both effects combine)
  K.opacity(0.5) // 50% global opacity
  K.fillColor("rgba(0, 255, 0, 0.5)") // 50% color alpha
  K.circle(150, 100, 50) // Result: 25% total opacity
  
  // Method 3: Reset global opacity, use only color alpha
  K.opacity(1)
  K.fillColor("rgba(0, 0, 255, 0.3)")
  K.circle(200, 100, 50) // 30% opacity from color only
}
```

## Animation Patterns

### Fade In/Out

```tsx
import { useKlint, useStorage } from '@shopify/klint';

function FadeSketch() {
  const { context } = useKlint();
  const store = useStorage({
    fadeProgress: 0,
    fadeDirection: 1
  });
  
  const draw = (K: KlintContext) => {
    let progress = store.get('fadeProgress');
    const direction = store.get('fadeDirection');
    
    // Update fade progress
    progress += direction * 0.02;
    
    // Reverse direction at ends
    if (progress >= 1) {
      progress = 1;
      store.set('fadeDirection', -1);
    } else if (progress <= 0) {
      progress = 0;
      store.set('fadeDirection', 1);
    }
    
    store.set('fadeProgress', progress);
    
    K.background("#333");
    
    // Fade element
    K.opacity(progress);
    K.fillColor("cyan");
    K.circle(K.width/2, K.height/2, 100);
    
    // UI (always visible)
    K.opacity(1);
    K.fillColor("white");
    K.text(`Fade: ${Math.round(progress * 100)}%`, 20, 30);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

### Trail Effect

```tsx
import { useKlint, useStorage } from '@shopify/klint';

function TrailSketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  const store = useStorage({ trail: [] });
  
  const draw = (K: KlintContext) => {
    const trail = store.get('trail');
    
    // Add current mouse position
    trail.push({ x: mouse.x, y: mouse.y, age: 0 });
    
    // Update and remove old trail points
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].age++;
      if (trail[i].age > 30) {
        trail.splice(i, 1);
      }
    }
    
    store.set('trail', trail);
    
    K.background("rgba(0, 0, 0, 0.1)"); // Slight fade background
    
    // Draw trail with fading opacity
    trail.forEach((point, i) => {
      const alpha = 1 - (point.age / 30);
      K.opacity(alpha);
      K.fillColor(`hsl(${i * 10}, 80%, 60%)`);
      K.circle(point.x, point.y, 10 - point.age * 0.3);
    });
  };
  
  return <Klint context={context} draw={draw} />;
}
```

### UI Hover Effects

```tsx
import { useKlint } from '@shopify/klint';

function HoverSketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  
  const draw = (K: KlintContext) => {
    const buttons = [
      { x: 100, y: 100, w: 120, h: 40, text: "Button 1" },
      { x: 100, y: 160, w: 120, h: 40, text: "Button 2" },
      { x: 100, y: 220, w: 120, h: 40, text: "Button 3" }
    ];
    
    K.background("#f5f5f5");
    
    buttons.forEach(btn => {
      // Check if mouse is over button
      const isHover = mouse.x > btn.x && mouse.x < btn.x + btn.w &&
                      mouse.y > btn.y && mouse.y < btn.y + btn.h;
      
      // Set opacity based on hover
      K.opacity(isHover ? 1 : 0.7);
      
      // Draw button
      K.fillColor("#4a90e2");
      K.roundedRectangle(btn.x, btn.y, btn.w, 8, btn.h);
      
      // Button text (always full opacity)
      K.opacity(1);
      K.fillColor("white");
      K.alignText("center", "middle");
      K.text(btn.text, btn.x + btn.w/2, btn.y + btn.h/2);
    });
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Performance Considerations

```tsx
// Efficient: Set opacity once for multiple objects
K.opacity(0.5)
for (let i = 0; i < 100; i++) {
  K.fillColor(`hsl(${i * 3.6}, 70%, 60%)`)
  K.circle(i * 8, 100, 10)
}

// Less efficient: Changing opacity frequently
for (let i = 0; i < 100; i++) {
  K.opacity(0.5 + Math.sin(i) * 0.3) // Expensive state change
  K.fillColor(`hsl(${i * 3.6}, 70%, 60%)`)
  K.circle(i * 8, 100, 10)
}
```

## Notes

- Opacity affects all subsequent drawing operations (fill, stroke, images, text)
- Values are automatically clamped between 0 and 1 using `constrain()`
- Global opacity multiplies with color alpha values
- Use `push()` and `pop()` to isolate opacity changes
- Performance impact is minimal for static opacity values
- Frequent opacity changes can impact performance in tight loops
- Opacity of 0 still performs drawing operations (just invisible)
- Works with all drawing functions: shapes, text, images, gradients
