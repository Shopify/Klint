interface KlintEasing {
  normalize: (val: number) => number;
  expand: (val: number) => number;
  inout: (val: number, power?: number) => number;
  in: (val: number, power?: number) => number;
  out: (val: number, power?: number) => number;
  overshootIn: (val: number) => number;
  overshootOut: (val: number) => number;
  overshootInOut: (val: number) => number;
  bounceIn: (val: number) => number;
  bounceOut: (val: number) => number;
  bounceInOut: (val: number) => number;
  elasticIn: (val: number) => number;
  elasticOut: (val: number) => number;
  elasticInOut: (val: number) => number;
  smoothstep: (val: number, x0?: number, x1?: number) => number;
  spring: (val: number, tension?: number, friction?: number) => number;
  steps: (val: number, n?: number) => number;
  damp: (
    current: number,
    target: number,
    smoothing: number,
    deltaTime: number,
  ) => number;
  impulse: (val: number, k?: number) => number;
  parabola: (val: number, k?: number) => number;
}

class Easing implements KlintEasing {
  private zeroOut = (val: number) =>
    Object.is(val, -0) || Math.abs(val) < 1e-12 ? 0 : val;

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
    return this.zeroOut(val * val * (val * (k + 1) - k));
  };

  overshootOut = (val: number) => {
    const m = val - 1;
    const k = 1.70158;
    return this.zeroOut(1 + m * m * (m * (k + 1) + k));
  };

  overshootInOut = (val: number) => {
    const m = val - 1;
    const t = val * 2;
    const k = 1.70158 * 1.525;
    if (val < 0.5) return this.zeroOut(val * t * (t * (k + 1) - k));
    return this.zeroOut(1 + 2 * m * m * (2 * m * (k + 1) + k));
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

  /**
   * Damped spring easing. Physically expressive oscillation.
   * @param val - Progress value (0 to 1)
   * @param tension - Spring tension (0 to 1, default 0.5). Higher = faster oscillation.
   * @param friction - Spring friction (0 to 1, default 0.5). Higher = less damping (more bouncy).
   */
  spring = (val: number, tension: number = 0.5, friction: number = 0.5) => {
    const omega = tension * 40;
    const zeta = 1 - friction;

    if (zeta < 1) {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      return (
        1 -
        Math.exp(-zeta * omega * val) *
          (Math.cos(omegaD * val) +
            ((zeta * omega) / omegaD) * Math.sin(omegaD * val))
      );
    }
    return 1 - (1 + omega * val) * Math.exp(-omega * val);
  };

  /**
   * Staircase easing. Quantizes to N discrete steps.
   * @param val - Progress value (0 to 1)
   * @param n - Number of steps (default 4)
   */
  steps = (val: number, n: number = 4) => {
    if (n <= 0) return val;
    return Math.floor(val * n) / n;
  };

  /**
   * Frame-rate independent exponential smoothing.
   * Use instead of naive `lerp(a, b, 0.1)` which breaks at different FPS.
   * @param current - Current value
   * @param target - Target value
   * @param smoothing - Smoothing factor (higher = faster convergence)
   * @param deltaTime - Time since last frame in seconds
   */
  damp = (
    current: number,
    target: number,
    smoothing: number,
    deltaTime: number,
  ) => {
    return (
      current + (target - current) * (1 - Math.exp(-smoothing * deltaTime))
    );
  };

  /**
   * Quick rise then decay. Great for hit effects, flashes.
   * @param val - Progress value (0 to 1)
   * @param k - Sharpness (default 6). Higher = sharper peak.
   */
  impulse = (val: number, k: number = 6) => {
    const h = k * val;
    return h * Math.exp(1 - h);
  };

  /**
   * Symmetric arc. Useful for jumps, throw curves.
   * @param val - Progress value (0 to 1)
   * @param k - Steepness (default 1)
   */
  parabola = (val: number, k: number = 1) => {
    return Math.pow(4 * val * (1 - val), k);
  };

  log = () => {
    console.log(this);
  };
}

export default Easing;
