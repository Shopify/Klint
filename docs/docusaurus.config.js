import { themes as prismThemes } from "prism-react-renderer";
/** @type {import('@docusaurus/types').Config} */
/** @type {import('@docusaurus/preset-classic').ThemeConfig} */

const config = {
  title: "Klint Handbook",
  tagline: "The manual to a modern 2D Canvas made for React",
  url: "https://shopify.com",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Shopify",
  projectName: "klint",

  // GitHub pages deployment config.
  organizationName: "Shopify",
  projectName: "Klint",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // locales
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
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
    "./src/plugins/tailwind-config.js",
  ],
  markdown: {
    mermaid: true,
  },
  themes: ["@shopify/docusaurus-docuchat", "@docusaurus/theme-mermaid"],
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Klint",
      logo: {
        alt: "My Site Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "sidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/Shopify/Klint",
          label: "Editor",
          position: "left",
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
              label: "Slack",
              href: "https://shopify.enterprise.slack.com/archives/C04UJANU3LP",
            },
            {
              label: "Vault",
              href: "https://shopify.com",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/shopify/Klint",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shopify Inc. Made w/ 💚 for Shopifolks, hit me @ac on Slack.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
/*
module.exports = {
  title: "Klint Handbook",
  tagline: "The manual to a modern 2D Canvas made for React",
  url: "https://shopify.com",
  baseUrl: "/",
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "Shopify",
  projectName: "klint",
  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Klint",
      items: [
        {
          type: "docSidebar",
          sidebarId: "sidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/Shopify/Klint",
          label: "Editor",
          position: "left",
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
              label: "Slack",
              href: "https://shopify.enterprise.slack.com/archives/C04UJANU3LP",
            },
            {
              label: "Vault",
              href: "https://shopify.com",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/shopify/Klint",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shopify Inc. Made w/ 💚 for Shopifolks, hit me @ac on Slack.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsDir: "docs",
        indexPages: true,
        docsRouteBasePath: "/",
      },
    ],
  ],
  markdown: {
    mermaid: true,
  },
  themes: ["@shopify/docusaurus-docuchat", "@docusaurus/theme-mermaid"],
  // presets: [
  //   [
  //     "@docusaurus/preset-classic",
  //     {
  //       docs: {
  //         showLastUpdateAuthor: true,
  //         showLastUpdateTime: true,
  //         path: "docs",
  //         routeBasePath: "/",
  //         sidebarPath: require.resolve("./sidebars.js"),
  //         editUrl: "https://github.com/shopify/three/edit/main/docusaurus/",
  //       },
  //       blog: false,
  //       pages: false,
  //       sitemap: false,
  //       theme: {
  //         customCss: ["./src/css/custom.css"],
  //       },
  //     },
  //   ],
  // ],
};
*/
