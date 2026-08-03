import KlintVisualExample from '@site/src/components/Documentation/KlintVisualExample';

# rotate

```ts
rotate(angle: number) => void
```

Rotates the coordinate system by the specified angle (in radians). The rotation takes place around the (0,0), use `translate()` before `rotate()` to rotate around a different point.

<KlintVisualExample scene="transforms" />

## Parameters
- `angle`: The rotation angle in radians (not degrees)

## Example
```tsx
// Basic rotation
K.rotate(Math.PI / 4) // Rotate 45 degrees
K.rectangle(0, 0, 50, 50)

// Rotate around a specific point
K.push()
K.translate(200, 200) // Move to rotation center
K.rotate(Math.PI / 6) // Rotate 30 degrees
K.translate(-25, -25) // Offset to center the rectangle
K.rectangle(0, 0, 50, 50)
K.pop()

// Convert degrees to radians
const degrees = 45
const radians = degrees * (Math.PI / 180)
K.rotate(radians)

// Animated rotation
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // Spinning square at center
  K.push()
  K.translate(K.width/2, K.height/2)
  K.rotate(K.time * 0.5) // Rotate based on time
  K.fillColor("red")
  K.rectangle(-25, -25, 50, 50)
  K.pop()
  
  // Multiple rotating objects
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8
    const x = K.width/2 + Math.cos(angle) * 100
    const y = K.height/2 + Math.sin(angle) * 100
    
    K.push()
    K.translate(x, y)
    K.rotate(K.time * 0.3 + angle)
    K.fillColor(`hsl(${i * 45}, 70%, 60%)`)
    K.rectangle(-10, -10, 20, 20)
    K.pop()
  }
}

// Clock example
const draw = (K: KlintContext) => {
  K.background("white")
  K.translate(K.width/2, K.height/2)
  
  // Clock face
  K.strokeColor("black")
  K.strokeWidth(2)
  K.noFill()
  K.circle(0, 0, 100)
  
  // Hour markers
  for (let i = 0; i < 12; i++) {
    K.push()
    K.rotate(i * Math.PI / 6)
    K.strokeWidth(3)
    K.line(0, -90, 0, -80)
    K.pop()
  }
  
  // Current time
  const now = new Date()
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours() % 12
  
  // Second hand
  K.push()
  K.rotate((seconds * Math.PI) / 30 - Math.PI/2)
  K.strokeColor("red")
  K.strokeWidth(1)
  K.line(0, 0, 70, 0)
  K.pop()
  
  // Minute hand
  K.push()
  K.rotate((minutes * Math.PI) / 30 - Math.PI/2)
  K.strokeColor("black")
  K.strokeWidth(3)
  K.line(0, 0, 60, 0)
  K.pop()
  
  // Hour hand
  K.push()
  K.rotate(((hours + minutes/60) * Math.PI) / 6 - Math.PI/2)
  K.strokeColor("black")
  K.strokeWidth(4)
  K.line(0, 0, 40, 0)
  K.pop()
}
```

## Notes
- Rotation is measured in radians, not degrees (2π radians = 360 degrees)
- To convert degrees to radians: `radians = degrees * (Math.PI / 180)`
- Rotation happens around the current coordinate system origin (0, 0)
- Rotations are cumulative - multiple `rotate()` calls add together
- Use `push()` and `pop()` to save and restore transformation state
- Positive angles rotate clockwise, negative angles rotate counter-clockwise
- Affects all subsequent drawing operations until reset or popped
- Combine with translation for complex transformations 