
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


#### Fixes
- [ ] Arguments order is wrong on roundedRect
    [ ] Update docs
- [ ] Line breaks in text()
- [ ] CSS text style cloner : https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021
- [ ] Paragraph break : https://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks
- [ ] clip
- [ ] Triangle strip and Quad strip
- [x] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
    [x] Added 'revert' flag for contours
    [x] Make Tests docs
    [x] Update docs
- [ ] Filters

- [ ] Make vectors 3D + add cross and 3d transforms
- [ ] Add PI and TWO_PI
- [x] Essential plugins to be included in the library
    [ ] Update docs

### Considerations 
- [ ] Dissociate Klint and the 2D context : confusing autocomplete
- [ ] Create a singe useFrame() hook similar to Three Fiber
- [ ] Add url params

### Doc
- [ ] Update dependency
- [ ] Build homepage

### Editor
- [ ] Update dependency

### Nice to have
- [ ] Make the loadVideo hook 
- [ ] Make the useGestures hook 

## ELEMENTS
- [ ] Hotspot : note ( Path 2D for custom shapes + ctx.isPointInPath()) 
- [ ] Draggables 
- [ ] Grids : 2D, responsive, radial 
- [ ] Curve : Strips, rounding
- [ ] Vector2D & Matrix
- [ ] Noise + pseudo-random
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage
## EXTRAS PLUGINS
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
- [ ] Opentype.js || typr.js support + text to points
---