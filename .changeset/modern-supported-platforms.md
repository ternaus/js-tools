---
"@ternaus/openapi-typescript": major
"@ternaus/openapi-fetch": major
"@ternaus/openapi-typescript-helpers": major
"@ternaus/openapi-react-query": major
---

Publish the maintained packages under `@ternaus` with ESM exports, Node.js 24/26 support, and TypeScript 7 type checks. The generator owns its TypeScript 6 AST dependency instead of using the application's compiler. AST transforms can import `ts` from the generator.

Remove deprecated helper aliases, non-strict client support, internal package subpath exports, and separate CommonJS bundles. React Query requires React 19. The shared Markdown site deploys to GitHub Pages. Remove external API snapshot corpora, comparative benchmarks, and Vue/Svelte examples. Validation follows the OpenAPI specification; nonstandard document-level `$defs` and internal runtime exports are removed.
