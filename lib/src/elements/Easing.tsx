import { KlintContexts } from "../Klint";

interface KlintEasing {
  context: KlintContexts;
  normalize: (val: number) => number;
  expand: (val: number) => number;
  inout: (val: number, power?: number) => number;
  in: (val: number, power?: number) => number;
  out: (val: number, power?: number) => number;
  overshootIn: (val: number) => number;
  overshootOut: (val: number) => number;
  overshootInOut: (val: number) => number;
}

class Easing implements KlintEasing {
  context: KlintContexts;
  constructor(ctx: KlintContexts) {
    this.context = ctx;
  }

  normalize = (val: number) => {
    return val * 0.5 + 0.5;
  };

  expand = (val: number) => {
    return val * 2 - 1;
  };

  inout = (val: number, power: number = 2) => {
    const m = val - 1;
    const t = val * 2;

    if (t < 1) {
      return val * Math.pow(t, power - 1);
    }
    return power % 2 === 0
      ? 1 - Math.pow(m, power) * Math.pow(2, power - 1)
      : 1 + Math.pow(m, power) * Math.pow(2, power - 1);
  };

  in = (val: number, power: number = 2) => {
    return Math.pow(val, power);
  };

  out = (val: number, power: number = 2) => {
    const m = val - 1;
    return power % 2 === 0 ? 1 - Math.pow(m, power) : 1 + Math.pow(m, power);
  };

  overshootIn = (val: number) => {
    const k = 1.70158;
    return val * val * (val * (k + 1) - k);
  };

  overshootOut = (val: number) => {
    const m = val - 1;
    const k = 1.70158;
    return 1 + m * m * (m * (k + 1) + k);
  };

  overshootInOut = (val: number) => {
    const m = val - 1;
    const t = val * 2;
    const k = 1.70158 * 1.525;
    if (val < 0.5) return val * t * (t * (k + 1) - k);
    return 1 + 2 * m * m * (2 * m * (k + 1) + k);
  };

  bounceOut = (val: number) => {
    const r = 1 / 2.75;
    const k1 = r;
    const k2 = 2 * r;
    const k3 = 1.5 * r;
    const k4 = 2.5 * r;
    const k5 = 2.25 * r;
    const k6 = 2.625 * r;
    const k0 = 7.5625;
    let t;

    if (val < k1) {
      return k0 * val * val;
    } else if (val < k2) {
      t = val - k3;
      return k0 * t * t + 0.75;
    } else if (val < k4) {
      t = val - k5;
      return k0 * t * t + 0.9375;
    }
    t = val - k6;
    return k0 * t * t + 0.984375;
  };

  bounceIn = (val: number) => {
    return 1 - this.bounceOut(1 - val);
  };

  bounceInOut = (val: number) => {
    const t = val * 2;
    if (t < 1) return 0.5 - 0.5 * this.bounceOut(1 - t);
    return 0.5 + 0.5 * this.bounceOut(t - 1);
  };

  elasticIn = (val: number) => {
    const m = val - 1;
    return -Math.pow(2, 10 * m) * Math.sin(((m * 40 - 3) * Math.PI) / 6);
  };

  elasticOut = (val: number) => {
    return (
      1 + Math.pow(2, 10 * -val) * Math.sin(((-val * 40 - 3) * Math.PI) / 6)
    );
  };

  elasticInOut = (val: number) => {
    const s = 2 * val - 1;
    const k = ((80 * s - 9) * Math.PI) / 18;
    if (s < 0) return -0.5 * Math.pow(2, 10 * s) * Math.sin(k);
    return 1 + 0.5 * Math.pow(2, -10 * s) * Math.sin(k);
  };

  smoothstep = (val: number, x0: number = 0, x1: number = 1) => {
    let p = (val - x0) / (x1 - x0);
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    return p * p * (3 - 2 * p);
  };

  log = () => {
    console.log(this);
  };
}

export default Easing;
