import path from "path";
import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Klint Handbook",
  tagline: "The manual to a modern 2D Canvas made for React",
  url: "https://shopify.github.io",
  baseUrl: "/Klint/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  favicon: "img/favicon.ico",
  organizationName: "Shopify",
  projectName: "klint",
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],
  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsDir: "docs",
        indexPages: true,
        docsRouteBasePath: "/",
      },
    ],
    "./plugins/api-docs-plugin.js",
    function pluginAliases() {
      return {
        name: "klint-plugin-aliases",
        configureWebpack() {
          return {
            resolve: {
              alias: {
                "@shopify/klint/plugins/FontParser": path.resolve(
                  __dirname,
                  "../packages/klint/src/plugins/FontParser.tsx",
                ),
                "@shopify/klint/plugins": path.resolve(
                  __dirname,
                  "../packages/klint/dist/plugins/index.js",
                ),
              },
            },
          };
        },
      };
    },
  ],
  markdown: {
    mermaid: true,
  },
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Klint",
      items: [
        {
          type: "docSidebar",
          sidebarId: "docs",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/Shopify/Klint",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Community",
          items: [
            {
              label: "GitHub Discussions",
              href: "https://github.com/Shopify/Klint/discussions",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/Shopify/Klint",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shopify Inc.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
