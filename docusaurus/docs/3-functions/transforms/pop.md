# pop

```ts
pop() => void
```

Restores the most recently saved drawing state from the stack.

## What Gets Restored

The `pop()` function restores:
- **Transformation matrix** (translate, rotate, scale operations)
- **Fill style** (color, gradient, pattern)
- **Stroke style** (color, gradient, pattern)
- **Line width**
- **Line cap and join styles**
- **Global alpha** (opacity)
- **Global composite operation** (blending mode)
- **Clipping region**
- **Font settings**
- **Text alignment**

## Example
```tsx
// Basic usage
K.push()
K.translate(100, 100)
K.rotate(Math.PI / 4)
K.fillColor("red")
K.rectangle(0, 0, 50, 50)
K.pop() // Restore previous state

// Multiple nested states
K.push()
  K.fillColor("red")
  K.circle(100, 100, 50)
  
  K.push()
    K.fillColor("blue")
    K.translate(50, 0)
    K.circle(150, 150, 30)
  K.pop() // Restores red fill
  
  K.circle(200, 100, 50) // Still uses red fill
K.pop() // Restores original state

// Animation with isolated transformations
const draw = (K: KlintContext) => {
  K.background("#333")
  
  // Original state preserved
  K.fillColor("white")
  K.textSize(16)
  K.text("Original State", 20, 30)
  
  for (let i = 0; i < 5; i++) {
    K.push() // Save state for each iteration
    
    // Apply transformations
    K.translate(100 + i * 80, K.height/2)
    K.rotate(K.time + i * 0.5)
    K.scale(0.5 + Math.sin(K.time * 2 + i) * 0.3)
    
    // Draw transformed object
    K.fillColor(`hsl(${i * 72}, 70%, 60%)`)
    K.rectangle(-25, -25, 50, 50)
    
    K.pop() // Restore state (no transformations carry over)
  }
  
  // Original state is intact
  K.text("State Restored", 20, K.height - 30)
}
```

## Error Handling

```tsx
// Always balance push/pop calls
const draw = (K: KlintContext) => {
  // ✅ Good: Balanced
  K.push()
  K.fillColor("red")
  K.circle(100, 100, 50)
  K.pop()
  
  // ❌ Bad: Unbalanced - calling pop() without push()
  // K.pop() // This would cause an error
  
  // ❌ Bad: Unbalanced - missing pop()
  K.push()
  K.fillColor("blue")
  K.circle(200, 100, 50)
  // Missing K.pop() - state stack will grow
}
```

## Common Patterns

### UI Component Isolation

```tsx
const drawModal = (K, x, y, width, height, title, content) => {
  K.push() // Isolate modal rendering
  
  // Modal background
  K.fillColor("rgba(0, 0, 0, 0.8)")
  K.rectangle(0, 0, K.width, K.height)
  
  // Modal content area
  K.translate(x, y)
  K.fillColor("white")
  K.roundedRectangle(0, 0, width, 12, height)
  
  // Title
  K.fillColor("black")
  K.textSize(18)
  K.textWeight("bold")
  K.text(title, 20, 40)
  
  // Content
  K.textSize(14)
  K.textWeight("normal")
  K.text(content, 20, 80)
  
  K.pop() // Restore original state
}

const draw = (K: KlintContext) => {
  // Main app content
  K.background("#f0f0f0")
  K.fillColor("black")
  K.text("Main Application", 20, 30)
  
  // Show modal without affecting main app
  // Note: Use useStorage hook for state management
  K.text("App continues normally", 20, K.height - 30)
}
```

### Animation Cleanup

```tsx
import { useKlint, useStorage } from '@shopify/klint';

function ParticleSketch() {
  const { context } = useKlint();
  const store = useStorage({ particles: [] });
  
  const drawParticle = (K, particle) => {
    K.push(); // Isolate particle transformations
    
    K.translate(particle.x, particle.y);
    K.rotate(particle.rotation);
    K.scale(particle.scale);
    K.opacity(particle.alpha);
    
    K.fillColor(particle.color);
    K.circle(0, 0, particle.size);
    
    K.pop(); // Clean up transformations
  };
  
  const draw = (K: KlintContext) => {
    K.background("#111");
    
    const particles = store.get("particles") || [];
    
    // Each particle renders independently
    particles.forEach(particle => {
      drawParticle(K, particle);
      // No transformation spillover between particles
    });
  };
  
  return <Klint context={context} draw={draw} />;
}
```

### Nested Transformations

```tsx
const drawArm = (K, length, angle) => {
  K.push()
  K.rotate(angle)
  
  // Draw upper arm
  K.strokeColor("brown")
  K.strokeWidth(8)
  K.line(0, 0, length, 0)
  
  // Draw lower arm (nested transformation)
  K.push()
  K.translate(length, 0)
  K.rotate(Math.sin(K.time * 3) * 0.5) // Elbow movement
  
  K.strokeColor("tan")
  K.strokeWidth(6)
  K.line(0, 0, length * 0.8, 0)
  
  // Draw hand
  K.push()
  K.translate(length * 0.8, 0)
  K.fillColor("peach")
  K.circle(0, 0, 8)
  K.pop() // Restore to elbow position
  
  K.pop() // Restore to shoulder position
  K.pop() // Restore to original position
}

const draw = (K: KlintContext) => {
  K.background("#87CEEB")
  
  // Draw figure at center
  K.push()
  K.translate(K.width/2, K.height/2)
  
  // Body
  K.fillColor("blue")
  K.rectangle(-20, -50, 40, 100)
  
  // Left arm
  K.push()
  K.translate(-20, -30)
  drawArm(K, 40, Math.sin(K.time * 2) * 0.3)
  K.pop()
  
  // Right arm  
  K.push()
  K.translate(20, -30)
  drawArm(K, 40, -Math.sin(K.time * 2) * 0.3)
  K.pop()
  
  K.pop() // Restore original coordinates
}
```

## Performance Notes

- `pop()` operations are relatively expensive - avoid in tight loops
- Each `pop()` restores the entire saved state, not just transformations
- Canvas maintains a state stack with limited depth (typically 32-64 levels)
- Use push/pop strategically, think about the layering and do not nest every single transform.

## Best Practices

```tsx
// ✅ Good: Group related operations
K.push()
K.translate(x, y)
K.rotate(angle)
K.scale(size)
// Draw multiple related objects
K.pop()

// ✅ Good: Use for isolation
const drawComponent = (K, props) => {
  K.push()
  // Component-specific rendering
  K.pop()
}

// ❌ Avoid: Unnecessary nesting
K.push()
  K.push()
    K.push()
      K.circle(100, 100, 50) // Too much nesting for simple operation
    K.pop()
  K.pop()
K.pop()
```

## Notes

- Every `pop()` must have a preceding `push()` call, this can heavily mess up your visual.
- Restores the exact state that was saved by the most recent `push()`
- Essential for creating reusable drawing functions that don't affect global state
- Port of the `restore()` in the Canvas API, but with more intuitive naming to match other libraries.
- Use push/pop pairs to create "scope" for transformations and style changes
- Always balance push/pop calls to avoid state stack corruption
- Consider using helper functions to ensure balanced push/pop operations 