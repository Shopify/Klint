---
sidebar_position: 3
---

# API Reference

Complete reference for all Klint functions, organized by category.

## Drawing Functions

### Basic Shapes

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.circle(x, y, radius, radius2?)` | Draw a circle or ellipse | x, y: center position<br/>radius: circle radius<br/>radius2: optional y-radius for ellipse |
| `K.rectangle(x, y, width, height)` | Draw a rectangle | x, y: top-left position<br/>width, height: dimensions |
| `K.roundedRectangle(x, y, width, height, radius)` | Draw a rounded rectangle | x, y: top-left position<br/>width, height: dimensions<br/>radius: corner radius |
| `K.line(x1, y1, x2, y2)` | Draw a line | x1, y1: start point<br/>x2, y2: end point |
| `K.point(x, y)` | Draw a point | x, y: position |
| `K.polygon(x, y, sides, radius)` | Draw a regular polygon | x, y: center position<br/>sides: number of sides<br/>radius: radius |
| `K.arc(x, y, radius, startAngle, endAngle, counterclockwise?)` | Draw an arc | x, y: center<br/>radius: radius<br/>angles in radians |
| `K.disk(x, y, radius)` | Draw a filled circle | x, y: center<br/>radius: radius |

### Paths and Vertices

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.beginShape()` | Start a new shape | None |
| `K.endShape(close?)` | End the current shape | close: close the path |
| `K.vertex(x, y)` | Add a vertex | x, y: position |
| `K.bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y)` | Add a bezier curve | Control points and end point |
| `K.quadraticVertex(cpx, cpy, x, y)` | Add a quadratic curve | Control point and end point |
| `K.arcVertex(x, y, radius, startAngle, endAngle, ccw?)` | Add an arc to path | Center, radius, and angles |
| `K.beginContour()` | Start a hole in shape | None |
| `K.endContour()` | End the hole | None |

## Styling Functions

### Colors and Stroke

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.fillColor(color)` | Set fill color | CSS color string or RGB values |
| `K.strokeColor(color)` | Set stroke color | CSS color string or RGB values |
| `K.strokeWidth(width)` | Set stroke width | Width in pixels |
| `K.strokeCap(cap)` | Set line cap style | 'butt', 'round', 'square' |
| `K.strokeJoin(join)` | Set line join style | 'miter', 'round', 'bevel' |
| `K.noFill()` | Disable fill | None |
| `K.noStroke()` | Disable stroke | None |
| `K.opacity(alpha)` | Set global opacity | 0-1 |
| `K.blend(mode)` | Set blend mode | Blend mode string |

### Gradients

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.gradient(x1, y1, x2, y2)` | Create linear gradient | Start and end points |
| `K.radialGradient(x1, y1, r1, x2, y2, r2)` | Create radial gradient | Two circles |
| `K.conicGradient(angle, x, y)` | Create conic gradient | Start angle and center |
| `K.addColorStop(offset, color)` | Add gradient color stop | 0-1 offset and color |

## Transform Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.translate(x, y)` | Move origin | x, y: translation |
| `K.rotate(angle)` | Rotate canvas | Angle in radians |
| `K.scale(x, y?)` | Scale canvas | x scale, optional y scale |
| `K.push()` | Save transform state | None |
| `K.pop()` | Restore transform state | None |

## Text Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.text(text, x, y, maxWidth?)` | Draw text | Text string and position |
| `K.textSize(size)` | Set font size | Size in pixels |
| `K.textFont(font)` | Set font family | Font string |
| `K.textAlign(horizontal, vertical?)` | Set text alignment | 'left', 'center', 'right'<br/>'top', 'middle', 'bottom' |
| `K.textBaseline(baseline)` | Set text baseline | 'alphabetic', 'top', 'middle', etc. |
| `K.measureText(text)` | Measure text dimensions | Text string |

## Image Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.image(img, x, y, width?, height?)` | Draw an image | Image and position |
| `K.createOffscreen(width, height)` | Create offscreen canvas | Dimensions |
| `K.loadImage(url)` | Load an image | URL string |
| `K.getImageData(x, y, width, height)` | Get pixel data | Rectangle bounds |
| `K.putImageData(data, x, y)` | Put pixel data | ImageData and position |

## Canvas Control

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.background(color)` | Clear canvas with color | CSS color string |
| `K.clear()` | Clear canvas | None |
| `K.reset()` | Reset all transforms | None |
| `K.save()` | Save canvas state | None |
| `K.restore()` | Restore canvas state | None |

## Utility Functions

### Math Utilities

| Function | Description | Parameters |
|----------|-------------|------------|
| `K.distance(x1, y1, x2, y2)` | Distance between points | Two points |
| `K.angle(x1, y1, x2, y2)` | Angle between points | Two points |
| `K.lerp(start, end, amount)` | Linear interpolation | Start, end, amount (0-1) |
| `K.map(value, start1, end1, start2, end2)` | Map value between ranges | Value and two ranges |
| `K.constrain(value, min, max)` | Constrain value to range | Value and min/max |
| `K.random(min?, max?)` | Random number | Optional range |
| `K.noise(x, y?, z?)` | Perlin noise | 1D, 2D, or 3D position |

### Time and Animation

| Property | Description | Type |
|----------|-------------|------|
| `K.time` | Time since start (ms) | number |
| `K.frame` | Frame count | number |
| `K.deltaTime` | Time since last frame (ms) | number |
| `K.fps` | Current frame rate | number |

### Canvas Properties

| Property | Description | Type |
|----------|-------------|------|
| `K.width` | Canvas width | number |
| `K.height` | Canvas height | number |
| `K.pixelDensity` | Device pixel ratio | number |

## Klint Elements

### Color Element
- `Color.rgb(r, g, b, a?)` - Create from RGB
- `Color.hsl(h, s, l, a?)` - Create from HSL
- `Color.hex(hex)` - Create from hex string

### Vector Element
- `Vector.create(x, y)` - Create 2D vector
- `Vector.add(v1, v2)` - Add vectors
- `Vector.sub(v1, v2)` - Subtract vectors
- `Vector.mult(v, scalar)` - Multiply by scalar
- `Vector.normalize(v)` - Normalize vector
- `Vector.magnitude(v)` - Get magnitude

### Time Element
- `Time.now()` - Current timestamp
- `Time.delta()` - Delta time
- `Time.fps()` - Current FPS

### Easing Functions
- `Easing.linear(t)` - Linear (no easing)
- `Easing.easeInQuad(t)` - Quadratic ease in
- `Easing.easeOutQuad(t)` - Quadratic ease out
- `Easing.easeInOutQuad(t)` - Quadratic ease in/out
- And many more...

## Next Steps

- [Function Examples](../3-functions/drawing/circle) - Detailed function docs
- [Quick Start](../1-getting-started/quick-start) - Get started quickly
- [TypeScript](../1-getting-started/typescript) - Type definitions