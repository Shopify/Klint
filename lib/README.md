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

1. Make your changes and commit them to the repository
2. Update the version in package.json:
   ```bash
   cd lib
   yarn version --new-version [patch|minor|major]
   ```
   This will:
   - Update the version in package.json
   - Create a git commit with the new version
   - Create a git tag with the new version (e.g., v1.0.0)

3. Push the changes and the tag:
   ```bash
   git push && git push --tags
   ```

4. The GitHub Action will automatically:
   - Run tests
   - Build the package
   - Publish to npm
   - Create a GitHub release with auto-generated release notes

