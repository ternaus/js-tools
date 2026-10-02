import type { DefaultTheme, UserConfig } from "vitepress";

const zh = {
  lang: "zh-Hans",
  themeConfig: {
    nav: [
      {
        text: "OpenAPI",
        items: [
          { text: "类型生成器", link: "/zh/introduction" },
          { text: "Fetch 客户端", link: "/zh/openapi-fetch/" },
        ],
      },
      { text: "GitHub Sponsors", link: "https://github.com/sponsors/ternaus" },
    ],
    sidebar: {
      "/zh/": [
        {
          text: "类型生成器",
          items: [
            { text: "简介", link: "/zh/introduction" },
            { text: "命令行", link: "/zh/cli" },
            { text: "Node.js API", link: "/zh/node" },
            { text: "示例", link: "/zh/examples" },
            { text: "高级用法", link: "/zh/advanced" },
          ],
        },
        {
          text: "openapi-fetch",
          items: [
            { text: "简介", link: "/zh/openapi-fetch/" },
            { text: "中间件与认证", link: "/zh/openapi-fetch/middleware-auth" },
            { text: "测试", link: "/zh/openapi-fetch/testing" },
            { text: "示例", link: "/zh/openapi-fetch/examples" },
            { text: "API", link: "/zh/openapi-fetch/api" },
          ],
        },
      ],
    },
  },
} satisfies Pick<UserConfig<DefaultTheme.Config>, "lang" | "themeConfig">;

export default zh;
