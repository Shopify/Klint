---
sidebar_position: 8
---

# Creating Custom Plugins

You can create your own plugins following Klint's plugin architecture. Plugins are static utility classes that manage their own state and only require Klint context for drawing operations.

## Plugin Architecture

Klint plugins follow these principles:

1. **Static classes** — no need to instantiate
2. **Context-free computation** — process data without requiring Klint context
3. **Context for drawing only** — accept `KlintContext` parameter when rendering
4. **Self-contained state** — use private static fields for internal data
5. **TypeScript-first** — provide full type definitions

## Basic Plugin Template

```tsx
import { KlintContext } from '@shopify/klint';

export interface MyPluginConfig {
  option1?: number;
  option2?: string;
}

export interface MyData {
  id: string;
  x: number;
  y: number;
  customField: any;
}

export class MyPlugin {
  private static data: Map<string, MyData> = new Map();
  private static config: MyPluginConfig = {
    option1: 50,
    option2: 'default'
  };

  static configure(config: MyPluginConfig): void {
    this.config = { ...this.config, ...config };
  }

  static process(input: any[]): MyData[] {
    const results: MyData[] = [];

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

  private static transform(input: any): any {
    return input;
  }

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

  private static drawItem(ctx: KlintContext, item: MyData): void {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

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

## Real-World Example: Noise Field Plugin

A complete example that generates and visualizes vector fields:

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

export class NoiseField {
  private static field: VectorFieldPoint[][] = [];
  private static config: NoiseFieldConfig = {
    width: 800,
    height: 600,
    resolution: 20,
    scale: 0.01,
    timeScale: 0.001
  };

  static configure(config: Partial<NoiseFieldConfig>): void {
    this.config = { ...this.config, ...config };
    this.generate();
  }

  static generate(time: number = 0): VectorFieldPoint[][] {
    const { width, height, resolution, scale, timeScale } = this.config;
    const cols = Math.floor(width / resolution);
    const rows = Math.floor(height / resolution);

    this.field = [];

    for (let y = 0; y < rows; y++) {
      const row: VectorFieldPoint[] = [];
      for (let x = 0; x < cols; x++) {
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

  static applyToParticle(
    particle: { x: number; y: number; vx: number; vy: number },
    strength: number = 1
  ): void {
    const vector = this.getVectorAt(particle.x, particle.y);
    particle.vx += Math.cos(vector.angle) * vector.magnitude * strength;
    particle.vy += Math.sin(vector.angle) * vector.magnitude * strength;
  }

  static getField(): VectorFieldPoint[][] {
    return this.field;
  }

  static clear(): void {
    this.field = [];
  }
}
```

### Using the Custom Plugin

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

    NoiseField.generate(K.time);

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

## Best Practices

### 1. Separate Computation from Rendering

```tsx
// Good: compute data separately
static process(data: any[]): Result[] {
  return data.map(item => this.transform(item));
}

static draw(ctx: KlintContext, results: Result[]): void {
  results.forEach(r => this.drawItem(ctx, r));
}

// Bad: mixing computation with rendering
static draw(ctx: KlintContext, data: any[]): void {
  data.forEach(item => {
    const processed = this.transform(item);
    this.drawItem(ctx, processed);
  });
}
```

### 2. Use TypeScript Generics for Flexibility

```tsx
export class GenericPlugin<T> {
  private static data: Map<string, any> = new Map();

  static process<T>(items: T[], transform: (item: T) => any): any[] {
    return items.map(transform);
  }
}
```

### 3. Provide Clear Configuration

```tsx
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

### 4. Handle Edge Cases

```tsx
static draw(ctx: KlintContext, id: string): void {
  const item = this.data.get(id);

  if (!item) {
    console.warn(`Item ${id} not found`);
    return;
  }

  this.drawItem(ctx, item);
}
```

### 5. Provide Async Loading When Needed

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

## Testing

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

## Exporting Your Plugin

If creating a shareable plugin package:

```tsx
// src/index.ts
export { MyPlugin } from './MyPlugin';
export type { MyPluginConfig, MyData } from './MyPlugin';
```

```json
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

Then users install and use it:

```bash
npm install klint-plugin-myname
```

```tsx
import { MyPlugin } from 'klint-plugin-myname';
```
