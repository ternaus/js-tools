# Contributing to openapi-typescript

Follow the [repository setup and checks](../../CONTRIBUTING.md).

The generator uses `@typescript/typescript6` for its AST and printer. Import that namespace in generator code; TypeScript 7 checks the package and generated declarations. Node API callbacks receive the same AST types through the package’s exported `ts` namespace.

Generated types should follow the schema and preserve its property names. Test schema changes through the expected TypeScript output, including ambiguous unions, references, and discriminator behavior. Prefer a focused schema over updating a large snapshot for an unrelated change.

```sh
pnpm --filter @ternaus/openapi-typescript run lint
pnpm --filter @ternaus/openapi-typescript test
```

The test command checks unit output, generated example types, and package exports. Small schema fixtures live in `test/fixtures/`; the repository does not maintain snapshots of external service APIs.

Edit generator documentation in `docs/`, including `cli.md`, `node.md`, and `advanced.md`.
