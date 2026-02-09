import { KlintContexts } from "../Klint";

/**
 * Pixels Element for Klint
 *
 * Provides pixel-level read/write access to the canvas.
 *
 * @example
 * ```tsx
 * const draw = (K) => {
 *   // Read all pixels
 *   const imageData = K.Pixels.load();
 *
 *   // Read a single pixel
 *   const [r, g, b, a] = K.Pixels.read(100, 100);
 *
 *   // Modify and write back
 *   K.Pixels.update(imageData.data);
 * };
 * ```
 */
export default class Pixels {
  private ctx: KlintContexts;

  constructor(ctx: KlintContexts) {
    this.ctx = ctx;
  }

  /**
   * Read all pixels from the canvas as ImageData.
   */
  load(): ImageData {
    return this.ctx.getImageData(0, 0, this.ctx.width, this.ctx.height);
  }

  /**
   * Write pixel data back to the canvas.
   * Accepts a Uint8ClampedArray or a plain number array of RGBA values.
   */
  update(pixels: Uint8ClampedArray | number[]): void {
    const pixelArray =
      pixels instanceof Uint8ClampedArray
        ? pixels
        : new Uint8ClampedArray(pixels);
    const imageData = new ImageData(
      pixelArray,
      this.ctx.width,
      this.ctx.height,
    );
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Read pixel values at a position.
   * Returns an array of [r, g, b, a] values (0-255).
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param w - Width of region (default: 1)
   * @param h - Height of region (default: 1)
   */
  read(x: number, y: number, w = 1, h = 1): number[] {
    const imageData = this.ctx.getImageData(x, y, w, h);
    return Array.from(imageData.data);
  }
}
