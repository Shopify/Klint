# State

The State element provides persistent state management across animation frames.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Access the State element
  K.State.set("frameCount", K.frame);
  const lastFrame = K.State.get("frameCount");
}
```

## Methods

### set(key, value, callback?)

```ts
set(key: string, value: any, callback?: (key: string, value: any) => void) => void
```

Stores a value with an optional callback.

```tsx
// Basic usage
K.State.set("score", 100);

// With callback
K.State.set("playerPosition", { x: 200, y: 300 }, (key, value) => {
  console.log(`Updated ${key}:`, value);
});
```

### get(key, callback?)

```ts
get(key: string, callback?: (key: string, value: any) => void) => any
```

Retrieves a stored value with optional callback.

```tsx
const position = K.State.get("playerPosition");

// With callback
const score = K.State.get("score", (key, value) => {
  if (value > 1000) console.log("High score!");
});
```

### has(key)

```ts
has(key: string) => boolean
```

Checks if a key exists in state.

```tsx
if (!K.State.has("gameStarted")) {
  K.State.set("gameStarted", true);
  K.State.set("startTime", K.time);
}
```

### delete(key, callback?)

```ts
delete(key: string, callback?: (key: string) => void) => void
```

Removes a key from state with optional callback.

```tsx
K.State.delete("tempData");

// With callback
K.State.delete("oldScore", (key) => {
  console.log(`Removed ${key}`);
});
```

### log()

```ts
log() => Map<string, any>
```

Returns the entire state Map for debugging.

```tsx
console.log("Current state:", K.State.log());
```

## Common Patterns

### Initialization

```tsx
const draw = (K: KlintContext) => {
  // Initialize state on first frame
  if (!K.State.has("initialized")) {
    K.State.set("initialized", true);
    K.State.set("particles", []);
    K.State.set("score", 0);
    K.State.set("gameMode", "menu");
  }
  
  // Use state
  const gameMode = K.State.get("gameMode");
  if (gameMode === "menu") {
    drawMenu(K);
  } else if (gameMode === "playing") {
    drawGame(K);
  }
}
```

### Persistent Animation Data

```tsx
const draw = (K: KlintContext) => {
  // Initialize particles
  if (!K.State.has("particles")) {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * K.width,
        y: Math.random() * K.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1
      });
    }
    K.State.set("particles", particles);
  }
  
  // Update particles
  const particles = K.State.get("particles");
  particles.forEach(particle => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= 0.01;
    
    // Respawn dead particles
    if (particle.life <= 0) {
      particle.x = Math.random() * K.width;
      particle.y = Math.random() * K.height;
      particle.life = 1;
    }
  });
  
  // Draw particles
  K.background("#111");
  particles.forEach(particle => {
    K.fillColor(`rgba(255, 255, 255, ${particle.life})`);
    K.circle(particle.x, particle.y, 3);
  });
}
```

### Game State Management

```tsx
const draw = (K: KlintContext) => {
  const { mouse, onClick } = KlintMouse();
  
  // Initialize game state
  if (!K.State.has("gameState")) {
    K.State.set("gameState", {
      mode: "menu",
      score: 0,
      level: 1,
      lives: 3,
      enemies: [],
      powerups: []
    });
  }
  
  const game = K.State.get("gameState");
  
  // Handle click events
  onClick(() => {
    if (game.mode === "menu") {
      game.mode = "playing";
      game.startTime = K.time;
    } else if (game.mode === "gameOver") {
      // Reset game
      game.mode = "menu";
      game.score = 0;
      game.level = 1;
      game.lives = 3;
    }
  });
  
  // Game logic based on mode
  switch (game.mode) {
    case "menu":
      drawMenu(K, game);
      break;
    case "playing":
      updateGame(K, game);
      drawGame(K, game);
      break;
    case "gameOver":
      drawGameOver(K, game);
      break;
  }
}

function updateGame(K, game) {
  // Spawn enemies
  if (!K.State.has("lastEnemySpawn")) {
    K.State.set("lastEnemySpawn", K.time);
  }
  
  if (K.time - K.State.get("lastEnemySpawn") > 2) {
    game.enemies.push({
      x: K.width,
      y: Math.random() * K.height,
      speed: 2 + game.level * 0.5
    });
    K.State.set("lastEnemySpawn", K.time);
  }
  
  // Update enemies
  game.enemies = game.enemies.filter(enemy => {
    enemy.x -= enemy.speed;
    return enemy.x > -50;
  });
  
  // Check for level progression
  if (game.score > game.level * 100) {
    game.level++;
  }
}
```

### State with Validation

```tsx
const draw = (K: KlintContext) => {
  // Initialize with validation
  if (!K.State.has("settings")) {
    const defaultSettings = {
      volume: 0.5,
      difficulty: "normal",
      showFPS: false
    };
    
    K.State.set("settings", defaultSettings, (key, value) => {
      // Validate settings
      if (value.volume < 0 || value.volume > 1) {
        console.warn("Volume must be between 0 and 1");
        value.volume = Math.max(0, Math.min(1, value.volume));
      }
      
      if (!["easy", "normal", "hard"].includes(value.difficulty)) {
        console.warn("Invalid difficulty, resetting to normal");
        value.difficulty = "normal";
      }
    });
  }
  
  // Use settings
  const settings = K.State.get("settings");
  
  // Show FPS if enabled
  if (settings.showFPS) {
    K.fillColor("white");
    K.textSize(16);
    K.text(`FPS: ${Math.round(1000 / K.deltaTime)}`, 20, 30);
  }
}
```

### Undo/Redo System

```tsx
const draw = (K: KlintContext) => {
  const { mouse, onClick } = KlintMouse();
  
  // Initialize history
  if (!K.State.has("history")) {
    K.State.set("history", {
      states: [{ points: [] }],
      currentIndex: 0
    });
  }
  
  const history = K.State.get("history");
  const currentState = history.states[history.currentIndex];
  
  // Add point on click
  onClick(() => {
    const newState = {
      points: [...currentState.points, { x: mouse.x, y: mouse.y }]
    };
    
    // Remove any states after current index (for branching)
    history.states = history.states.slice(0, history.currentIndex + 1);
    
    // Add new state
    history.states.push(newState);
    history.currentIndex++;
    
    // Limit history size
    if (history.states.length > 50) {
      history.states.shift();
      history.currentIndex--;
    }
  });
  
  // Undo/Redo with keyboard (simplified)
  // In real app, you'd use proper key event handling
  
  K.background("#222");
  
  // Draw all points
  currentState.points.forEach((point, i) => {
    K.fillColor(`hsl(${i * 10}, 70%, 60%)`);
    K.circle(point.x, point.y, 10);
  });
  
  // UI
  K.fillColor("white");
  K.textSize(14);
  K.text(`Points: ${currentState.points.length}`, 20, 30);
  K.text(`History: ${history.currentIndex}/${history.states.length - 1}`, 20, 50);
}
```

## Notes

- State persists across all animation frames until manually deleted
- Use State for data that needs to survive between draw calls
- State is instance-specific - different Klint components have separate state
- Perfect for game state, animation data, user preferences
- State callbacks are useful for validation and logging
- Consider using meaningful key names to avoid conflicts
- For complex state, consider storing objects rather than individual values
- State is kept in memory - large datasets should be managed carefully 