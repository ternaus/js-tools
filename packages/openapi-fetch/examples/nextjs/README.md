# openapi-fetch + Next.js

Example of using openapi-fetch in [Next.js](https://nextjs.org) using server-rendered data.

For client-side fetching, see the [React Query guide](../../../../docs/openapi-react-query/index.md).

## Setup

```sh
pnpm i
pnpm run dev
```

You’ll see the server running at `localhost:3000`

Set `CAT_FACT_API_URL` to use another server implementing the same API.

## Validation

From the workspace root, run `pnpm run build`, then:

```sh
pnpm --filter @example/openapi-fetch-nextjs run check
pnpm --filter @example/openapi-fetch-nextjs run test-e2e
```

The browser test builds and starts Next.js in production mode with a local API fixture. It checks that the initial HTML contains the API response and that the browser renders it without an uncaught error. It does not contact `catfact.ninja`.
