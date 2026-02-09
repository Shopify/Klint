---
sidebar_position: 1
id: plugins
title: 👋 Plugins
slug: /plugins
---

# Plugins

Klint's plugin system extends the core library with specialized functionality for common creative coding tasks. Plugins are designed as static utility classes that work seamlessly with Klint's context-based API.

## Overview

Plugins provide:
- **Font parsing** - Load TTF fonts and convert text to vector paths or points
- **Curve interpolation** - Create smooth Catmull-Rom splines
- **Triangulation** - Delaunay triangulation for point sets
- **Sprite management** - Handle sprite sheets and animations
- **Entity system** - Manage collections of drawable objects

All plugins are imported from `@shopify/klint/plugins` and designed to work with minimal overhead.

## Installation

Plugins are included in the main Klint package:

```bash
npm install @shopify/klint
```

Import plugins as needed:

```tsx
import { FontParser, Sprites, CatmullRom, Delaunay, Things, MatterPhysics } from '@shopify/klint/plugins';
```

## FontParser

The FontParser plugin loads TrueType fonts and converts text into vector paths or point arrays, perfect for custom text rendering and animation.

### Features

- Load TTF fonts from URLs or buffers
- Convert text to Path2D objects for rendering
- Convert text to point arrays for particle effects
- Full layout control (alignment, spacing, baseline)
- Variable font support
- Multi-line text support

### Supported Formats

- ✅ TTF (TrueType Font)
- ❌ OTF (convert at [convertio.co/otf-ttf](http://convertio.co/otf-ttf/))
- ❌ WOFF (convert at [convertio.co/woff-ttf](http://convertio.co/woff-ttf/))
- ❌ WOFF2 (convert at [convertio.co/woff2-ttf](http://convertio.co/woff2-ttf/))

### Basic Usage

```tsx
import { FontParser } from '@shopify/klint/plugins';

function TextSketch() {
  const [font, setFont] = useState(null);

  useEffect(() => {
    const parser = new FontParser();
    parser.load('/fonts/MyFont.ttf').then(setFont);
  }, []);

  const draw = (K) => {
    if (!font) return;
    
    K.background('#000');
    K.fillColor('#fff');
    
    // Convert text to paths
    const result = font.toPaths('Hello', 100);
    
    result.letters.forEach(letter => {
      K.push();
      K.translate(K.width / 2 + letter.center.x, K.height / 2 + letter.center.y);
      K.fill(letter.path);
      K.pop();
    });
  };

  return <Klint draw={draw} />;
}
```

### Text to Points (Particle Effects)

```tsx
const draw = (K) => {
  if (!font) return;
  
  // Convert text to points with sampling
  const result = font.toPoints('KLINT', 200, { 
    sampling: 0.5,  // Point density
    align: 'center',
    baseline: 'center'
  });
  
  result.letters.forEach(letter => {
    letter.shape.forEach(point => {
      // Animate each point
      const x = K.width / 2 + letter.center.x + point.x;
      const y = K.height / 2 + letter.center.y + point.y;
      const noise = K.noise(point.x * 0.01, point.y * 0.01, K.time * 0.001);
      
      K.fillColor('#fff');
      K.circle(x + noise * 20, y + noise * 20, 2);
    });
  });
};
```

### Layout Options

```tsx
const options = {
  align: 'left' | 'center' | 'right',      // Horizontal alignment
  baseline: 'top' | 'center' | 'bottom',   // Vertical alignment  
  anchor: 'default' | 'center',             // Origin point
  letterSpacing: 10,                        // Space between letters
  lineSpacing: 20,                          // Space between lines
  wordSpacing: 30,                          // Space between words
  sampling: 0.5,                            // Point density (toPoints only)
  axisValues: [400, 700]                    // Variable font axes
};

const result = font.toPaths('Multi\nLine\nText', 60, options);
```

### Variable Fonts

```tsx
// Check if font has variable axes
if (font.fvar) {
  const axes = font.fvar[0]; // Array of axis definitions
  
  // Animate font weight
  const weight = 400 + Math.sin(K.time * 0.001) * 300;
  const result = font.toPaths('Variable', 100, {
    axisValues: [weight]
  });
}
```

### Font Metadata

```tsx
const metadata = {
  unitsPerEm: font.head.unitsPerEm,
  ascender: font.hhea.ascender,
  descender: font.hhea.descender,
  fontFamily: font.name?.fontFamily,
  postScriptName: font.name?.postScriptName
};
```

## Sprites

The Sprites plugin manages sprite sheets and provides built-in animation support.

### Loading Sprites

```tsx
import { Sprites } from '@shopify/klint/plugins';

// Load before rendering
useEffect(() => {
  Sprites.load({
    name: 'player',
    url: '/sprites/player.png',
    spriteWidth: 32,
    spriteHeight: 32,
    gap: 0  // Optional spacing between sprites
  });
}, []);
```

### Drawing Sprites

```tsx
const draw = (K) => {
  const sheet = Sprites.sheet('player');
  if (!sheet) return;
  
  // Draw specific frame
  const frame = Math.floor(K.frame / 10) % sheet.numSprites;
  Sprites.draw(K, 'player', frame, 100, 100, {
    width: 64,        // Scale width
    height: 64,       // Scale height
    rotation: 0.5,    // Rotation in radians
    scale: 2,         // Uniform scale
    flipX: false,     // Horizontal flip
    flipY: false,     // Vertical flip
    alpha: 1.0        // Opacity
  });
};
```

### Sprite Animations

```tsx
const [animation] = useState(() => 
  Sprites.animation('player', 0, 7, 100) // start, end, frameDuration(ms)
);

const draw = (K) => {
  animation.update(K.deltaTime);
  animation.draw(K, 200, 200);
  
  // Control playback
  // animation.play();
  // animation.pause();
  // animation.stop();
  // animation.setLoop(true);
  // animation.setFrame(3);
};
```

### Utility Methods

```tsx
// Check if loaded
if (Sprites.hasSheet('player')) { }

// Get sheet info
const sheet = Sprites.sheet('player');
console.log(sheet.numSprites, sheet.cols, sheet.rows);

// Get all loaded sheets
const names = Sprites.getSheetNames();

// Unload
Sprites.unload('player');
Sprites.clear(); // Clear all
```

## CatmullRom

Create smooth curves through control points using Catmull-Rom spline interpolation.

### Basic Interpolation

```tsx
import { CatmullRom } from '@shopify/klint/plugins';

const draw = (K) => {
  const points = [
    { x: 100, y: 100 },
    { x: 200, y: 50 },
    { x: 300, y: 150 },
    { x: 400, y: 100 }
  ];
  
  // Draw smooth curve
  CatmullRom.draw(K, points, {
    tension: 0.5,      // 0 = straight, 1 = loose
    segments: 20,      // Points per segment
    closed: false,     // Close the curve
    strokeStyle: '#fff',
    lineWidth: 2
  });
};
```

### Get Interpolated Points

```tsx
const points = [
  { x: 100, y: 100 },
  { x: 200, y: 200 },
  { x: 300, y: 100 }
];

const smooth = CatmullRom.interpolate(points, 0.5, 20);

// Draw custom visualization
smooth.forEach(point => {
  K.circle(point.x, point.y, 3);
});
```

### As Path2D

```tsx
const path = CatmullRom.toPath2D(points, {
  tension: 0.5,
  segments: 20,
  closed: true
});

K.stroke(path);
K.fill(path);
```

## Delaunay

Perform Delaunay triangulation on point sets.

### Basic Triangulation

```tsx
import { Delaunay } from '@shopify/klint/plugins';

const draw = (K) => {
  const points = Array.from({ length: 50 }, () => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height
  }));
  
  const triangles = Delaunay.triangulate(points);
  
  Delaunay.drawTriangles(K, triangles, {
    fill: true,
    stroke: true,
    fillStyle: '#ffffff20',
    strokeStyle: '#ffffff'
  });
};
```

### Triangle Utilities

```tsx
const triangles = Delaunay.triangulate(points);

triangles.forEach(triangle => {
  // Get circumcenter
  const center = Delaunay.circumcenter(triangle);
  K.circle(center.x, center.y, 5);
  
  // Check if point is in circumcircle
  const point = { x: K.mouseX, y: K.mouseY };
  if (Delaunay.inCircumcircle(point, triangle)) {
    // Highlight this triangle
  }
});
```

## Things

Entity management system for organizing and animating collections of objects.

### Creating Things

```tsx
import { Things } from '@shopify/klint/plugins';

// Configure plugin
Things.configure({
  maxThings: 1000,
  defaultSize: 50,
  defaultColor: '#ffffff'
});

// Create things
Things.create({ 
  x: 100, 
  y: 100, 
  color: '#ff0066',
  data: { velocity: { x: 2, y: 1 } }
});

Things.create({ x: 200, y: 200 });
```

### Managing Things

```tsx
// Get by ID
const thing = Things.get('thing_0');

// Update properties
Things.update('thing_0', { x: 150, y: 150, rotation: 0.5 });

// Transform
Things.move('thing_0', 10, 5);      // Relative movement
Things.rotate('thing_0', 0.1);      // Add rotation
Things.scale('thing_0', 1.1);       // Multiply scale

// Remove
Things.remove('thing_0');
Things.clear(); // Remove all
```

### Finding Things

```tsx
// Near a point
const nearby = Things.findNear(mouseX, mouseY, 100);

// In rectangle
const inRect = Things.findInRect(0, 0, 400, 300);

// By filter
const redThings = Things.filter(t => t.color === '#ff0000');

// Sort
const sorted = Things.sort((a, b) => a.y - b.y);
```

### Drawing Things

```tsx
const draw = (K) => {
  // Default drawing (rectangles)
  Things.draw(K);
  
  // Custom drawing
  Things.draw(K, {
    customDraw: (K, thing) => {
      K.push();
      K.translate(thing.x, thing.y);
      K.rotate(thing.rotation);
      K.fillColor(thing.color);
      K.circle(0, 0, thing.width / 2);
      K.pop();
    },
    filter: (thing) => thing.data.visible !== false
  });
};
```

### Physics Animation

```tsx
const draw = (K) => {
  Things.animatePhysics(K.deltaTime, {
    gravity: 0.5,
    friction: 0.99,
    bounds: { x: 0, y: 0, width: K.width, height: K.height }
  });
  
  Things.draw(K);
};
```

### Iteration

```tsx
// forEach
Things.forEach(thing => {
  thing.rotation += 0.01;
});

// map
const positions = Things.map(thing => ({ x: thing.x, y: thing.y }));

// Distance between things
const dist = Things.distance('thing_0', 'thing_1');

// Collision detection
if (Things.collides('thing_0', 'thing_1')) {
  // Handle collision
}
```

## MatterPhysics

Wrapper around [Matter.js](https://brm.io/matter-js/) for 2D physics simulation. Requires `matter-js` as a separate install — you pass the module at init.

### Setup

```tsx
import { MatterPhysics } from '@shopify/klint/plugins';

// Recommended — loads matter-js automatically
// Tries local import first, falls back to CDN
await MatterPhysics.load({ gravity: { x: 0, y: 1 } });

// Or pass the module directly if you have it installed
import Matter from 'matter-js';
MatterPhysics.init(Matter, { gravity: { x: 0, y: 1 } });

// Check if loaded
if (MatterPhysics.isLoaded) { /* ready */ }
```

`load()` tries `import("matter-js")` first (if you have it as a dependency), then falls back to loading `v0.20.0` from cdnjs. You can change the version:

```tsx
MatterPhysics.MATTER_VERSION = "0.20.0";
// CDN URL updates automatically
```

### Adding Bodies

```tsx
// Static ground
MatterPhysics.addRect(400, 580, 800, 40, { isStatic: true });

// Dynamic circle
const ball = MatterPhysics.addCircle(400, 100, 25, {
  restitution: 0.8,
  friction: 0.1,
});

// Polygon
MatterPhysics.addPolygon(300, 200, 6, 30);

// Custom shape from vertices
MatterPhysics.addFromVertices(500, 200, [
  { x: 0, y: -30 },
  { x: 30, y: 30 },
  { x: -30, y: 30 },
]);
```

### Constraints

```tsx
// Between two bodies
MatterPhysics.addConstraint(bodyA.id, bodyB.id, {
  stiffness: 0.5,
  length: 100,
});

// Pinned to a world point
MatterPhysics.addWorldConstraint(body.id, { x: 400, y: 100 }, {
  stiffness: 0.1,
});
```

### Update & Draw

```tsx
const draw = (K) => {
  K.background('#111');
  
  // Step physics (pass deltaTime in ms)
  MatterPhysics.update(K.deltaTime);
  
  // Debug draw
  MatterPhysics.draw(K, {
    bodyStroke: '#fff',
    bodyFill: 'transparent',
    staticFill: '#444',
    constraintStroke: '#0f0',
    lineWidth: 1,
  });
};
```

### Custom Drawing

```tsx
const draw = (K) => {
  MatterPhysics.update(K.deltaTime);
  
  // Draw bodies with custom rendering
  MatterPhysics.forEach(({ x, y, angle, id, label }) => {
    K.push();
    K.translate(x, y);
    K.rotate(angle);
    
    if (label === 'player') {
      K.fillColor('#00ff88');
      K.circle(0, 0, 25);
    } else {
      K.fillColor('#fff');
      K.rectangle(0, 0, 50, 50);
    }
    
    K.pop();
  });
};
```

### Forces & Collisions

```tsx
// Apply force
MatterPhysics.applyForce(ball.id, { x: 0.01, y: -0.05 });

// Set velocity
MatterPhysics.setVelocity(ball.id, { x: 5, y: -10 });

// Collision events
MatterPhysics.onCollision('collisionStart', (pairs) => {
  pairs.forEach(pair => {
    console.log('collision between', pair.bodyA.id, pair.bodyB.id);
  });
});
```

### Cleanup

```tsx
MatterPhysics.removeBody(ball.id);
MatterPhysics.clear();    // Remove all bodies/constraints
MatterPhysics.destroy();  // Full cleanup including engine
```

## Creating Custom Plugins

You can create your own plugins following Klint's plugin architecture. Plugins are static utility classes that manage their own state and only require Klint context for drawing operations.

### Plugin Architecture

Klint plugins follow these principles:

1. **Static classes** - No need to instantiate
2. **Context-free computation** - Process data without requiring Klint context
3. **Context for drawing only** - Accept `KlintContext` parameter when rendering
4. **Self-contained state** - Use private static fields for internal data
5. **TypeScript-first** - Provide full type definitions

### Basic Plugin Template

```tsx
import { KlintContext } from '@shopify/klint';

/**
 * Configuration interface
 */
export interface MyPluginConfig {
  option1?: number;
  option2?: string;
}

/**
 * Data structure your plugin manages
 */
export interface MyData {
  id: string;
  x: number;
  y: number;
  customField: any;
}

/**
 * Your Custom Plugin
 * 
 * @example
 * ```tsx
 * import { MyPlugin } from './MyPlugin';
 * 
 * MyPlugin.configure({ option1: 100 });
 * MyPlugin.process(data);
 * MyPlugin.draw(K);
 * ```
 */
export class MyPlugin {
  private static data: Map<string, MyData> = new Map();
  private static config: MyPluginConfig = {
    option1: 50,
    option2: 'default'
  };

  /**
   * Configure the plugin
   */
  static configure(config: MyPluginConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Process data (no context required)
   */
  static process(input: any[]): MyData[] {
    const results: MyData[] = [];
    
    // Your processing logic here
    input.forEach((item, i) => {
      const processed: MyData = {
        id: `item_${i}`,
        x: item.x || 0,
        y: item.y || 0,
        customField: this.transform(item)
      };
      
      this.data.set(processed.id, processed);
      results.push(processed);
    });
    
    return results;
  }

  /**
   * Helper method (private)
   */
  private static transform(input: any): any {
    // Your transformation logic
    return input;
  }

  /**
   * Draw to canvas (requires context)
   */
  static draw(
    ctx: KlintContext,
    options?: {
      filter?: (item: MyData) => boolean;
      customDraw?: (ctx: KlintContext, item: MyData) => void;
    }
  ): void {
    const items = options?.filter 
      ? Array.from(this.data.values()).filter(options.filter)
      : Array.from(this.data.values());

    items.forEach(item => {
      if (options?.customDraw) {
        options.customDraw(ctx, item);
      } else {
        this.drawItem(ctx, item);
      }
    });
  }

  /**
   * Default drawing implementation
   */
  private static drawItem(ctx: KlintContext, item: MyData): void {
    ctx.save();
    ctx.translate(item.x, item.y);
    // Your drawing code here
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

  /**
   * Utility methods
   */
  static get(id: string): MyData | undefined {
    return this.data.get(id);
  }

  static getAll(): MyData[] {
    return Array.from(this.data.values());
  }

  static clear(): void {
    this.data.clear();
  }
}
```

### Real-World Example: Noise Field Plugin

Here's a complete example of a custom plugin that generates and visualizes vector fields:

```tsx
import { KlintContext } from '@shopify/klint';

export interface NoiseFieldConfig {
  width: number;
  height: number;
  resolution: number;
  scale: number;
  timeScale?: number;
}

export interface VectorFieldPoint {
  x: number;
  y: number;
  angle: number;
  magnitude: number;
}

/**
 * Noise Field Plugin
 * Generates smooth vector fields using Perlin noise
 */
export class NoiseField {
  private static field: VectorFieldPoint[][] = [];
  private static config: NoiseFieldConfig = {
    width: 800,
    height: 600,
    resolution: 20,
    scale: 0.01,
    timeScale: 0.001
  };

  /**
   * Initialize or reconfigure the field
   */
  static configure(config: Partial<NoiseFieldConfig>): void {
    this.config = { ...this.config, ...config };
    this.generate();
  }

  /**
   * Generate the vector field (context-free)
   */
  static generate(time: number = 0): VectorFieldPoint[][] {
    const { width, height, resolution, scale, timeScale } = this.config;
    const cols = Math.floor(width / resolution);
    const rows = Math.floor(height / resolution);
    
    this.field = [];
    
    for (let y = 0; y < rows; y++) {
      const row: VectorFieldPoint[] = [];
      for (let x = 0; x < cols; x++) {
        // Use Math.random as placeholder for noise function
        // In real implementation, use a proper noise library
        const noiseValue = Math.sin(x * scale + time * (timeScale || 0)) * 
                          Math.cos(y * scale + time * (timeScale || 0));
        
        const angle = noiseValue * Math.PI * 2;
        const magnitude = Math.abs(noiseValue);
        
        row.push({
          x: x * resolution,
          y: y * resolution,
          angle,
          magnitude
        });
      }
      this.field.push(row);
    }
    
    return this.field;
  }

  /**
   * Get vector at specific position (interpolated)
   */
  static getVectorAt(x: number, y: number): VectorFieldPoint {
    const { resolution } = this.config;
    const col = Math.floor(x / resolution);
    const row = Math.floor(y / resolution);
    
    if (row >= 0 && row < this.field.length &&
        col >= 0 && col < this.field[row].length) {
      return this.field[row][col];
    }
    
    return { x, y, angle: 0, magnitude: 0 };
  }

  /**
   * Draw the vector field
   */
  static draw(
    ctx: KlintContext,
    options?: {
      showArrows?: boolean;
      showPoints?: boolean;
      arrowLength?: number;
      color?: string;
      alpha?: number;
    }
  ): void {
    const {
      showArrows = true,
      showPoints = false,
      arrowLength = 15,
      color = '#ffffff',
      alpha = 0.5
    } = options || {};

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    this.field.forEach(row => {
      row.forEach(point => {
        if (showPoints) {
          ctx.fillRect(point.x - 1, point.y - 1, 2, 2);
        }

        if (showArrows) {
          const length = arrowLength * point.magnitude;
          const endX = point.x + Math.cos(point.angle) * length;
          const endY = point.y + Math.sin(point.angle) * length;

          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(endX, endY);
          ctx.stroke();
        }
      });
    });

    ctx.restore();
  }

  /**
   * Apply field to particles (utility)
   */
  static applyToParticle(
    particle: { x: number; y: number; vx: number; vy: number },
    strength: number = 1
  ): void {
    const vector = this.getVectorAt(particle.x, particle.y);
    particle.vx += Math.cos(vector.angle) * vector.magnitude * strength;
    particle.vy += Math.sin(vector.angle) * vector.magnitude * strength;
  }

  /**
   * Get field data for custom use
   */
  static getField(): VectorFieldPoint[][] {
    return this.field;
  }

  /**
   * Clear the field
   */
  static clear(): void {
    this.field = [];
  }
}
```

### Using Your Custom Plugin

```tsx
import { NoiseField } from './NoiseField';

function VectorFieldSketch() {
  useEffect(() => {
    NoiseField.configure({
      width: 800,
      height: 600,
      resolution: 20,
      scale: 0.01,
      timeScale: 0.001
    });
  }, []);

  const draw = (K) => {
    K.background('#000000');
    
    // Update field with time
    NoiseField.generate(K.time);
    
    // Draw the field
    NoiseField.draw(K, {
      showArrows: true,
      arrowLength: 20,
      color: '#00ff88',
      alpha: 0.6
    });
  };

  return <Klint draw={draw} />;
}
```

### Plugin Best Practices

#### 1. Separate Computation from Rendering

```tsx
// ✅ Good: Compute data separately
static process(data: any[]): Result[] {
  return data.map(item => this.transform(item));
}

static draw(ctx: KlintContext, results: Result[]): void {
  results.forEach(r => this.drawItem(ctx, r));
}

// ❌ Bad: Mixing computation with rendering
static draw(ctx: KlintContext, data: any[]): void {
  data.forEach(item => {
    const processed = this.transform(item); // Don't compute in draw
    this.drawItem(ctx, processed);
  });
}
```

#### 2. Use TypeScript Generics for Flexibility

```tsx
export class GenericPlugin<T> {
  private static data: Map<string, any> = new Map();
  
  static process<T>(items: T[], transform: (item: T) => any): any[] {
    return items.map(transform);
  }
}
```

#### 3. Provide Clear Configuration

```tsx
// ✅ Good: Type-safe configuration with defaults
interface PluginConfig {
  enabled: boolean;
  quality: 'low' | 'medium' | 'high';
  maxItems: number;
}

static configure(config: Partial<PluginConfig>): void {
  this.config = { 
    ...this.defaultConfig, 
    ...config 
  };
}
```

#### 4. Handle Edge Cases

```tsx
static draw(ctx: KlintContext, id: string): void {
  const item = this.data.get(id);
  
  // ✅ Good: Check for existence
  if (!item) {
    console.warn(`Item ${id} not found`);
    return;
  }
  
  this.drawItem(ctx, item);
}
```

#### 5. Provide Async Loading When Needed

```tsx
static async load(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load');
    
    const data = await response.json();
    this.initialize(data);
  } catch (error) {
    console.error('Plugin load error:', error);
    throw error;
  }
}
```

### Plugin Testing

Create tests for your plugin logic:

```tsx
import { describe, it, expect } from 'vitest';
import { MyPlugin } from './MyPlugin';

describe('MyPlugin', () => {
  it('should process data correctly', () => {
    const input = [{ x: 10, y: 20 }];
    const result = MyPlugin.process(input);
    
    expect(result).toHaveLength(1);
    expect(result[0].x).toBe(10);
    expect(result[0].y).toBe(20);
  });

  it('should handle empty input', () => {
    const result = MyPlugin.process([]);
    expect(result).toHaveLength(0);
  });

  it('should clear data', () => {
    MyPlugin.process([{ x: 1, y: 2 }]);
    MyPlugin.clear();
    expect(MyPlugin.getAll()).toHaveLength(0);
  });
});
```

### Exporting Your Plugin

If creating a shareable plugin package:

```tsx
// src/index.ts
export { MyPlugin } from './MyPlugin';
export type { MyPluginConfig, MyData } from './MyPlugin';

// package.json
{
  "name": "klint-plugin-myname",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "@shopify/klint": "^1.0.0"
  }
}
```

Then users can install and use it:

```bash
npm install klint-plugin-myname
```

```tsx
import { MyPlugin } from 'klint-plugin-myname';
```

## Best Practices

### Performance

- Load assets (fonts, sprites) during initialization, not in draw loop
- Cache plugin results when possible
- Use appropriate sampling rates for point generation
- Consider using Things for managing large numbers of objects
- Pre-compute expensive operations outside the draw loop

### Memory Management

```tsx
// Clean up when unmounting
useEffect(() => {
  return () => {
    Sprites.clear();
    Things.clear();
    MyPlugin.clear(); // Your custom plugin cleanup
  };
}, []);
```

### Type Safety

All plugins include full TypeScript definitions:

```tsx
import type { 
  FontPathsResult, 
  FontPointsResult, 
  FontTextOptions 
} from '@shopify/klint/plugins';

import type { Triangle } from '@shopify/klint/plugins';
import type { SpriteConfig, Spritesheet } from '@shopify/klint/plugins';
```

## Examples

### Animated Text Particles

```tsx
const [font, setFont] = useState(null);

useEffect(() => {
  const parser = new FontParser();
  parser.load('/font.ttf').then(setFont);
}, []);

const draw = (K) => {
  if (!font) return;
  
  K.background('#000');
  
  const result = font.toPoints('KLINT', 150, {
    align: 'center',
    baseline: 'center',
    sampling: 0.3
  });
  
  result.letters.forEach(letter => {
    letter.shape.forEach((point, i) => {
      const angle = K.time * 0.001 + i * 0.1;
      const radius = Math.sin(angle) * 10;
      const x = K.width / 2 + letter.center.x + point.x + Math.cos(angle) * radius;
      const y = K.height / 2 + letter.center.y + point.y + Math.sin(angle) * radius;
      
      K.fillColor(`hsl(${i * 10}, 70%, 60%)`);
      K.circle(x, y, 2);
    });
  });
};
```

### Voronoi Diagram

```tsx
const draw = (K) => {
  const points = Array.from({ length: 30 }, () => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height
  }));
  
  const triangles = Delaunay.triangulate(points);
  
  // Draw triangles
  K.strokeColor('#ffffff40');
  Delaunay.drawTriangles(K, triangles, {
    fill: false,
    stroke: true
  });
  
  // Draw circumcenters
  triangles.forEach(tri => {
    const center = Delaunay.circumcenter(tri);
    K.fillColor('#ff006680');
    K.circle(center.x, center.y, 3);
  });
  
  // Draw original points
  points.forEach(p => {
    K.fillColor('#fff');
    K.circle(p.x, p.y, 5);
  });
};
```

### Sprite-Based Particle System

```tsx
useEffect(() => {
  Sprites.load({
    name: 'particle',
    url: '/particle-sprite.png',
    spriteWidth: 16,
    spriteHeight: 16
  });
}, []);

const draw = (K) => {
  if (!Sprites.hasSheet('particle')) return;
  
  // Create and animate particles using Things
  if (K.frame % 5 === 0) {
    Things.create({
      x: K.width / 2,
      y: K.height / 2,
      data: {
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        frame: Math.floor(Math.random() * 8),
        life: 1.0
      }
    });
  }
  
  // Update and draw
  Things.forEach(thing => {
    thing.x += thing.data.vx;
    thing.y += thing.data.vy;
    thing.data.life -= 0.01;
    if (thing.data.life <= 0) Things.remove(thing.id);
  });
  
  Things.draw(K, {
    customDraw: (K, thing) => {
      Sprites.draw(K, 'particle', thing.data.frame, thing.x, thing.y, {
        alpha: thing.data.life
      });
    }
  });
};
```