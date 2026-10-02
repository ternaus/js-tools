import type { DefaultTheme, UserConfig } from "vitepress";

const ja = {
  lang: "ja",
  themeConfig: {
    nav: [
      {
        text: "OpenAPI",
        items: [
          { text: "型ジェネレーター", link: "/ja/introduction" },
          { text: "Fetch クライアント", link: "/ja/openapi-fetch/" },
          { text: "React Query", link: "/ja/openapi-react-query/" },
        ],
      },
      { text: "GitHub Sponsors", link: "https://github.com/sponsors/ternaus" },
    ],
    sidebar: {
      "/ja/": [
        {
          text: "型ジェネレーター",
          items: [
            { text: "概要", link: "/ja/introduction" },
            { text: "CLI", link: "/ja/cli" },
            { text: "Node.js API", link: "/ja/node" },
            { text: "使用例", link: "/ja/examples" },
            { text: "高度な使い方", link: "/ja/advanced" },
          ],
        },
        {
          text: "openapi-fetch",
          items: [
            { text: "概要", link: "/ja/openapi-fetch/" },
            { text: "ミドルウェアと認証", link: "/ja/openapi-fetch/middleware-auth" },
            { text: "テスト", link: "/ja/openapi-fetch/testing" },
            { text: "使用例", link: "/ja/openapi-fetch/examples" },
            { text: "API", link: "/ja/openapi-fetch/api" },
          ],
        },
        {
          text: "openapi-react-query",
          items: [
            { text: "概要", link: "/ja/openapi-react-query/" },
            { text: "useQuery", link: "/ja/openapi-react-query/use-query" },
            { text: "useMutation", link: "/ja/openapi-react-query/use-mutation" },
            { text: "useSuspenseQuery", link: "/ja/openapi-react-query/use-suspense-query" },
          ],
        },
      ],
    },
  },
} satisfies Pick<UserConfig<DefaultTheme.Config>, "lang" | "themeConfig">;

export default ja;
