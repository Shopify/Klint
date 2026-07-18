---
sidebar_position: 2
---

# FontParser

The FontParser plugin loads TTF, OTF, WOFF, and WOFF2 fonts and converts text into vector paths or point arrays, perfect for custom text rendering and animation. The universal parser auto-detects the format and is asynchronous.

## Features

- Load TTF, OTF, WOFF, and WOFF2 fonts from URLs or buffers
- Convert text to Path2D objects for rendering
- Convert text to point arrays for particle effects
- Full layout control (alignment, spacing, baseline)
- Variable font support
- Multi-line text support

## Supported Formats

- TTF (TrueType outlines, including supported variable-font axes)
- OTF (static CFF v1 outlines)
- WOFF
- WOFF2

CFF2 variable outlines are not yet supported. WOFF2 decoding uses the browser's Brotli `DecompressionStream` when available and Node's Brotli implementation in Node.js. Other runtimes can pass a custom `{brotli}` decoder.

For smaller format-specific bundles, import the parser directly:

```ts
import {parseTTF} from '@shopify/klint/plugins/FontParser/ttf';
import {parseOTF} from '@shopify/klint/plugins/FontParser/otf';
import {parseWOFF} from '@shopify/klint/plugins/FontParser/woff';
import {parseWOFF2} from '@shopify/klint/plugins/FontParser/woff2';
```

TTF and OTF parsing is synchronous. WOFF, WOFF2, and the auto-detecting `FontParser` API are asynchronous.

## Basic Usage

```tsx
import { FontParser } from '@shopify/klint/plugins';

function TextSketch() {
  const [font, setFont] = useState(null);

  useEffect(() => {
    const parser = new FontParser();
    parser.load('/fonts/MyFont.ttf').then(setFont);
  }, []);

  const draw = (K) => {
    if (!font) return;

    K.background('#000');
    K.fillColor('#fff');

    const result = font.toPaths('Hello', 100);

    result.letters.forEach(letter => {
      K.push();
      K.translate(K.width / 2 + letter.center.x, K.height / 2 + letter.center.y);
      K.fill(letter.path);
      K.pop();
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Klint context={context} draw={draw} />
    </div>
  );
}
```

## Text to Points

Convert text to point arrays for particle effects:

```tsx
const draw = (K) => {
  if (!font) return;

  const result = font.toPoints('KLINT', 200, {
    sampling: 0.5,
    align: 'center',
    baseline: 'center'
  });

  result.letters.forEach(letter => {
    letter.shape.forEach(point => {
      const x = K.width / 2 + letter.center.x + point.x;
      const y = K.height / 2 + letter.center.y + point.y;
      const noise = K.Noise.perlin(point.x * 0.01, point.y * 0.01, K.time);

      K.fillColor('#fff');
      K.circle(x + noise * 20, y + noise * 20, 2);
    });
  });
};
```

## Layout Options

```tsx
const options = {
  align: 'left' | 'center' | 'right',
  baseline: 'top' | 'center' | 'bottom',
  anchor: 'default' | 'center',
  letterSpacing: 10,
  lineSpacing: 20,
  wordSpacing: 30,
  sampling: 0.5,          // point density (toPoints only)
  axisValues: [400, 700]  // variable font axes
};

const result = font.toPaths('Multi\nLine\nText', 60, options);
```

## Variable Fonts

```tsx
if (font.fvar) {
  const axes = font.fvar[0];

  const weight = 400 + Math.sin(K.time) * 300;
  const result = font.toPaths('Variable', 100, {
    axisValues: [weight]
  });
}
```

## Font Metadata

```tsx
const metadata = {
  unitsPerEm: font.head.unitsPerEm,
  ascender: font.hhea.ascender,
  descender: font.hhea.descender,
  fontFamily: font.name?.fontFamily,
  postScriptName: font.name?.postScriptName
};
```

## Example: Animated Text Particles

```tsx
const draw = (K) => {
  if (!font) return;

  K.background('#000');

  const result = font.toPoints('KLINT', 150, {
    align: 'center',
    baseline: 'center',
    sampling: 0.3
  });

  result.letters.forEach(letter => {
    letter.shape.forEach((point, i) => {
      const angle = K.time + i * 0.1;
      const radius = Math.sin(angle) * 10;
      const x = K.width / 2 + letter.center.x + point.x + Math.cos(angle) * radius;
      const y = K.height / 2 + letter.center.y + point.y + Math.sin(angle) * radius;

      K.fillColor(`hsl(${i * 10}, 70%, 60%)`);
      K.circle(x, y, 2);
    });
  });
};
```
