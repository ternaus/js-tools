# Documentation

This repository keeps documentation as Markdown. Read it on GitHub or in a Markdown viewer; no documentation server is required.

- [Generator: installation and options](introduction.md)
- [Command line](cli.md)
- [Node.js API and AST transforms](node.md)
- [Advanced type generation](advanced.md)
- [Fetch client](openapi-fetch/index.md)
- [React Query client](openapi-react-query/index.md)

The maintained packages require Node.js 24.15+ or 26 and ESM. Libraries and generated types are checked with TypeScript 7. The generator uses TypeScript 6 for its AST API until TypeScript 7 provides a stable replacement. React Query requires React 19.

Run `pnpm --filter @example/js-tools-docs run typecheck` to check the site configuration, including dependency declarations. `pnpm run docs:build` also checks internal Markdown links while building the site.

The documentation workspace explicitly installs `preact` and `search-insights` because DocSearch 4.7.1 imports their types without declaring the dependencies ([upstream issue #3077](https://github.com/algolia/docsearch/issues/3077)). Review these dependencies after the upstream fix, or by December 1, 2026. `@types/web-bluetooth` supplies the ambient types required by VueUse.
