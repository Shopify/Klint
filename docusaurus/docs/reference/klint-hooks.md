---
sidebar_position: 2
---

# Klint Hooks

Klint provides React hooks for managing state, handling input, and loading resources.

## useKlint

```tsx
const { 
  context,        // KlintContext instance 
  KlintMouse,     // Mouse tracking hook factory
  KlintImage,     // Image loading hook factory
  KlintWindow,    // Window/resize events hook factory
  KlintScroll,    // Scroll handling hook factory
  KlintGesture,   // Touch gesture handling hook factory
  useDev          // Development utilities
} = useKlint()
```

The main hook that initializes Klint and provides access to sub-hook factories.

## useStorage

```tsx
const P = useStorage<StorageType>(initialValues)
```

Provides persistent storage across renders that survives component re-renders.

### Methods
- `get(key)`: Get a stored value
- `set(key, value)`: Store a value
- `has(key)`: Check if key exists
- `delete(key)`: Remove a stored value

## useProps

```tsx
const P = useProps<PropsType>(props)
```

Provides reactive access to props that can be updated and accessed consistently.

## KlintMouse

```tsx
const { 
  mouse,          // Current mouse state
  onClick,        // Register click handler
  onMouseIn,      // Register mouse enter handler
  onMouseOut,     // Register mouse leave handler
  onMouseDown,    // Register mousedown handler
  onMouseUp       // Register mouseup handler
} = KlintMouse()
```

Tracks mouse state and registers event handlers.

### Mouse properties
- `x`, `y`: Current position (relative to canvas origin)
- `px`, `py`: Previous position
- `vx`, `vy`: Velocity (change in position)
- `angle`: Angle of movement
- `isPressed`: Boolean indicating mouse pressed state
- `isHover`: Boolean indicating if mouse is over canvas

## KlintImage

```tsx
const { 
  images,          // Proxy object containing loaded images
  loadImage,       // Function to load a single image
  loadImages,      // Function to load multiple images
  getImage,        // Get image by key
  hasImage,        // Check if image exists
  clearImages      // Clear all loaded images
} = KlintImage()
```

Handles image loading with promise-based API.

### Methods
- `loadImage(key, url, options?)`: Load a single image
- `loadImages(imageMap, options?)`: Load multiple images from URL map
- `images[key]` or `images.get(key)`: Access loaded images

## KlintWindow

```tsx
const { 
  onResize,        // Register resize handler
  onBlur,          // Register window blur handler
  onFocus,         // Register window focus handler
  onVisibilityChange, // Register visibility change handler
  window           // Window state
} = KlintWindow()
```

Tracks window state and handles window events.

## KlintScroll

```tsx
const { 
  scroll,          // Current scroll state
  onScroll         // Register scroll handler
} = KlintScroll()
```

Tracks scroll events and provides scroll state.

### Scroll properties
- `distance`: Total scroll distance
- `velocity`: Scroll velocity
- `lastTime`: Last scroll event timestamp

## KlintGesture

```tsx
const { 
  gesture,         // Current gesture state
  onTouchStart,    // Register touch start handler
  onTouchMove,     // Register touch move handler
  onTouchEnd,      // Register touch end handler
  onTouchCancel    // Register touch cancel handler
} = KlintGesture()
```

Handles touch gestures for mobile devices.

### Gesture properties
- `active`: Boolean indicating if gesture is active
- `touches`: Current touch list
- `scale`: Pinch scale factor
- `rotation`: Rotation angle
- `deltaX`, `deltaY`: Movement delta
- `velocityX`, `velocityY`: Movement velocity

## Example

```tsx
import { Klint, useKlint, useStorage, type KlintContext } from "@shopify/klint";

export function KlintCanvas() {
  // Initialize hooks
  const { context, KlintMouse, KlintImage, KlintWindow } = useKlint();
  const { mouse, onClick } = KlintMouse();
  const { onResize } = KlintWindow();
  const { images, loadImages } = KlintImage();
  
  // Set up storage
  const P = useStorage({
    clickCount: 0,
    lastPosition: { x: 0, y: 0 }
  });

  // Set up event handlers
  onClick((ctx, e) => {
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
- Event handlers are automatically cleaned up on component unmount
- The `loadImages` function returns a promise that resolves when all images are loaded
- Mouse coordinates are relative to the canvas origin setting
- Touch gestures work on mobile devices and touch-enabled screens 