import { KlintContext } from "@shopify/klint";

/**
 * Configuration options for Things plugin
 */
interface ThingsConfig {
  // Add your configuration options here
  maxThings?: number;
  defaultSize?: number;
  defaultColor?: string;
}

/**
 * Individual Thing interface
 */
interface Thing {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  color: string;
  data?: any; // Custom data attached to the thing
}

/**
 * Static Things Plugin
 *
 * Manages a collection of "things" - generic objects that can be positioned,
 * transformed, and rendered without requiring Klint context initialization.
 * Context is only passed when drawing operations are needed.
 *
 * @example
 * ```tsx
 * import { Things } from '@shopify/klint/plugins';
 *
 * // Create things
 * Things.create({ x: 100, y: 100 });
 * Things.create({ x: 200, y: 200, color: '#ff0066' });
 *
 * // Update and draw
 * Things.animatePhysics(deltaTime);
 * Things.draw(K);
 * ```
 */
export class Things {
  private static things: Map<string, Thing> = new Map();
  private static config: ThingsConfig = {
    maxThings: 1000,
    defaultSize: 50,
    defaultColor: "#ffffff",
  };
  private static idCounter: number = 0;

  /**
   * Configure the plugin
   */
  static configure(config: ThingsConfig): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Create a new thing
   */
  static create(options: Partial<Thing> = {}): Thing {
    if (this.things.size >= (this.config.maxThings || 1000)) {
      throw new Error(
        `Maximum number of things (${this.config.maxThings}) reached`,
      );
    }

    const thing: Thing = {
      id: options.id || `thing_${this.idCounter++}`,
      x: options.x || 0,
      y: options.y || 0,
      width: options.width || this.config.defaultSize || 50,
      height: options.height || this.config.defaultSize || 50,
      rotation: options.rotation || 0,
      scale: options.scale || 1,
      color: options.color || this.config.defaultColor || "#ffffff",
      data: options.data || {},
    };

    this.things.set(thing.id, thing);
    return thing;
  }

  /**
   * Get a thing by ID
   */
  static get(id: string): Thing | undefined {
    return this.things.get(id);
  }

  /**
   * Get all things
   */
  static getAll(): Thing[] {
    return Array.from(this.things.values());
  }

  /**
   * Update a thing's properties
   */
  static update(id: string, updates: Partial<Thing>): void {
    const thing = this.things.get(id);
    if (thing) {
      Object.assign(thing, updates);
    }
  }

  /**
   * Remove a thing
   */
  static remove(id: string): boolean {
    return this.things.delete(id);
  }

  /**
   * Clear all things
   */
  static clear(): void {
    this.things.clear();
    this.idCounter = 0;
  }

  /**
   * Move a thing
   */
  static move(id: string, dx: number, dy: number): void {
    const thing = this.things.get(id);
    if (thing) {
      thing.x += dx;
      thing.y += dy;
    }
  }

  /**
   * Rotate a thing
   */
  static rotate(id: string, angle: number): void {
    const thing = this.things.get(id);
    if (thing) {
      thing.rotation += angle;
    }
  }

  /**
   * Scale a thing
   */
  static scale(id: string, factor: number): void {
    const thing = this.things.get(id);
    if (thing) {
      thing.scale *= factor;
    }
  }

  /**
   * Find things within a radius
   */
  static findNear(x: number, y: number, radius: number): Thing[] {
    const near: Thing[] = [];
    const radiusSq = radius * radius;

    this.things.forEach((thing) => {
      const dx = thing.x - x;
      const dy = thing.y - y;
      if (dx * dx + dy * dy <= radiusSq) {
        near.push(thing);
      }
    });

    return near;
  }

  /**
   * Find things that overlap with a rectangle
   */
  static findInRect(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Thing[] {
    const found: Thing[] = [];

    this.things.forEach((thing) => {
      const halfW = (thing.width * thing.scale) / 2;
      const halfH = (thing.height * thing.scale) / 2;

      if (
        thing.x + halfW >= x &&
        thing.x - halfW <= x + width &&
        thing.y + halfH >= y &&
        thing.y - halfH <= y + height
      ) {
        found.push(thing);
      }
    });

    return found;
  }

  /**
   * Apply a function to all things
   */
  static forEach(fn: (thing: Thing) => void): void {
    this.things.forEach(fn);
  }

  /**
   * Map things to a new array
   */
  static map<T>(fn: (thing: Thing) => T): T[] {
    return Array.from(this.things.values()).map(fn);
  }

  /**
   * Filter things
   */
  static filter(fn: (thing: Thing) => boolean): Thing[] {
    return Array.from(this.things.values()).filter(fn);
  }

  /**
   * Sort things by a property or function
   */
  static sort(fn: (a: Thing, b: Thing) => number): Thing[] {
    return Array.from(this.things.values()).sort(fn);
  }

  /**
   * Draw all things
   */
  static draw(
    ctx: KlintContext,
    options?: {
      customDraw?: (ctx: KlintContext, thing: Thing) => void;
      filter?: (thing: Thing) => boolean;
    },
  ): void {
    const thingsToDraw = options?.filter
      ? this.filter(options.filter)
      : this.getAll();

    thingsToDraw.forEach((thing) => {
      if (options?.customDraw) {
        // Custom drawing function
        options.customDraw(ctx, thing);
      } else {
        // Default drawing
        this.drawThing(ctx, thing);
      }
    });
  }

  /**
   * Default drawing method for a thing
   */
  private static drawThing(ctx: KlintContext, thing: Thing): void {
    ctx.save();

    // Apply transformations
    ctx.translate(thing.x, thing.y);
    ctx.rotate(thing.rotation);
    ctx.scale(thing.scale, thing.scale);

    // Draw the thing (default is a rectangle)
    ctx.fillStyle = thing.color;
    ctx.fillRect(
      -thing.width / 2,
      -thing.height / 2,
      thing.width,
      thing.height,
    );

    ctx.restore();
  }

  /**
   * Animate things with a simple physics update
   */
  static animatePhysics(
    deltaTime: number,
    options?: {
      gravity?: number;
      friction?: number;
      bounds?: { x: number; y: number; width: number; height: number };
    },
  ): void {
    const gravity = options?.gravity || 0;
    const friction = options?.friction || 0.99;
    const bounds = options?.bounds;

    this.things.forEach((thing) => {
      if (!thing.data.vx) thing.data.vx = 0;
      if (!thing.data.vy) thing.data.vy = 0;

      // Apply gravity
      thing.data.vy += gravity;

      // Apply friction
      thing.data.vx *= friction;
      thing.data.vy *= friction;

      // Update position
      thing.x += thing.data.vx;
      thing.y += thing.data.vy;

      // Apply bounds
      if (bounds) {
        const halfW = (thing.width * thing.scale) / 2;
        const halfH = (thing.height * thing.scale) / 2;

        if (thing.x - halfW < bounds.x) {
          thing.x = bounds.x + halfW;
          thing.data.vx *= -0.8; // Bounce
        }
        if (thing.x + halfW > bounds.x + bounds.width) {
          thing.x = bounds.x + bounds.width - halfW;
          thing.data.vx *= -0.8;
        }
        if (thing.y - halfH < bounds.y) {
          thing.y = bounds.y + halfH;
          thing.data.vy *= -0.8;
        }
        if (thing.y + halfH > bounds.y + bounds.height) {
          thing.y = bounds.y + bounds.height - halfH;
          thing.data.vy *= -0.8;
        }
      }
    });
  }

  /**
   * Get the count of things
   */
  static count(): number {
    return this.things.size;
  }

  /**
   * Check if a thing exists
   */
  static has(id: string): boolean {
    return this.things.has(id);
  }

  /**
   * Utility: Get distance between two things
   */
  static distance(id1: string, id2: string): number {
    const thing1 = this.things.get(id1);
    const thing2 = this.things.get(id2);

    if (!thing1 || !thing2) return Infinity;

    const dx = thing2.x - thing1.x;
    const dy = thing2.y - thing1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Utility: Check collision between two things
   */
  static collides(id1: string, id2: string): boolean {
    const thing1 = this.things.get(id1);
    const thing2 = this.things.get(id2);

    if (!thing1 || !thing2) return false;

    const halfW1 = (thing1.width * thing1.scale) / 2;
    const halfH1 = (thing1.height * thing1.scale) / 2;
    const halfW2 = (thing2.width * thing2.scale) / 2;
    const halfH2 = (thing2.height * thing2.scale) / 2;

    return (
      Math.abs(thing1.x - thing2.x) < halfW1 + halfW2 &&
      Math.abs(thing1.y - thing2.y) < halfH1 + halfH2
    );
  }
}
