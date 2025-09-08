
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
- [ ] paragraph()
- [ ] clip()
- [ ] strip()
- [ ] filters
- [ ] 3D vector operations
- [ ] grids

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
    [x] Update docs

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
- [ ] Rubber Band 
- [ ] Layouts : divided grids
- [ ] Layers : pre-rendered offscreen canvas that can be redraw independtly
- [ ] Shader Filter => wegGPU applied on canvas, 'afterDraw()'
- [ ] Svg Filter
- [ ] SDF effector : shader like advanced dist function 
- [ ] Responsive grid/Layout : CSS-like responsivenes - to think about
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
- [ ] Worker
- [ ] Bitmap font rendering => render to image, get atlas of chars on texture, text composer
- [ ] True SSR => return base64

### Considerations 
- [ ] From Bytes, From base64
- [ ] Controls : test Leva
- [ ] Create a singe useFrame() hook similar to Three Fiber
- [x] Add relativeTo(), lookAt(), rotate(), fromAngle(), toScreen(), slerp()
- [x] Add PI and TWO_PI
- [ ] Consider url params
- [x] Make the loadVideo hook 
- [x] Make the useGestures hook 
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage

### Doc
- [x] Update dependency
- [ ] Build homepage

### Editor
- [ ] Add ID to session
- [ ] Make Quick version
- [x] Update dependency
