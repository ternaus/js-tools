---
"@ternaus/openapi-fetch": patch
---

Generate middleware request IDs from a counter instead of `Math.random()`, so clients can be used during Next.js `cacheComponents` prerendering. IDs stay unique strings.
