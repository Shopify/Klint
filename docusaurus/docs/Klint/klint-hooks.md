# Klint Hooks

Klint provides React hooks for managing state, handling input, and loading resources.

## useKlint

```tsx
const { 
  context,      // KlintContext instance 
  useMouse,     // Mouse tracking hook
  useWindow,    // Window/resize events hook
  useImage      // Image loading hook
} = useKlint()
```

The main hook that initializes Klint and provides access to sub-hooks.

## useStorage

```tsx
const P = useStorage<StorageType>(initialValues)
```

Provides persistent storage across renders. 

### Methods
- `get(key)`: Get a stored value
- `set(key, value)`: Store a value
- `has(key)`: Check if key exists
- `delete(key)`: Remove a stored value

## useMouse

```tsx
const { 
  mouse,          // Current mouse state
  onClick,        // Register click handler
  onMove,         // Register move handler
  onDown,         // Register mousedown handler
  onUp,           // Register mouseup handler
  onDrag,         // Register drag handler
  onOver,         // Register mouseover handler
  onOut           // Register mouseout handler
} = useMouse()
```

Tracks mouse state and registers event handlers.

### Mouse properties
- `x`, `y`: Current position
- `px`, `py`: Previous position
- `dx`, `dy`: Delta since last frame
- `isPressed`: Boolean indicating mouse pressed state

## useImage

```tsx
const { 
  images,          // Object containing loaded images
  loadImages,      // Function to load images
  isLoading        // Boolean loading state
} = useImage()
```

Handles image loading.

### Methods
- `loadImages(imageMap)`: Asynchronously loads images from URLs

## useWindow

```tsx
const { 
  onResize,        // Register resize handler
  window           // Window dimensions
} = useWindow()
```

Tracks window state and handles resize events.

## Example

```tsx
import { Klint, useKlint, useStorage, useImage, type KlintContext } from "klint";

export function KlintCanvas() {
  // Initialize hooks
  const { context, useMouse, useWindow } = useKlint();
  const { mouse, onClick } = useMouse();
  const { onResize } = useWindow();
  const { images, loadImages } = useImage();
  
  // Set up storage
  const P = useStorage({
    clickCount: 0,
    lastPosition: { x: 0, y: 0 }
  });

  // Set up event handlers
  onClick(() => {
    P.set("clickCount", P.get("clickCount") + 1);
    P.set("lastPosition", { x: mouse.x, y: mouse.y });
  });
  
  onResize(() => {
    console.log("Canvas resized");
  });

  const preload = async (K: KlintContext) => {
    await loadImages({
      icon: "path/to/icon.png"
    });
  };

  const draw = (K: KlintContext) => {
    K.background("#222");
    
    // Use mouse state
    K.fillColor(mouse.isPressed ? "red" : "white");
    K.circle(mouse.x, mouse.y, 20);
    
    // Use storage
    K.fillColor("white");
    K.text(`Clicks: ${P.get("clickCount")}`, 20, 30);
    
    // Use loaded images
    if (images.icon) {
      K.image(images.icon, 50, 50);
    }
  };

  return (
    <Klint
      context={context}
      preload={preload}
      draw={draw}
    />
  );
}
```

## Notes
- All hooks must be used within a React component
- `useKlint()` should be called only once per component
- Pass the context from `useKlint()` to the `<Klint>` component
- Storage persists between renders and is reactive
- Event handlers registered with mouse functions can be cleaned up automatically
- The `loadImages` function from `useImage` returns a promise that resolves when all images are loaded 