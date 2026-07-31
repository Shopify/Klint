import type { KlintContext } from "../core/KlintTypes";

/**
 * Sprite configuration
 */
export interface SpriteConfig {
  name: string;
  url: string;
  spriteWidth: number;
  spriteHeight: number;
  gap?: number;
}

/**
 * Spritesheet data
 */
export interface Spritesheet {
  image: HTMLImageElement;
  srcNaturalWidth: number;
  srcNaturalHeight: number;
  numSprites: number;
  spriteWidth: number;
  spriteHeight: number;
  gap: number;
  cols: number;
  rows: number;
}

/**
 * Static Sprites Plugin
 *
 * Manages spritesheets and sprite rendering without requiring Klint context initialization.
 * Context is only passed when drawing operations are needed.
 *
 * @example
 * ```tsx
 * import { Sprites } from '@shopify/klint/plugins';
 *
 * const preload = async () => {
 *   await Sprites.load({
 *     name: 'player',
 *     url: '/assets/player-sprites.png',
 *     spriteWidth: 32,
 *     spriteHeight: 32,
 *     gap: 0
 *   });
 * };
 *
 * const draw = (K) => {
 *   const sheet = Sprites.sheet('player');
 *   const frame = Math.floor(K.frame / 10) % sheet.numSprites;
 *   Sprites.draw(K, 'player', frame, 100, 100);
 * };
 * ```
 */
export class Sprites {
  private static spritesheets: Map<string, Spritesheet> = new Map();
  private static loadingPromises: Map<string, Promise<void>> = new Map();

  /**
   * Load one or more spritesheets
   * @param configs - Sprite configuration(s) to load
   * @returns Promise that resolves when all sprites are loaded
   */
  static async load(...configs: SpriteConfig[]): Promise<void> {
    const promises = configs.map((config) => this.loadSingle(config));
    await Promise.all(promises);
  }

  /**
   * Load a single spritesheet
   * @param config - Sprite configuration
   * @returns Promise that resolves when sprite is loaded
   */
  private static async loadSingle(config: SpriteConfig): Promise<void> {
    const { name, url, spriteWidth, spriteHeight, gap = 0 } = config;

    // Check if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!;
    }

    // Check if already loaded
    if (this.spritesheets.has(name)) {
      return Promise.resolve();
    }

    // Create loading promise
    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const cols = Math.floor((img.width + gap) / (spriteWidth + gap));
        const rows = Math.floor((img.height + gap) / (spriteHeight + gap));
        const numSprites = cols * rows;

        const spritesheet: Spritesheet = {
          image: img,
          srcNaturalWidth: img.width,
          srcNaturalHeight: img.height,
          numSprites,
          spriteWidth,
          spriteHeight,
          gap,
          cols,
          rows,
        };

        this.spritesheets.set(name, spritesheet);
        this.loadingPromises.delete(name);
        resolve();
      };

      img.onerror = () => {
        this.loadingPromises.delete(name);
        reject(new Error(`Failed to load sprite: ${url}`));
      };

      // Set crossOrigin to allow loading from different domains
      img.crossOrigin = "anonymous";
      img.src = url;
    });

    this.loadingPromises.set(name, loadPromise);
    return loadPromise;
  }

  /**
   * Get spritesheet information
   * @param name - Name of the spritesheet
   * @returns Spritesheet data or undefined if not loaded
   */
  static sheet(name: string): Spritesheet | undefined {
    return this.spritesheets.get(name);
  }

  /**
   * Draw a sprite from a spritesheet
   * @param ctx - Klint context
   * @param sheetName - Name of the spritesheet
   * @param sprite - Sprite index to draw
   * @param x - X position to draw at
   * @param y - Y position to draw at
   * @param options - Drawing options
   */
  static draw(
    ctx: KlintContext,
    sheetName: string,
    sprite: number,
    x: number,
    y: number,
    options?: {
      width?: number;
      height?: number;
      rotation?: number;
      scale?: number;
      flipX?: boolean;
      flipY?: boolean;
      alpha?: number;
    },
  ): void {
    const sheet = this.spritesheets.get(sheetName);
    if (!sheet) {
      console.warn(`Spritesheet '${sheetName}' not loaded`);
      return;
    }

    // Calculate sprite position in sheet
    const spriteIndex = Math.floor(sprite) % sheet.numSprites;
    const col = spriteIndex % sheet.cols;
    const row = Math.floor(spriteIndex / sheet.cols);

    const sx = col * (sheet.spriteWidth + sheet.gap);
    const sy = row * (sheet.spriteHeight + sheet.gap);

    // Drawing dimensions
    const drawWidth = options?.width || sheet.spriteWidth;
    const drawHeight = options?.height || sheet.spriteHeight;
    const scale = options?.scale || 1;
    const rotation = options?.rotation || 0;
    const flipX = options?.flipX || false;
    const flipY = options?.flipY || false;
    const alpha = options?.alpha !== undefined ? options.alpha : 1;

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(x, y);

    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    if (flipX || flipY) {
      ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    }

    if (scale !== 1) {
      ctx.scale(scale, scale);
    }

    if (alpha !== 1) {
      ctx.globalAlpha = alpha;
    }

    // Draw sprite
    ctx.drawImage(
      sheet.image,
      sx,
      sy,
      sheet.spriteWidth,
      sheet.spriteHeight,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
    );

    // Restore context state
    ctx.restore();
  }

  /**
   * Draw a sprite at its actual position without centering
   * @param ctx - Klint context
   * @param sheetName - Name of the spritesheet
   * @param sprite - Sprite index to draw
   * @param x - X position to draw at
   * @param y - Y position to draw at
   * @param width - Width to draw (optional)
   * @param height - Height to draw (optional)
   */
  static drawCorner(
    ctx: KlintContext,
    sheetName: string,
    sprite: number,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ): void {
    const sheet = this.spritesheets.get(sheetName);
    if (!sheet) {
      console.warn(`Spritesheet '${sheetName}' not loaded`);
      return;
    }

    // Calculate sprite position in sheet
    const spriteIndex = Math.floor(sprite) % sheet.numSprites;
    const col = spriteIndex % sheet.cols;
    const row = Math.floor(spriteIndex / sheet.cols);

    const sx = col * (sheet.spriteWidth + sheet.gap);
    const sy = row * (sheet.spriteHeight + sheet.gap);

    // Drawing dimensions
    const drawWidth = width || sheet.spriteWidth;
    const drawHeight = height || sheet.spriteHeight;

    // Draw sprite
    ctx.drawImage(
      sheet.image,
      sx,
      sy,
      sheet.spriteWidth,
      sheet.spriteHeight,
      x,
      y,
      drawWidth,
      drawHeight,
    );
  }

  /**
   * Create an animation from a range of sprites
   * @param sheetName - Name of the spritesheet
   * @param startSprite - Starting sprite index
   * @param endSprite - Ending sprite index
   * @param frameDuration - Duration of each frame in milliseconds
   * @returns Animation object
   */
  static animation(
    sheetName: string,
    startSprite: number,
    endSprite: number,
    frameDuration: number = 100,
  ): SpriteAnimation {
    return new SpriteAnimation(
      sheetName,
      startSprite,
      endSprite,
      frameDuration,
    );
  }

  /**
   * Check if a spritesheet is loaded
   * @param name - Name of the spritesheet
   * @returns True if loaded, false otherwise
   */
  static hasSheet(name: string): boolean {
    return this.spritesheets.has(name);
  }

  /**
   * Unload a spritesheet
   * @param name - Name of the spritesheet to unload
   */
  static unload(name: string): void {
    this.spritesheets.delete(name);
    this.loadingPromises.delete(name);
  }

  /**
   * Unload all spritesheets
   */
  static clear(): void {
    this.spritesheets.clear();
    this.loadingPromises.clear();
  }

  /**
   * Get the number of loaded spritesheets
   * @returns Number of loaded spritesheets
   */
  static count(): number {
    return this.spritesheets.size;
  }

  /**
   * Get all loaded spritesheet names
   * @returns Array of spritesheet names
   */
  static getSheetNames(): string[] {
    return Array.from(this.spritesheets.keys());
  }
}

/**
 * Sprite animation helper class
 */
export class SpriteAnimation {
  private sheetName: string;
  private startSprite: number;
  private endSprite: number;
  private frameDuration: number;
  private currentFrame: number = 0;
  private lastFrameTime: number = 0;
  private playing: boolean = true;
  private loop: boolean = true;

  constructor(
    sheetName: string,
    startSprite: number,
    endSprite: number,
    frameDuration: number,
  ) {
    this.sheetName = sheetName;
    this.startSprite = startSprite;
    this.endSprite = endSprite;
    this.frameDuration = frameDuration;
    this.currentFrame = startSprite;
  }

  /**
   * Update animation frame
   * @param deltaTime - Time since last update in milliseconds
   */
  update(deltaTime: number): void {
    if (!this.playing) return;

    this.lastFrameTime += deltaTime;

    if (this.lastFrameTime >= this.frameDuration) {
      this.lastFrameTime = 0;
      this.currentFrame++;

      if (this.currentFrame > this.endSprite) {
        if (this.loop) {
          this.currentFrame = this.startSprite;
        } else {
          this.currentFrame = this.endSprite;
          this.playing = false;
        }
      }
    }
  }

  /**
   * Draw the current animation frame
   * @param ctx - Klint context
   * @param x - X position
   * @param y - Y position
   * @param options - Drawing options
   */
  draw(
    ctx: KlintContext,
    x: number,
    y: number,
    options?: Parameters<typeof Sprites.draw>[5],
  ): void {
    Sprites.draw(ctx, this.sheetName, this.currentFrame, x, y, options);
  }

  /**
   * Play the animation
   */
  play(): void {
    this.playing = true;
  }

  /**
   * Pause the animation
   */
  pause(): void {
    this.playing = false;
  }

  /**
   * Stop the animation and reset to start
   */
  stop(): void {
    this.playing = false;
    this.currentFrame = this.startSprite;
    this.lastFrameTime = 0;
  }

  /**
   * Set whether the animation should loop
   * @param loop - True to loop, false to play once
   */
  setLoop(loop: boolean): void {
    this.loop = loop;
  }

  /**
   * Get the current frame
   * @returns Current frame index
   */
  getCurrentFrame(): number {
    return this.currentFrame;
  }

  /**
   * Set the current frame
   * @param frame - Frame index to set
   */
  setFrame(frame: number): void {
    this.currentFrame = Math.max(
      this.startSprite,
      Math.min(this.endSprite, frame),
    );
  }

  /**
   * Check if animation is playing
   * @returns True if playing, false otherwise
   */
  isPlaying(): boolean {
    return this.playing;
  }
}
