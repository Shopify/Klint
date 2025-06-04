---
sidebar_position: 4
id: klintfunctions-fill-stroke
title: Fill and Stroke
slug: /klinfunctions-fill-stroke
---

# Fill & Stroke Functions

Klint provides functions to control the fill and stroke styles of shapes.

## fillColor

```ts
fillColor(color: string | CanvasGradient) => void
```

Sets the fill color for shapes and text.

```tsx
K.fillColor("#FF5733")         // Hex color
K.fillColor("rgba(255, 0, 0, 0.5)") // Semi-transparent red
```

## strokeColor

```ts
strokeColor(color: string | CanvasGradient) => void
```

Sets the color for lines and shape outlines.

```tsx
K.strokeColor("blue")
K.strokeColor(gradient) // Gradient object from K.gradient()
```

## noFill

```ts
noFill() => void
```

Disables filling for shapes and text.

```tsx
K.noFill()  // Only outlines will be drawn
```

## noStroke

```ts
noStroke() => void
```

Disables outlines for shapes and text.

```tsx
K.noStroke()  // Only fills will be drawn
```

## strokeWidth

```ts
strokeWidth(width: number) => void
```

Sets the thickness of lines and shape outlines.

```tsx
K.strokeWidth(3)  // 3 pixel line thickness
```

## strokeJoin

```ts
strokeJoin(join: CanvasLineJoin) => void
```

Sets the style of joints where lines meet.

```tsx
K.strokeJoin("miter")  // Sharp corners (default)
K.strokeJoin("round")  // Rounded corners
K.strokeJoin("bevel")  // Flattened corners
```

## strokeCap

```ts
strokeCap(cap: CanvasLineCap) => void
```

Sets the style of line endpoints.

```tsx
K.strokeCap("butt")    // Flat endings (default)
K.strokeCap("round")   // Rounded endings
K.strokeCap("square")  // Extended flat endings
```

## opacity

```ts
opacity(value: number) => void
```

Sets the global opacity for all drawing operations.

```tsx
K.opacity(0.5)  // 50% opacity for all subsequent drawing
```

## blend

```ts
blend(mode: GlobalCompositeOperation) => void
```

Sets the blend mode for how new shapes interact with existing content.

```tsx
K.blend("multiply")
K.blend("screen")
K.blend("overlay")
```

## Example

```tsx
const draw = (K: KlintContext) => {
  K.background("#333")
  
  // Fill with no stroke
  K.fillColor("red")
  K.noStroke()
  K.circle(100, 100, 50)
  
  // Stroke with no fill
  K.strokeColor("lime")
  K.strokeWidth(4)
  K.noFill()
  K.rectangle(200, 75, 100, 50)
  
  // Both fill and stroke with opacity
  K.fillColor("blue")
  K.strokeColor("white")
  K.strokeWidth(8)
  K.opacity(0.7)
  K.circle(350, 100, 50)
  
  // Different stroke join and cap styles
  K.strokeColor("yellow")
  K.strokeWidth(15)
  K.strokeJoin("round")
  K.strokeCap("round")
  K.noFill()
  
  K.beginShape()
  K.vertex(50, 200)
  K.vertex(150, 250)
  K.vertex(75, 300)
  K.endShape(false)
  
  // Blend modes
  K.opacity(1)
  K.blend("screen")
  K.fillColor("rgba(255, 0, 255, 0.5)")
  K.circle(300, 250, 80)
  K.fillColor("rgba(0, 255, 255, 0.5)")
  K.circle(350, 300, 80)
}
```

## Notes

- `K.fillColor()` and `K.strokeColor()` can take any valid CSS color string
- Both can also accept gradient objects created with `K.gradient()`, `K.radialGradient()` or `K.conicGradient()`
- Use `K.noFill()` and `K.noStroke()` to disable fills or strokes rather than setting transparent colors
- The `K.opacity()` function affects both fill and stroke operations
- Different blend modes can create dramatic visual effects when shapes overlap 