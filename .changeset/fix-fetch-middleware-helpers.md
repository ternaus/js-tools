---
"@ternaus/openapi-fetch": patch
---

Accept the existing client-created Request when middleware returns it unchanged, including compatible constructors that delegate to the standard Request. Invalid replacements remain rejected.

Exported client helper types accept generated paths interfaces without requiring every HTTP method on every path. Request validation stays strict.
