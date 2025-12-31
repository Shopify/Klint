# clipTo

```ts
clipTo(callback: (K: KlintContext) => void, fillRule?: "nonzero" | "evenodd") => void
```

Creates a clipping region from a path defined in the callback. All subsequent drawing operations will be clipped to this region until the clipping is reset (typically with `pop()`).

## Parameters

- `callback`: Function that defines the clipping path using drawing commands
- `fillRule`: Optional fill rule - "nonzero" (default) or "evenodd"

## Example

```tsx
// Basic clipping with a circle
const draw = (K: KlintContext) => {
  K.background("#222");
  
  // Create circular clipping region
  K.push();
  K.clipTo((K) => {
    K.circle(K.width/2, K.height/2, 150);
  });
  
  // Draw pattern - only visible within circle
  for (let i = 0; i < 20; i++) {
    K.fillColor(`hsl(${i * 18}, 70%, 60%)`);
    K.rectangle(i * 40, 0, 40, K.height);
  }
  
  K.pop(); // Remove clipping
}

// Complex clipping shape
const draw = (K: KlintContext) => {
  K.background("white");
  
  K.push();
  K.clipTo((K) => {
    K.beginShape();
    K.vertex(100, 100);
    K.vertex(300, 50);
    K.vertex(400, 200);
    K.vertex(200, 300);
    K.endShape(true);
  });
  
  // Draw image - clipped to shape
  const img = K.images.get("photo");
  if (img) {
    K.image(img, 0, 0, K.width, K.height);
  }
  
  K.pop();
}

// Multiple clipping regions with evenodd fill rule
const draw = (K: KlintContext) => {
  K.background("#333");
  
  K.push();
  K.clipTo((K) => {
    // Outer circle
    K.circle(K.width/2, K.height/2, 200);
    // Inner circle (hole) - uses evenodd to create hole
    K.circle(K.width/2, K.height/2, 100);
  }, "evenodd");
  
  // Draw pattern - visible only in ring shape
  for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
    const x = K.width/2 + Math.cos(angle) * 150;
    const y = K.height/2 + Math.sin(angle) * 150;
    K.fillColor(`hsl(${angle * 57.3}, 70%, 60%)`);
    K.circle(x, y, 10);
  }
  
  K.pop();
}
```

## Fill Rules

### nonzero (default)
Standard fill rule - counts winding number:
```tsx
K.clipTo((K) => {
  K.circle(100, 100, 50);
  K.circle(150, 100, 50); // Overlapping circles
}, "nonzero");
```

### evenodd
Alternating rule - creates holes in overlapping regions:
```tsx
K.clipTo((K) => {
  K.circle(100, 100, 50);
  K.circle(150, 100, 50); // Overlapping creates hole
}, "evenodd");
```

## Common Patterns

### Masking Images

```tsx
const draw = (K: KlintContext) => {
  K.background("white");
  
  K.push();
  // Create star-shaped mask
  K.clipTo((K) => {
    const centerX = K.width/2;
    const centerY = K.height/2;
    const outerRadius = 100;
    const innerRadius = 50;
    
    K.beginShape();
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      K.vertex(x, y);
    }
    K.endShape(true);
  });
  
  // Draw image - clipped to star shape
  const img = K.images.get("texture");
  if (img) {
    K.image(img, 0, 0, K.width, K.height);
  }
  
  K.pop();
}
```

### Animated Clipping

```tsx
const draw = (K: KlintContext) => {
  K.background("#111");
  
  K.push();
  // Animated clipping region
  K.clipTo((K) => {
    const size = 100 + Math.sin(K.time * 2) * 50;
    K.roundedRectangle(
      K.width/2 - size/2,
      K.height/2 - size/2,
      size,
      20,
      size
    );
  });
  
  // Draw content - clipped to animated rectangle
  for (let i = 0; i < 50; i++) {
    K.fillColor(`hsl(${i * 7.2}, 70%, 60%)`);
    K.circle(
      Math.random() * K.width,
      Math.random() * K.height,
      20
    );
  }
  
  K.pop();
}
```

## Notes

- Clipping persists until `pop()` is called or canvas is reset
- The callback doesn't actually draw anything - it only defines the path
- Use `push()`/`pop()` to manage clipping regions
- Fill rule affects how overlapping paths are interpreted
- Clipping affects all drawing operations (shapes, images, text)
- Performance: Clipping adds overhead - use sparingly in tight loops
- Can be nested by using multiple `push()`/`clipTo()`/`pop()` pairs

