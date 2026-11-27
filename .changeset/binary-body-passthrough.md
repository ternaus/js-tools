---
"@ternaus/openapi-fetch": patch
"@ternaus/openapi-typescript-helpers": patch
---

Send `Blob` and `File` request bodies unchanged and leave `Content-Type` to the Blob. `Readable`, `Writable` and the strict request check treat Blob-like values as opaque, so a `File` is assignable to a `Blob` field.
