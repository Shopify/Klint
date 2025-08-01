# Color

The Color element provides comprehensive color utilities, palette management, and color manipulation functions across multiple color spaces.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Access the Color element
  const coral = K.Color.coral; // #E84D37
  const palette = K.Color.createPalette("#ff6b35", 5);
}
```

## Built-in Color Palette

Color includes 18 carefully selected colors:

```tsx
K.Color.coral     // #E84D37
K.Color.brown     // #7F4C2F  
K.Color.mustard   // #EDBC2F
K.Color.crimson   // #BF3034
K.Color.navy      // #18599D
K.Color.sky       // #45A7C6
K.Color.olive     // #8CB151
K.Color.charcoal  // #252120
K.Color.peach     // #ECA088
K.Color.rose      // #C9B1B8
K.Color.plum      // #8F3064
K.Color.sage      // #7B8870
K.Color.drab      // #C0C180
K.Color.taupe     // #4B423D
K.Color.midnight  // #1A2A65
K.Color.golden    // #EAA550
K.Color.orange    // #F17B04
K.Color.slate     // #404757
```

## Color Format Functions

### hex(color)

```ts
hex(color: string) => string
```

Ensures a color string has a # prefix.

```tsx
const color1 = K.Color.hex("ff6b35")   // "#ff6b35"
const color2 = K.Color.hex("#ff6b35")  // "#ff6b35"
```

### rgb(r, g, b)

```ts
rgb(r: number, g: number, b: number) => string
```

Creates an RGB color string.

```tsx
K.fillColor(K.Color.rgb(255, 107, 53))  // "rgb(255, 107, 53)"
```

### rgba(r, g, b, a)

```ts
rgba(r: number, g: number, b: number, alpha: number) => string
```

Creates an RGBA color string.

```tsx
K.fillColor(K.Color.rgba(255, 107, 53, 0.8))  // "rgba(255, 107, 53, 0.8)"
```

### gray(value, alpha?)

```ts
gray(value: number, alpha?: number) => string
```

Creates a grayscale color.

```tsx
K.fillColor(K.Color.gray(128))       // "rgb(128, 128, 128)"
K.fillColor(K.Color.gray(200, 0.5))  // "rgba(200, 200, 200, 0.5)"
```

### hsl(h, s, l)

```ts
hsl(h: number, s: number, l: number) => string
```

Creates an HSL color string.

```tsx
K.fillColor(K.Color.hsl(220, 80, 60))  // "hsl(220, 80%, 60%)"
```

### hsla(h, s, l, a)

```ts
hsla(h: number, s: number, l: number, alpha: number) => string
```

Creates an HSLA color string.

```tsx
K.fillColor(K.Color.hsla(220, 80, 60, 0.7))  // "hsla(220, 80%, 60%, 0.7)"
```

## Modern Color Spaces

### lch(l, c, h)

```ts
lch(l: number, c: number, h: number) => string
```

Creates an LCH (Lightness, Chroma, Hue) color string.

```tsx
K.fillColor(K.Color.lch(65, 40, 120))  // "lch(65% 40 120)"
```

### lcha(l, c, h, a)

```ts
lcha(l: number, c: number, h: number, alpha: number) => string
```

Creates an LCH color string with alpha.

```tsx
K.fillColor(K.Color.lcha(65, 40, 120, 0.8))  // "lch(65% 40 120 / 0.8)"
```

### lab(l, a, b)

```ts
lab(l: number, a: number, b: number) => string
```

Creates a LAB color string.

```tsx
K.fillColor(K.Color.lab(65, 20, -30))  // "lab(65% 20 -30)"
```

### laba(l, a, b, alpha)

```ts
laba(l: number, a: number, b: number, alpha: number) => string
```

Creates a LAB color string with alpha.

```tsx
K.fillColor(K.Color.laba(65, 20, -30, 0.9))  // "lab(65% 20 -30 / 0.9)"
```

### oklch(l, c, h)

```ts
oklch(l: number, c: number, h: number) => string
```

Creates an OKLCH (perceptually uniform) color string.

```tsx
K.fillColor(K.Color.oklch(0.65, 0.15, 120))  // "oklch(0.65 0.15 120)"
```

### oklcha(l, c, h, a)

```ts
oklcha(l: number, c: number, h: number, alpha: number) => string
```

Creates an OKLCH color string with alpha.

```tsx
K.fillColor(K.Color.oklcha(0.65, 0.15, 120, 0.8))  // "oklch(0.65 0.15 120 / 0.8)"
```

### oklab(l, a, b)

```ts
oklab(l: number, a: number, b: number) => string
```

Creates an OKLAB color string.

```tsx
K.fillColor(K.Color.oklab(0.65, 0.1, -0.1))  // "oklab(0.65 0.1 -0.1)"
```

### oklaba(l, a, b, alpha)

```ts
oklaba(l: number, a: number, b: number, alpha: number) => string
```

Creates an OKLAB color string with alpha.

```tsx
K.fillColor(K.Color.oklaba(0.65, 0.1, -0.1, 0.8))  // "oklab(0.65 0.1 -0.1 / 0.8)"
```

## Color Manipulation Functions

### blendColors(colorA, colorB, factor, colorMode?)

```ts
blendColors(colorA: string, colorB: string, factor: number, colorMode?: string) => string
```

Blends two colors using CSS color-mix.

```tsx
// Blend red and blue 50/50 in OKLCH space (default)
const purple = K.Color.blendColors("#ff0000", "#0000ff", 0.5)

// Blend in HSL space
const mixed = K.Color.blendColors(K.Color.coral, K.Color.navy, 0.3, "hsl")

// Animated blending
const animated = K.Color.blendColors(
  K.Color.coral,
  K.Color.sky,
  Math.sin(K.time) * 0.5 + 0.5
)
```

### createPalette(baseColor, steps?)

```ts
createPalette(baseColor: string, steps?: number) => string[]
```

Creates a palette of lighter and darker shades.

```tsx
// Create 9-step palette from coral
const palette = K.Color.createPalette(K.Color.coral, 9)

// Use palette for gradient effect
palette.forEach((color, i) => {
  K.fillColor(color)
  K.rectangle(i * 50, 100, 45, 200)
})
```

### complementary(color)

```ts
complementary(color: string) => string
```

Returns the complementary color (opposite on the color wheel).

```tsx
const complement = K.Color.complementary("#ff6b35")
```

### analogous(color, angle?)

```ts
analogous(color: string, angle?: number) => [string, string]
```

Creates analogous colors (adjacent on the color wheel).

```tsx
const [analog1, analog2] = K.Color.analogous(K.Color.coral, 30)

K.fillColor(K.Color.coral)
K.circle(100, 100, 40)
K.fillColor(analog1)
K.circle(200, 100, 40)
K.fillColor(analog2)
K.circle(300, 100, 40)
```

### triadic(color)

```ts
triadic(color: string) => [string, string]
```

Returns two additional colors forming a triadic color scheme.

```tsx
const [tri1, tri2] = K.Color.triadic(K.Color.coral)
K.fillColor(K.Color.coral)
K.circle(100, 100, 50)
K.fillColor(tri1)
K.circle(200, 100, 50)
K.fillColor(tri2)
K.circle(300, 100, 50)
```

### saturate(color, amount)

```ts
saturate(color: string, amount: number) => string
```

Increases the saturation of a color.

```tsx
const moreSaturated = K.Color.saturate("#ff6b35", 20)  // 20% more saturated
```

### lighten(color, amount)

```ts
lighten(color: string, amount: number) => string
```

Lightens a color by mixing with white.

```tsx
const lighter = K.Color.lighten(K.Color.coral, 30)  // 30% lighter
```

### darken(color, amount)

```ts
darken(color: string, amount: number) => string
```

Darkens a color by mixing with black.

```tsx
const darker = K.Color.darken(K.Color.coral, 25)  // 25% darker
```

## Example Usage

```tsx
const draw = (K: KlintContext) => {
  K.background(K.Color.charcoal)
  
  // Modern color space usage
  K.fillColor(K.Color.oklch(0.7, 0.15, K.time * 50))
  K.circle(100, 100, 60)
  
  // Color manipulation
  const baseColor = K.Color.hsl(K.time * 10, 80, 60)
  const lightened = K.Color.lighten(baseColor, 20)
  const darkened = K.Color.darken(baseColor, 20)
  
  K.fillColor(lightened)
  K.circle(250, 80, 40)
  K.fillColor(baseColor)
  K.circle(250, 150, 40)
  K.fillColor(darkened)
  K.circle(250, 220, 40)
  
  // Palette gradient
  const palette = K.Color.createPalette(baseColor, 7)
  palette.forEach((color, i) => {
    K.fillColor(color)
    K.rectangle(400 + i * 40, 100, 35, 150)
  })
  
  // Analogous color scheme
  const [a1, a2] = K.Color.analogous(baseColor, 45)
  K.fillColor(a1)
  K.circle(150, 300, 50)
  K.fillColor(a2)
  K.circle(250, 300, 50)
  
  // Animated blending
  const t = Math.sin(K.time * 0.002) * 0.5 + 0.5
  const blended = K.Color.blendColors(K.Color.coral, K.Color.sky, t, "oklch")
  K.fillColor(blended)
  K.circle(400, 300, 60)
}
```

## Color Space Notes

- **RGB/RGBA**: Standard web colors, good for basic use
- **HSL/HSLA**: Intuitive for hue-based animations
- **LCH/LCHA**: Perceptually uniform lightness and chroma
- **LAB/LABA**: Device-independent color space
- **OKLCH/OKLCHA**: Improved perceptual uniformity (recommended for blending)
- **OKLAB/OKLABA**: Cartesian form of OKLCH

## Best Practices

- Use OKLCH for smooth color transitions and blending
- HSL is great for hue-based animations
- LAB/OKLAB provide perceptually uniform gradients
- Modern color spaces (LCH, LAB, OKLCH, OKLAB) offer better visual results
- All functions return standard CSS color strings compatible with Klint drawing functions
- Color operations are computationally light and suitable for real-time use 