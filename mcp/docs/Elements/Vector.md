# Vector

The Vector element provides 3D vector mathematics for position, velocity, and force calculations. While designed for 3D operations, it maintains backward compatibility with 2D use cases by defaulting the z-coordinate to 0.

## Creating Vectors

```tsx
const draw = (K: KlintContext) => {
  // Create a 2D vector (z defaults to 0)
  const position = K.createVector(100, 200);
  
  // Create a 3D vector explicitly
  const position3D = K.createVector(100, 200, 50);
  
  // Create from class (if needed)
  const velocity = new K.Vector(5, -3, 0);
}
```

## Properties

- `x`: X-coordinate
- `y`: Y-coordinate  
- `z`: Z-coordinate (defaults to 0 for 2D compatibility)

## Methods

### Basic Operations

#### add(vector)

```ts
add(v: Vector) => Vector
```

Adds another vector to this vector (including z component).

```tsx
const pos = K.createVector(100, 100, 10);
const vel = K.createVector(2, -1, 0.5);
pos.add(vel); // pos is now (102, 99, 10.5)
```

#### sub(vector)

```ts
sub(v: Vector) => Vector
```

Subtracts another vector from this vector (including z component).

```tsx
const a = K.createVector(100, 100, 20);
const b = K.createVector(20, 30, 5);
a.sub(b); // a is now (80, 70, 15)
```

#### mult(scalar)

```ts
mult(n: number) => Vector
```

Multiplies the vector by a scalar (affects all components).

```tsx
const vec = K.createVector(10, 20, 30);
vec.mult(0.5); // vec is now (5, 10, 15)
```

#### div(scalar)

```ts
div(n: number) => Vector
```

Divides the vector by a scalar (affects all components).

```tsx
const vec = K.createVector(100, 50, 25);
vec.div(10); // vec is now (10, 5, 2.5)
```

### Geometric Operations

#### rotate(angle)

```ts
rotate(angle: number) => Vector
```

Rotates the vector by an angle around the z-axis (2D rotation, z component unchanged).

```tsx
const vec = K.createVector(100, 0, 5);
vec.rotate(Math.PI / 2); // vec is now (0, 100, 5)
```

#### normalize()

```ts
normalize() => Vector
```

Normalizes the vector to unit length (magnitude = 1) in 3D space.

```tsx
const vec = K.createVector(100, 100, 100);
vec.normalize(); // vec is now (0.577..., 0.577..., 0.577...)
```

### Measurement Functions

#### mag() / length()

```ts
mag() => number
length() => number  // Alias for mag()
```

Returns the magnitude (length) of the vector in 3D space.

```tsx
const vec = K.createVector(2, 3, 6);
const magnitude = vec.mag(); // 7
```

#### dist(vector)

```ts
dist(v: Vector) => number
```

Calculates 3D distance to another vector.

```tsx
const a = K.createVector(0, 0, 0);
const b = K.createVector(2, 3, 6);
const distance = a.dist(b); // 7
```

#### dot(vector)

```ts
dot(v: Vector) => number
```

Calculates the 3D dot product with another vector.

```tsx
const a = K.createVector(2, 3, 4);
const b = K.createVector(5, 6, 7);
const dotProduct = a.dot(b); // 56 (2*5 + 3*6 + 4*7)
```

#### angle()

```ts
angle() => number
```

Returns the angle of the vector in radians (2D calculation, ignoring z).

```tsx
const vec = K.createVector(1, 1, 10);
const angle = vec.angle(); // π/4 radians (45 degrees)
```

### Advanced Operations

#### cross(vector)

```ts
cross(v: Vector) => Vector
```

Calculates the 3D cross product with another vector, returning a new vector.

```tsx
const a = K.createVector(1, 0, 0);
const b = K.createVector(0, 1, 0);
const cross = a.cross(b); // (0, 0, 1)
```

#### relativeTo(vector)

```ts
relativeTo(v: Vector) => Vector
```

Makes this vector relative to another vector by subtracting the reference vector.

```tsx
const worldPos = K.createVector(100, 200, 50);
const origin = K.createVector(50, 100, 25);
worldPos.relativeTo(origin); // worldPos is now (50, 100, 25)
```

#### lookAt(target)

```ts
lookAt(target: Vector) => Vector
```

Makes this vector point towards a target vector (normalized direction).

```tsx
const position = K.createVector(0, 0, 0);
const target = K.createVector(3, 4, 0);
position.lookAt(target); // position is now (0.6, 0.8, 0)
```

#### toScreen(width, height)

```ts
toScreen(width: number, height: number) => Vector
```

Converts from normalized coordinates (-1 to 1) to screen coordinates.

```tsx
const normalizedPos = K.createVector(0, 0, 0); // Center
normalizedPos.toScreen(800, 600); // (400, 300, 0)
```

#### slerp(vector, amount)

```ts
slerp(v: Vector, amt: number) => Vector
```

Spherical linear interpolation between this vector and another vector.

```tsx
const a = K.createVector(1, 0, 0);
const b = K.createVector(0, 1, 0);
a.slerp(b, 0.5); // Smooth interpolation halfway between vectors
```

### Utility Functions

#### copy()

```ts
copy() => Vector
```

Creates a copy of the vector (including z component).

```tsx
const original = K.createVector(10, 20, 30);
const copy = original.copy();
copy.mult(2); // original is unchanged
```

#### set(x, y, z)

```ts
set(x: number, y: number, z?: number) => Vector
```

Sets the vector's coordinates (z defaults to 0).

```tsx
const vec = K.createVector(0, 0, 0);
vec.set(100, 200, 300); // vec is now (100, 200, 300)
vec.set(50, 75); // vec is now (50, 75, 0)
```

### Static Methods

#### fromAngle(center, angle, radius)

```ts
Vector.fromAngle(center: Vector, angle: number, radius: number) => Vector
```

Creates a vector at a specific angle and distance from a center point (2D operation, preserves z).

```tsx
const center = K.createVector(200, 200, 100);
const point = K.Vector.fromAngle(center, Math.PI / 4, 100);
// point is 100 units away from center at 45 degrees, z=100
```

## Common Patterns

### 3D Physics Simulation

```tsx
const draw = (K: KlintContext) => {
  // Initialize if first frame
  if (!K.State.has('particles')) {
    const particles = [];
    for (let i = 0; i < 10; i++) {
      particles.push({
        position: K.createVector(K.width/2, K.height/2, 0),
        velocity: K.createVector(
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 2
        ),
        acceleration: K.createVector(0, 0.1, 0) // gravity
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
    
    // Bounce off edges (2D bounds)
    if (particle.position.x < 0 || particle.position.x > K.width) {
      particle.velocity.x *= -0.8;
    }
    if (particle.position.y < 0 || particle.position.y > K.height) {
      particle.velocity.y *= -0.8;
    }
    
    // Constrain to canvas
    particle.position.x = K.constrain(particle.position.x, 0, K.width);
    particle.position.y = K.constrain(particle.position.y, 0, K.height);
    
    // Size based on z-depth
    const size = 5 + particle.position.z * 0.1;
    
    // Draw particle
    K.fillColor("white");
    K.circle(particle.position.x, particle.position.y, size);
  });
}
```

### 3D Steering and Following

```tsx
const draw = (K: KlintContext) => {
  const { mouse } = KlintMouse();
  
  // Initialize agent
  if (!K.State.has('agent')) {
    K.State.set('agent', {
      position: K.createVector(K.width/2, K.height/2, 0),
      velocity: K.createVector(0, 0, 0),
      maxSpeed: 3
    });
  }
  
  const agent = K.State.get('agent');
  const target = K.createVector(mouse.x, mouse.y, 0);
  
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
  
  // Draw 3D velocity vector
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

### Spherical Interpolation Animation

```tsx
const draw = (K: KlintContext) => {
  if (!K.State.has('vectors')) {
    K.State.set('vectors', {
      start: K.createVector(1, 0, 0),
      end: K.createVector(0, 1, 0),
      current: K.createVector(1, 0, 0),
      t: 0
    });
  }
  
  const vectors = K.State.get('vectors');
  const center = K.createVector(K.width/2, K.height/2, 0);
  
  // Animate interpolation
  vectors.t += 0.01;
  if (vectors.t > 1) vectors.t = 0;
  
  // Reset current and interpolate
  vectors.current.set(vectors.start.x, vectors.start.y, vectors.start.z);
  vectors.current.slerp(vectors.end, vectors.t);
  
  K.background("#111");
  
  // Draw interpolated vector
  const scaled = vectors.current.copy().mult(100);
  const end = center.copy().add(scaled);
  
  K.strokeColor("white");
  K.strokeWidth(3);
  K.line(center.x, center.y, end.x, end.y);
  
  K.fillColor("red");
  K.circle(end.x, end.y, 8);
}
```

### Cross Product Visualization

```tsx
const draw = (K: KlintContext) => {
  const center = K.createVector(K.width/2, K.height/2, 0);
  
  // Two vectors
  const a = K.createVector(100, 0, 0);
  const b = K.createVector(50, 80, 0);
  
  // Cross product (perpendicular to both)
  const cross = a.cross(b);
  
  K.background("#222");
  
  // Draw vectors
  K.strokeColor("red");
  K.strokeWidth(3);
  K.line(center.x, center.y, center.x + a.x, center.y + a.y);
  
  K.strokeColor("blue"); 
  K.line(center.x, center.y, center.x + b.x, center.y + b.y);
  
  // Show cross product magnitude as text
  K.fillColor("white");
  K.text(`Cross product Z: ${cross.z.toFixed(2)}`, 10, 30);
}
```

## Notes

- **3D Support**: All operations now work in 3D space, with z defaulting to 0 for 2D compatibility
- **Method Chaining**: All vector operations modify the original vector and return `this` for chaining: `vec.normalize().mult(speed).add(offset)`
- **Copy When Needed**: Use `copy()` when you need to preserve the original vector during operations
- **Angles in Radians**: All angle operations use radians; use `degrees * (Math.PI / 180)` for conversion
- **Performance**: For performance-critical code, consider reusing vectors instead of creating new ones
- **Cross Product**: Returns a new vector perpendicular to both input vectors (right-hand rule)
- **Slerp**: Provides smooth interpolation that maintains constant angular velocity
- **Screen Coordinates**: `toScreen()` converts from normalized device coordinates to pixel coordinates 