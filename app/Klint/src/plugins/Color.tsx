import { KlintContexts } from "../component/KlintTypes";

declare module "../component/KlintTypes" {
  interface KlintPlugins {
    Color: Color;
  }
}

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

  hex(color: string) {
    return color.startsWith("#") ? color : `#${color}`;
  }

  rgb(r: number, g: number, b: number) {
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  rgba(r: number, g: number, b: number, alpha: number) {
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
      b
    )}, ${alpha})`;
  }

  gray(value: number, alpha?: number) {
    return alpha !== undefined
      ? `rgba(${Math.round(value)}, ${Math.round(value)}, ${Math.round(
          value
        )}, ${alpha})`
      : `rgb(${Math.round(value)}, ${Math.round(value)}, ${Math.round(value)})`;
  }

  hsl(h: number, s: number, l: number) {
    return `hsl(${h % 360}, ${Math.max(0, s)}%, ${Math.max(0, l)}%)`;
  }

  hsla(h: number, s: number, l: number, alpha: number) {
    return `hsla(${h % 360}, ${Math.max(0, s)}%, ${Math.max(0, l)}%, ${alpha})`;
  }

  lch(l: number, c: number, h: number) {
    return `lch(${l}% ${c} ${h})`;
  }

  lcha(l: number, c: number, h: number, alpha: number) {
    return `lch(${l}% ${c} ${h} / ${alpha})`;
  }

  lab(l: number, a: number, b: number) {
    return `lab(${l}% ${a} ${b})`;
  }

  laba(l: number, a: number, b: number, alpha: number) {
    return `lab(${l}% ${a} ${b} / ${alpha})`;
  }

  oklch(l: number, c: number, h: number) {
    return `oklch(${l} ${c} ${h})`;
  }

  oklcha(l: number, c: number, h: number, alpha: number) {
    return `oklch(${l} ${c} ${h} / ${alpha})`;
  }

  oklab(l: number, a: number, b: number) {
    return `oklab(${l} ${a} ${b})`;
  }

  oklaba(l: number, a: number, b: number, alpha: number) {
    return `oklab(${l} ${a} ${b} / ${alpha})`;
  }

  blendColors(
    colorMode: string,
    colorA: string,
    colorB: string,
    factor: number
  ): string {
    const t = Math.max(0, Math.min(1, factor)) * 100;
    return `color-mix(in ${colorMode}, ${colorA}, ${colorB} ${t}%)`;
  }

  createPalette(baseColor: string, steps: number = 9): string[] {
    const palette: string[] = [];
    // Generate lighter shades
    for (let i = 1; i < steps; i++) {
      const factor = i / steps;
      palette.unshift(
        this.blendColors("in oklch", baseColor, "#ffffff", factor)
      );
    }
    // Add base color
    palette.push(baseColor);
    // Generate darker shades
    for (let i = 1; i < steps; i++) {
      const factor = i / steps;
      palette.push(this.blendColors("in oklch", baseColor, "#000000", factor));
    }
    return palette;
  }

  // Create a complementary color
  complementary(color: string): string {
    return `color-mix(in hsl, ${color}, hsl(180deg 100% 50% / 100%))`;
  }

  // Create analogous colors
  analogous(color: string, angle: number = 30): [string, string] {
    return [
      `color-mix(in hsl, ${color}, hsl(${-angle}deg 100% 50% / 100%))`,
      `color-mix(in hsl, ${color}, hsl(${angle}deg 100% 50% / 100%))`,
    ];
  }

  // Create a triadic color scheme
  triadic(color: string): [string, string] {
    return [
      `color-mix(in hsl, ${color}, hsl(120deg 100% 50% / 100%))`,
      `color-mix(in hsl, ${color}, hsl(240deg 100% 50% / 100%))`,
    ];
  }

  // Adjust color saturation
  saturate(color: string, amount: number): string {
    return `color-mix(in hsl, ${color}, hsl(0deg 100% 50% / 0%) ${amount}%)`;
  }

  // Adjust color lightness
  lighten(color: string, amount: number): string {
    return `color-mix(in hsl, ${color}, white ${amount}%)`;
  }

  darken(color: string, amount: number): string {
    return `color-mix(in hsl, ${color}, black ${amount}%)`;
  }
}

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

export default Color;
