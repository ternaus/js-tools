# Contributing to openapi-fetch

Follow the [repository setup and checks](../../CONTRIBUTING.md).

The runtime lives in `src/index.js`; its public type declarations live in `src/index.d.ts`. Keep them aligned when changing the API. Shared OpenAPI type utilities belong in `@ternaus/openapi-typescript-helpers`.

Tests verify runtime responses and inferred types. Include valid and rejected inputs for changes to inference, using `assertType` and narrowly scoped `@ts-expect-error` assertions.

Run this package’s checks from the repository root:

```sh
pnpm --filter @ternaus/openapi-fetch run lint
pnpm --filter @ternaus/openapi-fetch test
```

Edit the client documentation in `docs/openapi-fetch/`.
