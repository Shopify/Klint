import { KlintContext } from "../Klint";

/**
 * Body reference tracked by MatterPhysics
 */
interface MatterBody {
  id: string;
  body: any;
  label?: string;
}

/**
 * Configuration for MatterPhysics initialization
 */
interface MatterPhysicsConfig {
  gravity?: { x: number; y: number; scale?: number };
  enableSleeping?: boolean;
  constraintIterations?: number;
  positionIterations?: number;
  velocityIterations?: number;
}

/**
 * Options for body creation
 */
interface BodyOptions {
  id?: string;
  label?: string;
  isStatic?: boolean;
  restitution?: number;
  friction?: number;
  frictionAir?: number;
  density?: number;
  angle?: number;
  isSensor?: boolean;
  chamfer?: { radius: number };
  [key: string]: any;
}

/**
 * Options for constraint creation
 */
interface ConstraintOptions {
  id?: string;
  stiffness?: number;
  damping?: number;
  length?: number;
  pointA?: { x: number; y: number };
  pointB?: { x: number; y: number };
  [key: string]: any;
}

/**
 * Debug draw options
 */
interface DrawOptions {
  showBodies?: boolean;
  showConstraints?: boolean;
  showBounds?: boolean;
  bodyStroke?: string;
  bodyFill?: string;
  staticFill?: string;
  constraintStroke?: string;
  lineWidth?: number;
}

/**
 * MatterPhysics Plugin
 *
 * Wrapper around Matter.js for 2D physics simulation.
 * Requires matter-js — either pass the module at init, or use load() to dynamically import it.
 *
 * @example
 * ```tsx
 * import { MatterPhysics } from '@shopify/klint/plugins';
 *
 * // Option 1: Dynamic import (recommended)
 * await MatterPhysics.load({ gravity: { x: 0, y: 1 } });
 *
 * // Option 2: Pass module directly
 * import Matter from 'matter-js';
 * MatterPhysics.init(Matter, { gravity: { x: 0, y: 1 } });
 *
 * MatterPhysics.addRect(400, 550, 800, 50, { isStatic: true });
 * MatterPhysics.addCircle(400, 100, 25);
 *
 * const draw = (K) => {
 *   MatterPhysics.update(K.deltaTime);
 *   MatterPhysics.draw(K);
 * };
 * ```
 */
export class MatterPhysics {
  private static Matter: any = null;
  private static engine: any = null;
  private static world: any = null;
  private static bodies: Map<string, MatterBody> = new Map();
  private static constraints: Map<string, any> = new Map();
  private static idCounter: number = 0;
  private static constraintIdCounter: number = 0;
  private static _loaded: boolean = false;

  /** Matter.js version loaded from CDN when not installed locally */
  static MATTER_VERSION = "0.20.0";
  /** CDN URL template — version is interpolated */
  static MATTER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/matter-js/${MatterPhysics.MATTER_VERSION}/matter.min.js`;

  /**
   * Dynamically load matter-js and initialize the engine.
   * Tries a local `import("matter-js")` first — if that fails (package not installed),
   * falls back to loading from CDN via a script tag.
   * @param config - Engine configuration
   * @returns Promise that resolves when ready
   *
   * @example
   * ```tsx
   * // In preload or setup:
   * await MatterPhysics.load({ gravity: { x: 0, y: 1 } });
   * ```
   */
  static async load(config: MatterPhysicsConfig = {}): Promise<void> {
    if (this._loaded && this.engine) return;

    // Try local import first (user has matter-js installed)
    try {
      // @ts-expect-error - matter-js is a peer dependency, not bundled
      const matterModule = await import("matter-js");
      const Matter = matterModule.default || matterModule;
      this.init(Matter, config);
      this._loaded = true;
      return;
    } catch {
      // Local import failed, fall through to CDN
    }

    // Fallback: load from CDN
    try {
      const Matter = await this._loadFromCDN();
      this.init(Matter, config);
      this._loaded = true;
    } catch (e) {
      throw new Error(
        `MatterPhysics: failed to load matter-js. Install it with "npm install matter-js" or check your network connection for CDN fallback (${this.MATTER_CDN}).`,
      );
    }
  }

  /**
   * Load Matter.js from CDN by injecting a script tag.
   * Resolves with the global `Matter` object.
   */
  private static _loadFromCDN(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Already on the page (e.g. loaded by a previous call)
      if (typeof (globalThis as any).Matter !== "undefined") {
        resolve((globalThis as any).Matter);
        return;
      }

      const script = document.createElement("script");
      script.src = this.MATTER_CDN;
      script.async = true;

      script.onload = () => {
        if (typeof (globalThis as any).Matter !== "undefined") {
          resolve((globalThis as any).Matter);
        } else {
          reject(new Error("Matter global not found after script load"));
        }
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script from ${this.MATTER_CDN}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Check if MatterPhysics has been loaded and initialized.
   */
  static get isLoaded(): boolean {
    return this._loaded && this.engine !== null;
  }

  /**
   * Initialize the physics engine with a Matter.js module reference.
   * Prefer `load()` for dynamic import. Use this if you want to pass the module directly.
   * @param matterModule - The Matter.js module (import Matter from 'matter-js')
   * @param config - Engine configuration
   */
  static init(matterModule: any, config: MatterPhysicsConfig = {}): void {
    this.Matter = matterModule;
    this._loaded = true;
    this.engine = matterModule.Engine.create({
      enableSleeping: config.enableSleeping ?? false,
      constraintIterations: config.constraintIterations ?? 2,
      positionIterations: config.positionIterations ?? 6,
      velocityIterations: config.velocityIterations ?? 4,
    });
    this.world = this.engine.world;

    if (config.gravity) {
      this.world.gravity.x = config.gravity.x;
      this.world.gravity.y = config.gravity.y;
      if (config.gravity.scale !== undefined) {
        this.world.gravity.scale = config.gravity.scale;
      }
    }

    this.bodies.clear();
    this.constraints.clear();
    this.idCounter = 0;
    this.constraintIdCounter = 0;
  }

  private static ensureInit(): void {
    if (!this.Matter || !this.engine) {
      throw new Error(
        "MatterPhysics not initialized. Call MatterPhysics.init(Matter) first.",
      );
    }
  }

  private static generateId(prefix: string = "body"): string {
    return `${prefix}_${this.idCounter++}`;
  }

  /**
   * Add a rectangle body.
   * @param x - Center X
   * @param y - Center Y
   * @param width - Width
   * @param height - Height
   * @param options - Body options
   * @returns Body reference with id
   */
  static addRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options: BodyOptions = {},
  ): MatterBody {
    this.ensureInit();
    const id = options.id || this.generateId("rect");
    const body = this.Matter.Bodies.rectangle(x, y, width, height, options);
    this.Matter.Composite.add(this.world, body);
    const ref: MatterBody = { id, body, label: options.label };
    this.bodies.set(id, ref);
    return ref;
  }

  /**
   * Add a circle body.
   * @param x - Center X
   * @param y - Center Y
   * @param radius - Radius
   * @param options - Body options
   * @returns Body reference with id
   */
  static addCircle(
    x: number,
    y: number,
    radius: number,
    options: BodyOptions = {},
  ): MatterBody {
    this.ensureInit();
    const id = options.id || this.generateId("circle");
    const body = this.Matter.Bodies.circle(x, y, radius, options);
    this.Matter.Composite.add(this.world, body);
    const ref: MatterBody = { id, body, label: options.label };
    this.bodies.set(id, ref);
    return ref;
  }

  /**
   * Add a polygon body.
   * @param x - Center X
   * @param y - Center Y
   * @param sides - Number of sides
   * @param radius - Radius
   * @param options - Body options
   * @returns Body reference with id
   */
  static addPolygon(
    x: number,
    y: number,
    sides: number,
    radius: number,
    options: BodyOptions = {},
  ): MatterBody {
    this.ensureInit();
    const id = options.id || this.generateId("polygon");
    const body = this.Matter.Bodies.polygon(x, y, sides, radius, options);
    this.Matter.Composite.add(this.world, body);
    const ref: MatterBody = { id, body, label: options.label };
    this.bodies.set(id, ref);
    return ref;
  }

  /**
   * Add a body from custom vertices.
   * @param x - Center X
   * @param y - Center Y
   * @param vertices - Array of {x, y} points
   * @param options - Body options
   * @returns Body reference with id
   */
  static addFromVertices(
    x: number,
    y: number,
    vertices: Array<{ x: number; y: number }>,
    options: BodyOptions = {},
  ): MatterBody {
    this.ensureInit();
    const id = options.id || this.generateId("custom");
    const body = this.Matter.Bodies.fromVertices(x, y, vertices, options);
    this.Matter.Composite.add(this.world, body);
    const ref: MatterBody = { id, body, label: options.label };
    this.bodies.set(id, ref);
    return ref;
  }

  /**
   * Add a constraint between two bodies.
   * @param bodyIdA - First body ID
   * @param bodyIdB - Second body ID
   * @param options - Constraint options
   * @returns Constraint ID
   */
  static addConstraint(
    bodyIdA: string,
    bodyIdB: string,
    options: ConstraintOptions = {},
  ): string {
    this.ensureInit();
    const refA = this.bodies.get(bodyIdA);
    const refB = this.bodies.get(bodyIdB);
    if (!refA || !refB) {
      throw new Error(`Body not found: ${!refA ? bodyIdA : bodyIdB}`);
    }

    const id = options.id || `constraint_${this.constraintIdCounter++}`;
    const constraint = this.Matter.Constraint.create({
      bodyA: refA.body,
      bodyB: refB.body,
      ...options,
    });
    this.Matter.Composite.add(this.world, constraint);
    this.constraints.set(id, constraint);
    return id;
  }

  /**
   * Add a constraint anchored to a world point.
   * @param bodyId - Body ID
   * @param worldPoint - World anchor point {x, y}
   * @param options - Constraint options
   * @returns Constraint ID
   */
  static addWorldConstraint(
    bodyId: string,
    worldPoint: { x: number; y: number },
    options: ConstraintOptions = {},
  ): string {
    this.ensureInit();
    const ref = this.bodies.get(bodyId);
    if (!ref) throw new Error(`Body not found: ${bodyId}`);

    const id = options.id || `constraint_${this.constraintIdCounter++}`;
    const constraint = this.Matter.Constraint.create({
      bodyA: ref.body,
      pointB: worldPoint,
      ...options,
    });
    this.Matter.Composite.add(this.world, constraint);
    this.constraints.set(id, constraint);
    return id;
  }

  /**
   * Apply force to a body.
   * @param bodyId - Body ID
   * @param force - Force vector {x, y}
   */
  static applyForce(bodyId: string, force: { x: number; y: number }): void {
    this.ensureInit();
    const ref = this.bodies.get(bodyId);
    if (!ref) return;
    this.Matter.Body.applyForce(ref.body, ref.body.position, force);
  }

  /**
   * Set velocity of a body.
   * @param bodyId - Body ID
   * @param velocity - Velocity vector {x, y}
   */
  static setVelocity(bodyId: string, velocity: { x: number; y: number }): void {
    this.ensureInit();
    const ref = this.bodies.get(bodyId);
    if (!ref) return;
    this.Matter.Body.setVelocity(ref.body, velocity);
  }

  /**
   * Set position of a body.
   * @param bodyId - Body ID
   * @param position - Position {x, y}
   */
  static setPosition(bodyId: string, position: { x: number; y: number }): void {
    this.ensureInit();
    const ref = this.bodies.get(bodyId);
    if (!ref) return;
    this.Matter.Body.setPosition(ref.body, position);
  }

  /**
   * Set gravity.
   * @param x - Horizontal gravity
   * @param y - Vertical gravity
   */
  static setGravity(x: number, y: number): void {
    this.ensureInit();
    this.world.gravity.x = x;
    this.world.gravity.y = y;
  }

  /**
   * Get a body reference by ID.
   */
  static getBody(id: string): MatterBody | undefined {
    return this.bodies.get(id);
  }

  /**
   * Get all body references.
   */
  static getAllBodies(): MatterBody[] {
    return Array.from(this.bodies.values());
  }

  /**
   * Remove a body.
   * @param id - Body ID
   */
  static removeBody(id: string): boolean {
    this.ensureInit();
    const ref = this.bodies.get(id);
    if (!ref) return false;
    this.Matter.Composite.remove(this.world, ref.body);
    return this.bodies.delete(id);
  }

  /**
   * Remove a constraint.
   * @param id - Constraint ID
   */
  static removeConstraint(id: string): boolean {
    this.ensureInit();
    const constraint = this.constraints.get(id);
    if (!constraint) return false;
    this.Matter.Composite.remove(this.world, constraint);
    return this.constraints.delete(id);
  }

  /**
   * Step the physics engine.
   * @param deltaTime - Time step in milliseconds
   */
  static update(deltaTime: number): void {
    this.ensureInit();
    this.Matter.Engine.update(this.engine, deltaTime);
  }

  /**
   * Debug draw all bodies and constraints using Klint drawing primitives.
   * @param ctx - Klint context
   * @param options - Drawing options
   */
  static draw(ctx: KlintContext, options: DrawOptions = {}): void {
    const {
      showBodies = true,
      showConstraints = true,
      showBounds = false,
      bodyStroke = "#ffffff",
      bodyFill = "transparent",
      staticFill = "#666666",
      constraintStroke = "#44ff44",
      lineWidth = 1,
    } = options;

    ctx.save();
    ctx.strokeWidth(lineWidth);

    if (showBodies) {
      this.bodies.forEach((ref) => {
        const body = ref.body;
        const vertices = body.vertices;

        ctx.fillStyle = body.isStatic ? staticFill : bodyFill;
        ctx.strokeStyle = bodyStroke;

        ctx.beginShape();
        for (let i = 0; i < vertices.length; i++) {
          ctx.vertex(vertices[i].x, vertices[i].y);
        }
        ctx.endShape(true);

        if (showBounds) {
          const { min, max } = body.bounds;
          ctx.noFill();
          ctx.strokeStyle = "#ff444444";
          ctx.setRectOrigin("corner");
          ctx.rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
        }
      });
    }

    if (showConstraints) {
      ctx.strokeStyle = constraintStroke;
      this.constraints.forEach((constraint) => {
        const { bodyA, bodyB, pointA, pointB } = constraint;
        const startX = bodyA
          ? bodyA.position.x + (pointA?.x || 0)
          : pointA?.x || 0;
        const startY = bodyA
          ? bodyA.position.y + (pointA?.y || 0)
          : pointA?.y || 0;
        const endX = bodyB
          ? bodyB.position.x + (pointB?.x || 0)
          : pointB?.x || 0;
        const endY = bodyB
          ? bodyB.position.y + (pointB?.y || 0)
          : pointB?.y || 0;

        ctx.line(startX, startY, endX, endY);
      });
    }

    ctx.restore();
  }

  /**
   * Iterate over all bodies with their position and angle.
   * Convenience method for syncing physics bodies to visual objects.
   * @param fn - Callback receiving body data
   */
  static forEach(
    fn: (data: {
      id: string;
      x: number;
      y: number;
      angle: number;
      velocity: { x: number; y: number };
      body: any;
      label?: string;
    }) => void,
  ): void {
    this.bodies.forEach((ref) => {
      fn({
        id: ref.id,
        x: ref.body.position.x,
        y: ref.body.position.y,
        angle: ref.body.angle,
        velocity: ref.body.velocity,
        body: ref.body,
        label: ref.label,
      });
    });
  }

  /**
   * Register a collision callback.
   * @param event - Event type: 'collisionStart', 'collisionActive', 'collisionEnd'
   * @param callback - Callback receiving collision pairs
   */
  static onCollision(
    event: "collisionStart" | "collisionActive" | "collisionEnd",
    callback: (pairs: any[]) => void,
  ): void {
    this.ensureInit();
    this.Matter.Events.on(this.engine, event, (e: any) => {
      callback(e.pairs);
    });
  }

  /**
   * Get the raw Matter.js engine for advanced usage.
   */
  static getEngine(): any {
    return this.engine;
  }

  /**
   * Get the raw Matter.js world for advanced usage.
   */
  static getWorld(): any {
    return this.world;
  }

  /**
   * Clear all bodies, constraints, and reset the engine.
   */
  static clear(): void {
    if (this.world) {
      this.Matter?.Composite.clear(this.world, false);
    }
    this.bodies.clear();
    this.constraints.clear();
    this.idCounter = 0;
    this.constraintIdCounter = 0;
  }

  /**
   * Destroy the engine entirely.
   */
  static destroy(): void {
    this.clear();
    if (this.engine) {
      this.Matter?.Engine.clear(this.engine);
    }
    this.engine = null;
    this.world = null;
    this.Matter = null;
    this._loaded = false;
  }
}
