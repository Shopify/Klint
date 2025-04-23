# Klint

A modern creative coding library for React applications that provides an intuitive interface to HTML Canvas 2D rendering. Klint simplifies the process of creating interactive graphics, animations, and visualizations.

## Features

- React integration with hooks and components
- Intuitive drawing API inspired by Processing and P5.js
- Responsive canvas that automatically resizes
- Support for animations, static renderings, and interactive content
- Built-in utilities for managing state, input, and resources

## Example

```jsx
import { Klint, useKlint, type KlintContext } from "klint";

function AnimatedCircle() {
  const { context } = useKlint();

  const draw = (K: KlintContext) => {
    K.background("#222");
    K.fillColor("red");
    
    // Draw a pulsing circle at the center of the canvas
    const size = 50 + Math.sin(K.frame * 0.05) * 25;
    K.circle(K.width/2, K.height/2, size);
  };
  
  return <Klint context={context} draw={draw} />;
}
```

## Release Process

This package uses GitHub Actions for automated releases. Here's how to create a new release:

## Development and tests

> **Important:** The Klint library isn't public yet, so you'll need to link it manually. We're working to resolve this soon but for now, you will need to add it to your npm package using npm link.

1. Clone the repository
   ```bash
   git clone https://github.com/Shopify/klint.git
   cd klint
   ```

2. Go to the lib folder and link it locally
   ```bash
   cd lib
   npm link
   ```

3. In your working directory, link to the local Klint
   ```bash
   cd your-project
   npm link klint
   ```

4. Run the dev server:
   ```bash
   npm run dev
   ```

5. When finished, unlink both in your project and the local repo
   ```bash
   # In your project
   npm unlink klint
   
   # In the Klint lib folder
   npm unlink
   ```

6. If you change anything in the library, you will need to rebuild
   ```bash
   # In the Klint lib folder
   npm build
   npm link
   ```

7. I use Vitest for testing
   ```bash
   npm test
   ```

8. Push your commit


Made with love at Shopify, 2025
