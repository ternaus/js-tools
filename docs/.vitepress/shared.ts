import type { DefaultTheme, UserConfig } from "vitepress";

const siteUrl = "https://ternaus.github.io";
const siteBase = "/js-tools";

function addSiteBase(url: string): string {
  const value = new URL(url, siteUrl);
  if (value.origin === siteUrl && !value.pathname.startsWith(`${siteBase}/`)) {
    value.pathname = `${siteBase}${value.pathname}`;
  }
  return value.href;
}

const shared: UserConfig<DefaultTheme.Config> = {
  title: "@ternaus/js-tools",
  titleTemplate: false,
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
    const heading = pageData.title.endsWith(".md") ? route.split("/").pop() : pageData.title;
    const section = route
      .split("/")
      .find((part) =>
        ["openapi-fetch", "openapi-react-query", "openapi-typescript-helpers", "eslint-plugin-react"].includes(part),
      );
    const language = route.startsWith("ja/") ? "日本語" : route.startsWith("zh/") ? "简体中文" : "";
    const title = route
      ? [heading, section && heading?.includes(section) ? "" : (section ?? "OpenAPI TypeScript"), language]
          .filter(Boolean)
          .join(" · ")
      : heading;
    return {
      title,
      description: pageData.frontmatter.description ?? `${title} documentation for @ternaus/js-tools.`,
    };
  },
  transformHead({ pageData }) {
    const route = pageData.relativePath.replace(/(^|\/)index\.md$/, "").replace(/\.md$/, "");
    const url = `${siteUrl}${siteBase}/${route}`;
    return [
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:title", content: `${pageData.title} | @ternaus/js-tools` }],
      ["meta", { property: "og:description", content: pageData.description }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:image", content: `${siteUrl}${siteBase}/social-card.png` }],
      ["meta", { property: "og:image:alt", content: "@ternaus/js-tools: React linting and typed APIs" }],
      ["meta", { name: "twitter:card", content: "summary_large_image" }],
      [
        "script",
        { type: "application/ld+json" },
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": route ? "WebPage" : "WebSite",
          name: pageData.title,
          description: pageData.description,
          url,
        }),
      ],
    ];
  },
};

export default shared;
