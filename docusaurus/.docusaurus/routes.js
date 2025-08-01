import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/experiments/',
    component: ComponentCreator('/experiments/', '960'),
    exact: true
  },
  {
    path: '/experiments/draw',
    component: ComponentCreator('/experiments/draw', '77e'),
    exact: true
  },
  {
    path: '/experiments/mandala',
    component: ComponentCreator('/experiments/mandala', '530'),
    exact: true
  },
  {
    path: '/experiments/mandala2',
    component: ComponentCreator('/experiments/mandala2', '024'),
    exact: true
  },
  {
    path: '/experiments/moire',
    component: ComponentCreator('/experiments/moire', '182'),
    exact: true
  },
  {
    path: '/experiments/moire2',
    component: ComponentCreator('/experiments/moire2', '2d0'),
    exact: true
  },
  {
    path: '/experiments/moire3',
    component: ComponentCreator('/experiments/moire3', 'e0e'),
    exact: true
  },
  {
    path: '/experiments/palette',
    component: ComponentCreator('/experiments/palette', 'e18'),
    exact: true
  },
  {
    path: '/experiments/slimeMould',
    component: ComponentCreator('/experiments/slimeMould', '8ce'),
    exact: true
  },
  {
    path: '/experiments/stripes',
    component: ComponentCreator('/experiments/stripes', 'c20'),
    exact: true
  },
  {
    path: '/experiments/swans17',
    component: ComponentCreator('/experiments/swans17', 'd44'),
    exact: true
  },
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '3d7'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '822'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'a1c'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'e9f'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '30e'),
            routes: [
              {
                path: '/docs/',
                component: ComponentCreator('/docs/', '56e'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/advanced/klint-editor',
                component: ComponentCreator('/docs/advanced/klint-editor', 'b77'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/advanced/mcp-server',
                component: ComponentCreator('/docs/advanced/mcp-server', 'af5'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/advanced/web-components',
                component: ComponentCreator('/docs/advanced/web-components', '230'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/core-concepts/coordinates',
                component: ComponentCreator('/docs/core-concepts/coordinates', '467'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/core-concepts/klint-context',
                component: ComponentCreator('/docs/core-concepts/klint-context', '9f2'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/core-concepts/lifecycle',
                component: ComponentCreator('/docs/core-concepts/lifecycle', '777'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/core-concepts/react-integration',
                component: ComponentCreator('/docs/core-concepts/react-integration', 'f2a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/Color',
                component: ComponentCreator('/docs/elements/Color', '4d9'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/Easing',
                component: ComponentCreator('/docs/elements/Easing', 'e4d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/State',
                component: ComponentCreator('/docs/elements/State', '89b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/Text',
                component: ComponentCreator('/docs/elements/Text', 'd97'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/Thing',
                component: ComponentCreator('/docs/elements/Thing', '989'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/Time',
                component: ComponentCreator('/docs/elements/Time', 'f28'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/elements/Vector',
                component: ComponentCreator('/docs/elements/Vector', '268'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/canvas/background',
                component: ComponentCreator('/docs/functions/canvas/background', 'eba'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/arc',
                component: ComponentCreator('/docs/functions/drawing/arc', '746'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/circle',
                component: ComponentCreator('/docs/functions/drawing/circle', 'e26'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/disk',
                component: ComponentCreator('/docs/functions/drawing/disk', '6b9'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/ellipse',
                component: ComponentCreator('/docs/functions/drawing/ellipse', '838'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/line',
                component: ComponentCreator('/docs/functions/drawing/line', '7c5'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/point',
                component: ComponentCreator('/docs/functions/drawing/point', '29b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/polygon',
                component: ComponentCreator('/docs/functions/drawing/polygon', '96c'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/rectangle',
                component: ComponentCreator('/docs/functions/drawing/rectangle', '2ed'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/drawing/roundedRectangle',
                component: ComponentCreator('/docs/functions/drawing/roundedRectangle', '738'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/gradients/addColorStop',
                component: ComponentCreator('/docs/functions/gradients/addColorStop', '73d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/gradients/conicGradient',
                component: ComponentCreator('/docs/functions/gradients/conicGradient', 'a29'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/gradients/gradient',
                component: ComponentCreator('/docs/functions/gradients/gradient', '6d6'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/gradients/radialGradient',
                component: ComponentCreator('/docs/functions/gradients/radialGradient', '81b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/images/createOffscreen',
                component: ComponentCreator('/docs/functions/images/createOffscreen', '6ca'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/images/image',
                component: ComponentCreator('/docs/functions/images/image', 'c0f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/arcVertex',
                component: ComponentCreator('/docs/functions/paths/arcVertex', '916'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/beginContour',
                component: ComponentCreator('/docs/functions/paths/beginContour', '2c5'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/beginShape',
                component: ComponentCreator('/docs/functions/paths/beginShape', '7d1'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/bezierVertex',
                component: ComponentCreator('/docs/functions/paths/bezierVertex', '568'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/endContour',
                component: ComponentCreator('/docs/functions/paths/endContour', 'fbf'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/endShape',
                component: ComponentCreator('/docs/functions/paths/endShape', '928'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/quadraticVertex',
                component: ComponentCreator('/docs/functions/paths/quadraticVertex', 'd8f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/paths/vertex',
                component: ComponentCreator('/docs/functions/paths/vertex', '8db'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/blend',
                component: ComponentCreator('/docs/functions/styling/blend', 'fcc'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/fillColor',
                component: ComponentCreator('/docs/functions/styling/fillColor', 'a8a'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/noFill',
                component: ComponentCreator('/docs/functions/styling/noFill', '275'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/noStroke',
                component: ComponentCreator('/docs/functions/styling/noStroke', '72f'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/opacity',
                component: ComponentCreator('/docs/functions/styling/opacity', '13c'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/strokeCap',
                component: ComponentCreator('/docs/functions/styling/strokeCap', 'c99'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/strokeColor',
                component: ComponentCreator('/docs/functions/styling/strokeColor', '059'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/strokeJoin',
                component: ComponentCreator('/docs/functions/styling/strokeJoin', '051'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/styling/strokeWidth',
                component: ComponentCreator('/docs/functions/styling/strokeWidth', '8ae'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/text/',
                component: ComponentCreator('/docs/functions/text/', '73b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/transforms/pop',
                component: ComponentCreator('/docs/functions/transforms/pop', 'f66'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/transforms/push',
                component: ComponentCreator('/docs/functions/transforms/push', 'ceb'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/transforms/rotate',
                component: ComponentCreator('/docs/functions/transforms/rotate', '704'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/transforms/scale',
                component: ComponentCreator('/docs/functions/transforms/scale', '221'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/transforms/translate',
                component: ComponentCreator('/docs/functions/transforms/translate', 'f6e'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/functions/utilities/math-utils',
                component: ComponentCreator('/docs/functions/utilities/math-utils', '3c2'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/getting-started/installation',
                component: ComponentCreator('/docs/getting-started/installation', '316'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/getting-started/quick-start',
                component: ComponentCreator('/docs/getting-started/quick-start', 'd3b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/getting-started/typescript',
                component: ComponentCreator('/docs/getting-started/typescript', 'ccf'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/getting-started/useKlint-pattern',
                component: ComponentCreator('/docs/getting-started/useKlint-pattern', '13b'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/klinfunctions-pixels',
                component: ComponentCreator('/docs/klinfunctions-pixels', 'cc7'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/klinfunctions-text-styling',
                component: ComponentCreator('/docs/klinfunctions-text-styling', '55d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/klintfunctions-canvas',
                component: ComponentCreator('/docs/klintfunctions-canvas', '8b0'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/klintfunctions-time',
                component: ComponentCreator('/docs/klintfunctions-time', '645'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/plugins',
                component: ComponentCreator('/docs/plugins', 'c5d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/reference/api-reference',
                component: ComponentCreator('/docs/reference/api-reference', '784'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/reference/from-p5js',
                component: ComponentCreator('/docs/reference/from-p5js', 'c53'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/reference/klint-component',
                component: ComponentCreator('/docs/reference/klint-component', '19d'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/reference/klint-hooks',
                component: ComponentCreator('/docs/reference/klint-hooks', '756'),
                exact: true,
                sidebar: "docs"
              },
              {
                path: '/docs/reference/troubleshooting',
                component: ComponentCreator('/docs/reference/troubleshooting', '652'),
                exact: true,
                sidebar: "docs"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
