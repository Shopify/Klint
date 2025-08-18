
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
- [ ] Vite hotreload creates slows down
- [x] Window.resize event inconsistent
- [x] Refactor event listener to abort controler

#### Fixes + upgrades
- [x] Arguments order is wrong on roundedRect
    [x] Update docs
- [x] Line breaks in text()
- [ ] Paragraph break : https://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks
- [x] clip
- [x] Review Editor
- [x] Add keyboard listener
- [ ] Triangle strip and Quad strip
- [x] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
    [x] Added 'revert' flag for contours
    [x] Make Tests docs
    [x] Update docs
- [x] Filters
- [x] Make vectors 3D + add cross, slerp and 3d transforms
- [x] Essential plugins to be included in the library
    [x] Update docs

### Elements 
- [ ] Basic Grids : 2D, radial 
- [ ] Responsive grid : CSS-like responsivenes - to think about
- [ ] Noise + pseudo-random : https://github.com/sneha-belkhale/noisejs/blob/master/perlin.js
- [ ] Refactor timeline : https://github.com/arthurcloche/mini-timeline
- [ ] Controls : test Leva
- [ ] SDF effector : shader like advanced dist function 
- [ ] Hotspot : note ( Path 2D for custom shapes + ctx.isPointInPath())
- [ ] Draggables 
- [x] Easing 
- [x] Bezier + Bezier sampling + normals 
- [ ] Svg Filter
- [x] Timeline 
- [ ] Text Animation
- [ ] Sprites  : https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
- [ ] Shader Filter => wegGPU applied on canvas, 'afterDraw()'
- [ ] From Bytes, From base64

###  Plugins
- [ ] Text To Points : https://github.com/arthurcloche/font-to-svg
- [ ] Recorder : use miniRecorder
- [ ] Projector 
- [ ] Polyline 2D
- [ ] Quadtree
- [ ] Svg parsing + rendering 
- [ ] Catmull Curve :  path smoothing and auto-rounded Strips, rounding
- [ ] 2D shapes builder : constructive geometry 
- [ ] Advanced bezier : see bezier.js
- [ ] Springs
- [ ] Particles 
- [ ] Worker
- [ ] Bitmap font rendering => render to image, get atlas of chars on texture, text composer
- [ ] True SSR => return base64

### Considerations 
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
