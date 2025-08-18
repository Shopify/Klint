import { KlintContext } from '@shopify/klint';

// Define particle interface
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  opacity: number;
}

// Configuration for the particle system
interface ParticleSystemConfig {
  maxParticles?: number;
  emitRate?: number;
  lifespan?: number;
  speed?: { min: number; max: number };
  size?: { min: number; max: number };
  colors?: string[];
  gravity?: number;
  wind?: number;
  spread?: number;
  fadeOut?: boolean;
}

/**
 * Emitter interface for continuous particle emission
 */
interface Emitter {
  id: string;
  x: number;
  y: number;
  config: ParticleSystemConfig;
  timeSinceLastEmit: number;
  enabled: boolean;
}

/**
 * Static ParticleSystem Plugin
 * 
 * Provides a complete particle system with emitters, physics, and visual effects
 * without requiring Klint context initialization.
 * Context is only passed when drawing operations are needed.
 * 
 * @example
 * ```tsx
 * import { ParticleSystem } from '@shopify/klint-plugins';
 * 
 * // Create an emitter
 * const emitterId = ParticleSystem.createEmitter(
 *   canvas.width / 2,
 *   canvas.height / 2,
 *   {
 *     emitRate: 5,
 *     lifespan: 2000,
 *     colors: ['#ff0066', '#00ff66', '#0066ff']
 *   }
 * );
 * 
 * // In draw loop
 * ParticleSystem.update(deltaTime);
 * ParticleSystem.draw(K);
 * ```
 */
export class ParticleSystem {
  private static particles: Particle[] = [];
  private static emitters: Map<string, Emitter> = new Map();
  private static globalConfig: ParticleSystemConfig = {
    maxParticles: 1000,
    lifespan: 2000,
    speed: { min: 1, max: 5 },
    size: { min: 2, max: 8 },
    colors: ['#ffffff'],
    gravity: 0.1,
    wind: 0,
    spread: Math.PI / 4,
    fadeOut: true
  };
  
  /**
   * Configure global particle system settings
   */
  static configure(config: ParticleSystemConfig): void {
    this.globalConfig = { ...this.globalConfig, ...config };
  }
  
  /**
   * Create a new particle emitter
   */
  static createEmitter(
    x: number,
    y: number,
    config?: ParticleSystemConfig,
    id?: string
  ): string {
    const emitterId = id || `emitter_${Date.now()}_${Math.random()}`;
    const emitter: Emitter = {
      id: emitterId,
      x,
      y,
      config: { ...this.globalConfig, ...config },
      timeSinceLastEmit: 0,
      enabled: true
    };
    this.emitters.set(emitterId, emitter);
    return emitterId;
  }
  
  /**
   * Update emitter position
   */
  static setEmitterPosition(id: string, x: number, y: number): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.x = x;
      emitter.y = y;
    }
  }
  
  /**
   * Enable/disable an emitter
   */
  static setEmitterEnabled(id: string, enabled: boolean): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.enabled = enabled;
    }
  }
  
  /**
   * Toggle an emitter
   */
  static toggleEmitter(id: string): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.enabled = !emitter.enabled;
    }
  }
  
  /**
   * Remove an emitter
   */
  static removeEmitter(id: string): boolean {
    return this.emitters.delete(id);
  }
  
  /**
   * Emit particles manually at a specific position
   */
  static emit(x: number, y: number, count: number = 1, config?: ParticleSystemConfig): void {
    const cfg = { ...this.globalConfig, ...config };
    
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= (cfg.maxParticles || 1000)) {
        break;
      }
      
      const angle = Math.random() * (cfg.spread || Math.PI / 4) - (cfg.spread || Math.PI / 4) / 2;
      const speed = this.random(cfg.speed?.min || 1, cfg.speed?.max || 5);
      const size = this.random(cfg.size?.min || 2, cfg.size?.max || 8);
      const color = cfg.colors ? cfg.colors[Math.floor(Math.random() * cfg.colors.length)] : '#ffffff';
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: cfg.lifespan || 2000,
        size,
        color,
        opacity: 1
      });
    }
  }
  
  /**
   * Burst emission - emit many particles at once
   */
  static burst(x: number, y: number, count: number = 50, config?: ParticleSystemConfig): void {
    const cfg = { ...this.globalConfig, ...config };
    
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= (cfg.maxParticles || 1000)) {
        break;
      }
      
      // Emit in all directions for burst
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.1;
      const speed = this.random(cfg.speed?.min || 1, cfg.speed?.max || 5);
      const size = this.random(cfg.size?.min || 2, cfg.size?.max || 8);
      const color = cfg.colors ? cfg.colors[Math.floor(Math.random() * cfg.colors.length)] : '#ffffff';
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: cfg.lifespan || 2000,
        size,
        color,
        opacity: 1
      });
    }
  }
  
  /**
   * Update all particles and emitters
   */
  static update(deltaTime: number = 16): void {
    // Update emitters
    this.emitters.forEach(emitter => {
      if (!emitter.enabled) return;
      
      emitter.timeSinceLastEmit += deltaTime;
      const emitInterval = 1000 / (emitter.config.emitRate || 10);
      
      while (emitter.timeSinceLastEmit >= emitInterval) {
        this.emit(emitter.x, emitter.y, 1, emitter.config);
        emitter.timeSinceLastEmit -= emitInterval;
      }
    });
    
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Apply physics
      p.vy += this.globalConfig.gravity || 0;
      p.vx += this.globalConfig.wind || 0;
      
      // Update life
      p.life += deltaTime;
      
      // Fade out if enabled
      if (this.globalConfig.fadeOut) {
        p.opacity = 1 - (p.life / p.maxLife);
      }
      
      // Remove dead particles
      if (p.life >= p.maxLife || p.opacity <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  /**
   * Draw all particles
   */
  static draw(
    ctx: KlintContext,
    options?: { 
      blendMode?: GlobalCompositeOperation;
      customDraw?: (ctx: KlintContext, particle: Particle) => void;
    }
  ): void {
    const prevBlendMode = ctx.globalCompositeOperation;
    
    if (options?.blendMode) {
      ctx.globalCompositeOperation = options.blendMode;
    }
    
    this.particles.forEach(p => {
      if (options?.customDraw) {
        options.customDraw(ctx, p);
      } else {
        // Default particle rendering
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    
    ctx.globalCompositeOperation = prevBlendMode;
  }
  
  /**
   * Apply force to all particles
   */
  static applyForce(fx: number, fy: number): void {
    this.particles.forEach(p => {
      p.vx += fx;
      p.vy += fy;
    });
  }
  
  /**
   * Apply attraction/repulsion from a point
   */
  static applyAttraction(x: number, y: number, strength: number = 1, radius: number = 100): void {
    this.particles.forEach(p => {
      const dx = x - p.x;
      const dy = y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius && dist > 0) {
        const force = strength * (1 - dist / radius);
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    });
  }
  
  /**
   * Apply turbulence to particles
   */
  static applyTurbulence(strength: number = 1): void {
    this.particles.forEach(p => {
      p.vx += (Math.random() - 0.5) * strength;
      p.vy += (Math.random() - 0.5) * strength;
    });
  }
  
  /**
   * Clear all particles
   */
  static clear(): void {
    this.particles = [];
  }
  
  /**
   * Clear all emitters
   */
  static clearEmitters(): void {
    this.emitters.clear();
  }
  
  /**
   * Clear everything
   */
  static clearAll(): void {
    this.clear();
    this.clearEmitters();
  }
  
  /**
   * Get particle count
   */
  static getCount(): number {
    return this.particles.length;
  }
  
  /**
   * Get all particles (for custom manipulation)
   */
  static getParticles(): Particle[] {
    return this.particles;
  }
  
  /**
   * Get all emitters
   */
  static getEmitters(): Emitter[] {
    return Array.from(this.emitters.values());
  }
  
  /**
   * Check if emitter exists
   */
  static hasEmitter(id: string): boolean {
    return this.emitters.has(id);
  }
  
  // Utility function
  private static random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}