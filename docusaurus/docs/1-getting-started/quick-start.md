---
sidebar_position: 2
---

# Quick Start

Create your first Klint sketch in 2 minutes. Klint will take the size of its direct parent DOM element.

## The Minimal Sketch

Here's the simplest possible Klint sketch:

```tsx
import { useKlint, Klint } from '@shopify/klint';

function MySketch() {
  const { context } = useKlint();
  
  const draw = (K) => {
    K.background('#000');
    K.fillColor('#fff');
    K.circle(K.width/2, K.height/2, 50);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Add Animation

Make it move by using the `Klint.frame` property, it represents the amount of frames ellapsed since the sketch has been started.

```tsx
import { useKlint, Klint } from '@shopify/klint';

function AnimatedSketch() {
  const { context } = useKlint();
  
  const draw = (K) => {
    K.background('#000');
    
    // Animate position with sine wave
    const x = K.width/2 + Math.sin(K.frame * 0.001) * 100;
    const y = K.height/2 + Math.cos(K.frame * 0.001) * 100;
    
    K.fillColor('#ff6b6b');
    K.circle(x, y, 30);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Add Interactivity

Track mouse position with the `KlintMouse` hook:

```tsx
import { useKlint, Klint } from '@shopify/klint';

function InteractiveSketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  
  const draw = (K) => {
    K.background('#000');
    
    // Draw at mouse position
    K.fillColor(mouse.pressed ? '#ff6b6b' : '#fff');
    K.circle(mouse.x, mouse.y, mouse.pressed ? 40 : 30);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Use Setup Function

Initialize your sketch with the `setup` function:

```tsx
import { useKlint, Klint } from '@shopify/klint';

function SetupExample() {
  const { context } = useKlint();
  
  const setup = (K) => {
    // Runs once when component mounts
    console.log('Canvas size:', K.width, 'x', K.height);
  };
  
  const draw = (K) => {
    K.background('#000');
    
    // Draw a grid of circles
    for (let x = 50; x < K.width; x += 100) {
      for (let y = 50; y < K.height; y += 100) {
        K.fillColor('#ff6b6b');
        K.circle(x, y, 20);
      }
    }
  };
  
  return <Klint context={context} setup={setup} draw={draw} />;
}
```

## Complete Example

Here's everything together in a more complete sketch:

```tsx
import { useKlint, Klint } from '@shopify/klint';

function CompleteSketch() {
  const { context, KlintMouse } = useKlint();
  const { mouse } = KlintMouse();
  
  const setup = (K) => {
    // Set up text styling
    K.textAlign('center', 'middle');
    K.textSize(16);
  };
  
  const draw = (K) => {
    // Fade background
    K.fillColor('rgba(0, 0, 0, 0.1)');
    K.rectangle(0, 0, K.width, K.height);
    
    // Draw animated circles
    for (let i = 0; i < 5; i++) {
      const angle = (K.time * 0.001) + (i * Math.PI * 2 / 5);
      const radius = 100;
      
      const x = K.width/2 + Math.cos(angle) * radius;
      const y = K.height/2 + Math.sin(angle) * radius;
      
      // Distance from mouse affects size
      const dist = K.distance(mouse.x, mouse.y, x, y);
      const size = K.map(dist, 0, 200, 40, 10);
      
      K.fillColor(`hsl(${i * 72}, 70%, 60%)`);
      K.circle(x, y, size);
    }
    
    // Show instructions
    K.fillColor('#fff');
    K.text('Move your mouse around!', K.width/2, 30);
  };
  
  return <Klint 
    context={context} 
    setup={setup} 
    draw={draw}
  />;
}
```

## What's Next?

- [useKlint Pattern](./useKlint-pattern) - Deep dive into the core pattern
- [Core Concepts](../2-core-concepts/lifecycle) - Understand lifecycle functions
- [Function Reference](../3-functions/drawing/circle) - Explore all available functions