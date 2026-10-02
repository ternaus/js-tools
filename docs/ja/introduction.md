<img src="/assets/openapi-ts.svg" alt="@ternaus/openapi-typescript" width="200" height="40" />

# OpenAPIスキーマからTypeScriptの型を生成

openapi-typescriptは、[OpenAPI 3.0 & 3.1](https://spec.openapis.org/oas/latest.html) スキーマをNode.jsを使用して素早くTypeScriptに変換します。Java/node-gyp/OpenAPIサーバーの実行は不要です。

このコードは[MITライセンス](https://github.com/ternaus/js-tools/blob/main/packages/openapi-typescript/LICENSE)で保護されており、無料で利用可能です。

> **tip**
>
> OpenAPI初心者ですか？Speakeasyの [Intro to OpenAPI](https://www.speakeasyapi.dev/openapi) は、初心者にも分かりやすいガイドで、OpenAPIの「なぜ」と「どのように」を説明しています。
>

## 特徴

- ✅ OpenAPI 3.0および3.1をサポート（[discriminators](https://spec.openapis.org/oas/v3.1.0#discriminator-object)のような高度な機能を含む）
- ✅ 従来のコード生成より優れている**実行時に依存しない型**を生成
- ✅ YAMLまたはJSONから、ローカルまたはリモートでスキーマを読み込む
- ✅ 巨大なスキーマであってもミリ秒単位で型を生成


## 使用例

👀 [使用例を見る](https://github.com/ternaus/js-tools/tree/main/packages/openapi-typescript/examples/)

## セットアップ

このライブラリを使用するには、最新バージョンの [Node.js](https://nodejs.org) がインストールされている必要があります（Node.js 24.15 以降または 26 が必要です）。インストールしたら、以下のコマンドをプロジェクトで実行してください：

```bash
npm i -D @ternaus/openapi-typescript typescript
```

次に、`tsconfig.json` ファイルに以下を追加して、型を正しく読み込めるようにします：


```json
{
  "compilerOptions": {
    "module": "ESNext", // または "NodeNext" // [!code ++]
    "moduleResolution": "Bundler" // または "NodeNext" // [!code ++]
  }
}
```


> **tip 強く推奨**
>
> さらに、以下の設定を追加すると型の安全性が向上します：
>

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true // [!code ++]
  }
}
```

>
> ## 基本的な使い方
>
> まず、`npx @ternaus/openapi-typescript` を実行してローカルの型ファイルを生成します。最初に入力スキーマ（JSON または YAML）を指定し、保存する場所を `--output` （`-o`）で指定します：
>
> ```bash
> # ローカルスキーマ
> npx @ternaus/openapi-typescript ./path/to/my/schema.yaml -o ./path/to/my/schema.d.ts
> # 🚀 ./path/to/my/schema.yaml -> ./path/to/my/schema.d.ts [7ms]
>
> # リモートスキーマ
> npx @ternaus/openapi-typescript https://myapi.dev/api/v1/openapi.yaml -o ./path/to/my/schema.d.ts
> # 🚀 https://myapi.dev/api/v1/openapi.yaml -> ./path/to/my/schema.d.ts [250ms]
> ```
>
> 次に、TypeScript プロジェクトで必要に応じて型をインポートします：
>

```ts
import type { paths, components } from "./my-openapi-3-schema"; // openapi-typescript によって生成

// スキーマオブジェクト
type MyType = components["schemas"]["MyType"];

// パスパラメータ
type EndpointParams = paths["/my/endpoint"]["parameters"];

// レスポンスオブジェクト
type SuccessResponse =
  paths["/my/endpoint"]["get"]["responses"][200]["content"]["application/json"]["schema"];
type ErrorResponse =
  paths["/my/endpoint"]["get"]["responses"][500]["content"]["application/json"]["schema"];
```

>
> ここから、これらの型を以下の用途で使用できます（ただし、これに限定されません）：
>
> - OpenAPI対応のfetchクライアントを使用する（例：[openapi-fetch](openapi-fetch/index.md)）
> - 他のAPIリクエストボディやレスポンスの型のアサート
> - API型に基づいたコアビジネスロジックの構築
> - モックテストデータが現在のスキーマと一致していることを確認する
> - 任意のnpmパッケージ（クライアントSDKなど）にAPI型をパッケージ化する
