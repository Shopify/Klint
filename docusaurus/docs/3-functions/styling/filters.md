# Filters

Klint provides several filter functions for applying visual effects to drawing operations. Filters are applied to all subsequent drawing until changed or reset.

## Available Filters

### blur

```ts
blur(radius: number) => void
```

Applies a Gaussian blur effect.

```tsx
K.blur(5);
K.circle(100, 100, 50); // Blurred circle
```

### dropShadow

```ts
dropShadow(offsetX: number, offsetY: number, blurRadius: number, color: string) => void
```

Creates a drop shadow effect.

```tsx
K.dropShadow(5, 5, 10, "rgba(0,0,0,0.5)");
K.fillColor("white");
K.rectangle(100, 100, 200, 100);
```

### grayscale

```ts
grayscale(amount: number) => void
```

Converts colors to grayscale. Amount ranges from 0 (no effect) to 1 (fully grayscale).

```tsx
K.grayscale(0.5); // 50% grayscale
K.image(img, 0, 0);
```

### hue

```ts
hue(angle: number) => void
```

Rotates the hue. Angle is in radians.

```tsx
K.hue(Math.PI / 3); // Rotate hue by 60 degrees
K.fillColor("red");
K.circle(100, 100, 50); // Appears as yellow-green
```

### invert

```ts
invert(amount: number) => void
```

Inverts colors. Amount ranges from 0 (no effect) to 1 (fully inverted).

```tsx
K.invert(1); // Full inversion
K.image(img, 0, 0);
```

### filterOpacity

```ts
filterOpacity(value: number) => void
```

Sets opacity via filter (different from `opacity()`). Value ranges from 0 to 1.

```tsx
K.filterOpacity(0.5);
K.fillColor("blue");
K.circle(100, 100, 50);
```

### SVGfilter

```ts
SVGfilter(url: string) => void
```

Applies a custom SVG filter. URL must start with "url(".

```tsx
K.SVGfilter("url(#myCustomFilter)");
K.circle(100, 100, 50);
```

## Checking Filter Support

```ts
canIuseFilter() => boolean
```

Check if filters are supported in the current browser.

```tsx
if (K.canIuseFilter()) {
  K.blur(10);
} else {
  console.warn("Filters not supported");
}
```

## Examples

### Multiple Filters

```tsx
const draw = (K: KlintContext) => {
  K.background("white");
  
  // Apply multiple filters
  K.blur(3);
  K.grayscale(0.3);
  K.image(img, 0, 0);
  
  // Reset filters (set to empty string or use pop)
  K.filter = "";
}
```

### Animated Filter Effects

```tsx
const draw = (K: KlintContext) => {
  K.background("#222");
  
  // Animated blur
  const blurAmount = 2 + Math.sin(K.time * 2) * 3;
  K.blur(blurAmount);
  
  K.fillColor("yellow");
  K.circle(K.width/2, K.height/2, 100);
}
```

### Shadow Effects

```tsx
const draw = (K: KlintContext) => {
  K.background("white");
  
  // Draw shadow first
  K.dropShadow(10, 10, 20, "rgba(0,0,0,0.3)");
  K.fillColor("blue");
  K.rectangle(100, 100, 200, 100);
  
  // Reset filter for main shape
  K.filter = "";
  K.fillColor("blue");
  K.rectangle(100, 100, 200, 100);
}
```

## Notes

- Filters persist until changed or canvas state is restored with `pop()`
- Use `push()`/`pop()` to isolate filter effects
- Filter support varies by browser - use `canIuseFilter()` to check
- Filters affect all subsequent drawing operations
- Setting `K.filter = ""` removes all filters
- Filter performance can vary - test on target devices
- Some filters may not work in all browsers (especially SVG filters)

