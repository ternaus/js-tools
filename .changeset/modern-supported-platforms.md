---
"@ternaus/openapi-typescript": major
"@ternaus/openapi-fetch": major
"@ternaus/openapi-typescript-helpers": major
"@ternaus/openapi-react-query": major
---

Publish the maintained packages under `@ternaus` with ESM exports, Node.js 24/26 support, and TypeScript 7 type checks. The generator owns its TypeScript 6 AST dependency instead of using the application's compiler. AST transforms can import `ts` from the generator.

Remove deprecated helper aliases, non-strict client support, internal package subpath exports, and separate CommonJS bundles. React Query requires React 19. The shared Markdown site deploys to GitHub Pages. Remove external API snapshot corpora, comparative benchmarks, and Vue/Svelte examples. Validation follows the OpenAPI specification; nonstandard document-level `$defs` and internal runtime exports are removed.

Fix generator output for escaped JSON pointers, enum names and comments, enum deduplication, required-only `allOf`, sibling `anyOf`, array bounds and nesting, `prefixItems` tails, parameter content, and optional `$defs` references. Inline enum-value helpers support nullable and readonly arrays. Library and inline read/write marker types share one source and preserve tuples, readonly arrays, branded primitives, Date methods, and optional null fields. Flow-style YAML and leading kebab-case boolean CLI flags work; unsupported OpenAPI versions are rejected explicitly. Typed path templates use native AST nodes and preserve literal backticks; stringToAST returns typed statements.

React Query keys now include normalized baseUrl, optional cacheKey, and query mode. Rebuild older cache keys when upgrading. Empty HTTP errors reject with an Error containing the status and original Response in cause; parsed payloads stay unchanged. Empty successful queries return null. Undefined page parameters no longer become cursor=0. Query options belong in their separate argument, and clients reject undeclared query/path/body fields during type checking.

Fetch preserves text bodies for text media types, keeps JSON scalar serialization, supports cross-realm header getters, and rejects dot-segment path parameters before they change the route. SuccessResponse uses default when no explicit success response exists. Remove the unused parse-json dependency and update compatible vulnerable transitive dependencies.
