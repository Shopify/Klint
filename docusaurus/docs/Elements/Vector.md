# Vector

The Vector element provides 2D vector mathematics for position, velocity, and force calculations.

## Creating Vectors

```tsx
const draw = (K: KlintContext) => {
  // Create a vector using the factory function
  const position = K.createVector(100, 200);
  
  // Create from class (if needed)
  const velocity = new K.Vector(5, -3);
}
```

## Properties

- `x`: X-coordinate
- `y`: Y-coordinate

## Methods

### Basic Operations

#### add(vector)

```ts
add(v: Vector) => Vector
```

Adds another vector to this vector.

```tsx
const pos = K.createVector(100, 100);
const vel = K.createVector(2, -1);
pos.add(vel); // pos is now (102, 99)
```

#### sub(vector)

```ts
sub(v: Vector) => Vector
```

Subtracts another vector from this vector.

```tsx
const a = K.createVector(100, 100);
const b = K.createVector(20, 30);
a.sub(b); // a is now (80, 70)
```

#### mult(scalar)

```ts
mult(n: number) => Vector
```

Multiplies the vector by a scalar.

```tsx
const vec = K.createVector(10, 20);
vec.mult(0.5); // vec is now (5, 10)
```

#### div(scalar)

```ts
div(n: number) => Vector
```

Divides the vector by a scalar.

```tsx
const vec = K.createVector(100, 50);
vec.div(10); // vec is now (10, 5)
```

### Geometric Operations

#### rotate(angle)

```ts
rotate(angle: number) => Vector
```

Rotates the vector by an angle (in radians).

```tsx
const vec = K.createVector(100, 0);
vec.rotate(Math.PI / 2); // vec is now (0, 100)
```

#### normalize()

```ts
normalize() => Vector
```

Normalizes the vector to unit length (magnitude = 1).

```tsx
const vec = K.createVector(100, 100);
vec.normalize(); // vec is now (0.707..., 0.707...)
```

### Measurement Functions

#### mag() / length()

```ts
mag() => number
length() => number  // Alias for mag()
```

Returns the magnitude (length) of the vector.

```tsx
const vec = K.createVector(3, 4);
const magnitude = vec.mag(); // 5
```

#### dist(vector)

```ts
dist(v: Vector) => number
```

Calculates distance to another vector.

```tsx
const a = K.createVector(0, 0);
const b = K.createVector(3, 4);
const distance = a.dist(b); // 5
```

#### dot(vector)

```ts
dot(v: Vector) => number
```

Calculates the dot product with another vector.

```tsx
const a = K.createVector(2, 3);
const b = K.createVector(4, 5);
const dotProduct = a.dot(b); // 23
```

#### angle()

```ts
angle() => number
```

Returns the angle of the vector in radians.

```tsx
const vec = K.createVector(1, 1);
const angle = vec.angle(); // π/4 radians (45 degrees)
```

### Utility Functions

#### copy()

```ts
copy() => Vector
```

Creates a copy of the vector.

```tsx
const original = K.createVector(10, 20);
const copy = original.copy();
copy.mult(2); // original is unchanged
```

#### set(x, y)

```ts
set(x: number, y: number) => Vector
```

Sets the vector's coordinates.

```tsx
const vec = K.createVector(0, 0);
vec.set(100, 200); // vec is now (100, 200)
```

### Static Methods

#### fromAngle(center, angle, radius)

```ts
Vector.fromAngle(center: Vector, angle: number, radius: number) => Vector
```

Creates a vector at a specific angle and distance from a center point.

```tsx
const center = K.createVector(200, 200);
const point = K.Vector.fromAngle(center, Math.PI / 4, 100);
// point is 100 units away from center at 45 degrees
```

## Common Patterns

### Physics Simulation

```tsx
const draw = (K: KlintContext) => {
  // Initialize if first frame
  if (!K.State.has('particles')) {
    const particles = [];
    for (let i = 0; i < 10; i++) {
      particles.push({
        position: K.createVector(K.width/2, K.height/2),
        velocity: K.createVector(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4
        ),
        acceleration: K.createVector(0, 0.1) // gravity
      });
    }
    K.State.set('particles', particles);
  }
  
  const particles = K.State.get('particles');
  
  K.background("#222");
  
  particles.forEach(particle => {
    // Apply physics
    particle.velocity.add(particle.acceleration);
    particle.position.add(particle.velocity);
    
    // Bounce off edges
    if (particle.position.x < 0 || particle.position.x > K.width) {
      particle.velocity.x *= -0.8;
    }
    if (particle.position.y < 0 || particle.position.y > K.height) {
      particle.velocity.y *= -0.8;
    }
    
    // Constrain to canvas
    particle.position.x = K.constrain(particle.position.x, 0, K.width);
    particle.position.y = K.constrain(particle.position.y, 0, K.height);
    
    // Draw particle
    K.fillColor("white");
    K.circle(particle.position.x, particle.position.y, 5);
  });
}
```

### Following and Steering

```tsx
const draw = (K: KlintContext) => {
  const { mouse } = KlintMouse();
  
  // Initialize agent
  if (!K.State.has('agent')) {
    K.State.set('agent', {
      position: K.createVector(K.width/2, K.height/2),
      velocity: K.createVector(0, 0),
      maxSpeed: 3
    });
  }
  
  const agent = K.State.get('agent');
  const target = K.createVector(mouse.x, mouse.y);
  
  // Calculate desired velocity toward target
  const desired = target.copy().sub(agent.position);
  desired.normalize().mult(agent.maxSpeed);
  
  // Steering force
  const steer = desired.copy().sub(agent.velocity);
  steer.mult(0.1); // steering strength
  
  // Update agent
  agent.velocity.add(steer);
  agent.position.add(agent.velocity);
  
  K.background("#333");
  
  // Draw agent
  K.fillColor("cyan");
  K.circle(agent.position.x, agent.position.y, 20);
  
  // Draw velocity vector
  K.strokeColor("yellow");
  K.strokeWidth(2);
  const velEnd = agent.position.copy().add(
    agent.velocity.copy().mult(10)
  );
  K.line(
    agent.position.x, agent.position.y,
    velEnd.x, velEnd.y
  );
}
```

### Circular Motion

```tsx
const draw = (K: KlintContext) => {
  const center = K.createVector(K.width/2, K.height/2);
  const numPoints = 8;
  
  K.background("#111");
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2 + K.time * 0.5;
    const radius = 100 + Math.sin(K.time * 2 + i) * 30;
    
    const point = K.Vector.fromAngle(center, angle, radius);
    
    K.fillColor(`hsl(${i * 45}, 70%, 60%)`);
    K.circle(point.x, point.y, 15);
    
    // Draw line to center
    K.strokeColor("rgba(255,255,255,0.3)");
    K.strokeWidth(1);
    K.line(center.x, center.y, point.x, point.y);
  }
}
```

## Notes

- All vector operations modify the original vector (except `copy()`)
- Chain operations: `vec.normalize().mult(speed).add(offset)`
- Vector operations are fundamental for physics, movement, and geometry
- Use `copy()` when you need to preserve the original vector
- Angles are in radians; use `degrees * (Math.PI / 180)` for conversion
- For performance-critical code, consider reusing vectors instead of creating new ones 