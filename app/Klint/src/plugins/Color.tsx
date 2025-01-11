import { KlintCoreContext, KlintContext } from "../component/KlintTypes";

// const colors = {
//   coral: "#E84D37",
//   brown: "#7F4C2F",
//   mustard: "#EDBC2F",
//   crimson: "#BF3034",
//   navy: "#18599D",
//   sky: "#45A7C6",
//   olive: "#8CB151",
//   charcoal: "#252120",
//   peach: "#ECA088",
//   rose: "#C9B1B8",
//   plum: "#8F3064",
//   sage: "#7B8870",
//   drab: "#C0C180",
//   taupe: "#4B423D",
//   midnight: "#1A2A65",
//   golden: "#EAA550",
//   orange: "#F17B04",
//   slate: "#404757",
// };

interface KlintColor {
  context: KlintContext | KlintCoreContext;
}

class Color implements KlintColor {
  context: KlintContext | KlintCoreContext;

  constructor(ctx: KlintContext | KlintCoreContext) {
    this.context = ctx;
  }

  get coral() {
    return "#E84D37";
  }
  get brown() {
    return "#7F4C2F";
  }
  get mustard() {
    return "#EDBC2F";
  }
  get crimson() {
    return "#BF3034";
  }
  get navy() {
    return "#18599D";
  }
  get sky() {
    return "#45A7C6";
  }
  get olive() {
    return "#8CB151";
  }
  get charcoal() {
    return "#252120";
  }
  get peach() {
    return "#ECA088";
  }
  get rose() {
    return "#C9B1B8";
  }
  get plum() {
    return "#8F3064";
  }
  get sage() {
    return "#7B8870";
  }
  get drab() {
    return "#C0C180";
  }
  get taupe() {
    return "#4B423D";
  }
  get midnight() {
    return "#1A2A65";
  }
  get golden() {
    return "#EAA550";
  }
  get orange() {
    return "#F17B04";
  }
  get slate() {
    return "#404757";
  }

  private toHex(n: number): string {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  rgb(r: number, g: number, b: number) {
    return this.rgba(r, g, b, 1);
  }

  rgba(r: number, g: number, b: number, alpha: number) {
    return `#${this.toHex(r)}${this.toHex(g)}${this.toHex(b)}${this.toHex(
      alpha * 255
    )}`;
  }

  gray(value: number, alpha?: number) {
    return this.rgba(value, value, value, alpha ?? 1);
  }

  hsl(h: number, s: number, l: number, alpha?: number) {
    // Convert HSL to RGB
    h = h % 360;
    s = s / 100;
    l = l / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;
    if (h < 60) {
      [r, g, b] = [c, x, 0];
    } else if (h < 120) {
      [r, g, b] = [x, c, 0];
    } else if (h < 180) {
      [r, g, b] = [0, c, x];
    } else if (h < 240) {
      [r, g, b] = [0, x, c];
    } else if (h < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }

    return this.rgba(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
      alpha ?? 1
    );
  }

  lab(l: number, a: number, b: number, alpha?: number) {
    // LAB to XYZ
    const y = (l + 16) / 116;
    const x = a / 500 + y;
    const z = y - b / 200;

    const xyz2rgb = (t: number) => {
      return t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116;
    };

    const [xr, yr, zr] = [x, y, z].map(xyz2rgb);

    // XYZ to RGB
    const r = xr * 3.2406 + yr * -1.5372 + zr * -0.4986;
    const g = xr * -0.9689 + yr * 1.8758 + zr * 0.0415;
    const _b = xr * 0.0557 + yr * -0.204 + zr * 1.057;

    return this.rgba(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(_b * 255),
      alpha ?? 1
    );
  }

  oklab(l: number, a: number, b: number, alpha?: number) {
    // OKLAB to linear RGB
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l2 = l_ * l_ * l_;
    const m2 = m_ * m_ * m_;
    const s2 = s_ * s_ * s_;

    // Linear RGB to sRGB
    const r = 4.0767416621 * l2 - 3.3077115913 * m2 + 0.2309699292 * s2;
    const g = -1.2684380046 * l2 + 2.6097574011 * m2 - 0.3413193965 * s2;
    const _b = -0.0041960863 * l2 - 0.7034186147 * m2 + 1.707614701 * s2;

    return this.rgba(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(_b * 255),
      alpha ?? 1
    );
  }
}

export default Color;
