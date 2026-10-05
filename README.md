# @ternaus JavaScript tools

This workspace maintains a fork of [jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and forks of the four OpenAPI packages from [openapi-ts/openapi-typescript](https://github.com/openapi-ts/openapi-typescript). Vladimir Iglovikov maintains these forks for current React, ESLint, Node.js, and TypeScript versions. The original authors' Git histories and MIT notices are preserved.

[Support ongoing maintenance on GitHub Sponsors](https://github.com/sponsors/ternaus).

| Package | Purpose |
| --- | --- |
| [@ternaus/eslint-plugin-react](packages/eslint-plugin-react) | React 19 rules for ESLint 10 alongside Biome |
| [@ternaus/openapi-typescript](packages/openapi-typescript) | Generate TypeScript types from OpenAPI 3.0 and 3.1 |
| [@ternaus/openapi-fetch](packages/openapi-fetch) | Typed Fetch API client |
| [@ternaus/openapi-react-query](packages/openapi-react-query) | Typed TanStack Query client for React 19 |
| [@ternaus/openapi-typescript-helpers](packages/openapi-typescript-helpers) | Shared request and response type helpers |

Packages keep independent versions and release notes. Development requires Node.js 24.15+ or 26 and the pnpm version pinned in `package.json`. Source and generated types are checked with TypeScript 7; the OpenAPI generator retains TypeScript 6 as its stable AST dependency.

## Development

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run quality:complete
```

Use Corepack 0.36 or later for pnpm 12. See each package's README for installation and usage, and [the documentation](docs/README.md) for OpenAPI guides.

The generator's existing `skipLibCheck: true` setting accommodates the Redocly declaration defect in [issue #3189](https://github.com/Redocly/redocly-cli/issues/3189). Source checks remain strict. Review this exception by 2026-11-05 or when Redocly releases a fix; [Node API consumers have the same declaration-checking limitation](docs/node.md#redocly-declaration-compatibility).

## History and attribution

This repository combines the complete Git histories of [ternaus/eslint-plugin-react](https://github.com/ternaus/eslint-plugin-react) and [ternaus/openapi-typescript](https://github.com/ternaus/openapi-typescript) without squashing or rewriting their commits. It preserves the work of [jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and [openapi-ts/openapi-typescript](https://github.com/openapi-ts/openapi-typescript), including author records and package license notices.

The histories join at a merge commit. Historical ESLint tags retain their names; OpenAPI tags use the `openapi-history/` prefix to avoid tag-name collisions. The original repositories remain references for their existing issues, pull requests, and releases.
