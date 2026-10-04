---
"@ternaus/openapi-typescript": patch
---

Preserve declared and explicitly mapped discriminator values, required properties, and referenced readOnly/writeOnly annotations. Avoid duplicate discriminator constraints and circular generated inheritance types. Accept parent enum members while retaining generated child enum exports.

Honor API-specific Redocly decorators and explicitly ignored lint findings.
