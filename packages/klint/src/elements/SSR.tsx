/**
 * Server-Side Rendering (SSR) utilities for Klint
 * Provides utilities for rendering Klint sketches on the server
 * or generating static images without requiring a browser environment.
 */

import { KlintContext } from "../Klint";

export interface KlintServerRenderOptions {
  width: number;
  height: number;
  dpr?: number;
  format?: "png" | "jpeg" | "webp";
  quality?: number; // 0-1 for jpeg/webp
}

interface KlintSSR {
  /**
   * Render a Klint sketch to a static image (base64 data URL)
   * Useful for Server Components, static site generation, or previews
   */
  renderToImage: (
    draw: (ctx: KlintContext) => void,
    options: KlintServerRenderOptions
  ) => Promise<string>;

  /**
   * Generate a static image URL for a Klint sketch
   * This can be used in Server Components to generate images at build time
   */
  generateImageUrl: (
    draw: (ctx: KlintContext) => void,
    options: KlintServerRenderOptions
  ) => Promise<string>;

  /**
   * Check if Klint can run in the current environment
   */
  canRender: () => boolean;
}

class SSR implements KlintSSR {
  private context: KlintContext | null;

  constructor(ctx?: KlintContext) {
    this.context = ctx || null;
  }

  /**
   * Render a Klint sketch to a static image (base64 data URL)
   */
  async renderToImage(
    draw: (ctx: KlintContext) => void,
    options: KlintServerRenderOptions
  ): Promise<string> {
    // Check if we're in a browser environment
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      // Browser: use canvas API directly
      return this.renderInBrowser(draw, options);
    }

    // Server: use node-canvas or similar
    // For now, we'll throw a helpful error suggesting alternatives
    throw new Error(
      "Server-side rendering requires 'canvas' package. Install it with: npm install canvas\n" +
      "Alternatively, use SSR.generateImageUrl() to generate images via an API endpoint."
    );
  }

  /**
   * Generate a static image URL for a Klint sketch
   */
  async generateImageUrl(
    draw: (ctx: KlintContext) => void,
    options: KlintServerRenderOptions
  ): Promise<string> {
    // This would typically call an API endpoint or use a service worker
    // For now, we'll use the browser rendering
    if (typeof window === "undefined") {
      throw new Error(
        "generateImageUrl() requires a browser environment. " +
        "For server-side rendering, use renderToImage() with the 'canvas' package."
      );
    }

    return this.renderInBrowser(draw, options);
  }

  /**
   * Check if Klint can run in the current environment
   */
  canRender(): boolean {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      return true; // Browser environment
    }

    // Check for node-canvas
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("canvas");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Render in browser environment (client-side)
   */
  private async renderInBrowser(
    draw: (ctx: KlintContext) => void,
    options: KlintServerRenderOptions
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const canvas = document.createElement("canvas");
        const dpr =
          options.dpr ||
          (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);

        canvas.width = options.width * dpr;
        canvas.height = options.height * dpr;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Create a minimal KlintContext-like object
        const klintContext = this.createMinimalContext(
          ctx,
          canvas,
          options.width,
          options.height,
          dpr
        );

        // Execute draw function
        draw(klintContext as KlintContext);

        // Convert to image
        const mimeType =
          options.format === "jpeg"
            ? "image/jpeg"
            : options.format === "webp"
              ? "image/webp"
              : "image/png";

        const quality =
          options.quality !== undefined ? options.quality : 0.85;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Create a minimal KlintContext for server rendering
   * This provides basic functionality without full Klint features
   */
  private createMinimalContext(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    dpr: number
  ): Partial<KlintContext> {
    // This is a simplified context - full implementation would require
    // importing KlintFunctions and elements
    return {
      canvas,
      width: width * dpr,
      height: height * dpr,
      // Basic canvas methods
      fillRect: ctx.fillRect.bind(ctx),
      strokeRect: ctx.strokeRect.bind(ctx),
      clearRect: ctx.clearRect.bind(ctx),
      beginPath: ctx.beginPath.bind(ctx),
      moveTo: ctx.moveTo.bind(ctx),
      lineTo: ctx.lineTo.bind(ctx),
      arc: ctx.arc.bind(ctx),
      fill: ctx.fill.bind(ctx),
      stroke: ctx.stroke.bind(ctx),
      save: ctx.save.bind(ctx),
      restore: ctx.restore.bind(ctx),
      translate: ctx.translate.bind(ctx),
      rotate: ctx.rotate.bind(ctx),
      scale: ctx.scale.bind(ctx),
      // Basic properties
      fillStyle: ctx.fillStyle,
      strokeStyle: ctx.strokeStyle,
      lineWidth: ctx.lineWidth,
      // Minimal Klint-like API
      background: (color?: string) => {
        ctx.fillStyle = color || "#000";
        ctx.fillRect(0, 0, width * dpr, height * dpr);
      },
      fillColor: (color: string) => {
        ctx.fillStyle = color;
      },
      strokeColor: (color: string) => {
        ctx.strokeStyle = color;
      },
      circle: (x: number, y: number, radius: number) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      },
      rectangle: (x: number, y: number, w: number, h?: number) => {
        ctx.fillRect(x, y, w, h || w);
      },
      // Time properties (static for server rendering)
      frame: 0,
      time: 0,
      deltaTime: 0,
      fps: 60,
    } as Partial<KlintContext>;
  }
}

export default SSR;


