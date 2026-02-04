# Klint Code Examples

## Animated Gradient Background

```tsx
const draw = (K) => {
  const g = K.gradient(0, 0, K.width, K.height);
  const hue = (K.time * 30) % 360;
  K.addColorStop(g, 0, K.Color.hsl(hue, 70, 50));
  K.addColorStop(g, 1, K.Color.hsl((hue + 60) % 360, 70, 50));
  K.fillColor(g);
  K.rectangle(0, 0, K.width, K.height);
};
```

## Circular Motion

```tsx
const draw = (K) => {
  K.background('#111');
  
  const centerX = K.width / 2;
  const centerY = K.height / 2;
  
  for (let i = 0; i < 12; i++) {
    const angle = K.time + (i * Math.PI * 2 / 12);
    const x = centerX + Math.cos(angle) * 150;
    const y = centerY + Math.sin(angle) * 150;
    
    K.fillColor(K.Color.hsl(i * 30, 70, 60));
    K.circle(x, y, 20);
  }
};
```

## Mouse Trail

```tsx
const { context, KlintMouse } = useKlint();
const { mouse } = KlintMouse();
const store = useStorage({ trail: [] });

const draw = (K) => {
  K.background('rgba(0, 0, 0, 0.05)');
  
  const trail = store.get('trail');
  trail.push({ x: mouse.x, y: mouse.y });
  if (trail.length > 50) trail.shift();
  
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const alpha = i / trail.length;
    K.fillColor(K.Color.rgba(255, 100, 100, alpha));
    K.circle(p.x, p.y, alpha * 20);
  }
};
```

## Grid Pattern

```tsx
const draw = (K) => {
  K.background('#1a1a2e');
  
  const cols = 20;
  const rows = 20;
  const cellW = K.width / cols;
  const cellH = K.height / rows;
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * cellW + cellW / 2;
      const y = j * cellH + cellH / 2;
      const d = K.distance(x, y, K.width/2, K.height/2);
      const size = K.remap(Math.sin(d * 0.02 - K.time * 2), -1, 1, 2, cellW * 0.4);
      
      K.fillColor(K.Color.hsl(d * 0.5, 70, 60));
      K.circle(x, y, size);
    }
  }
};
```

## Noise Field (with Noise Element)

```tsx
const setup = (K) => {
  K.Noise.seed(123);
};

const draw = (K) => {
  K.background('#000');
  
  const scale = 0.01;
  for (let x = 0; x < K.width; x += 20) {
    for (let y = 0; y < K.height; y += 20) {
      const angle = K.Noise.perlin2(x * scale, y * scale + K.time * 0.5) * Math.PI * 2;
      
      K.push();
      K.translate(x, y);
      K.rotate(angle);
      K.strokeColor('#fff');
      K.strokeWidth(1);
      K.line(0, 0, 15, 0);
      K.pop();
    }
  }
};
```

## Bouncing Balls

```tsx
const store = useStorage({ balls: [] });

const setup = (K) => {
  store.set('balls', Array(20).fill(0).map(() => ({
    x: Math.random() * K.width,
    y: Math.random() * K.height,
    vx: (Math.random() - 0.5) * 10,
    vy: (Math.random() - 0.5) * 10,
    r: 10 + Math.random() * 30,
    hue: Math.random() * 360
  })));
};

const draw = (K) => {
  K.background('#0a0a0a');
  
  for (const ball of store.get('balls')) {
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    if (ball.x < ball.r || ball.x > K.width - ball.r) ball.vx *= -1;
    if (ball.y < ball.r || ball.y > K.height - ball.r) ball.vy *= -1;
    
    K.fillColor(K.Color.hsl(ball.hue, 70, 60));
    K.circle(ball.x, ball.y, ball.r);
  }
};
```

## Layered Offscreen Rendering

```tsx
const setup = (K) => {
  // Pre-render static background
  K.createOffscreen('bg', K.width, K.height, {}, (ctx) => {
    for (let i = 0; i < 100; i++) {
      ctx.fillColor(K.Color.rgba(255, 255, 255, 0.1));
      ctx.circle(
        Math.random() * ctx.width,
        Math.random() * ctx.height,
        Math.random() * 50
      );
    }
  });
};

const draw = (K) => {
  K.background('#111');
  K.image(K.getOffscreen('bg'), 0, 0);
  
  // Draw dynamic content on top
  K.fillColor('#ff6b6b');
  K.circle(K.width/2 + Math.sin(K.time) * 100, K.height/2, 30);
};
```

## Custom Shape with Bezier Curves

```tsx
const draw = (K) => {
  K.background('#1a1a2e');
  K.translate(K.width/2, K.height/2);
  
  K.fillColor('#e94560');
  K.noStroke();
  
  K.beginShape();
  K.vertex(-100, 0);
  K.bezierVertex(-100, -55, -55, -100, 0, -100);
  K.bezierVertex(55, -100, 100, -55, 100, 0);
  K.bezierVertex(100, 55, 55, 100, 0, 100);
  K.bezierVertex(-55, 100, -100, 55, -100, 0);
  K.endShape(true);
};
```

## Interactive Ripples

```tsx
const { context, KlintMouse } = useKlint();
const { mouse, onClick } = KlintMouse();
const store = useStorage({ ripples: [] });

onClick(() => {
  store.get('ripples').push({
    x: mouse.x,
    y: mouse.y,
    r: 0,
    alpha: 1
  });
});

const draw = (K) => {
  K.background('#0f0f23');
  
  const ripples = store.get('ripples');
  
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.r += 3;
    r.alpha -= 0.02;
    
    if (r.alpha <= 0) {
      ripples.splice(i, 1);
      continue;
    }
    
    K.noFill();
    K.strokeColor(K.Color.rgba(100, 200, 255, r.alpha));
    K.strokeWidth(2);
    K.circle(r.x, r.y, r.r);
  }
};
```

## Text with Glow Effect

```tsx
const draw = (K) => {
  K.background('#0a0a0a');
  
  K.textFont('Arial');
  K.textSize(72);
  K.alignText('center', 'middle');
  
  // Glow layers
  for (let i = 5; i > 0; i--) {
    K.fillColor(K.Color.rgba(0, 200, 255, 0.1));
    K.blur(i * 4);
    K.text('KLINT', K.width/2, K.height/2);
  }
  
  // Clear blur and draw sharp text
  K.filter = 'none';
  K.fillColor('#fff');
  K.text('KLINT', K.width/2, K.height/2);
};
```

## Responsive Design Pattern

```tsx
const { KlintWindow } = useKlint();
const { onResize } = KlintWindow();

onResize((K) => {
  // Recalculate positions on resize
  console.log('New size:', K.width, K.height);
});

const draw = (K) => {
  K.background('#1a1a2e');
  
  // Use relative positions
  const margin = Math.min(K.width, K.height) * 0.1;
  const size = Math.min(K.width, K.height) * 0.3;
  
  K.fillColor('#4ecdc4');
  K.circle(margin + size/2, K.height/2, size/2);
  
  K.fillColor('#ff6b6b');
  K.circle(K.width - margin - size/2, K.height/2, size/2);
};
```
