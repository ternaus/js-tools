# Contributing to openapi-react-query

Follow the [repository setup and checks](../../CONTRIBUTING.md).

Keep the wrapper aligned with React 19, TanStack Query, and `@ternaus/openapi-fetch`. Reuse the shared OpenAPI type helpers and Fetch client behavior when adding query methods.

Tests should verify both query behavior and inferred data, error, and parameter types. The test command regenerates its schema declarations before running the React project in the shared Vitest configuration.

```sh
pnpm --filter @ternaus/openapi-react-query run lint
pnpm --filter @ternaus/openapi-react-query test
```

Edit the integration documentation in `docs/openapi-react-query/`.
