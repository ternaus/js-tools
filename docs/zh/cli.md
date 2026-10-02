# CLI

CLI 是使用 openapi-typescript 最常见的方式。CLI 可以解析 JSON 和 YAML，甚至使用 [Redocly CLI](https://redocly.com/docs/cli/commands/lint/) 验证您的模式。它可以解析本地和远程模式（甚至支持基本身份验证）。

## 将 OpenAPI 模式转换为 TypeScript

### 单个模式

转换模式的最简单方式是指定输入模式（JSON 或 YAML），然后通过 `--output`（`-o`）指定您希望保存输出的位置：

```bash
npx @ternaus/openapi-typescript schema.yaml -o schema.ts

# 🚀 schema.yaml -> schema.ts [50ms]
```

```bash
npx @ternaus/openapi-typescript https://petstore3.swagger.io/api/v3/openapi.yaml -o petstore.d.ts

# 🚀 https://petstore3.swagger.io/api/v3/openapi.yaml -> petstore.d.ts [250ms]
```

### 多个模式

要转换多个模式，请在项目根目录创建一个 `redocly.yaml` 文件，并[定义 APIs](https://redocly.com/docs/cli/configuration/)。在 `apis` 下，为每个模式提供一个唯一的名称和可选的版本（名称无关紧要，只要唯一即可）。将 `root` 值设置为模式的入口点，这将充当主输入。对于输出，使用 `x-openapi-ts.output` 设置：


```yaml
apis:
  core@v2:
    root: ./openapi/openapi.yaml
    x-openapi-ts:
      output: ./openapi/openapi.ts
  external@v1:
    root: ./openapi/external.yaml
    x-openapi-ts:
      output: ./openapi/external.ts
```


> **tip**
>
> 这将保留模式 1:1 输入:输出。要将多个模式捆绑到一个模式中，请使用 Redocly 的 [bundle 命令](https://redocly.com/docs/resources/multi-file-definitions/#bundle)
>

只要您的项目中有一个带有 `apis` 的 `redocly.yaml` 文件，您就可以在 CLI 中省略输入/输出参数：

```bash
npx @ternaus/openapi-typescript
```

> **warning**
>
> 在先前的版本中支持通配符，但在 v7 中已被**弃用**，而改为使用 `redocly.yaml`。这样您将能够更好地控制每个模式的输出位置，以及获得独特的每个模式设置。
>

## Redoc 配置

使用 openapi-typescript 不需要 `redocly.yaml` 文件。默认情况下，它扩展了内置配置中的 `"minimal"`。但如果您想要自定义验证规则（或构建[多个模式](#multiple-schemas)的类型），建议使用它。CLI 将尝试在项目根目录自动找到 `redocly.yaml`，但您也可以使用 `--redocly` 标志提供其位置：

```bash
npx @ternaus/openapi-typescript --redocly ./path/to/redocly.yaml
```

您可以在 [Redoc 文档](https://redocly.com/docs/cli/configuration/) 中详细了解 Redoc 的配置选项。

## 身份验证

非公共模式的身份验证在您的 [Redocly 配置](https://redocly.com/docs/cli/configuration/#resolve-non-public-or-non-remote-urls)中处理。您可以添加头部和基本身份验证，如下所示：


```yaml
resolve:
  http:
    headers:
      - matches: https://api.example.com/v2/**
        name: X-API-KEY
        envVariable: SECRET_KEY
      - matches: https://example.com/*/test.yaml
        name: Authorization
        envVariable: SECRET_AUTH
```


有关其他选项，请参阅 [Redocly 文档](https://redocly.com/docs/cli/configuration/#resolve-non-public-or-non-remote-urls)。

## 命令行参数

CLI 支持以下参数：

| 参数                      | 别名 |  默认值  | 描述                                                                                              |
| :------------------------ | :--- | :------: | :------------------------------------------------------------------------------------------------ |
| `--help`                  |      |          | 显示内联帮助消息并退出                                                                            |
| `--version`               |      |          | 显示此库的版本并退出                                                                              |
| `--output [location]`     | `-o` | (stdout) | 应将输出文件保存在何处？                                                                          |
| `--redocly [location]`      |      |          | `redocly.yaml` 文件的路径（参见 [多个模式](#multiple-schemas)）                                   |
| `--additional-properties` |      | `false`  | 允许所有模式对象使用 `additionalProperties: false` 之外的任意属性                                 |
| `--alphabetize`           |      | `false`  | 按字母顺序排序类型                                                                                |
| `--array-length`          |      | `false`  | 使用数组 `minItems` / `maxItems` 生成元组                                                         |
| `--default-non-nullable`  |      | `false`  | 将带有默认值的模式对象视为非可空                                                                  |
| `--empty-objects-unknown` |      | `false`  | 允许在未指定属性和未指定 `additionalProperties` 的情况下，为模式对象设置任意属性                  |
| `--enum`                  |      | `false`  | 生成真实的 [TS 枚举](https://www.typescriptlang.org/docs/handbook/enums.html)，而不是字符串联合。 |
| `--enum-values`            |      | `false`  | 将 enum 值导出为数组                                                                                                  |
| `--dedupe-enums`            |      | `false`  | 将 enum 值导出为数组                                                                                                  |
| `--check`            |      | `false`  | 当 --enum=true 时，去除重复定义的枚举类型                                                   |
| `--exclude-deprecated`    |      | `false`  | 从类型中排除已弃用的字段                                                                          |
| `--export-type`           | `-t` | `false`  | 导出 `type` 而不是 `interface`                                                                    |
| `--immutable`             |      | `false`  | 生成不可变类型（只读属性和只读数组）                                                              |
| `--path-params-as-types`  |      | `false`  | 允许在 `paths` 对象上进行动态字符串查找                                                           |

### pathParamsAsTypes

默认情况下，URL 会按照在模式中编写的方式保留：


```ts
export interface paths {
  "/user/{user_id}": components["schemas"]["User"];
}
```


这意味着您的类型查找也必须与确切的 URL 匹配：


```ts
import type { paths } from "./my-openapi-3-schema"; // 由openapi-typescript生成

const url = `/user/${id}`;
type UserResponses = paths["/user/{user_id}"]["responses"];
```


但当启用 `--path-params-as-types` 时，您可以这样利用动态查找：


```ts
import type { paths } from "./my-openapi-3-schema"; // 由openapi-typescript生成

const url = `/user/${id}`;
type UserResponses = paths[url]["responses"]; // 自动匹配 `paths['/user/{user_id}']`
```


虽然这是一个假设的例子，但您可以使用此功能自动推断基于应用程序中 URL 的有用位置的类型，例如在 fetch 客户端中。

_感谢，[@Powell-v2](https://github.com/Powell-v2)!_

### arrayLength

如果数组类型指定了 `minItems` 或 `maxItems`，此选项非常有用。

例如，给定以下模式：


```yaml
components:
  schemas:
    TupleType:
      type: array
      items:
        type: string
      minItems: 1
      maxItems: 2
```


启用 `--array-length` 将更改类型如下：


```ts
export interface components {
  schemas: {
    TupleType: string[]; // [!code --]
    TupleType: [string] | [string, string]; // [!code ++]
  };
}
```


这导致了对数组长度的更明确的类型检查。

_注意：这有一个合理的限制，因此例如 `maxItems: 100` 将简单地再次扁平化为 `string[];`_

_感谢，[@kgtkr](https://github.com/kgtkr)!_
