---
sidebar_position: 1
---

# Klint Component

`Klint` owns the canvas, lifecycle, sizing, visibility handling, and animation loop. A context bridge from `useKlint()` is optional, but required when you use Klint's React input or resource hooks.

```tsx
import {Klint, useKlint, type KlintContext} from '@shopify/klint';

function Sketch() {
  const {context} = useKlint();

  return (
    <Klint
      context={context}
      preload={async (K) => {/* load resources */}}
      setup={(K) => {/* initialize once */}}
      draw={(K) => {/* draw a frame */}}
      options={{
        origin: 'corner',
        fps: 60,
        alpha: true,
        willreadfrequently: false,
        dpr: 'default',
        maxDpr: 3,
      }}
    />
  );
}
```

## Lifecycle props

| Prop | Type | Behavior |
| --- | --- | --- |
| `preload` | `(K) => void \| Promise<void>` | Runs once before setup. Drawing waits for it. |
| `setup` | `(K) => void \| Promise<void>` | Runs once after preload. Drawing waits for it. |
| `draw` | `(K) => void` | Runs at the requested frame rate, or once in static/no-loop mode. |

The canvas and its 2D context survive React rerenders. The latest `draw` and event callbacks are read from refs, so changing a callback does not recreate the canvas or animation loop. Canvas options are initialization options; remount the component to change them.

## Canvas options

Options can be passed through the grouped `options` prop. Flattened options remain supported for compatibility.

| Option | Default | Description |
| --- | --- | --- |
| `origin` | `'corner'` | Canvas origin: `'corner'` or `'center'`. |
| `fps` | `60` | Target draw rate. |
| `autoplay` | `true` | Start the animation after setup. |
| `static` | `false` | Draw once after setup. |
| `noloop` | `false` | Draw once without continuing the loop. |
| `alpha` | `true` | Request an alpha-enabled 2D context. |
| `willreadfrequently` | `false` | Optimize the context for frequent pixel reads. |
| `ignoreResize` | `false` | Disable automatic `ResizeObserver` sizing. |
| `dpr` | `'default'` | Device-pixel ratio or a positive number. |
| `maxDpr` | `3` | Cap used when `dpr` is `'default'`. |
| `nocanvas` | `false` | Keep the canvas mounted but hidden. |
| `ignoreFunctions` | `false` | Do not install Klint helpers on offscreen contexts. |
| `unsafemode` | `false` | Disable selected safety checks. |

Boolean options use actual booleans in 0.5. Legacy `'true'` and `'false'` strings are normalized at runtime only to ease migration.

## Presentation and lifecycle callbacks

```tsx
<Klint
  loadingComponent={<p>Loading sketch…</p>}
  errorComponent={(error) => <p role="alert">{error.message}</p>}
  onError={(error) => console.error(error)}
  onReady={(K) => console.log('ready', K.width, K.height)}
  onResize={(K) => console.log('resized', K.width, K.height)}
  onVisible={(K, visible) => console.log({visible})}
/>
```

- `loadingComponent` is displayed while preload/setup runs.
- `errorComponent` is displayed if initialization or drawing throws.
- `onError`, `onReady`, `onResize`, and `onVisible` observe lifecycle changes.
- Drawing pauses while the document or canvas is not visible, without adding hidden time to `deltaTime`.

## Container and canvas props

The outer element fills its parent. Control canvas size by sizing that parent or by passing `className`/`style` to the outer element.

Use `canvasProps` for standard canvas attributes and handlers:

```tsx
<div style={{width: 640, height: 360}}>
  <Klint
    draw={draw}
    className="sketch"
    canvasProps={{
      'aria-label': 'Animated particle field',
      tabIndex: 0,
    }}
  />
</div>
```

The canvas is focusable by default so keyboard input is scoped to the active sketch rather than captured globally.

## Extensions and children

`extensionFunction` installs custom context values before preload. `children` render inside the canvas container, which is useful for overlays.

```tsx
<Klint
  draw={draw}
  extensionFunction={{
    randomSign: () => () => Math.random() < 0.5 ? -1 : 1,
  }}
>
  <button className="overlay">Reset</button>
</Klint>
```

For runtime extensions, `K.extend(name, value, enforceReplace?)` warns on collisions unless replacement is explicitly allowed.
