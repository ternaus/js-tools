import type { DefaultTheme, UserConfig } from "vitepress";

const siteUrl = "https://ternaus.github.io";
const siteBase = "/js-tools";

function addSiteBase(url: string): string {
  const value = new URL(url, siteUrl);
  if (value.origin === siteUrl && !value.pathname.startsWith(`${siteBase}/`)) {
    value.pathname = `${siteBase}${value.pathname === "/" ? "" : value.pathname}`;
  }
  return value.href;
}

const shared: UserConfig<DefaultTheme.Config> = {
  title: "@ternaus/js-tools",
  description: "React ESLint rules, OpenAPI type generation, and type-safe HTTP clients.",
  base: "/js-tools/",
  cleanUrls: true,
  srcExclude: ["**/README.md", "**/CONTRIBUTING.md"],
  sitemap: {
    hostname: siteUrl,
    transformItems(items) {
      const pages = items.map((item) => ({
        ...item,
        url: addSiteBase(item.url),
        links: item.links?.map((link) => ({ ...link, url: addSiteBase(link.url) })),
      }));
      const routes = new Set(pages.map((item) => new URL(item.url).pathname));
      return pages.map((item) => ({
        ...item,
        links: item.links?.filter((link) => routes.has(new URL(link.url).pathname)),
      }));
    },
  },
  head: [["link", { rel: "icon", href: "/js-tools/favicon.svg", type: "image/svg+xml" }]],
  themeConfig: {
    siteTitle: "@ternaus/js-tools",
    i18nRouting: false,
    search: { provider: "local" },
    outline: "deep",
    socialLinks: [{ icon: "github", link: "https://github.com/ternaus/js-tools" }],
    footer: {
      message:
        '<a href="https://github.com/ternaus/js-tools/blob/main/LICENSE">MIT licensed</a>. Original package license notices remain with each package.',
      copyright: "Copyright © the original authors and contributors",
    },
  },
  transformPageData(pageData) {
    const route = pageData.relativePath.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");
    const title = pageData.title.endsWith(".md") ? route.split("/").pop() : pageData.title;
    return {
      title,
      description: pageData.frontmatter.description ?? `${title} documentation for @ternaus/js-tools.`,
    };
  },
  transformHead({ pageData }) {
    const route = pageData.relativePath.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");
    return [
      ["link", { rel: "canonical", href: `${siteUrl}${siteBase}/${route}` }],
      ["meta", { property: "og:title", content: `${pageData.title} | @ternaus/js-tools` }],
      ["meta", { property: "og:description", content: pageData.description }],
      ["meta", { property: "og:url", content: `${siteUrl}${siteBase}/${route}` }],
      ["meta", { name: "twitter:card", content: "summary" }],
    ];
  },
};

export default shared;
