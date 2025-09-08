// Core plugin classes for static import
export { default as FontParser } from './FontParser';

// FontParser types - clean interfaces for creative coding
export type { 
  FontData, 
  FontPoint, 
  FontLetter,
  FontLetterWithPath,
  FontLetterWithPoints,
  FontTextBlock,
  FontPathsResult,
  FontPointsResult,
  FontTextOptions
} from './FontParser';

export { Delaunay } from './Delaunay';
export { CatmullRom } from './Catmull';
export { Things } from './Things';
export { ParticleSystem } from './examples/ParticleSystem';
export { Sprites } from './Sprites';

// WIP plugins (to be migrated to new system)
// Temporarily disabled due to build issues
// export * from './wip/BitmapText';
// export * from './wip/Hotspot';
// export * from './wip/Path';
// export * from './wip/SVGfont';