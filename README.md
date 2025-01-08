# Winter 24 Hackdays : 🎨 Klint
---
- 📖 [Vault](https://hackdays.shopify.io/projects/19268)
- 📖 [Video](https://hackdays.shopify.io/projects/19268)

### TL.DR
🛰️ Loading ...

### Participants
- 🔑 Arthur Cloche — @ac
- 👩‍💻 Carolyne McNeilly — @Carolyn McNeillie
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


# TODO
## 💾 Roadmap to Klint 1.0 
#### ( Non-exhaustive and probably highly underestimated ) 
- [ ] Core library
- [ ] Essentials plugins
- [ ] Dev => optimization, types, ... 
- [ ] QA + reviews

## CORE
- [x] describe => HTMLElement
- [x] Points => strokeRect(x,y,1,1)
- [x] Lines 
- [ ] Arcs
- [x] Better mouse & touch listeners
- [x] Custom shape + contours
- [ ] Add other types of vertices
- [x] Text measurement 
- [x] distance, clamp, lerp, wrap, remap
- [x] blending operations
- [ ] better text options
- [x] line joints and caps
- [ ] clip
- [x] pixels array data but considering removing it
- [ ] Loading ... state + onDoneLoading callback
- [x] improve extend to flag duplicates
- [x] preload
- [x] better loadImage & passImage
- [x] better options : fps, origin : center, ...options
- [x] better configs + clone : clone canvas features
- [x] no canvas mode => favicon - toBase64()
- [x] add proper framecount
- [ ] add callback to mouse actions and resize
- [ ] Triangle strip and Quad strip
- [ ] Filters
- [x] Gradients
- [x] Offscreen Canvas + foreign => pass an external canvas to the renderer as an image

## TO DO

## TESTS

## ESSENTIALS PLUGINS
### will be in the main lib
- [ ] Hotspot : note ( Path 2D circle and square : ctx.isPointInPath()) 
- [ ] Colors : Lerp color, grayscale, gradients & Color Modes 
- [ ] Grids : 2D, responsive, radial 
- [x] Text helper : paragraph, precise bounding, text directions, circular text, text on a path & wrap ( char || words )
- [ ] Vector2D & Matrix
- [ ] Noise
- [ ] Loading State fallback
- [ ] Pixels array : load, set, copy & update => ! set Canvas to willReadOften if loaded, needs to happen at preload stage

## DEV
- [ ] Add loading state if external libs are imported in the Klint lifecycle
- [ ] Figuring out bundles of plugins
- [ ] Refresh GTP prompt

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
- [ ] Stagger 
- [x] Timeline 
- [ ] Polyline 2D
- [x] Text Animation
- [ ] 2D shapes builder
- [ ] Sprites  : https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap
- [ ] Exports
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
## Sources
### Maths

Fast Approximate Distance Functions (https://www.flipcode.com/archives/Fast_Approximate_Distance_Functions.shtml)[link]