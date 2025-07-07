# Time

The Time element provides advanced timeline management and animation sequencing capabilities for complex animations.

## Access

```tsx
const draw = (K: KlintContext) => {
  // Access the Time element
  K.Time.timeline("main").use(K.time * 0.001).for(5);
  const progress = K.Time.progress();
}
```

## Core Methods

### timeline(key)

```ts
timeline(key: string) => Time
```

Creates or switches to a named timeline. Each timeline maintains its own progress and duration.

```tsx
// Create and switch to "intro" timeline
K.Time.timeline("intro")

// Create multiple timelines
K.Time.timeline("main")
K.Time.timeline("outro")
K.Time.timeline("background")
```

### use(progress)

```ts
use(progress: number) => Time
```

Sets the progress for the current timeline. Progress is automatically wrapped based on duration.

```tsx
// Use global time as progress
K.Time.timeline("main").use(K.time * 0.001)

// Use frame-based progress
K.Time.timeline("loop").use(K.frame * 0.02)

// Manual progress control
K.Time.timeline("custom").use(someProgressValue)
```

### for(duration)

```ts
for(duration: number) => Time
```

Sets the duration for the current timeline. This affects how progress wrapping works.

```tsx
// 5-second timeline
K.Time.timeline("main").for(5)

// 120-frame timeline
K.Time.timeline("frameBasedAnim").for(120)

// Infinite timeline (no wrapping)
K.Time.timeline("infinite").for(0)
```

### progress()

```ts
progress() => number
```

Returns the current progress (0-1) of the active timeline.

```tsx
const p = K.Time.timeline("main").progress()

// Use progress for animation
const rotation = p * Math.PI * 2
K.rotate(rotation)
```

## Advanced Methods

### stagger(num, offset?, callback?)

```ts
stagger(num: number, offset?: number, callback?: (progress: number, id: number, num: number) => void) => Time | Array<{id: number, progress: number}>
```

Creates staggered animations with delayed timing for multiple elements.

```tsx
// With callback - immediate execution
K.Time.timeline("stagger").use(K.time * 0.001).for(3)
K.Time.stagger(10, 0.1, (progress, id, num) => {
  const x = 50 + id * 80
  const y = 200 + progress * 200
  
  K.fillColor(`hsl(${id * 36}, 70%, 60%)`)
  K.circle(x, y, 20 + progress * 10)
})

// Without callback - returns array for manual iteration
K.Time.timeline("delayed").use(K.time * 0.0005).for(4)
const staggers = K.Time.stagger(8, 0.2)
staggers.forEach((stagger, i) => {
  const scale = 0.5 + stagger.progress * 1.5
  K.push()
  K.translate(100 + i * 60, 300)
  K.scale(scale)
  K.fillColor("cyan")
  K.rectangle(-15, -15, 30, 30)
  K.pop()
})
```

### between(from?, to?, callback)

```ts
between(from?: number, to?: number, callback: (progress: number) => void) => Time
```

Executes callback only when timeline progress is between specified range, with normalized progress.

```tsx
K.Time.timeline("sequence").use(K.time * 0.0008).for(6)

// First third of timeline (0-2 seconds)
K.Time.between(0, 0.33, (p) => {
  K.fillColor(`rgba(255, 0, 0, ${p})`)
  K.circle(200, 200, 50 + p * 50)
})

// Middle third (2-4 seconds)  
K.Time.between(0.33, 0.66, (p) => {
  K.fillColor("blue")
  K.rectangle(100 + p * 200, 300, 50, 50)
})

// Final third (4-6 seconds)
K.Time.between(0.66, 1, (p) => {
  const eased = K.Easing.bounceOut(p)
  K.fillColor("green")
  K.circle(400, 100 + eased * 100, 30)
})
```

## Animation Patterns

### Sequential Animation

```tsx
const draw = (K: KlintContext) => {
  K.background("#222")
  
  // 8-second sequence
  K.Time.timeline("sequence").use(K.time * 0.001).for(8)
  
  // Phase 1: Fade in (0-2s)
  K.Time.between(0, 0.25, (p) => {
    K.opacity(p)
    K.fillColor("white")
    K.textAlign("center", "middle")
    K.textSize(48)
    K.text("Hello", K.width/2, K.height/2)
  })
  
  // Phase 2: Scale up (2-4s)
  K.Time.between(0.25, 0.5, (p) => {
    const scale = 1 + p * 0.5
    K.push()
    K.translate(K.width/2, K.height/2)
    K.scale(scale)
    K.fillColor("yellow")
    K.textAlign("center", "middle")
    K.textSize(48)
    K.text("World", 0, 0)
    K.pop()
  })
  
  // Phase 3: Rotate (4-6s)
  K.Time.between(0.5, 0.75, (p) => {
    const rotation = p * Math.PI * 2
    K.push()
    K.translate(K.width/2, K.height/2)
    K.rotate(rotation)
    K.fillColor("cyan")
    K.rectangle(-50, -25, 100, 50)
    K.pop()
  })
  
  // Phase 4: Fade out (6-8s)
  K.Time.between(0.75, 1, (p) => {
    K.opacity(1 - p)
    K.fillColor("red")
    K.circle(K.width/2, K.height/2, 100)
  })
}
```

### Parallel Timelines

```tsx
const draw = (K: KlintContext) => {
  K.background("#111")
  
  // Background animation (slow, 10 seconds)
  K.Time.timeline("background").use(K.time * 0.0001).for(10)
  const bgProgress = K.Time.progress()
  K.fillColor(`hsl(${bgProgress * 360}, 30%, 15%)`)
  K.rectangle(0, 0, K.width, K.height)
  
  // Main content (fast, 2 seconds)  
  K.Time.timeline("main").use(K.time * 0.001).for(2)
  const mainProgress = K.Time.progress()
  K.fillColor("white")
  K.circle(
    K.width/2 + Math.cos(mainProgress * Math.PI * 4) * 100,
    K.height/2 + Math.sin(mainProgress * Math.PI * 4) * 100,
    20
  )
  
  // UI elements (medium, 5 seconds)
  K.Time.timeline("ui").use(K.time * 0.0004).for(5)
  const uiProgress = K.Time.progress()
  K.fillColor(`rgba(255, 255, 255, ${0.5 + Math.sin(uiProgress * Math.PI * 2) * 0.3})`)
  K.textAlign("center", "top")
  K.textSize(24)
  K.text(`Progress: ${Math.round(mainProgress * 100)}%`, K.width/2, 50)
}
```

### Complex Staggered Animation

```tsx
const draw = (K: KlintContext) => {
  K.background("#000")
  
  // Setup timeline
  K.Time.timeline("wave").use(K.time * 0.0008).for(4)
  
  // Grid of staggered elements
  const cols = 12
  const rows = 8
  K.Time.stagger(cols * rows, 0.05, (progress, id, total) => {
    const col = Math.floor(id * cols) % cols
    const row = Math.floor(id * cols / cols)
    
    const x = 50 + col * 50
    const y = 50 + row * 60
    
    // Apply easing
    const easedProgress = K.Easing.elasticOut(progress)
    
    // Size and color based on progress
    const size = 5 + easedProgress * 25
    const hue = (id * 15 + progress * 120) % 360
    
    K.fillColor(`hsl(${hue}, 80%, ${40 + progress * 40}%)`)
    K.circle(x, y, size)
  })
}
```

### Timeline Synchronization

```tsx
const draw = (K: KlintContext) => {
  // Initialize master timeline
  if (!K.State.has('masterTime')) {
    K.State.set('masterTime', 0)
  }
  
  // Update master time
  let masterTime = K.State.get('masterTime')
  masterTime += K.deltaTime * 0.001  // seconds
  K.State.set('masterTime', masterTime)
  
  K.background("#333")
  
  // Synchronized timelines
  K.Time.timeline("sync1").use(masterTime).for(3)
  K.Time.between(0, 1, (p) => {
    K.fillColor("red")
    K.circle(100, 200 + Math.sin(p * Math.PI * 2) * 50, 30)
  })
  
  K.Time.timeline("sync2").use(masterTime * 2).for(3)  // Double speed
  K.Time.between(0, 1, (p) => {
    K.fillColor("blue")
    K.circle(300, 200 + Math.sin(p * Math.PI * 2) * 50, 30)
  })
  
  K.Time.timeline("sync3").use(masterTime * 0.5).for(3)  // Half speed
  K.Time.between(0, 1, (p) => {
    K.fillColor("green")
    K.circle(500, 200 + Math.sin(p * Math.PI * 2) * 50, 30)
  })
}
```

## Best Practices

- **Use meaningful timeline names**: "intro", "main", "outro" instead of "t1", "t2"
- **Chain methods**: `K.Time.timeline("main").use(K.time * 0.001).for(5)`
- **Normalize durations**: Use seconds for time-based, frames for frame-based
- **Combine with Easing**: Apply easing functions to progress values for smoother animations
- **Use `between()` for sequences**: Clean way to create multi-phase animations
- **Leverage `stagger()`**: Perfect for grid animations, text reveals, particle systems

## Notes

- Default timeline duration is 480 frames (8 seconds at 60fps)
- Progress automatically wraps when duration > 0
- Each timeline maintains independent state
- `stagger()` creates delayed animations with configurable offset
- `between()` normalizes progress to 0-1 within the specified range
- Method chaining allows concise timeline setup
- Works seamlessly with `K.time`, `K.frame`, or custom progress sources 