# Contributing

Development uses Node.js 24.15+ or 26 and the pnpm version pinned in `package.json`. Run these commands from the repository root:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run build
```

The build orders workspace dependencies automatically. Rebuild after changing a dependency package before checking its consumers.

## Shared tooling

The root `.gitignore`, `.pre-commit-config.yaml`, `biome.json`, and `eslint.config.js` apply to the repository. Biome overrides retain package-specific rules. Package TypeScript configs extend the root defaults and select their own inputs and build outputs. The root Vitest config defines the Node and React test projects.

Install the Git hooks once from the root:

```sh
pre-commit install --install-hooks
```

Before submitting changes, run:

```sh
pnpm run quality:precommit
pnpm test
```

To work on one package, use `pnpm --filter @ternaus/openapi-fetch run lint` or the corresponding package name. Package commands use the shared configuration.

## Package contracts

- `packages/eslint-plugin-react`: ESLint 10 flat configs and React 19 rules.
- `packages/openapi-typescript`: OpenAPI type generation, with TypeScript 6 as the AST runtime and TypeScript 7 for checks.
- `packages/openapi-typescript-helpers`: shared OpenAPI type helpers used by the clients.
- `packages/openapi-fetch`: Fetch API runtime code and hand-written type declarations.
- `packages/openapi-react-query`: React 19 and TanStack Query integration.

The React 19/Next.js example remains under `packages/openapi-fetch/examples/nextjs`. Shared tooling uses TypeScript 7; the generator’s AST runtime is the sole TypeScript 6 dependency.

## Documentation

Edit OpenAPI Markdown in `docs/`. Edit ESLint rule documentation in `packages/eslint-plugin-react/docs/`; the site build derives its ESLint pages from that directory. Run `pnpm --filter @ternaus/eslint-plugin-react run docs:rules` after changing the rule registry and `pnpm run docs:build` to build the site.

## Changes and releases

Check the [open issues](https://github.com/ternaus/js-tools/issues) before starting work. Discuss new features and breaking API changes in an issue first. Preserve the original authorship and license notices.

For a publishable change, run `pnpm exec changeset` from the root and describe the user-visible effect. Packages keep independent versions. The release workflow uses these changesets to prepare a version PR.
