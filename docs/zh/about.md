# 关于 openapi-typescript

## 项目目标

### openapi-typescript

1. 支持将任何有效的 OpenAPI 模式转换为 TypeScript 类型，无论多么复杂。
2. 生成的类型应该是静态分析的、无运行时依赖的（有一些例外，比如 [enums](https://www.typescriptlang.org/docs/handbook/enums.html)）。
3. 生成的类型应尽可能与原始模式匹配，保留原始的大写形式等。
4. Typegen 只需要 Node.js 来运行（不需要 Java、Python 等），可以在任何环境中运行。
5. 支持从文件以及本地和远程服务器获取 OpenAPI 模式。

### openapi-fetch

1. 类型应该严格，并且应该从 OpenAPI 模式中自动推断出绝对最少数量的泛型。
2. 使用原生的 Fetch API，同时减少样板代码（例如 `await res.json()`）。
3. 尽可能轻巧和高性能。

## Maintainers

Maintained by [Vladimir Iglovikov](https://github.com/ternaus). Original authorship and MIT notices are preserved.
