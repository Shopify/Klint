import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    'introduction',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/useKlint-pattern',
        'getting-started/typescript',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core-concepts/lifecycle',
        'core-concepts/klint-context',
        'core-concepts/react-integration',
        'core-concepts/coordinates',
      ],
    },
    {
      type: 'category',
      label: 'Function Reference',
      items: [
        {
          type: 'category',
          label: 'Drawing Shapes',
          items: [
            'functions/drawing/circle',
            'functions/drawing/rectangle',
            'functions/drawing/line',
            'functions/drawing/point',
            'functions/drawing/polygon',
            'functions/drawing/arc',
            'functions/drawing/disk',
            'functions/drawing/ellipse',
            'functions/drawing/roundedRectangle',
          ],
        },
        {
          type: 'category',
          label: 'Paths & Vertices',
          items: [
            'functions/paths/beginShape',
            'functions/paths/endShape',
            'functions/paths/vertex',
            'functions/paths/bezierVertex',
            'functions/paths/quadraticVertex',
            'functions/paths/arcVertex',
            'functions/paths/beginContour',
            'functions/paths/endContour',
          ],
        },
        {
          type: 'category',
          label: 'Colors & Styles',
          items: [
            'functions/styling/fillColor',
            'functions/styling/strokeColor',
            'functions/styling/strokeWidth',
            'functions/styling/strokeCap',
            'functions/styling/strokeJoin',
            'functions/styling/noFill',
            'functions/styling/noStroke',
            'functions/styling/opacity',
            'functions/styling/blend',
          ],
        },
        {
          type: 'category',
          label: 'Gradients',
          items: [
            'functions/gradients/gradient',
            'functions/gradients/radialGradient',
            'functions/gradients/conicGradient',
            'functions/gradients/addColorStop',
          ],
        },
        {
          type: 'category',
          label: 'Transformations',
          items: [
            'functions/transforms/translate',
            'functions/transforms/rotate',
            'functions/transforms/scale',
            'functions/transforms/push',
            'functions/transforms/pop',
          ],
        },
        {
          type: 'category',
          label: 'Text',
          items: [
            'functions/text/text',
            'functions/text/klintfunctions-text-styling',
          ],
        },
        {
          type: 'category',
          label: 'Images & Pixels',
          items: [
            'functions/images/image',
            'functions/images/createOffscreen',
            'functions/images/klintfunctions-pixels',
          ],
        },
        {
          type: 'category',
          label: 'Canvas Control',
          items: [
            'functions/canvas/background',
            'functions/canvas/klintfunctions-canvas',
          ],
        },
        {
          type: 'category',
          label: 'Utilities',
          items: [
            'functions/utilities/math-utils',
            'functions/utilities/klintfunctions-time',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Klint Elements',
      items: [
        'elements/Color',
        'elements/Vector',
        'elements/Time',
        'elements/State',
        'elements/Thing',
        'elements/Text',
        'elements/Easing',
      ],
    },
    {
      type: 'category',
      label: 'Advanced Topics',
      items: [
        'advanced/plugins',
        'advanced/web-components',
        'advanced/klint-editor',
        'advanced/mcp-server',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/api-reference',
        'reference/from-p5js',
        'reference/troubleshooting',
        'reference/klint-component',
        'reference/klint-hooks',
      ],
    },
  ],
};

export default sidebars;