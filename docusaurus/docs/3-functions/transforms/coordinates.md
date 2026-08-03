# Coordinate Conversion

Klint exposes helpers for converting points through the current canvas transform. Coordinates are logical pixels; DPR is handled by the base transform.

## screenToWorld

```ts
K.screenToWorld(x: number, y: number): {x: number; y: number}
```

Applies the inverse of the current transform. Call it after applying the transforms whose world space you want to query.

```tsx
const {mouse} = KlintMouse();

const draw = (K: KlintContext) => {
  K.background('#222');

  K.push();
  K.translate(K.width / 2, K.height / 2);
  K.scale(2, 2);
  K.rotate(K.time * 0.1);

  const world = K.screenToWorld(mouse.x, mouse.y);
  K.fillColor('white');
  K.circle(world.x, world.y, 10);
  K.pop();
};
```

## worldToScreen

```ts
K.worldToScreen(x: number, y: number): {x: number; y: number}
```

Applies the current transform to a world-space point. This is useful for locating an HTML overlay or inspecting transformed geometry.

```tsx
K.push();
K.translate(K.width / 2, K.height / 2);
K.scale(1.5, 1.5);

const screen = K.worldToScreen(100, -50);
K.circle(100, -50, 8);
K.pop();
```

The returned position is in the canvas's logical coordinate space. Add the canvas element's page bounding rectangle if you need page coordinates for a DOM overlay.

## getVisibleBounds

```ts
K.getVisibleBounds(): {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
```

Returns the logical world-space bounds visible through the current transform.

```tsx
K.push();
K.translate(K.width / 2, K.height / 2);
K.scale(zoom, zoom);
K.translate(-cameraX, -cameraY);

const bounds = K.getVisibleBounds();
for (const item of items) {
  if (
    item.x >= bounds.left && item.x <= bounds.right &&
    item.y >= bounds.top && item.y <= bounds.bottom
  ) {
    drawItem(K, item);
  }
}
K.pop();
```

## Ordering matters

These helpers read `K.getTransform()` at the moment they are called. If you call them before applying your scene transform, they only see Klint's base transform.

For normal input, `KlintMouse()` already provides logical canvas coordinates relative to the configured origin. Use `screenToWorld()` only when your scene adds further translate/rotate/scale operations.
