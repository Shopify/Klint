# point

```ts
K.point(x: number, y: number): void
```

Draws a one-unit stroked point using the current stroke color. It does not use the fill color.

```tsx
K.strokeColor('red');
K.point(100, 100);
```

For a configurable dot size, draw a circle instead:

```tsx
K.noStroke();
K.fillColor('red');
K.circle(100, 100, 4);
```

## Mouse example

```tsx
const {context, KlintMouse} = useKlint();
const {mouse} = KlintMouse();

const draw = (K: KlintContext) => {
  K.background('#111');
  K.strokeColor('yellow');
  K.point(mouse.x, mouse.y);
};

return <Klint context={context} draw={draw} />;
```

Because `point()` uses a one-unit `strokeRect`, its physical size follows the current transform. Use paths or circles when you need more control over appearance.
