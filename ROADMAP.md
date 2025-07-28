
# TODO
## 💾 Roadmap to Klint 1.0 
#### ( Non-exhaustive and probably highly underestimated ) 
- [ ] Core library 
- [ ] Essentials plugins 
- [ ] Tests 
- [ ] Docs 

## 0.1.0
### Core
#### Bugs
- [x] Vite hotreload creates slows down
- [x] Window.resize event inconsistent

### Elements 
- [ ] Grids : 2D, responsive, radial 
- [ ] Noise + pseudo-random : https://github.com/sneha-belkhale/noisejs/blob/master/perlin.js
- [ ] Refactor timeline : https://github.com/arthurcloche/mini-timeline
- [ ] Controls 
- [ ] Recorder : https://github.com/arthurcloche/canvas-recorder
- [ ] Text To Points : https://github.com/arthurcloche/font-to-svg

#### Fixes
- [x] Arguments order is wrong on roundedRect
    [x] Update docs
- [x] Line breaks in text()
- [ ] CSS text style cloner : https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021
- [ ] Paragraph break : https://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks
- [x] clip
- [x] Review Editor
- [x] Add keyboard listener
- [ ] Triangle strip and Quad strip
- [x] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
    [x] Added 'revert' flag for contours
    [x] Make Tests docs
    [x] Update docs
- [ ] Filters
- [ ] Make vectors 3D + add cross, slerp and 3d transforms
- [x] Essential plugins to be included in the library
    [x] Update docs

### Considerations 
- [ ] Create a singe useFrame() hook similar to Three Fiber
- [x] Add relativeTo(), lookAt(), rotate(), fromAngle(), toScreen(), slerp()
- [ ] Add PI and TWO_PI
- [ ] Consider url params
- [x] Make the loadVideo hook 
- [x] Make the useGestures hook 
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage

### Doc
- [x] Update dependency
- [ ] Build homepage

### Editor
- [ ] Consider url params
- [x] Update dependency

##  PLUGINS
- [ ] SDF effector
- [ ] Hotspot : note ( Path 2D for custom shapes + ctx.isPointInPath())
- [ ] Curve : Strips, rounding
- [ ] Draggables 
- [ ] Catmull Curves : path smoothing and auto-rounded
- [x] Easing 
- [ ] Bezier + Bezier sampling + normals 
- [ ] Svg parsing + rendering 
- [ ] Svg Filter
- [ ] Vector3D
- [ ] Vector4D
- [ ] Projector 
- [x] Timeline 
- [ ] Polyline 2D
- [x] Text Animation
- [ ] 2D shapes builder
- [ ] Sprites  : https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
- [ ] Exports : ffmpeg + svg
- [ ] Shader Filter => wegGPU applied on canvas, 'afterDraw()'
- [ ] From Bytes, From Float
---
## EXTRAS EXTRAS PLUGINS
### will be in an external examples folder
- [ ] Quadtree
- [ ] Particles 
- [ ] Worker
- [ ] Bitmap font rendering => render to image, get atlas of chars on texture, text composer
- [ ] True SSR => return base64
- [ ] URL params => encode / decode

---