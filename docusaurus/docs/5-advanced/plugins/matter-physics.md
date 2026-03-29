---
sidebar_position: 6
---

# MatterPhysics

Wrapper around [Matter.js](https://brm.io/matter-js/) for 2D physics simulation. Requires `matter-js` as a separate install — you pass the module at init.

## Setup

```tsx
import { MatterPhysics } from '@shopify/klint/plugins';

// Recommended — loads matter-js automatically
// Tries local import first, falls back to CDN
await MatterPhysics.load({ gravity: { x: 0, y: 1 } });

// Or pass the module directly if you have it installed
import Matter from 'matter-js';
MatterPhysics.init(Matter, { gravity: { x: 0, y: 1 } });

// Check if loaded
if (MatterPhysics.isLoaded) { /* ready */ }
```

`load()` tries `import("matter-js")` first, then falls back to loading `v0.20.0` from cdnjs. You can change the version:

```tsx
MatterPhysics.MATTER_VERSION = "0.20.0";
```

## Adding Bodies

```tsx
// Static ground
MatterPhysics.addRect(400, 580, 800, 40, { isStatic: true });

// Dynamic circle
const ball = MatterPhysics.addCircle(400, 100, 25, {
  restitution: 0.8,
  friction: 0.1,
});

// Polygon
MatterPhysics.addPolygon(300, 200, 6, 30);

// Custom shape from vertices
MatterPhysics.addFromVertices(500, 200, [
  { x: 0, y: -30 },
  { x: 30, y: 30 },
  { x: -30, y: 30 },
]);
```

## Constraints

```tsx
// Between two bodies
MatterPhysics.addConstraint(bodyA.id, bodyB.id, {
  stiffness: 0.5,
  length: 100,
});

// Pinned to a world point
MatterPhysics.addWorldConstraint(body.id, { x: 400, y: 100 }, {
  stiffness: 0.1,
});
```

## Update & Draw

```tsx
const draw = (K) => {
  K.background('#111');

  MatterPhysics.update(K.deltaTime);

  MatterPhysics.draw(K, {
    bodyStroke: '#fff',
    bodyFill: 'transparent',
    staticFill: '#444',
    constraintStroke: '#0f0',
    lineWidth: 1,
  });
};
```

## Custom Drawing

```tsx
const draw = (K) => {
  MatterPhysics.update(K.deltaTime);

  MatterPhysics.forEach(({ x, y, angle, id, label }) => {
    K.push();
    K.translate(x, y);
    K.rotate(angle);

    if (label === 'player') {
      K.fillColor('#00ff88');
      K.circle(0, 0, 25);
    } else {
      K.fillColor('#fff');
      K.rectangle(0, 0, 50, 50);
    }

    K.pop();
  });
};
```

## Forces & Collisions

```tsx
MatterPhysics.applyForce(ball.id, { x: 0.01, y: -0.05 });

MatterPhysics.setVelocity(ball.id, { x: 5, y: -10 });

MatterPhysics.onCollision('collisionStart', (pairs) => {
  pairs.forEach(pair => {
    console.log('collision between', pair.bodyA.id, pair.bodyB.id);
  });
});
```

## Cleanup

```tsx
MatterPhysics.removeBody(ball.id);
MatterPhysics.clear();    // remove all bodies/constraints
MatterPhysics.destroy();  // full cleanup including engine
```
