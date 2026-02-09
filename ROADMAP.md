
# TODO
## 💾 Roadmap to Klint 1.0 
#### ( Non-exhaustive and probably highly underestimated ) 
- [ ] Core library 
- [ ] Plugins 
- [ ] Editor 
- [ ] Docs 

## 0.1.0
### Core
#### Bugs
- [x] Vite hotreload creates slows down : fix the useDev()
- [x] Window.resize event inconsistent
- [x] Refactor event listener to abort controler

### Implemented — available for user test 
- [x] paragraph()
- [x] clip()
- [x] strip()
- [x] filters
- [x] 3D vector operations
- [x] grids

#### Fixes + upgrades
##### Library 
- [x] Arguments order is wrong on roundedRect
- [x] Line breaks in text()
- [x] Paragraph break : https://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks
- [x] clip
- [x] Review Editor
- [x] Add keyboard listener
- [x] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
- [x] Filters
- [x] Make vectors 3D + add cross, slerp and 3d transforms
- [x] Essential plugins to be included in the library
- [x] Update docs 
- [ ] loading state
- [ ] Add KlintVideo - consider streaming data
- [x] Add fillrule : non-zero | even-odd
- [x] Add 'default' to K.blend() to reset to default

#### Docs 
- [x] Review images-image.md
- [x] Review images-pixel-manipulation.md
- [x] Review styling-opacity : remove the Klint.State mention, replace with useStorage
- [ ] Review text - text : not sure if accurate
- [ ] Review text - text-styling : not sure if accurate
- [x] Review transforms - push : old
- [x] Review transforms - pop : old
- [x] Review transforms - resetTranform : missing
- [x] Review transforms - applyTransform : missing
- [x] Add missing functions and update according to lasts updates :
    [x] paragraph(),
    [x] clip()
    [x] strip()
    [x] filters
    [ ] 3D vector operations (check Vector.md)
    [ ] grids (check Grid element docs)


### Elements 
- [x] Basic Grids : 2D, radial 
- [x] Noise + pseudo-random : https://github.com/sneha-belkhale/noisejs/blob/master/perlin.js
- [x] Refactor timeline : https://github.com/arthurcloche/mini-timeline
- [x] Hotspot : note ( Path 2D for custom shapes + ctx.isPointInPath())
- [x] Easing 
- [x] Triangle strip and Quad strip
- [x] Bezier + Bezier sampling + normals 
- [x] Timeline 
- [ ] Text element : add animation callback



###  Plugins
- [ ] Auto Responsive grid/Layout : CSS-like responsivenes - to think about
- [ ] Rubber Band 
- [ ] Layouts : divided grids
- [ ] Layers : pre-rendered offscreen canvas that can be redraw independtly
- [ ] Shader Filter => wegGPU applied on canvas, 'afterDraw()'
- [ ] Svg Filter
- [ ] SDF effector : shader like advanced dist function 
- [ ] Draggables 
- [x] Font Parser
- [x] Sprites  : https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
- [ ] Text To Points : https://github.com/arthurcloche/font-to-svg
- [ ] Recorder : use miniRecorder
- [ ] Projector 
- [ ] Polyline 2D
- [ ] Quadtree
- [ ] Svg parsing + rendering 
- [x] Catmull Curve :  path smoothing and auto-rounded Strips, rounding
- [ ] 2D shapes builder : constructive geometry 
- [ ] Advanced bezier : see bezier.js
- [ ] Springs
- [ ] Particles 
- [ ] State Machine : finite state machines with enter/update/exit hooks, conditional auto-transitions, timed transitions with easing. Needs more design thought around API surface and integration patterns.
- [ ] Worker
- [ ] Bitmap font rendering => render to image, get atlas of chars on texture, text composer
- [ ] True SSR => return base64

### Considerations 
- [ ] a `center()` function
- [ ] Await fontLoaded in preload()
- [ ] From Bytes, From base64
- [ ] Controls : test Leva
- [ ] Create a singe useFrame() hook similar to Three Fiber
- [x] Add relativeTo(), lookAt(), rotate(), fromAngle(), toScreen(), slerp()
- [x] Add PI and TWO_PI
- [ ] Consider url params
- [x] Make the useGestures hook 
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage
- [ ] Add a monitor - will return 'good', 'okay', or 'bad' depending on the latency.
- [ ] Add toDeg() and toRad()

### Doc
- [x] Update dependency
- [ ] Build homepage

### Editor
- [ ] Add ID to session
- [ ] Make Quick version
- [x] Update dependency
