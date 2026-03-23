
# TODO
## 💾 Roadmap to Klint 1.0 
#### ( Non-exhaustive and probably highly underestimated ) 
- [ ] Core library 
- [ ] Plugins 

#### Fixes + upgrades
##### Library 
- [ ] loading state
- [ ] Add KlintVideo - consider streaming data
- [ ] Add variables axis to text
- [ ] Add font loading from URL

#### Docs 
- [ ] Review text - text : not sure if accurate
- [ ] Review text - text-styling : not sure if accurate
    [ ] 3D vector operations (check Vector.md)
    [ ] grids (check Grid element docs)


### Elements 
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
- [ ] Consider url params
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage
- [ ] Add a monitor - will return 'good', 'okay', or 'bad' depending on the latency.
- [ ] Add toDeg() and toRad()

### Doc
- [ ] Build homepage

### Editor
- [ ] Add ID to session
- [ ] Make Quick version
