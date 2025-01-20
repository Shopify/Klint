# 🎨 Klint

## Getting started


# TODO
## 💾 Roadmap to Klint 1.0 
#### ( Non-exhaustive and probably highly underestimated ) 
- [ ] Core library 
- [ ] Essentials plugins 
- [ ] Tests 
- [ ] Docs 

## CORE

### Blocking
- [ ] onLoading & onError : to finish, not sure if it the right direction or it should be handled outside.
- [x] Props handling and update.

### Non Blocking
- [ ] clip
- [ ] Triangle strip and Quad strip
- [ ] Add other types of vertices : bezierTo(), quadraticTo(), arcTo(),
- [ ] Filters
- [ ] Refresh GTP prompt
- [ ] Figuring out bundles, packages and plugins

## TESTS

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


## The origin : Winter 24 Hackdays : 🎨 Klint
---
- 📖 [Vault](https://hackdays.shopify.io/projects/19268)
- 📖 [Video](https://hackdays.shopify.io/projects/19268)

### TL.DR
🛰️ Loading ...

### Participants
- 🔑 Arthur Cloche — @ac
- 👩‍💻 Carolyn McNeillie — @Carolyn McNeillie
- 👨‍💻 John Bogan — @bogan
- 👨‍💻 Dane Sun - @Dane
- 👨‍💻 Eric Johnson - @Eric Johnson

Guest appearance from :
- 💡 Ateş Göral — @atesgoral
- 💡 Josh Sanger — @josh.sanger
- 💡 Mikko Haapoja — @mikko

## Development

Run the dev server:

```shellscript
npm run dev
```

## Reference Docs
- [WebCanvasAPI](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [p5.js](https://p5js.org/reference/)


## Sources
### Maths

Fast Approximate Distance Functions (https://www.flipcode.com/archives/Fast_Approximate_Distance_Functions.shtml)[link]