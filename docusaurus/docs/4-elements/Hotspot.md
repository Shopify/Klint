# Hotspot

The Hotspot element provides hit detection for shapes. Pass a point (usually mouse position) and shape parameters to check if the point is inside.

## Access

```tsx
const draw = (K) => {
  const isHit = K.Hotspot.circle(mouse, 200, 200, 50);
};
```

## Methods

### circle(point, x, y, radius)

```ts
circle(point: { x: number; y: number }, x: number, y: number, radius: number) => boolean
```

```tsx
const draw = (K) => {
  const hover = K.Hotspot.circle(mouse, K.width / 2, K.height / 2, 50);
  K.fillColor(hover ? '#ff0066' : '#333');
  K.circle(K.width / 2, K.height / 2, 50);
};
```

### rect(point, x, y, width, height)

Respects the current rectangle origin setting (`setRectOrigin`).

```ts
rect(point: { x: number; y: number }, x: number, y: number, width: number, height: number) => boolean
```

```tsx
const draw = (K) => {
  const hover = K.Hotspot.rect(mouse, 100, 100, 200, 150);
  K.fillColor(hover ? 'red' : 'gray');
  K.rectangle(100, 100, 200, 150);
};
```

### ellipse(point, x, y, radiusX, radiusY, rotation?)

```ts
ellipse(point: { x: number; y: number }, x: number, y: number, radiusX: number, radiusY: number, rotation?: number) => boolean
```

```tsx
const draw = (K) => {
  const hover = K.Hotspot.ellipse(mouse, K.width / 2, K.height / 2, 100, 60, K.time);
  K.fillColor(hover ? 'cyan' : '#444');
  K.push();
  K.translate(K.width / 2, K.height / 2);
  K.rotate(K.time);
  K.ellipse(0, 0, 100, 60);
  K.pop();
};
```

### polygon(point, vertices)

Uses ray casting to check point-in-polygon.

```ts
polygon(point: { x: number; y: number }, vertices: Array<{ x: number; y: number }>) => boolean
```

```tsx
const draw = (K) => {
  const verts = [
    { x: 200, y: 100 },
    { x: 350, y: 150 },
    { x: 300, y: 300 },
    { x: 150, y: 280 },
  ];

  const hover = K.Hotspot.polygon(mouse, verts);
  K.fillColor(hover ? 'lime' : '#555');

  K.beginShape();
  for (const v of verts) K.vertex(v.x, v.y);
  K.endShape(true);
};
```

### path(point, path)

Tests against a `Path2D` object using the native `isPointInPath`.

```ts
path(point: { x: number; y: number }, path: Path2D) => boolean
```

```tsx
const setup = (K) => {
  const p = new Path2D();
  p.arc(200, 200, 80, 0, Math.PI * 2);
  storage.set('hitPath', p);
};

const draw = (K) => {
  const p = storage.get('hitPath');
  const hover = K.Hotspot.path(mouse, p);
  K.fillColor(hover ? 'orange' : '#444');
  K.fill(p);
};
```

## Example

### Interactive buttons

```tsx
const draw = (K) => {
  K.background("#222");

  const buttons = [
    { x: 100, y: 200, w: 120, h: 40, label: "Play" },
    { x: 100, y: 260, w: 120, h: 40, label: "Settings" },
    { x: 100, y: 320, w: 120, h: 40, label: "Quit" },
  ];

  K.alignText("center", "middle");
  K.textSize(16);

  for (const btn of buttons) {
    const hover = K.Hotspot.rect(mouse, btn.x, btn.y, btn.w, btn.h);
    K.fillColor(hover ? '#ff6b6b' : '#444');
    K.rectangle(btn.x, btn.y, btn.w, btn.h);

    K.fillColor("white");
    K.text(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
  }
};
```
