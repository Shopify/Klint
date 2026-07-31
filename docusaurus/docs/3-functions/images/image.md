# image

```ts
image(
  img: Image | ImageBitmap | HTMLCanvasElement | HTMLVideoElement | ImageData,
  x: number,
  y: number,
  width?: number,
  height?: number,
  sx?: number,
  sy?: number,
  sWidth?: number,
  sHeight?: number
) => void
```

Draws an image on the canvas. Can crop and resize the source image if needed.

## Parameters
- `img`: The image to be drawn. Can be an Image object, ImageBitmap, canvas element, video element, or ImageData
- `x`: The x-coordinate on the canvas where to place the top-left corner of the image
- `y`: The y-coordinate on the canvas where to place the top-left corner of the image
- `width` (optional): The width to draw the image (resizes the image if different from its natural width)
- `height` (optional): The height to draw the image (resizes the image if different from its natural height)
- `sx` (optional): The x-coordinate of the top-left corner of the sub-rectangle of the source image to draw
- `sy` (optional): The y-coordinate of the top-left corner of the sub-rectangle of the source image to draw
- `sWidth` (optional): The width of the sub-rectangle of the source image to draw
- `sHeight` (optional): The height of the sub-rectangle of the source image to draw

## Example
```tsx
// Load and draw an image
const img = new Image()
img.src = "path/to/image.jpg"

// Basic usage - draw when loaded
img.onload = () => {
  K.image(img, 0, 0)
}

// Resized to fit specific dimensions
img.onload = () => {
  K.image(img, 50, 50, 300, 200)
}

// Draw a cropped portion
img.onload = () => {
  // Draw only the area from (100,100) to (300,300) of the source image
  // And place it at position (10,10) with size 200x200
  K.image(img, 10, 10, 200, 200, 100, 100, 200, 200)
}

// In JSX component with useKlint
import { useKlint, Klint } from '@shopify/klint';

function ImageSketch() {
  const { context, KlintImage } = useKlint();
  const images = KlintImage();
  
  const preload = async (K: KlintContext) => {
    await images.loadImage('texture', 'assets/texture.png');
  };
  
  const draw = (K: KlintContext) => {
    const img = images.getImage('texture');
    
    if (img) {
      // Apply transformations
      K.push();
      K.translate(K.width/2, K.height/2);
      K.rotate(K.frame * 0.01);
      const imageScale = 0.5 + Math.sin(K.frame * 0.05) * 0.1;
      K.scale(imageScale, imageScale);
      
      // Draw image centered (set image origin to center)
      K.setImageOrigin('center');
      K.image(img, 0, 0);
      K.pop();
      
      // Draw a tiled version with lower opacity
      K.opacity(0.3);
      K.setImageOrigin('corner'); // Reset to corner
      for (let x = 0; x < K.width; x += 50) {
        for (let y = 0; y < K.height; y += 50) {
          K.image(img, x, y, 50, 50);
        }
      }
      K.opacity(1); // Reset opacity
    }
  };
  
  return <Klint context={context} preload={preload} draw={draw} />;
}
```

## Notes
- Use `KlintImage()` hook from `useKlint()` to load images in React components
- Images default to being drawn at their natural size if width/height not specified
- The position of the image is controlled by `setImageOrigin()`: "corner" (default) or "center"
- For sprite sheets, use the crop parameters (sx, sy, sWidth, sHeight)
- For smooth scaling, ensure the image is properly loaded before drawing (use `preload()`)
- Be mindful of CORS restrictions when loading external images
- Supports HTMLImageElement, HTMLCanvasElement, OffscreenCanvas, and KlintContext