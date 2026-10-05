---
"@ternaus/openapi-typescript": patch
---

Preserve declared and explicitly mapped discriminator values, required properties, and referenced readOnly/writeOnly annotations. Avoid duplicate discriminator constraints and circular generated inheritance types. Accept parent enum members while retaining generated child enum exports.

Honor API-specific Redocly decorators and explicitly ignored lint findings.

Node API imports with TypeScript 7 still encounter the Redocly declaration defect tracked in [issue #3189](https://github.com/Redocly/redocly-cli/issues/3189). The documentation describes the temporary `skipLibCheck` workaround and the CLI alternative for applications that require full declaration checking.
