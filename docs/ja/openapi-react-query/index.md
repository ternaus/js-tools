# Introduction

openapi-react-queryは、[@tanstack/react-query](https://tanstack.com/query/latest/docs/framework/react/overview) と連携してOpenAPIスキーマを扱うための型安全なクライアントです。

これは [openapi-fetch](../openapi-fetch/index.md) および [openapi-typescript](../introduction.md) を使用することで、以下のすべての機能が提供されます：

- ✅ URLやパラメータのタイプミスが起こらない
- ✅ すべてのパラメータ、リクエストボディ、レスポンスが型チェックされ、スキーマと100%一致する
- ✅ APIの手動での型指定が不要
- ✅ バグを隠す可能性がある `any` 型の排除
- ✅ バグを隠す可能性がある `as` による型の上書きも排除


```tsx
import createFetchClient from "@ternaus/openapi-fetch";
import createClient from "@ternaus/openapi-react-query";
import type { paths } from "./my-openapi-3-schema"; // openapi-typescriptで生成された型

const fetchClient = createFetchClient<paths>({
  baseUrl: "https://myapi.dev/v1/",
});
const $api = createClient(fetchClient);

const MyComponent = () => {
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/blogposts/{post_id}",
    {
      params: {
        path: { post_id: 5 },
      },
    }
  );

  if (isLoading || !data) return "Loading...";

  if (error) return `An error occured: ${error.message}`;

  return <div>{data.title}</div>;
};
```


## セットアップ

React 19 と TanStack Query 5 が必要です。

このライブラリを [openapi-fetch](../openapi-fetch/index.md) および [openapi-typescript](../introduction.md) と一緒にインストールします：

```bash
npm i @ternaus/openapi-react-query @ternaus/openapi-fetch
npm i -D @ternaus/openapi-typescript typescript
```

> **tip 強く推奨**
>
> `tsconfig.json`で [noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig#noUncheckedIndexedAccess) を有効にしてください ([ドキュメント](../advanced.md#tsconfigで-nouncheckedindexedaccess-を有効にする))
>

次に、openapi-typescript を使用してOpenAPIスキーマからTypeScriptの型を生成します：

```bash
npx @ternaus/openapi-typescript ./path/to/api/v1.yaml -o ./src/lib/api/v1.d.ts
```

## 基本的な使い方

スキーマから型が生成されたら、[fetch クライアント](../introduction.md)と react-query クライアントを作成し、API にクエリを実行できます。


```tsx
import createFetchClient from "@ternaus/openapi-fetch";
import createClient from "@ternaus/openapi-react-query";
import type { paths } from "./my-openapi-3-schema"; // openapi-typescriptで生成された型

const fetchClient = createFetchClient<paths>({
  baseUrl: "https://myapi.dev/v1/",
});
const $api = createClient(fetchClient);

const MyComponent = () => {
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/blogposts/{post_id}",
    {
      params: {
        path: { post_id: 5 },
      },
    }
  );

  if (isLoading || !data) return "Loading...";

  if (error) return `An error occured: ${error.message}`;

  return <div>{data.title}</div>;
};
```


> **tip**
> `createFetchClient` に関する詳細は [openapi-fetch ドキュメント](../openapi-fetch/index.md) をご覧ください。
