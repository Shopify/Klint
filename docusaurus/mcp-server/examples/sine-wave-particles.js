// Sine Wave Particles Animation using Klint
// This example shows particles following a sine wave pattern with trails

class Particle {
  constructor(x, y, phase, speed, size, color) {
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.phase = phase;
    this.speed = speed;
    this.size = size;
    this.color = color;
    this.trail = [];
  }
}

class SineWaveParticles {
  constructor(ctx) {
    this.ctx = ctx;
    this.particles = [];
    this.waveAmplitude = 100;
    this.waveFrequency = 0.01;
    this.particleCount = 50;

    this.initParticles();
  }

  initParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = new Particle(
        (i / this.particleCount) * this.ctx.canvas.width,
        this.ctx.canvas.height / 2,
        (i / this.particleCount) * Math.PI * 2,
        0.02 + Math.random() * 0.02,
        2 + Math.random() * 4,
        this.ctx.Color.hsl(
          (i / this.particleCount) * 360,
          70 + Math.random() * 30,
          50 + Math.random() * 20
        )
      );

      this.particles.push(particle);
    }
  }

  updateParticles() {
    this.particles.forEach((particle) => {
      // Update phase for wave motion
      particle.phase += particle.speed;

      // Calculate sine wave position
      particle.y =
        particle.baseY +
        Math.sin(particle.x * this.waveFrequency + particle.phase) *
          this.waveAmplitude;

      // Move particle horizontally
      particle.x += 1;

      // Add current position to trail
      particle.trail.push({
        x: particle.x,
        y: particle.y,
        alpha: 1,
      });

      // Limit trail length
      if (particle.trail.length > 20) {
        particle.trail.shift();
      }

      // Fade trail
      particle.trail.forEach((point, index) => {
        point.alpha = index / particle.trail.length;
      });

      // Reset particle when it goes off screen
      if (particle.x > this.ctx.canvas.width + 50) {
        particle.x = -50;
        particle.trail = [];
      }
    });
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      // Draw trail
      particle.trail.forEach((point, index) => {
        if (index > 0) {
          const prevPoint = particle.trail[index - 1];
          this.ctx.strokeColor(particle.color);
          this.ctx.strokeWidth(particle.size * point.alpha);
          this.ctx.globalAlpha = point.alpha * 0.5;

          this.ctx.line(prevPoint.x, prevPoint.y, point.x, point.y);
        }
      });

      // Draw particle
      this.ctx.globalAlpha = 1;
      this.ctx.fillColor(particle.color);
      this.ctx.circle(particle.x, particle.y, particle.size);
    });
  }

  drawSineWave() {
    const time = this.ctx.time * 0.001;

    this.ctx.strokeColor(this.ctx.Color.rgba(255, 255, 255, 0.2));
    this.ctx.strokeWidth(1);
    this.ctx.noFill();

    this.ctx.beginPath();
    for (let x = 0; x <= this.ctx.canvas.width; x += 2) {
      const y =
        this.ctx.canvas.height / 2 +
        Math.sin(x * this.waveFrequency + time) * this.waveAmplitude;

      if (x === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
  }

  animate() {
    // Clear canvas with slight fade effect
    this.ctx.fillColor(this.ctx.Color.rgba(15, 15, 25, 0.1));
    this.ctx.rectangle(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Draw background sine wave guide
    this.drawSineWave();

    // Update and draw particles
    this.updateParticles();
    this.drawParticles();

    // Continue animation
    requestAnimationFrame(() => this.animate());
  }

  start() {
    // Set initial background
    this.ctx.background(this.ctx.Color.rgb(15, 15, 25));

    // Start animation loop
    this.animate();
  }
}

// Usage example:
/*
// Assuming you have a Klint context initialized
const animation = new SineWaveParticles(klintContext);
animation.start();
*/

export default SineWaveParticles;
