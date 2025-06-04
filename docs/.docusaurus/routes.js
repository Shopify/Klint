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
    component: ComponentCreator('/docs', '5ab'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', 'd01'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'd74'),
            routes: [
              {
                path: '/docs/',
                component: ComponentCreator('/docs/', 'dbb'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klinfunctions-fill-stroke',
                component: ComponentCreator('/docs/klinfunctions-fill-stroke', '3b2'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klinfunctions-pixels',
                component: ComponentCreator('/docs/klinfunctions-pixels', '0d4'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klinfunctions-text-styling',
                component: ComponentCreator('/docs/klinfunctions-text-styling', '02f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/addColorStop',
                component: ComponentCreator('/docs/Klint Functions/addColorStop', 'b6d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/arc',
                component: ComponentCreator('/docs/Klint Functions/arc', 'aa3'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/background',
                component: ComponentCreator('/docs/Klint Functions/background', '0f2'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/beginShape',
                component: ComponentCreator('/docs/Klint Functions/beginShape', 'adc'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/blend',
                component: ComponentCreator('/docs/Klint Functions/blend', '0f7'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/circle',
                component: ComponentCreator('/docs/Klint Functions/circle', '9b6'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/conicGradient',
                component: ComponentCreator('/docs/Klint Functions/conicGradient', '666'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/createOffscreen',
                component: ComponentCreator('/docs/Klint Functions/createOffscreen', '14c'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/disk',
                component: ComponentCreator('/docs/Klint Functions/disk', 'd19'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/ellipse',
                component: ComponentCreator('/docs/Klint Functions/ellipse', 'ce1'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/fillColor',
                component: ComponentCreator('/docs/Klint Functions/fillColor', 'f2f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/gradient',
                component: ComponentCreator('/docs/Klint Functions/gradient', '412'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/image',
                component: ComponentCreator('/docs/Klint Functions/image', 'f8f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/line',
                component: ComponentCreator('/docs/Klint Functions/line', 'a8d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/math-utils',
                component: ComponentCreator('/docs/Klint Functions/math-utils', 'a45'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/noFill',
                component: ComponentCreator('/docs/Klint Functions/noFill', '885'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/noStroke',
                component: ComponentCreator('/docs/Klint Functions/noStroke', '0d1'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/opacity',
                component: ComponentCreator('/docs/Klint Functions/opacity', '47e'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/point',
                component: ComponentCreator('/docs/Klint Functions/point', '4c3'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/polygon',
                component: ComponentCreator('/docs/Klint Functions/polygon', '303'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/pop',
                component: ComponentCreator('/docs/Klint Functions/pop', '11f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/push',
                component: ComponentCreator('/docs/Klint Functions/push', '10d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/radialGradient',
                component: ComponentCreator('/docs/Klint Functions/radialGradient', '19d'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/rectangle',
                component: ComponentCreator('/docs/Klint Functions/rectangle', '944'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/roundedRectangle',
                component: ComponentCreator('/docs/Klint Functions/roundedRectangle', '8f8'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/strokeCap',
                component: ComponentCreator('/docs/Klint Functions/strokeCap', 'd03'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/strokeColor',
                component: ComponentCreator('/docs/Klint Functions/strokeColor', '109'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/strokeJoin',
                component: ComponentCreator('/docs/Klint Functions/strokeJoin', '049'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/strokeWidth',
                component: ComponentCreator('/docs/Klint Functions/strokeWidth', '8f1'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint Functions/text',
                component: ComponentCreator('/docs/Klint Functions/text', '285'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klint-introduction',
                component: ComponentCreator('/docs/klint-introduction', '690'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint/klint-component',
                component: ComponentCreator('/docs/Klint/klint-component', '8ea'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint/klint-hooks',
                component: ComponentCreator('/docs/Klint/klint-hooks', '029'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint/lifecycle',
                component: ComponentCreator('/docs/Klint/lifecycle', 'fb0'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Klint/using-react',
                component: ComponentCreator('/docs/Klint/using-react', '27c'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klintfunctions-canvas',
                component: ComponentCreator('/docs/klintfunctions-canvas', 'e47'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klintfunctions-core',
                component: ComponentCreator('/docs/klintfunctions-core', '292'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klintfunctions-introduction',
                component: ComponentCreator('/docs/klintfunctions-introduction', '3b8'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/klintfunctions-time',
                component: ComponentCreator('/docs/klintfunctions-time', '566'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/plugins',
                component: ComponentCreator('/docs/plugins', '58f'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/Plugins/Color',
                component: ComponentCreator('/docs/Plugins/Color', 'fcc'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/tutorial-basics/congratulations',
                component: ComponentCreator('/docs/tutorial-basics/congratulations', '96b'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/tutorial-basics/create-a-blog-post',
                component: ComponentCreator('/docs/tutorial-basics/create-a-blog-post', 'ff1'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/tutorial-basics/create-a-document',
                component: ComponentCreator('/docs/tutorial-basics/create-a-document', 'aee'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/tutorial-basics/create-a-page',
                component: ComponentCreator('/docs/tutorial-basics/create-a-page', '5e6'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/tutorial-basics/deploy-your-site',
                component: ComponentCreator('/docs/tutorial-basics/deploy-your-site', '03a'),
                exact: true,
                sidebar: "sidebar"
              },
              {
                path: '/docs/tutorial-basics/markdown-features',
                component: ComponentCreator('/docs/tutorial-basics/markdown-features', 'cc1'),
                exact: true,
                sidebar: "sidebar"
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
