import { KlintContexts } from "../component/KlintTypes";

// declare module '../hooks/useKlint' {
//   interface KlintPlugins {
//     C: Color;
//   }
// }
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
  context: KlintContexts;
}

class Color implements KlintColor {
  context: KlintContexts;

  public colors = [
    "#E84D37", // coral
    "#7F4C2F", // brown
    "#EDBC2F", // mustard
    "#BF3034", // crimson
    "#18599D", // navy
    "#45A7C6", // sky
    "#8CB151", // olive
    "#252120", // charcoal
    "#ECA088", // peach
    "#C9B1B8", // rose
    "#8F3064", // plum
    "#7B8870", // sage
    "#C0C180", // drab
    "#4B423D", // taupe
    "#1A2A65", // midnight
    "#EAA550", // golden
    "#F17B04", // orange
    "#404757", // slate
  ] as const;

  constructor(ctx: KlintContexts) {
    this.context = ctx;
  }

  get coral() {
    return this.colors[0];
  }
  get brown() {
    return this.colors[1];
  }
  get mustard() {
    return this.colors[2];
  }
  get crimson() {
    return this.colors[3];
  }
  get navy() {
    return this.colors[4];
  }
  get sky() {
    return this.colors[5];
  }
  get olive() {
    return this.colors[6];
  }
  get charcoal() {
    return this.colors[7];
  }
  get peach() {
    return this.colors[8];
  }
  get rose() {
    return this.colors[9];
  }
  get plum() {
    return this.colors[10];
  }
  get sage() {
    return this.colors[11];
  }
  get drab() {
    return this.colors[12];
  }
  get taupe() {
    return this.colors[13];
  }
  get midnight() {
    return this.colors[14];
  }
  get golden() {
    return this.colors[15];
  }
  get orange() {
    return this.colors[16];
  }
  get slate() {
    return this.colors[17];
  }

  private toHex(n: number): string {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }

  private parseHex(hex: string): [number, number, number, number] {
    // Remove # if present
    hex = hex.replace("#", "");

    // Handle shorthand hex (#RGB or #RGBA)
    if (hex.length <= 4) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }

    // Pad with FF for alpha if needed
    if (hex.length === 6) hex += "FF";

    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
      parseInt(hex.slice(6, 8), 16),
    ];
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
    h = h >= 0 ? h % 360 : 360 - (-h % 360);
    s = Math.max(0, s / 100);
    l = Math.max(0, l / 100);

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

  blendColors(
    A: string,
    B: string,
    factor: number
    //colorspace: "rgb" | "lab" | "hsl" | "oklch" = "rgb"
  ): string {
    const cA = this.parseHex(A);
    const cB = this.parseHex(B);
    // console.log("colorA", cA);
    // console.log("colorB", cB);
    // Clamp factor between 0 and 1
    const t = Math.max(0, Math.min(1, factor));

    return this.rgba(
      cA[0] * (1 - t) + cB[0] * t,
      cA[1] * (1 - t) + cB[1] * t,
      cA[2] * (1 - t) + cB[2] * t,
      (cA[3] / 255) * (1 - t) + (cB[3] / 255) * t
    );
    /*
    switch (colorspace) {
      case "rgb":
        // Linear interpolation in RGB space
        return this.rgba(
          cA[0] * (1 - t) + cB[0] * t,
          cA[1] * (1 - t) + cB[1] * t,
          cA[2] * (1 - t) + cB[2] * t,
          cA[3] * (1 - t) + cB[3] * t
        );

      case "hsl":
      case "lab":
      case "oklch":
        // Fallback to RGB blending for now
        return this.blendColors(A, B, factor, "rgb");
    }
    */
  }
}

export default Color;
