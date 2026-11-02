# openapi-fetch + Next.js

Example of using openapi-fetch in [Next.js](https://nextjs.org) using server-rendered data.

For client-side fetching, see the [React Query guide](../../../../docs/openapi-react-query/index.md).

## Setup

```sh
pnpm i
pnpm run dev
```

You’ll see the server running at `localhost:3000`

Set `CAT_FACT_API_URL` to use another server implementing the same API. An unset, empty, or whitespace-only value uses `https://catfact.ninja/`.

The page fetches the fact on the server. A client component lets you hide and show the JSON response.

## Validation

From the workspace root, run `pnpm run build`, then:

```sh
pnpm --filter @example/openapi-fetch-nextjs run check
pnpm --filter @example/openapi-fetch-nextjs run test-e2e
```

The browser test builds and starts Next.js in production mode with a local API fixture. It checks the initial server HTML, then hides and shows the response through the client control to verify hydration. The Vitest suite checks the empty API URL fallback without starting either server. The tests do not contact `catfact.ninja`.

If the default ports are occupied, set `NEXTJS_PORT` (default `4174`) and `NEXTJS_API_PORT` (default `4175`) to two different free ports:

```sh
NEXTJS_PORT=4274 NEXTJS_API_PORT=4275 pnpm run test-e2e
```
