module.exports = {
  title: "Klint Handbook",
  tagline: "The manual to a modern 2D Canvas made for React",
  url: "https://klint.docs.shopify.io",
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
    prism: {
      additionalLanguages: ["ruby", "sql"],
    },
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
  },
  plugins: [
    [
      "@easyops-cn/docusaurus-search-local",
      {
        docsDir: "docs",
        indexPages: true,
        docsRouteBasePath: "/",
      },
      "./src/plugins/tailwind-config.js",
    ],
  ],
  themes: ["@shopify/docusaurus-shopify-theme", "@shopify/docusaurus-docuchat"],
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          path: "docs",
          routeBasePath: "/",
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/shopify/klint/edit/main/docusaurus/",
        },
        blog: false,
        pages: false,
        sitemap: false,
      },
    ],
  ],
};
