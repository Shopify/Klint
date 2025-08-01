---
sidebar_position: 2
---

# Klint Web Components

Use Klint as a web component in any framework or vanilla HTML.

## Installation

```bash
npm install @shopify/klint-web-component
```

## Basic Usage

### In HTML

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    import '@shopify/klint-web-component';
  </script>
</head>
<body>
  <klint-canvas width="800" height="600">
    <script type="text/klint">
      function draw(K) {
        K.background('#000');
        K.fillColor('#ff6b6b');
        K.circle(K.width/2, K.height/2, 50);
      }
    </script>
  </klint-canvas>
</body>
</html>
```

### With External Script

```html
<klint-canvas width="800" height="600" src="./my-sketch.js"></klint-canvas>
```

Where `my-sketch.js`:
```javascript
function setup(K) {
  // Setup code
}

function draw(K) {
  K.background('#000');
  K.fillColor('#fff');
  K.circle(K.mouse.x, K.mouse.y, 30);
}
```

## Attributes

- `width` - Canvas width (default: 800)
- `height` - Canvas height (default: 600)
- `src` - External script URL
- `autoplay` - Start animation automatically (default: true)
- `fps` - Target frame rate (default: 60)

## JavaScript API

```javascript
const canvas = document.querySelector('klint-canvas');

// Control playback
canvas.play();
canvas.pause();
canvas.reset();

// Update size
canvas.width = 1024;
canvas.height = 768;

// Access context
const K = canvas.getContext();

// Listen to events
canvas.addEventListener('frame', (e) => {
  console.log('Frame:', e.detail.frame);
});
```

## Framework Integration

### Vue

```vue
<template>
  <klint-canvas 
    :width="canvasWidth" 
    :height="canvasHeight"
    @frame="onFrame"
  >
    <script type="text/klint">
      function draw(K) {
        K.background('#000');
        K.circle(K.width/2, K.height/2, 50);
      }
    </script>
  </klint-canvas>
</template>

<script>
import '@shopify/klint-web-component';

export default {
  data() {
    return {
      canvasWidth: 800,
      canvasHeight: 600
    };
  },
  methods: {
    onFrame(e) {
      console.log('Frame:', e.detail.frame);
    }
  }
};
</script>
```

### Angular

```typescript
import '@shopify/klint-web-component';

@Component({
  selector: 'app-sketch',
  template: `
    <klint-canvas 
      [width]="width" 
      [height]="height"
      (frame)="onFrame($event)"
    >
      <script type="text/klint">
        function draw(K) {
          K.background('#000');
          K.circle(K.width/2, K.height/2, 50);
        }
      </script>
    </klint-canvas>
  `
})
export class SketchComponent {
  width = 800;
  height = 600;
  
  onFrame(event: CustomEvent) {
    console.log('Frame:', event.detail.frame);
  }
}
```

### Vanilla JavaScript

```javascript
import '@shopify/klint-web-component';

// Create element
const canvas = document.createElement('klint-canvas');
canvas.width = 800;
canvas.height = 600;

// Define sketch
canvas.innerHTML = `
  <script type="text/klint">
    function draw(K) {
      K.background('#000');
      K.fillColor('#ff6b6b');
      K.circle(K.mouse.x, K.mouse.y, 30);
    }
  </script>
`;

// Add to page
document.body.appendChild(canvas);

// Control programmatically
canvas.addEventListener('ready', () => {
  const K = canvas.getContext();
  console.log('Canvas size:', K.width, K.height);
});
```

## Advanced Features

### Dynamic Updates

```javascript
const canvas = document.querySelector('klint-canvas');

// Update sketch code dynamically
canvas.setSketch({
  setup(K) {
    K.background('#000');
  },
  draw(K) {
    K.fillColor(`hsl(${K.time * 0.1}, 70%, 50%)`);
    K.circle(K.width/2, K.height/2, 100);
  }
});
```

### Export Canvas

```javascript
const canvas = document.querySelector('klint-canvas');

// Get image data
const imageData = canvas.toDataURL('image/png');

// Download image
canvas.download('my-sketch.png');

// Get raw canvas element
const rawCanvas = canvas.getCanvas();
```

### Custom Elements

```javascript
// Extend the web component
class MyKlintCanvas extends KlintCanvas {
  constructor() {
    super();
    this.particleCount = 100;
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.setSketch({
      draw: (K) => {
        K.background('#000');
        for (let i = 0; i < this.particleCount; i++) {
          K.fillColor('white');
          K.circle(
            Math.random() * K.width,
            Math.random() * K.height,
            2
          );
        }
      }
    });
  }
}

customElements.define('my-klint-canvas', MyKlintCanvas);
```

## Performance Tips

1. **Use `requestAnimationFrame`** - The web component handles this automatically
2. **Batch DOM updates** - Update attributes together
3. **Cache references** - Store canvas element reference
4. **Use delegation** - For multiple canvases, use event delegation

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- No IE11 support

## Next Steps

- [React Integration](../2-core-concepts/react-integration) - Using Klint in React
- [Function Reference](../3-functions/drawing/circle) - Available functions
- [Examples](/experiments) - Live demos