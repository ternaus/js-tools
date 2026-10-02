# Contributing to eslint-plugin-react

Follow the [repository setup and checks](../../CONTRIBUTING.md). The package supports ESLint 10 flat config and React 19 on the repository’s Node.js runtime matrix.

Before adding a rule, check whether Biome already covers the behavior. New rules belong in `lib/rules/` and `lib/rule-registry.js`, with documentation and focused valid and invalid cases. Reuse the React binding helpers in `lib/util/` when resolving imports or component ownership.

Generate the rule catalog after changing the registry:

```sh
pnpm --filter @ternaus/eslint-plugin-react run docs:rules
```

Run package validation with:

```sh
pnpm --filter @ternaus/eslint-plugin-react run lint
pnpm --filter @ternaus/eslint-plugin-react test
```

The package checks retain the reviewed Biome exception registry and residual ESLint rules, verify documentation and citations, and validate the npm archive through package consumers. These scripts use the repository’s shared tooling configurations.
