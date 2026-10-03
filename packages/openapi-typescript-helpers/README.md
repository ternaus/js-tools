# @ternaus/openapi-typescript-helpers

Fork of [openapi-typescript-helpers in openapi-ts/openapi-typescript](https://github.com/openapi-ts/openapi-typescript/tree/main/packages/openapi-typescript-helpers), maintained by [Vladimir Iglovikov](https://github.com/ternaus). The original authorship, Git history, and MIT license are preserved.

Shared TypeScript types used by `@ternaus/openapi-fetch` and `@ternaus/openapi-react-query`. Most applications receive this package through their client dependency.

Install it directly when you need to extract types from generated OpenAPI declarations:

```sh
pnpm add @ternaus/openapi-typescript-helpers
```

```ts
import type { PathsWithMethod, SuccessResponse } from "@ternaus/openapi-typescript-helpers";
import type { paths } from "./api.js";

type GetPath = PathsWithMethod<paths, "get">;
type User = SuccessResponse<paths["/users/{id}"]["get"]["responses"]>;
```

`PathsWithMethod` selects paths that support an HTTP method. `SuccessResponse` extracts the response body for successful status codes. These helpers run at compile time.
