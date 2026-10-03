import type { DefaultTheme, UserConfig } from "vitepress";

const en = {
  lang: "en-US",
  themeConfig: {
    nav: [
      {
        text: "Packages",
        items: [
          { text: "ESLint rules for React 19", link: "/eslint-plugin-react/" },
          { text: "Generator", link: "/introduction" },
          { text: "Fetch client", link: "/openapi-fetch/" },
          { text: "React Query", link: "/openapi-react-query/" },
          { text: "Type helpers", link: "/openapi-typescript-helpers/" },
        ],
      },
      { text: "Forks and authors", link: "/about" },
      { text: "Buy me a coffee", link: "https://github.com/sponsors/ternaus" },
    ],
    sidebar: {
      "/": [
        {
          text: "Type generator",
          items: [
            { text: "Introduction", link: "/introduction" },
            { text: "CLI", link: "/cli" },
            { text: "Node.js API", link: "/node" },
            { text: "Examples", link: "/examples" },
            { text: "Advanced", link: "/advanced" },
          ],
        },
        {
          text: "openapi-fetch",
          items: [
            { text: "Getting started", link: "/openapi-fetch/" },
            { text: "Middleware and auth", link: "/openapi-fetch/middleware-auth" },
            { text: "Testing", link: "/openapi-fetch/testing" },
            { text: "Examples", link: "/openapi-fetch/examples" },
            { text: "API", link: "/openapi-fetch/api" },
          ],
        },
        {
          text: "openapi-react-query",
          items: [
            { text: "Getting started", link: "/openapi-react-query/" },
            { text: "useQuery", link: "/openapi-react-query/use-query" },
            { text: "useMutation", link: "/openapi-react-query/use-mutation" },
            { text: "useSuspenseQuery", link: "/openapi-react-query/use-suspense-query" },
            { text: "useInfiniteQuery", link: "/openapi-react-query/use-infinite-query" },
            { text: "queryOptions", link: "/openapi-react-query/query-options" },
          ],
        },
        { text: "About", link: "/about" },
        {
          text: "React ESLint plugin",
          items: [
            { text: "Installation and config", link: "/eslint-plugin-react/" },
            { text: "Rules", link: "/eslint-plugin-react/rules/" },
          ],
        },
        { text: "Type helpers", link: "/openapi-typescript-helpers/" },
      ],
    },
  },
} satisfies Pick<UserConfig<DefaultTheme.Config>, "lang" | "themeConfig">;

export default en;
