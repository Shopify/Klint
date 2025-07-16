# Klint Web Component

A web component implementation of the Klint canvas library, providing the same powerful drawing API and features as the React version.

## Features

- 🎨 Full compatibility with Klint drawing API
- 🚀 All Element classes (Color, Vector, Easing, State, Time, Text, Thing)
- 🎬 Built-in animation loop with configurable FPS
- 📐 Automatic canvas resizing
- 👁️ Visibility detection with Intersection Observer
- 🖼️ Static mode for generating images
- 📱 DPR-aware rendering
- 🎯 Custom events and lifecycle callbacks
- 💾 Offscreen canvas support
- 🔧 Both declarative and programmatic APIs

## Installation

```html
<!-- Option 1: Import the standalone version (recommended) -->
<script type="module">
  import './KlintWebComponent.standalone.js';
</script>

<!-- Option 2: Import via the main entry point -->
<script type="module">
  import './KlintWebComponent.js';
</script>

<!-- Option 3: Use from CDN (when published) -->
<script type="module">
  import 'https://unpkg.com/@shopify/klint/web-component/KlintWebComponent.standalone.js';
</script>
```

### File Structure

- **KlintWebComponent.standalone.js** - Self-contained version with all dependencies inlined (recommended for most use cases)
- **KlintWebComponent.js** - Re-exports the standalone version for consistency
- **build-standalone.js** - Build script for generating the standalone version

## Usage

### Declarative Approach

```html
<klint-canvas width="800" height="400" fps="60">
  <script type="text/klint">
    function setup(ctx) {
      ctx.background('#000');
    }
    
    function draw(ctx) {
      ctx.fillColor('#fff');
      ctx.circle(ctx.width/2, ctx.height/2, 50);
    }
  </script>
</klint-canvas>
```

### Programmatic Approach

```javascript
const canvas = document.querySelector('klint-canvas');

canvas.setup = (ctx) => {
  ctx.background(ctx.Color.navy);
};

canvas.draw = (ctx) => {
  const pos = ctx.createVector(ctx.width/2, ctx.height/2);
  ctx.circle(pos.x, pos.y, 50);
};

// Control methods
canvas.play();
canvas.pause();
canvas.saveCanvas();
canvas.fullscreen();
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | number | container width | Canvas width in pixels |
| `height` | number | container height | Canvas height in pixels |
| `fps` | number | 60 | Animation frame rate |
| `dpr` | number/"default" | "default" | Device pixel ratio |
| `origin` | "corner"/"center" | "corner" | Canvas coordinate origin |
| `alpha` | "true"/"false" | "true" | Enable alpha channel |
| `noloop` | "true"/"false" | "false" | Disable animation loop |
| `static` | "true"/"false" | "false" | Generate static image |
| `ignoreResize` | "true"/"false" | "false" | Disable resize handling |
| `willreadfrequently` | "true"/"false" | "false" | Optimize for pixel reading |

## Callbacks

```javascript
// Lifecycle callbacks
canvas.preload = async (ctx) => { /* Load assets */ };
canvas.setup = (ctx) => { /* One-time setup */ };
canvas.draw = (ctx) => { /* Animation frame */ };

// Event callbacks
canvas.onResize = (ctx) => { /* Handle resize */ };
canvas.onVisible = (ctx) => { /* Visibility changed */ };
```

## Custom Events

```javascript
// Listen for events
canvas.addEventListener('klint-ready', (e) => {
  console.log('Context:', e.detail.context);
});

canvas.addEventListener('klint-resize', (e) => {
  console.log('New size:', e.detail.context.width, e.detail.context.height);
});

canvas.addEventListener('klint-visible', (e) => {
  console.log('Visible:', e.detail.visible);
});
```

## Context Properties

The context object (`ctx`) includes all standard Canvas 2D API methods plus:

### Drawing Functions
- `background(color)` - Clear and fill background
- `fillColor(color)` - Set fill color
- `strokeColor(color)` - Set stroke color
- `circle(x, y, radius)` - Draw circle
- `rectangle(x, y, width, height)` - Draw rectangle
- `polygon(x, y, radius, sides)` - Draw regular polygon
- `text(string, x, y)` - Draw text
- And many more...

### Element Classes
- `ctx.Color` - Color utilities and palette
- `ctx.createVector(x, y)` - Create 2D vector
- `ctx.Easing` - Easing functions
- `ctx.State` - State management
- `ctx.Time` - Time utilities
- `ctx.Text` - Text utilities
- `ctx.Thing` - Thing utilities

### Animation Properties
- `ctx.frame` - Current frame number
- `ctx.time` - Elapsed time in seconds
- `ctx.deltaTime` - Time since last frame
- `ctx.fps` - Current frame rate

## Examples

See the [examples](./examples/) directory for comprehensive demos:
- [Basic Animation](./examples/basic.html)
- [Programmatic Control](./examples/programmatic.html)
- [Shapes and Text](./examples/shapes-and-text.html)
- [Offscreen Canvas](./examples/offscreen-canvas.html)

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+

Requires support for:
- Web Components (Custom Elements v1)
- ES Modules
- Shadow DOM
- ResizeObserver
- IntersectionObserver

## Differences from React Version

1. **Lifecycle**: Uses Web Components lifecycle instead of React hooks
2. **Props**: Attributes instead of React props
3. **Events**: Native DOM events instead of React callbacks
4. **Script Tags**: Supports inline `<script type="text/klint">` for code
5. **No JSX**: Pure JavaScript/HTML

## License

Same as Klint library.