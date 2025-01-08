import { KlintCoreContext, KlintMouse } from "../KlintTypes";

type HotspotShape = "circle" | "rectangle";

interface HotspotConfig {
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  shape: HotspotShape;
  onMouseEnter?: () => void;
  onMouseHover?: () => void;
  onMouseExit?: () => void;
}

class Hotspot {
  private context: KlintCoreContext;
  private isHovered: boolean = false;
  private wasHovered: boolean = false;
  private config: HotspotConfig;

  constructor(ctx: KlintCoreContext, config: HotspotConfig) {
    this.context = ctx;
    this.config = config;
  }

  isPointInside = (mouse: KlintMouse): boolean => {
    const { x, y, width, height, radius, shape } = this.config;

    this.wasHovered = this.isHovered;
    this.isHovered =
      shape === "circle"
        ? isInCircle(x, y, mouse.x, mouse.y, radius!)
        : isInRect(
            x,
            y,
            width ?? this.context.width,
            height ?? this.context.height,
            mouse.x,
            mouse.y
          );

    // Handle callbacks
    if (this.isHovered && !this.wasHovered && this.config.onMouseEnter) {
      this.config.onMouseEnter();
    }
    if (this.isHovered && this.config.onMouseHover) {
      this.config.onMouseHover();
    }
    if (!this.isHovered && this.wasHovered && this.config.onMouseExit) {
      this.config.onMouseExit();
    }

    return this.isHovered;
  };
  update = (x: number, y?: number) => {
    this.config.x = x;
    if (y) this.config.y = y;
  };
  resize = (width: number, height?: number) => {
    this.config.width = width;
    if (height) this.config.height = height;
  };
  show = () => {
    const {
      context: ctx,
      config: { x, y, width, height, radius, shape },
    } = this;
    ctx.save();
    ctx.fillStyle = this.isHovered
      ? "rgba(255, 0, 0, 0.5)"
      : "rgba(0, 0, 255, 0.5)";

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(x, y, radius!, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, width!, height!);
    }

    ctx.restore();
  };
}

// Circle distance check (Pythagorean)
const isInCircle = (
  x: number,
  y: number,
  mouseX: number,
  mouseY: number,
  radius: number
) => {
  const dx = mouseX - x;
  const dy = mouseY - y;
  return dx * dx + dy * dy <= radius * radius; // Avoiding Math.sqrt for performance
};

// Rectangle bounds check
const isInRect = (
  x: number,
  y: number,
  width: number,
  height: number,
  mouseX: number,
  mouseY: number
) => {
  return (
    mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height
  );
};

export default Hotspot;
