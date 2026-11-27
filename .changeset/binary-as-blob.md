---
"@ternaus/openapi-typescript": major
---

Type raw binary strings as `Blob` by default: OpenAPI 3.0 `format: binary` and 3.1 `contentMediaType` without `contentEncoding`. Encoded binary (`contentEncoding`) and textual media types (`text/*`, JSON, XML) stay `string`. Pass `--no-binary-as-blob` (`binaryAsBlob: false`) to keep the previous `string` output; regenerate types and update upload `body` types accordingly.
