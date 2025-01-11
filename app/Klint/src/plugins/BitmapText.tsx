import { KlintContext } from "../component/KlintTypes";

interface KlintBitmapText {
  context: KlintContext;
  chars: Map<string, { x: number; y: number; width: number; height: number }>;
  texture: HTMLImageElement;
  currentSize: "small" | "medium" | "large";
  spaceWidth: number;
}

class BitmapText implements KlintBitmapText {
  context: KlintContext;
  chars = new Map();
  texture!: HTMLImageElement;
  currentSize: "small" | "medium" | "large" = "large";
  spaceWidth = 0;

  private readonly sizes = {
    small: 16,
    medium: 48,
    large: 128,
  };

  private __currentFont = "";
  private __currentFill = "";
  private __currentStroke = "";

  constructor(ctx: KlintContext) {
    this.context = ctx;
    this.initialize();
  }

  private initialize = async () => {
    try {
      const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?-_/\\:;(){}[]";
      await this.createFontTexture(chars, this.currentSize);
    } catch (error) {
      console.error("Failed to initialize bitmap font:", error);
    }
  };

  private createFontTexture = async (
    chars: string,
    size: keyof typeof this.sizes
  ) => {
    const fontSize = this.sizes[size];
    const ctx = this.context;
    const dpr = ctx.__dpr || 1;

    const config = ctx.saveConfig();
    ctx.textFont("Inter");
    ctx.textSize(fontSize);
    ctx.alignText("left");
    ctx.computeFont();
    // ctx.fillColor(ctx.fillStyle);
    // to do : take strokeWeight into account in the padding
    // ctx.noStroke();

    const metrics = new Map();
    let totalWidth = 0;
    let maxHeight = 0;

    for (const char of chars) {
      const bounds = this.textBounds(char);
      bounds.width *= this.context.__dpr;
      bounds.height *= this.context.__dpr;
      metrics.set(char, bounds);
      totalWidth += bounds.width * 0.5 + 2;
      maxHeight = Math.max(maxHeight, bounds.height * 0.5);
    }
    // font metrics man ...
    const padding = (fontSize / 12) * dpr;
    const textureWidth = Math.ceil(totalWidth + padding * 2);
    const textureHeight = Math.ceil(maxHeight + padding * 2);

    const texture = ctx.createOffscreen(
      `bitmapFont_${size}`,
      textureWidth,
      textureHeight,
      { origin: "corner", static: "true" },
      (offscreen: KlintContext) => {
        offscreen.clear();
        // offscreen.background("#f00");
        // offscreen.strokeJoin("round");
        let x = padding;
        // const height = textureHeight * 2 - padding * 4;
        offscreen.textSize(fontSize * 2);
        offscreen.textFont(ctx.__textFont);
        offscreen.alignText("left");
        offscreen.fillColor("#FFF");
        offscreen.strokeColor("#000");

        for (const char of chars) {
          const bounds = metrics.get(char);
          const y = offscreen.height - bounds.baseline + padding * 2;
          offscreen.text(char, x - bounds.x * 2, 0);
          //   offscreen.push();
          //   offscreen.noFill();
          //   offscreen.strokeColor("#00F");
          //   offscreen.strokeWidth(8);

          //   offscreen.point(x, y - bounds.height);
          //   offscreen.strokeWidth(4);
          //   offscreen.rectangle(
          //     x,
          //     y - bounds.height,
          //     bounds.width,
          //     bounds.height
          //   );

          //   offscreen.pop();
          this.chars.set(char, {
            x,
            y,
            width: bounds.width,
            height: bounds.height,
          });

          x += bounds.width + 2;
        }
      }
    );

    this.texture = texture as HTMLImageElement;
    this.spaceWidth = this.textBounds(" ").width / dpr;
    ctx.restoreConfig(config);
  };

  textBounds = (text: string) => {
    const metrics = this.context.measureText(text);
    // console.log(text, metrics);
    return {
      x: metrics.actualBoundingBoxLeft * -1,
      y: metrics.actualBoundingBoxAscent * -1,
      width: metrics.width,
      height:
        metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
      offset: metrics.fontBoundingBoxAscent,
      baseline: metrics.hangingBaseline - metrics.actualBoundingBoxDescent * 2,
    };
  };

  text = (text: string, x: number, y: number) => {
    if (!this.texture) {
      return;
    }
    const ctx = this.context;
    let currentX = x;

    for (const char of text) {
      if (char === " ") {
        currentX += this.spaceWidth;
        continue;
      }

      const letter = this.chars.get(char);
      if (letter) {
        ctx.image(
          this.texture,
          currentX,
          y,
          letter.width,
          letter.height,
          letter.x,
          letter.y - letter.height,
          letter.width,
          letter.height
        );
        currentX += letter.width + 2;
      }
    }
  };
}

export default BitmapText;
