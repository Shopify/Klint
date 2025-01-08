export default () => {
  const colors = {
    "coral-red": "#E84D37",
    brown: "#7F4C2F",
    "mustard-yellow": "#EDBC2F",
    crimson: "#BF3034",
    "navy-blue": "#18599D",
    "sky-blue": "#45A7C6",
    "olive-green": "#8CB151",
    charcoal: "#252120",
    peach: "#ECA088",
    "dusty-rose": "#C9B1B8",
    plum: "#8F3064",
    sage: "#7B8870",
    "olive-drab": "#C0C180",
    taupe: "#4B423D",
    "midnight-blue": "#1A2A65",
    "golden-yellow": "#EAA550",
    "pumpkin-orange": "#F17B04",
    "slate-gray": "#404757",
  };

  const hsla = (h: number, s: number, l: number, a = 1): string => {
    const hue = h % 360;
    const sat = Math.max(0, Math.min(100, s));
    const light = Math.max(0, Math.min(100, l));
    const alpha = Math.max(0, Math.min(1, a));

    const c = ((1 - Math.abs((2 * light) / 100 - 1)) * sat) / 100;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = light / 100 - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (hue >= 0 && hue < 60) {
      [r, g, b] = [c, x, 0];
    } else if (hue >= 60 && hue < 120) {
      [r, g, b] = [x, c, 0];
    } else if (hue >= 120 && hue < 180) {
      [r, g, b] = [0, c, x];
    } else if (hue >= 180 && hue < 240) {
      [r, g, b] = [0, x, c];
    } else if (hue >= 240 && hue < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }

    const toHex = (n: number) => {
      const hex = Math.round((n + m) * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };

    if (alpha === 1) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    const alphaHex = Math.round(alpha * 255).toString(16);
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${
      alphaHex.length === 1 ? "0" + alphaHex : alphaHex
    }`;
  };

  const hsl = (h: number, s: number, l: number): string => hsla(h, s, l);

  return {
    colors,
    hsl,
    hsla,
    // Add other factory methods here as needed
  };
};
