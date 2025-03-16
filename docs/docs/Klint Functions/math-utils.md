# Math Utility Functions

Klint provides various math functions for common calculations and transformations.

## constrain

```ts
constrain(val: number, floor: number, ceil: number) => number
```

Limits a value to a specified range.

```tsx
// Limit value between 0 and 100
const value = constrain(mouseX, 0, 100)
```

## lerp

```ts
lerp(A: number, B: number, mix: number, bounded?: boolean) => number
```

Linearly interpolates between two values.

- `A`: Starting value
- `B`: Ending value
- `mix`: Interpolation factor (0-1 if bounded is true)
- `bounded`: Whether to constrain mix to 0-1 (default: true)

```tsx
// Mix between red and blue based on mouse position
const colorValue = lerp(0, 255, mouseX / width)
```

## fract

```ts
fract(n: number, mod: number, mode?: "precise" | "fast" | "faster") => number
```

Returns the fractional part of n/mod.

- `n`: Numerator
- `mod`: Denominator
- `mode`: Performance vs precision mode

```tsx
// Repeating timer value between 0-1
const cycle = fract(time, 1)
```

## distance

```ts
distance(x1: number, y1: number, x2: number, y2: number, mode?: "precise" | "fast" | "faster") => number
```

Calculates distance between two points.

- `mode`: "precise" (default, Euclidean), "fast" (approximate), "faster" (very approximate)

```tsx
// Distance from mouse to center
const dist = distance(mouseX, mouseY, width/2, height/2)
```

## squareDistance

```ts
squareDistance(x1: number, y1: number, x2: number, y2: number) => number
```

Calculates squared distance between points (faster than distance).

```tsx
// Check if within range (no need for sqrt)
if (squareDistance(x1, y1, x2, y2) < radius * radius) {
  // Point is within radius
}
```

## dot

```ts
dot(x1: number, y1: number, x2: number, y2: number) => number
```

Calculates dot product of two vectors.

```tsx
// Dot product for angle calculation
const similarity = dot(vx1, vy1, vx2, vy2)
```

## remap

```ts
remap(n: number, A: number, B: number, C: number, D: number, bounded?: boolean) => number
```

Maps a value from one range to another.

- `n`: Input value
- `A, B`: Input range
- `C, D`: Output range
- `bounded`: Whether to constrain output (default: true)

```tsx
// Map mouse position from 0-width to 0-100
const percentage = remap(mouseX, 0, width, 0, 100)
```

## scaleTo

```ts
scaleTo(
  originWidth: number, 
  originHeight: number, 
  destinationWidth: number, 
  destinationHeight: number, 
  cover?: boolean
) => number
```

Calculates scale factor to fit dimensions.

- `cover`: If true, scales to cover (fill) destination, otherwise scales to fit within destination

```tsx
// Scale image to fit canvas
const img = images["photo"]
const scale = scaleTo(img.width, img.height, canvasWidth, canvasHeight)
image(img, 0, 0, img.width * scale, img.height * scale)
```

## Example

```tsx
const draw = (K: KlintContext) => {
  // Map mouse position to color
  const red = K.remap(K.mouse.x, 0, K.width, 0, 255)
  const blue = K.remap(K.mouse.y, 0, K.height, 0, 255)
  
  // Constrain to safe values
  const safeRed = K.constrain(red, 0, 255)
  const safeBlue = K.constrain(blue, 0, 255)
  
  // Calculate distance from center
  const dist = K.distance(K.mouse.x, K.mouse.y, K.width/2, K.height/2)
  
  // Size based on distance
  const size = K.lerp(20, 100, 1 - dist / (K.width/2))
  
  K.fillColor(`rgb(${safeRed}, 100, ${safeBlue})`)
  K.circle(K.mouse.x, K.mouse.y, size)
}
``` 