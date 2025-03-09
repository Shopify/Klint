
# TODO
## 💾 Roadmap to Klint 1.0 
#### ( Non-exhaustive and probably highly underestimated ) 
- [ ] Core library 
- [ ] Essentials plugins 
- [ ] Tests 
- [ ] Docs 

## CORE

### TO DO
- [ ] Make the loadVideo hook 
- [ ] Make the useGestures hook 

### Non Blocking
- [ ] clip
- [ ] Triangle strip and Quad strip
- [ ] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
- [ ] Filters

## TESTS
- [ ] Add unit tests for Klint Functions

## DOCS
- [ ] Add Docusaurus



## ESSENTIALS PLUGINS
### will be in the main lib
- [ ] Hotspot : note ( Path 2D for custom shapes + ctx.isPointInPath()) 
- [ ] Grids : 2D, responsive, radial 
- [ ] Curve : Strips, rounding
- [ ] Vector2D & Matrix
- [ ] Noise + pseudo-random
- [ ] Advanced Pixels array : load, set, copy & update => Done but considering removing it. Should set Canvas to willReadOften if loaded, needs to happen at preload stage

## EXTRAS PLUGINS
### will be in an external extras folder
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