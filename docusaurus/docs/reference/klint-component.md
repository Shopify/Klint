---
sidebar_position: 1
---

# Klint Component

The `Klint` component is the main entry point for rendering canvas graphics in React applications.
The `context` prop comes from `useKlint()` hook.

```tsx
<Klint
  context={context}           // Optional KlintContext from useKlint()
  preload={preloadFunction}   // Optional async setup before first frame
  setup={setupFunction}       // Optional one-time setup function
  draw={drawFunction}         // Required drawing function
  options={{                  // Optional configuration
    origin: "center",         // "center" or "corner" (default)
    fps: 60,                  // Target frame rate (default: 60)
    static: "true",           // Static render, no animation loop (default: undefined)
    alpha: true,              // Canvas with alpha channel (default: true)
    willReadFrequently: false // Optimize for pixel manipulation (default: false)
  }}
/>
```

## Lifecycle Functions

### preload
```ts
preload: (K: KlintContext) => Promise<void>
```
Asynchronous function called before the first frame. Use for loading assets like images, fonts, etc.

### setup
```ts
setup: (K: KlintContext) => void
```
Called once after preload and before the first frame. Use for one-time initialization.

### draw
```ts
draw: (K: KlintContext) => void
```
Called every frame (or once in static mode). Contains your drawing logic.

## Example
```tsx
import { Klint, useKlint, useStorage, type KlintContext } from "@shopify/klint";

export function KlintCanvas() {
  const { context, useMouse, useImage } = useKlint();
  const { images, loadImages } = useImage();
  const P = useStorage({
    hello: "world",
  });

  const preload = async (K: KlintContext) => {
    await loadImages({
      lamp: "path/to/lamp.png",
    });
  };

  const setup = (K: KlintContext) => {
    K.textFont("Inter")
    K.textSize(36)
    K.noStroke()
    K.alignText("center", "middle")
    K.setImageOrigin("center")
  };

  const draw = (K: KlintContext) => {
    K.background("#FFF");
    
    K.push();
    const lamp = images["lamp"];
    const fit = K.scaleTo(lamp.width, lamp.height, K.width, K.height);
    K.scale(fit, fit);
    K.image(lamp, 0, 0);
    K.pop();
    
    K.push();
    K.text(P.get("hello"), 0, 0);
    K.pop();
  };

  return (
    <Klint
      context={context}
      preload={preload}
      setup={setup}
      draw={draw}
      options={{
        origin: "center",
      }}
    />
  );
}
```

## Notes
- For static rendering (non-animated), set `options.static` to "true"
- The KlintContext provides access to canvas dimensions via `K.width` and `K.height`
- Canvas automatically resizes with its container
- Setting `origin` to "center" places the coordinate origin at the center of the canvas 