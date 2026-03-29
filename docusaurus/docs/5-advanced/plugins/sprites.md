---
sidebar_position: 3
---

# Sprites

The Sprites plugin manages sprite sheets and provides built-in animation support.

## Loading Sprites

```tsx
import { Sprites } from '@shopify/klint/plugins';

useEffect(() => {
  Sprites.load({
    name: 'player',
    url: '/sprites/player.png',
    spriteWidth: 32,
    spriteHeight: 32,
    gap: 0
  });
}, []);
```

## Drawing Sprites

```tsx
const draw = (K) => {
  const sheet = Sprites.sheet('player');
  if (!sheet) return;

  const frame = Math.floor(K.frame / 10) % sheet.numSprites;
  Sprites.draw(K, 'player', frame, 100, 100, {
    width: 64,
    height: 64,
    rotation: 0.5,
    scale: 2,
    flipX: false,
    flipY: false,
    alpha: 1.0
  });
};
```

## Sprite Animations

```tsx
const [animation] = useState(() =>
  Sprites.animation('player', 0, 7, 100) // start, end, frameDuration(ms)
);

const draw = (K) => {
  animation.update(K.deltaTime);
  animation.draw(K, 200, 200);

  // Control playback
  // animation.play();
  // animation.pause();
  // animation.stop();
  // animation.setLoop(true);
  // animation.setFrame(3);
};
```

## Utility Methods

```tsx
if (Sprites.hasSheet('player')) { }

const sheet = Sprites.sheet('player');
console.log(sheet.numSprites, sheet.cols, sheet.rows);

const names = Sprites.getSheetNames();

Sprites.unload('player');
Sprites.clear();
```
