---
name: klint
description: Build creative-coding sketches and digital art with Klint's immediate-mode Canvas 2D API in React or vanilla JavaScript.
---

# Klint

Use Klint for generative art, animated sketches, and interactive Canvas 2D work. Treat it as an immediate-mode creative-coding runtime: update sketch state, then draw the current frame through the enhanced `KlintContext`.

## How to work

1. Install `@shopify/klint` and inspect its exported TypeScript types when unsure; do not guess p5.js-style names.
2. Put one-time resource loading in `preload`, initialization in `setup`, and synchronous rendering in `draw`.
3. Size the parent element—`<Klint>` fills it. Use `K.width` and `K.height` for responsive composition.
4. Drive animation with `K.time` or `K.deltaTime`, not an additional `requestAnimationFrame`.
5. Keep optional plugins behind their `@shopify/klint/plugins/*` imports and add them only when the artwork needs them.

```tsx
import {Klint, type KlintContext} from '@shopify/klint';

export function Artwork() {
  const draw = (K: KlintContext) => {
    K.background('#101018');
    const x = K.width / 2 + Math.cos(K.time) * K.width * 0.2;
    K.fillColor('#ff6b9d');
    K.circle(x, K.height / 2, 24);
  };

  return (
    <div style={{width: '100%', height: '100vh'}}>
      <Klint draw={draw} />
    </div>
  );
}
```

For pointer, keyboard, gesture, window, or image helpers, call their factories during render and pass the bridge to the canvas:

```tsx
const {context, KlintMouse} = useKlint();
const {mouse} = KlintMouse();
return <Klint context={context} draw={(K) => drawArtwork(K, mouse)} />;
```

Without React, import `createKlint` from `@shopify/klint/native`, await `sketch.ready`, and call `sketch.destroy()` when finished.

## React pitfalls

- **Never call `KlintMouse()`, `KlintImage()`, or another hook factory inside `draw`, a condition, or an event handler.** They use React hooks and must run unconditionally at component render time.
- Do not call React state setters every frame. Keep fast simulation state in `useStorage`/refs, read changing component values with `useProps`, and reserve React state for surrounding UI.
- Keep `draw` synchronous. Load/decode assets in `preload` or React effects and cache expensive/static work.
- Canvas options are initialization settings. Remount `<Klint>` to change them rather than expecting prop updates to rebuild the runtime.
- React Strict Mode may initialize effects twice in development. Make `preload` and `setup` idempotent, and clean up non-Klint listeners/resources in a React effect.
- Coordinates are logical CSS pixels. Do not multiply drawing or pointer coordinates by DPR; Klint manages the backing store.
- Clear with `background`/`clear` when each frame should replace the previous one; omit or use transparency intentionally for trails.
