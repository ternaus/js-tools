---
title: Migrate from the upstream packages
description: Replace eslint-plugin-react, openapi-typescript, openapi-fetch and openapi-react-query with the maintained @ternaus forks, and what changes in each.
---

# Migrate from the upstream packages

The `@ternaus` packages keep the upstream APIs and Git history. Migrating is a package swap plus a small set of behavior changes, listed per package below. The sources of truth are the package changelogs in the [repository](https://github.com/ternaus/js-tools).

## Why the forks exist

The upstream packages did not keep up with current tooling: React 19, ESLint 10, TypeScript 7 and Node.js 24+. These forks track those versions, fix bugs the upstream projects left open, and publish releases on a regular basis. They require:

- Node.js 24.15+ or 26
- ESM only, with no separate CommonJS bundles
- React 19 and TanStack Query 5.80+ for `openapi-react-query`
- ESLint 10 flat config for the lint plugin

## Package map

| Upstream                     | Replacement                           |
| ---------------------------- | ------------------------------------- |
| `eslint-plugin-react`        | `@ternaus/eslint-plugin-react`        |
| `openapi-typescript`         | `@ternaus/openapi-typescript`         |
| `openapi-fetch`              | `@ternaus/openapi-fetch`              |
| `openapi-react-query`        | `@ternaus/openapi-react-query`        |
| `openapi-typescript-helpers` | `@ternaus/openapi-typescript-helpers` |

Remove the upstream package, install the replacement, and update imports:

```diff
- import createClient from "openapi-fetch";
+ import createClient from "@ternaus/openapi-fetch";
```

The `openapi-typescript` CLI keeps its command name. Run it with `npx @ternaus/openapi-typescript`.

## @ternaus/eslint-plugin-react

The `react/*` rule namespace is unchanged. The package requires ESLint 10 and `eslint.config.js`; ESLint 9 and `.eslintrc*` files are not supported. See [Installation and config](/eslint-plugin-react/) and the [upstream rule support](/eslint-plugin-react/upstream-rule-support) page for which rules exist here and which Biome owns.

If `eslint-config-next` pulls in `eslint-plugin-react`, alias it to the fork as described in [Use it with eslint-config-next](/eslint-plugin-react/#use-it-with-eslint-config-next).

## @ternaus/openapi-typescript

Compared with upstream 7.x, version 8.0.0 changed:

- ESM only; the separate CommonJS bundles are gone, and removed internal runtime exports are no longer importable.
- Versions outside OpenAPI 3.0 and 3.1 and nonstandard document-level `$defs` are rejected explicitly.
- Escaped JSON pointers, enum names and comments, enum deduplication, required-only `allOf`, sibling `anyOf` constraints, array bounds and `prefixItems` tails are generated correctly.
- Flags can be set in `redocly.yaml`, and the generator owns the TypeScript 6 AST dependency and exposes `ts` for custom transforms.

Version 9.0.0 types raw binary strings as `Blob` by default (`format: binary` in OpenAPI 3.0, `contentMediaType` without `contentEncoding` in 3.1). Encoded binary and textual media types stay `string`. To keep the previous output, pass `--no-binary-as-blob` (`binaryAsBlob: false` in the Node.js API). Otherwise regenerate your types and update upload `body` types.

## @ternaus/openapi-fetch

Version 1.0.0 starts from upstream 0.17.0. Behavior changes to check when upgrading:

- Undeclared query, path and body fields are rejected by the types.
- Complete dot-segment path parameters (`.` and `..`) are rejected before the URL parser can change the request route.
- Empty success and error bodies are handled without parsing nonexistent JSON, and the original `Response` is kept in the result.
- Non-strict client support is removed.
- `client.baseUrl` is exposed as a readonly, normalized property.

Version 1.0.2 sends `Blob` and `File` request bodies unchanged, leaving `Content-Type` to the Blob. Middleware request IDs use a counter instead of `Math.random()`, so clients work during Next.js `cacheComponents` prerendering.

## @ternaus/openapi-react-query

Version 1.0.0 starts from upstream 0.5.4. Check these before upgrading:

- **Cache keys changed.** Keys include the normalized `baseUrl`, an optional `cacheKey`, and the query mode, and normal and infinite queries are separated. Rebuild any manually constructed keys.
- Unsuccessful HTTP responses reject with their parsed payload. For an empty error body, an `Error` is thrown with the status in its message and the original `Response` in `cause`.
- Empty successful queries return `null`. Successful mutations keep their data, including `undefined`.
- An `undefined` initial page parameter is preserved instead of injecting `cursor=0`.
- TanStack options placed in the fetch `init` are rejected.

## @ternaus/openapi-typescript-helpers

Version 1.0.0 removes the deprecated helper aliases, resolves `SuccessResponse` from `default` when no explicit success response exists, and keeps readonly arrays, tuple lengths, branded primitives and optional `null` properties intact in `Readable` and `Writable`.

## Report a problem

If an upgrade breaks in a way this page does not cover, [open an issue](https://github.com/ternaus/js-tools/issues). Fixes and missing features are handled in the repository, not through local workarounds.
