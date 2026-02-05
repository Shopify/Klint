# Klint Canvas Library

A React-first 2D canvas library for creative coding, inspired by p5.js but built with modern React patterns.

## Quick Start

```tsx
import { Klint, useKlint, useStorage } from "@shopify/klint";

function MySketch() {
  const { context } = useKlint();

  const draw = (K) => {
    K.background("#1a1a2e");
    K.fillColor("#e94560");
    K.circle(K.width / 2, K.height / 2, 100);
  };

  return <Klint context={context} draw={draw} />;
}
```

## Core Concepts

### Lifecycle Functions

| Function | When Called | Purpose |
|----------|-------------|---------|
| `preload` | Once, before setup | Async loading (images, fonts) |
| `setup` | Once, after preload | Initialize state, create offscreens |
| `draw` | Every frame | Main render loop |

### The K Context

All drawing happens through the `K` context passed to lifecycle functions. `K` is a convention but you can use whatever you want. :

```tsx
const draw = (K) => {
  K.width;      // Canvas width (scaled by DPR)
  K.height;     // Canvas height
  K.time;       // Seconds since start
  K.frame;      // Current frame number
  K.deltaTime;  // Time since last frame
};
```

### State Management with useStorage

```tsx
const store = useStorage({ particles: [], count: 0 });

const setup = (K) => {
  store.set("particles", [{ x: 0, y: 0 }]);
};

const draw = (K) => {
  const particles = store.get("particles");
  // Mutate directly - no setState needed
  particles.forEach((p) => (p.x += 1));
};
```

---

## Complete API Reference

### Core Functions (KlintCoreFunctions)

| Method | Signature | Description |
|--------|-----------|-------------|
| `saveCanvas` | `()` | Download canvas as PNG |
| `fullscreen` | `()` | Request fullscreen mode |
| `play` | `()` | Resume animation |
| `pause` | `()` | Pause animation |
| `redraw` | `()` | Force redraw (WIP) |
| `extend` | `(name, data, enforceReplace?)` | Add custom property to context |
| `passImage` | `(element)` | Validate image is loaded |
| `passImages` | `(elements[])` | Validate images array |
| `saveConfig` | `(from?)` | Save context configuration |
| `restoreConfig` | `(config)` | Restore context configuration |
| `describe` | `(description)` | Set canvas accessibility description |
| `createOffscreen` | `(id, width, height, options?, callback?)` | Create offscreen canvas |
| `getOffscreen` | `(id)` | Get offscreen canvas by ID |

### Drawing Functions (KlintFunctions)

#### Canvas & Background
| Method | Signature | Description |
|--------|-----------|-------------|
| `background` | `(color?)` | Clear canvas with color |
| `reset` | `()` | Clear canvas and reset transform |
| `clear` | `()` | Clear canvas (transparent) |

#### Styling
| Method | Signature | Description |
|--------|-----------|-------------|
| `fillColor` | `(color)` | Set fill style |
| `strokeColor` | `(color)` | Set stroke style |
| `noFill` | `()` | Disable fill |
| `noStroke` | `()` | Disable stroke |
| `strokeWidth` | `(width)` | Set line width |
| `strokeJoin` | `(join)` | Set line join: `miter\|round\|bevel` |
| `strokeCap` | `(cap)` | Set line cap: `butt\|round\|square` |
| `fillRule` | `(rule)` | Set fill rule: `nonzero\|evenodd` |
| `opacity` | `(value)` | Set global alpha (0-1) |
| `blend` | `(mode)` | Set composite operation |

#### Shapes
| Method | Signature | Description |
|--------|-----------|-------------|
| `point` | `(x, y)` | Draw single point |
| `line` | `(x1, y1, x2, y2)` | Draw line |
| `circle` | `(x, y, radius, radius2?)` | Draw circle/ellipse |
| `disk` | `(x, y, radius, startAngle?, endAngle?, closed?)` | Draw arc/pie |
| `rectangle` | `(x, y, width, height?)` | Draw rectangle |
| `roundedRectangle` | `(x, y, width, radius, height?)` | Draw rounded rectangle |
| `polygon` | `(x, y, radius, sides, radius2?, rotation?)` | Draw regular polygon |

#### Paths
| Method | Signature | Description |
|--------|-----------|-------------|
| `beginShape` | `()` | Start custom shape |
| `vertex` | `(x, y)` | Add vertex point |
| `bezierVertex` | `(cp1x, cp1y, cp2x, cp2y, x, y)` | Add cubic bezier |
| `quadraticVertex` | `(cpx, cpy, x, y)` | Add quadratic curve |
| `arcVertex` | `(x1, y1, x2, y2, radius)` | Add arc |
| `beginContour` | `()` | Start cutout contour |
| `endContour` | `(forceRevert?)` | End cutout contour |
| `endShape` | `(close?)` | Finish and draw shape |
| `clipTo` | `(callback, fillRule?)` | Create clipping region |

#### Gradients
| Method | Signature | Description |
|--------|-----------|-------------|
| `gradient` | `(x1?, y1?, x2?, y2?)` | Create linear gradient |
| `radialGradient` | `(x1?, y1?, r1?, x2?, y2?, r2?)` | Create radial gradient |
| `conicGradient` | `(angle?, x?, y?)` | Create conic gradient |
| `addColorStop` | `(gradient, offset, color)` | Add color stop |

#### Text
| Method | Signature | Description |
|--------|-----------|-------------|
| `textFont` | `(font)` | Set font family |
| `textSize` | `(size)` | Set font size |
| `textStyle` | `(style)` | Set font style: `normal\|italic` |
| `textWeight` | `(weight)` | Set font weight |
| `textQuality` | `(quality)` | Set rendering: `speed\|auto\|legibility\|precision` |
| `textSpacing` | `(kind, value)` | Set letter/word spacing |
| `textLeading` | `(spacing)` | Set line height |
| `alignText` | `(horizontal, vertical?)` | Set text alignment |
| `textWidth` | `(text)` | Measure text width |
| `text` | `(text, x, y, maxWidth?)` | Draw text |
| `paragraph` | `(text, x, y, width, options?)` | Draw paragraph |

#### Transforms
| Method | Signature | Description |
|--------|-----------|-------------|
| `push` | `()` | Save canvas state |
| `pop` | `()` | Restore canvas state |

#### Images & Pixels
| Method | Signature | Description |
|--------|-----------|-------------|
| `image` | `(image, x, y, ...)` | Draw image (3/5/9 arg forms) |
| `loadPixels` | `()` | Get ImageData |
| `updatePixels` | `(pixels)` | Put pixel array |
| `readPixels` | `(x, y, w?, h?)` | Read pixels at position |
| `scaleTo` | `(originW, originH, destW, destH, cover?)` | Calculate scale ratio |
| `toBase64` | `(type?, quality?)` | Export canvas as base64 |

#### Origin Settings
| Method | Signature | Description |
|--------|-----------|-------------|
| `setCanvasOrigin` | `(type)` | Set canvas origin: `center\|corner` |
| `setImageOrigin` | `(type)` | Set image origin: `center\|corner` |
| `setRectOrigin` | `(type)` | Set rectangle origin: `center\|corner` |

#### Filters
| Method | Signature | Description |
|--------|-----------|-------------|
| `canIuseFilter` | `()` | Check filter support |
| `blur` | `(radius)` | Apply blur filter |
| `grayscale` | `(amount)` | Apply grayscale (0-1) |
| `hue` | `(angle)` | Rotate hue (radians) |
| `invert` | `(amount)` | Invert colors (0-1) |
| `filterOpacity` | `(value)` | Filter opacity (0-1) |
| `dropShadow` | `(x, y, blur, color)` | Apply drop shadow |
| `SVGfilter` | `(url)` | Apply SVG filter |

#### Math Utilities
| Method | Signature | Description |
|--------|-----------|-------------|
| `PI` | | π constant |
| `TWO_PI` | | 2π constant |
| `TAU` | | 2π constant |
| `constrain` | `(val, floor, ceil)` | Clamp value |
| `lerp` | `(A, B, mix, bounded?)` | Linear interpolation |
| `fract` | `(n, mod, mode?)` | Modulo (handles negatives) |
| `distance` | `(x1, y1, x2, y2, mode?)` | Distance between points |
| `squareDistance` | `(x1, y1, x2, y2)` | Squared distance |
| `dot` | `(x1, y1, x2, y2)` | Dot product |
| `remap` | `(n, A, B, C, D, bounded?)` | Map value between ranges |
| `bezierLerp` | `(a, b, c, d, t)` | Cubic bezier interpolation |
| `bezierTangent` | `(a, b, c, d, t)` | Cubic bezier tangent |

---

## Elements

### K.Color

```tsx
K.Color.rgb(255, 100, 50);           // RGB (0-255)
K.Color.rgba(255, 100, 50, 0.5);     // RGBA with alpha
K.Color.hsl(180, 70, 50);            // HSL (h: 0-360, s/l: 0-100)
K.Color.hsla(180, 70, 50, 0.5);      // HSLA
K.Color.gray(128);                   // Grayscale
K.Color.hex("#ff6b6b");              // Hex
K.Color.oklch(0.7, 0.15, 180);       // OKLCH (perceptually uniform)
K.Color.blendColors(c1, c2, 0.5);    // Blend two colors
K.Color.complementary(color);        // Opposite on wheel
K.Color.analogous(color, 30);        // Adjacent colors
K.Color.triadic(color);              // Three evenly spaced
K.Color.saturate(color, 0.2);        // Increase saturation
K.Color.lighten(color, 0.2);         // Mix with white
K.Color.darken(color, 0.2);          // Mix with black
```

**Named colors:** `coral`, `brown`, `mustard`, `crimson`, `navy`, `sky`, `olive`, `charcoal`, `peach`, `rose`, `plum`, `sage`, `drab`, `taupe`, `midnight`, `golden`, `orange`, `slate`

### K.Vector

```tsx
const v = K.createVector(100, 200);
v.add(other);           // Add vector
v.sub(other);           // Subtract
v.mult(2);              // Scale
v.normalize();          // Unit vector
v.mag();                // Magnitude
v.rotate(Math.PI/4);    // Rotate
v.dist(other);          // Distance
v.dot(other);           // Dot product
v.copy();               // Clone

// Static
K.Vector.fromAngle(center, angle, radius);
```

### K.Easing

All take `t` (0-1), return eased value:

```tsx
K.Easing.linear(t);
K.Easing.easeInQuad(t);
K.Easing.easeOutQuad(t);
K.Easing.easeInOutQuad(t);
K.Easing.easeInCubic(t);
K.Easing.easeOutCubic(t);
K.Easing.easeInOutCubic(t);
K.Easing.easeInElastic(t);
K.Easing.easeOutElastic(t);
K.Easing.easeInOutElastic(t);
K.Easing.easeInBounce(t);
K.Easing.easeOutBounce(t);
K.Easing.easeInOutBounce(t);
// ... and more (Quart, Quint, Sine, Expo, Circ, Back)
```

---

## Hooks

### useKlint

```tsx
const {
  context,           // Pass to <Klint>
  KlintMouse,        // Mouse input hook
  KlintScroll,       // Scroll input hook
  KlintGesture,      // Touch gestures hook
  KlintKeyboard,     // Keyboard input hook
  KlintWindow,       // Resize, focus, visibility
  KlintImage,        // Image loading hook
  KlintTimeline,     // Animation timeline hook
  KlintPerformance,  // Performance monitoring
  togglePlay,        // Play/pause control
  useDev,            // HMR support
} = useKlint();
```

### KlintMouse

```tsx
const { mouse, onClick, onMove, onDrag } = KlintMouse();

// mouse object:
mouse.x;        // Current X position
mouse.y;        // Current Y position
mouse.px;       // Previous X
mouse.py;       // Previous Y
mouse.pressed;  // Is button down
mouse.button;   // Which button (0/1/2)

onClick((K, e) => { /* handle click */ });
```

### KlintImage

```tsx
const { loadImage, loadImages, getImage, hasImage } = KlintImage();

// In preload:
await loadImage("avatar", "/images/avatar.png");
await loadImages({ bg: "/bg.jpg", sprite: "/sprite.png" });

// In draw:
const img = getImage("avatar");
if (img) K.image(img, 0, 0);
```

### KlintTimeline

```tsx
const { Timeline } = KlintTimeline();

const anim = Timeline.create((t) => ({
  x: t.track((kf) => {
    kf.start(0)
      .then(100, 0.5, K.Easing.easeOutCubic)
      .then(0, 0.5);
  }),
  scale: t.track((kf) => kf.start(1).then(2, 1)),
}));

// In draw:
anim.update(K.time % 1);
K.circle(anim.x.current, 100, anim.scale.current * 20);
```

---

## Canvas Options

```tsx
<Klint
  context={context}
  draw={draw}
  options={{
    alpha: "true",              // Transparent background
    willreadfrequently: "true", // Optimize for pixel reads
    autoplay: "true",           // Auto start animation
    noloop: "true",             // Single frame only
    static: "true",             // Render once, convert to image
    fps: 60,                    // Target framerate
    dpr: 2,                     // Device pixel ratio
    origin: "center",           // Coordinate origin
  }}
/>
```

---

## Code Examples

### Animated Gradient

```tsx
const draw = (K) => {
  const g = K.gradient(0, 0, K.width, K.height);
  const hue = (K.time * 30) % 360;
  K.addColorStop(g, 0, K.Color.hsl(hue, 70, 50));
  K.addColorStop(g, 1, K.Color.hsl((hue + 60) % 360, 70, 50));
  K.fillColor(g);
  K.rectangle(0, 0, K.width, K.height);
};
```

### Circular Motion

```tsx
const draw = (K) => {
  K.background("#111");
  const cx = K.width / 2;
  const cy = K.height / 2;

  for (let i = 0; i < 12; i++) {
    const angle = K.time + (i * Math.PI * 2) / 12;
    const x = cx + Math.cos(angle) * 150;
    const y = cy + Math.sin(angle) * 150;
    K.fillColor(K.Color.hsl(i * 30, 70, 60));
    K.circle(x, y, 20);
  }
};
```

### Mouse Trail

```tsx
const { context, KlintMouse } = useKlint();
const { mouse } = KlintMouse();
const store = useStorage({ trail: [] });

const draw = (K) => {
  K.background("rgba(0, 0, 0, 0.05)");
  const trail = store.get("trail");
  trail.push({ x: mouse.x, y: mouse.y });
  if (trail.length > 50) trail.shift();

  trail.forEach((p, i) => {
    const alpha = i / trail.length;
    K.fillColor(K.Color.rgba(255, 100, 100, alpha));
    K.circle(p.x, p.y, alpha * 20);
  });
};
```

### Grid Pattern

```tsx
const draw = (K) => {
  K.background("#1a1a2e");
  const cols = 20,
    rows = 20;
  const cellW = K.width / cols,
    cellH = K.height / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * cellW + cellW / 2;
      const y = j * cellH + cellH / 2;
      const d = K.distance(x, y, K.width / 2, K.height / 2);
      const size = K.remap(
        Math.sin(d * 0.02 - K.time * 2),
        -1,
        1,
        2,
        cellW * 0.4
      );
      K.fillColor(K.Color.hsl(d * 0.5, 70, 60));
      K.circle(x, y, size);
    }
  }
};
```

### Offscreen Rendering

```tsx
const setup = (K) => {
  K.createOffscreen("bg", K.width, K.height, {}, (ctx) => {
    for (let i = 0; i < 100; i++) {
      ctx.fillColor(K.Color.rgba(255, 255, 255, 0.1));
      ctx.circle(Math.random() * ctx.width, Math.random() * ctx.height, Math.random() * 50);
    }
  });
};

const draw = (K) => {
  K.background("#111");
  K.image(K.getOffscreen("bg"), 0, 0);
  K.fillColor("#ff6b6b");
  K.circle(K.width / 2 + Math.sin(K.time) * 100, K.height / 2, 30);
};
```

### Custom Bezier Shape

```tsx
const draw = (K) => {
  K.background("#1a1a2e");
  K.translate(K.width / 2, K.height / 2);
  K.fillColor("#e94560");
  K.noStroke();

  K.beginShape();
  K.vertex(-100, 0);
  K.bezierVertex(-100, -55, -55, -100, 0, -100);
  K.bezierVertex(55, -100, 100, -55, 100, 0);
  K.bezierVertex(100, 55, 55, 100, 0, 100);
  K.bezierVertex(-55, 100, -100, 55, -100, 0);
  K.endShape(true);
};
```

---

## Plugins

### FontParser

Parse OpenType fonts for glyph-level access:

```tsx
import { FontParser } from "@shopify/klint/plugins";

const preload = async () => {
  await FontParser.load("myFont", "/fonts/MyFont.otf");
};

const draw = (K) => {
  const paths = FontParser.getTextPaths("myFont", "Hello", 100);
  paths.forEach((glyph) => {
    K.beginShape();
    glyph.commands.forEach((cmd) => {
      if (cmd.type === "M") K.vertex(cmd.x, cmd.y);
      else if (cmd.type === "L") K.vertex(cmd.x, cmd.y);
      else if (cmd.type === "C") K.bezierVertex(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
    });
    K.endShape(true);
  });
};
```

### CatmullRom

Smooth curves through points:

```tsx
import { CatmullRom } from "@shopify/klint/plugins";

const points = [
  { x: 100, y: 100 },
  { x: 200, y: 50 },
  { x: 300, y: 150 },
];
const smoothed = CatmullRom.getPoints(points, { tension: 0.5, segments: 20 });

K.beginShape();
smoothed.forEach((p) => K.vertex(p.x, p.y));
K.endShape();
```

### Delaunay

Triangulation and Voronoi diagrams:

```tsx
import { Delaunay } from "@shopify/klint/plugins";

const points = Array(50)
  .fill(0)
  .map(() => [Math.random() * K.width, Math.random() * K.height]);

const delaunay = Delaunay.from(points);
const voronoi = delaunay.voronoi([0, 0, K.width, K.height]);

// Draw Voronoi cells
for (const cell of voronoi.cellPolygons()) {
  K.beginShape();
  cell.forEach(([x, y]) => K.vertex(x, y));
  K.endShape(true);
}
```

### Sprites

Sprite sheet animations:

```tsx
import { Sprites } from "@shopify/klint/plugins";

const sprite = Sprites.create(image, {
  frameWidth: 64,
  frameHeight: 64,
  frameCount: 8,
  fps: 12,
});

const draw = (K) => {
  sprite.update(K.deltaTime);
  sprite.draw(K, x, y);
};
```

### Things

Entity management system:

```tsx
import { Things } from "@shopify/klint/plugins";

const things = Things.create();

things.add({
  x: 100,
  y: 100,
  update(dt) {
    this.x += Math.sin(Date.now() / 1000);
  },
  draw(K) {
    K.circle(this.x, this.y, 20);
  },
});

const draw = (K) => {
  things.update(K.deltaTime);
  things.draw(K);
};
```

---

## Blend Modes

```tsx
K.blend("source-over"); // Default
K.blend("multiply");
K.blend("screen");
K.blend("overlay");
K.blend("darken");
K.blend("lighten");
K.blend("color-dodge");
K.blend("color-burn");
K.blend("hard-light");
K.blend("soft-light");
K.blend("difference");
K.blend("exclusion");
K.blend("hue");
K.blend("saturation");
K.blend("color");
K.blend("luminosity");
```

---

## Performance Tips

1. **Avoid setup in draw** - Initialize in `setup`, not `draw`
2. **Use offscreen buffers** - Pre-render static content
3. **Batch similar operations** - Group by fill/stroke color
4. **Use `push/pop` sparingly** - State changes have cost
5. **Prefer `noStroke/noFill`** - When not needed
6. **Use integer coordinates** - Avoids sub-pixel rendering
7. **Text is expensive** - Cache text on offscreen canvas
