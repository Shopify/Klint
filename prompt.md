I have changed my mind about plugins, a plugin should be completly independent from the Klint library and shouldn't require a constructor with the ctx so it can be more transportable, we wont use the 'extend' pattern neither as it is creating some issue with typescript.

The pattern for a plugin should now be : 

import {FontParser, Delaunay, ...} from `@shopify/klint/plugins`

const preload =()=>{

    const font = await FontParser.load(url)

}

const draw=(K)=>{
    // if we need the canvas at some point, we will pass it via callbacks
    const triangles = Delaunay.triangulate(points)
    Delaunay.drawTriangles(K, ...args)


}


We will also implement a couple extra KlintFunctions and Elements : 

# Klint Functions 

## .PI and .TWO_PI/.TAU
Simple shortcut to the Math.PI and Math.PI * 2 

## .paragraph()
 `.paragraph()` function, it will be used to create a multiline paragraph for Klint. Look for the patterns in the KlintFunction file
It should follow the same pattern as the .text() and should be affected by the same font-size, line-height, etc.. 
It's just a better way to make multi-line text

It shoud look like K.paragraph(x,y,width,options={
    justification : 'left','center','right','justified'
    overflow : 0, // 0 by default, if 0, ignores it, if a number >0, will hide the lines that do not fit in the box
    break : 'words' | 'letters', // will define how we break the lines, the characters mode should take the hyphenation
})


I found this online to help you with the 'justify' : 
export interface JustifyLineProps {
  ctx: CanvasRenderingContext2D
  line: string
  spaceWidth: number
  spaceChar: string
  width: number
}

/**
 * This function will insert spaces between words in a line in order
 * to raise the line width to the box width.
 * The spaces are evenly spread in the line, and extra spaces (if any) are inserted
 * between the first words.
 *
 * It returns the justified text.
 */
export default function justifyLine({
  ctx,
  line,
  spaceWidth,
  spaceChar,
  width,
}: JustifyLineProps) {
  const text = line.trim()
  const words = text.split(/\s+/)
  const numOfWords = words.length - 1

  if (numOfWords === 0) return text

  // Width without spaces
  const lineWidth = ctx.measureText(words.join('')).width

  const noOfSpacesToInsert = (width - lineWidth) / spaceWidth
  const spacesPerWord = Math.floor(noOfSpacesToInsert / numOfWords)

  if (noOfSpacesToInsert < 1) return text

  const spaces = spaceChar.repeat(spacesPerWord)

  // Return justified text
  return words.join(spaces)
}


# Elements

## Grid Element

we will make a simple grid helper that will live under K.Grid as the other Elements

const rectgrid = K.Grid.rect(x,y,width,height,count-x,count-y, options={
    origin : 'corner','center' // corner is top-left 
}) // return []{x, y, i, j, id,}

const radialgrid = K.Grid.radial(x,y, radius, count, ring-count, ring-space, options={
    per-step-count : number // default at 0, the amount of items we had to each steps to make the radial grid more harmonious, should be mult by the ring id, going outward.
}) // return []{x, y, i, j, id,}

## Strip Element
 `Strip` will help to create a strip of quads or triangles for a set of points. It will use the index of the points to form either of hull, quads or triangles
If the amount of points is not enough to draw a quad or a triangle, draw only the complete triangles or quads. We are going to add a small callback to color and add some elements per triangle/quad, it should return a string representing the fill color of the shape, we don't care about stroke for now, only the fill color, but it should still behave like a normal shape so if the draw is not defined, it should use the last fill color on the stack, same for stroke. Only the hull doesn't need to return a color in it's draw, it's only a helper to not have to compute the centers etc... manually.

The hull is a bit more complex, let me know if it makes sense.

//triangles
0 - 2 - 4 ...
| / | / |
1 - 3 - 5 ...

K.Strip.triangles(points, draw=(triangle)=>{
    const {id, center, points } = triangle // the id of the triangle, its center, and the position of the 3 points making it {x , y}
    const color = `hsl(id*360, 50, 100)`
    const point = K.circle(center.x,center.y, 5)
    return color 
 })

//quads
0 - 2 - 4 ...
|   |   |
1 - 3 - 5 ...

 K.Strip.quads(points, draw=(quad)=>{
    const {id, center } = quad // the id of the triangle, its baricenter, and the position of the 4 points making it {x , y}
    const color = `hsl(id*360, 50, 100)`
    const point = K.circle(center.x,center.y, 5)
    return color 
 })

//hull
0 - 2 - 4 - ... n-1
|                 |
1 - 3 - 5 - ... n
 
The hull is little bit different, it will create a single hull from a set of points, it should follow the winding order. 
In this case, the final order of the points to draw the shape would be 
begin 0 - 2 - 4 ... n-1, n ,... - 5 - 3 - 1 close end

The id and the centers will be slightly different too, for the hull, the id will represent a vertical pair
so the pair [0 , 1] is id == 0, the pair [ 2 - 3] is id == 1, etc. , if the points.length is uneven, ignore the last point and last center.
the center will then become a point mid-distance between the two pair represented by the id

so the center of the id == 0 is points[0] + (points[1] - points[0]) * .5

This way we can still align elements on the strip while keeping it a single shape.

 K.Strip.hull(points, draw=(hull)=>{
    const { id, center } = hull
    const color = `hsl(id*360, 50, 100)`
    const point = K.circle(center.x,center.y, 5)
 })


## Noise Element

The noise element will generate a perlin noise function from parameters.
You will find a nice example here : https://github.com/sneha-belkhale/noisejs/blob/master/perlin.js

All noise functions should be seedable 
K.Noise.seed(number), if not defined, set randomly

// The noise should take up to 4 parameters
const noise = K.Noise.perlin(x)
const noise = K.Noise.perlin(x,y)
const noise = K.Noise.perlin(x,y,z)
const noise = K.Noise.perlin(x,y,z,w)

// We will also add a Simple
const noise = K.Noise.simplex(x)
const noise = K.Noise.simplex(x,y)
const noise = K.Noise.simplex(x,y,z)
const noise = K.Noise.simplex(x,y,z,w)

// And some basic hash === seedable random
const noise = K.Noise.hash(x)
const noise = K.Noise.hash(x,y)
const noise = K.Noise.hash(x,y,z)
const noise = K.Noise.hash(x,y,z,w)

## Spritesheet element

A simple spritesheet reader

await K.Sprites.load({name, url,spriteWidth,spriteHeight,gap = 0}, ...)

const spritesheet = K.Sprites.sheet($name) // return for spritesheet 'name' {srcNaturalWidth, srcNaturalHeight, numSprites, spriteWidth, spriteHeight }
const sprite = K.Sprites.draw(spritesheet, sprite:number)