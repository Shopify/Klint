
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
- [ ] Vite hotreload creates slows down
- [ ] Window.resize event inconsistent


#### Fixes
- [ ] Arguments order is wrong on roundedRect
- [ ] Dissociate Klint and the 2D context : confusing autocomplete
- [ ] Line breaks in text()
- [ ] CSS text style cloner : https://blog.steveasleep.com/how-to-draw-multi-line-text-on-an-html-canvas-in-2021
- [ ] Paragraph break : https://stackoverflow.com/questions/5026961/html5-canvas-ctx-filltext-wont-do-line-breaks
- [ ] clip
- [ ] Triangle strip and Quad strip
- [ ] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
- [ ] Filters
- [ ] Add url params
- [ ] Make vectors 3D
- [ ] Add PI and TWO_PI
- [ ] useImage not working like i wanted it to, inconsistent
- [ ] Essential plugins to be included in the library

### Doc
- [ ] Update dependency
- [ ] Build homepage

### Editor
- [ ] Update dependency

### Nice to have
- [ ] Make the loadVideo hook 
- [ ] Make the useGestures hook 

## ESSENTIALS PLUGINS
- [ ] Hotspot : note ( Path 2D for custom shapes + ctx.isPointInPath()) 
- [ ] Draggables 
- [ ] Grids : 2D, responsive, radial 
- [ ] Curve : Strips, rounding
- [ ] Vector2D & Matrix
- [ ] Noise + pseudo-random
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage
- [ ] Noise + pseudo-random
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