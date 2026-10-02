# About the OpenAPI packages

## Project goals

### openapi-typescript

1. Support converting any valid OpenAPI schema to TypeScript types, no matter how complicated.
1. Generated types should be statically-analyzable and runtime-free (with minor exceptions like [enums](https://www.typescriptlang.org/docs/handbook/enums.html).
1. Generated types should match your original schema as closely as possible, preserving original capitalization, etc.
1. Typegen only needs Node.js to run (no Java, Python, etc.) and works in any environment.
1. Support fetching OpenAPI schemas from files as well as local and remote servers.

### openapi-fetch

1. Types should be strict and inferred automatically from OpenAPI schemas with the absolute minimum number of generics needed.
2. Respect the native Fetch API while reducing boilerplate (such as `await res.json()`).
3. Be as light and performant as possible.

### openapi-react-query

1. Types should be strict and inferred automatically from OpenAPI schemas with the absolute minimum number of generics needed.
2. Respect the original `@tanstack/react-query` APIs while reducing boilerplate.
3. Be as light and performant as possible.

## Maintainers

Maintained by [Vladimir Iglovikov](https://github.com/ternaus). Original authorship and MIT notices are preserved.
