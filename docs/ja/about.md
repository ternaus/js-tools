# openapi-typescriptについて

## プロジェクトの目標

### openapi-typescript

1. 任意の有効な OpenAPI スキーマを TypeScript 型に変換できるようにすること。どんなに複雑なスキーマでも対応可能です。
2. 生成される型は静的に解析可能で、実行時の依存関係がない（ただし、[enums](https://www.typescriptlang.org/docs/handbook/enums.html) のような例外はあります）。
3. 生成された型は、元のスキーマにできるだけ一致し、元の大文字形式などを保持します。
4. 型の生成 は Node.js だけで実行可能であり、（Java、Python などは不要）どんな環境でも実行できます。
5. ファイルからの OpenAPI スキーマのフェッチや、ローカルおよびリモートサーバーからのフェッチをサポートします。

### openapi-fetch

1. 型は厳密で、最小限のジェネリクスで OpenAPI スキーマから自動的に推論されるべきです。
2. ネイティブの Fetch API を尊重しつつ、（`await res.json()` などの）ボイラープレートを削減すること。
3. 可能な限り軽量で高性能であること。

### openapi-react-query

1. 型は厳格であり、必要最小限のジェネリクスでOpenAPIスキーマから自動的に推論されるべきです。
2. 元の `@tanstack/react-query` API を尊重しつつ、ボイラープレートを減らします。
3. できるだけ軽量でパフォーマンスが高くなるようにします。

## メインテナー

Maintained by [Vladimir Iglovikov](https://github.com/ternaus). Original authorship and MIT notices are preserved.

## 貢献者

And thanks to 100+ amazing contributors, without whom these projects wouldn’t be possible:

[Upstream contributors](https://github.com/openapi-ts/openapi-typescript/graphs/contributors)
