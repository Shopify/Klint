# arc

```ts
arc(
  x: number, 
  y: number, 
  radius: number, 
  startAngle: number, 
  endAngle: number, 
  anticlockwise?: boolean
) => void
```

Draws an arc (a portion of a circle) on the canvas.

## Parameters
- `x`: The x-coordinate of the center of the circle
- `y`: The y-coordinate of the center of the circle
- `radius`: The radius of the circle
- `startAngle`: The starting angle in radians (0 is at the 3 o'clock position)
- `endAngle`: The ending angle in radians
- `anticlockwise` (optional): A boolean value that, when true, draws the arc counter-clockwise (default: false)

## Example
```tsx
// Basic arc (quarter circle)
K.arc(100, 100, 50, 0, Math.PI/2)

// Styled arc with color
K.strokeColor("blue")
K.strokeWidth(3)
K.fillColor("rgba(0, 0, 255, 0.2)")
K.arc(200, 150, 70, Math.PI/4, Math.PI*1.75)

// Arc drawn counter-clockwise
K.arc(300, 200, 60, 0, Math.PI, true)

// In JSX component
const draw = (K: KlintContext) => {
  // Progress indicator
  const progress = (K.frameCount % 100) / 100
  const endAngle = progress * Math.PI * 2
  
  K.fillColor("rgba(0, 0, 0, 0.1)")
  K.strokeColor("#3498db")
  K.strokeWidth(8)
  K.arc(K.width/2, K.height/2, 80, 0, Math.PI*2)
  
  K.strokeColor("#e74c3c")
  K.arc(K.width/2, K.height/2, 80, 0, endAngle)
  
  // Display percentage
  K.fillColor("black")
  K.textAlign("center")
  K.textBaseline("middle")
  K.textSize(24)
  K.text(`${Math.floor(progress * 100)}%`, K.width/2, K.height/2)
}
```

## Notes
- If you need to draw a portion of circle, prefer the `disk`
- Angles are measured in radians (0 to 2π), not degrees (0 to 360)
- To convert degrees to radians: `radians = degrees * (Math.PI/180)`
- For a complete circle, use `startAngle: 0` and `endAngle: Math.PI*2`
- By default, arcs are drawn clockwise from the start angle to the end angle
- Arcs automatically close to the center when filled (creating a pie slice shape)
- For just the curved line without connecting to the center, use `K.beginPath()`, `K.arc()`, and `K.stroke()` 