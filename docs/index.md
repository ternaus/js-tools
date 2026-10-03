---
layout: home
title: React linting and typed APIs
description: Maintained forks of jsx-eslint/eslint-plugin-react and openapi-ts/openapi-typescript for React 19, ESLint 10, TypeScript 7, and typed API clients.
hero:
  name: "@ternaus/js-tools"
  text: "React linting and typed APIs"
  tagline: 'Fork of <a href="https://github.com/jsx-eslint/eslint-plugin-react">jsx-eslint/eslint-plugin-react</a>. Fork of <a href="https://github.com/openapi-ts/openapi-typescript">openapi-ts/openapi-typescript</a>. Maintained by Vladimir Iglovikov.'
  actions:
    - theme: brand
      text: Choose a package
      link: /#packages
    - theme: alt
      text: Buy me a coffee
      link: https://github.com/sponsors/ternaus
---

## Packages

Install the packages you need. Each has its own version and release notes.

`@ternaus/eslint-plugin-react` is a fork of [jsx-eslint/eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react). The four `@ternaus/openapi-*` packages are forks of the packages in [openapi-ts/openapi-typescript](https://github.com/openapi-ts/openapi-typescript). The original authors' Git histories and MIT license notices are preserved.

- [@ternaus/eslint-plugin-react](/eslint-plugin-react/): React 19 rules for ESLint 10 alongside Biome. Includes installation and flat config examples.
- [@ternaus/openapi-typescript](/introduction): generate TypeScript declarations from OpenAPI 3.0 and 3.1 schemas.
- [@ternaus/openapi-fetch](/openapi-fetch/): call APIs with typed paths, parameters, request bodies, and responses.
- [@ternaus/openapi-react-query](/openapi-react-query/): use those types with TanStack Query hooks in React 19.
- [@ternaus/openapi-typescript-helpers](/openapi-typescript-helpers/): reuse the OpenAPI types shared by the clients.

Development and type generation require Node.js 24.15+ or 26. Packages use ESM and are checked with TypeScript 7. The generator uses TypeScript 6 internally for its AST API. React packages target React 19; the lint plugin requires ESLint 10 and Biome 2.5.13+.

## Buy me a coffee

I'm [Vladimir Iglovikov](https://github.com/ternaus). I maintain these forks, fix bugs, and keep them working with current JavaScript tools.

If they save you time, [buy me a coffee through GitHub Sponsors](https://github.com/sponsors/ternaus). Your support helps me spend more time on maintenance.
