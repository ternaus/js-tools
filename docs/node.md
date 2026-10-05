# Node.js API

The Node API may be useful if dealing with dynamically-created schemas, or you’re using within context of a larger application. Pass in either a JSON-friendly object to load a schema from memory, or a string to load a schema from a local file or remote URL.

## Setup

```bash
npm i --save-dev @ternaus/openapi-typescript typescript
```

> **tip Recommended**
>
> For the best experience, use Node ESM by adding `"type": "module"` to `package.json` ([docs](https://nodejs.org/api/esm.html#enabling))
>

### Redocly declaration compatibility

Importing the Node API can fail TypeScript 7 declaration checking because the Redocly dependency references undeclared React and Markdoc types and an incompatible `json-schema-to-ts` version. This is tracked in [Redocly issue #3189](https://github.com/Redocly/redocly-cli/issues/3189).

Use the [CLI](cli.md) to generate a types file while keeping full declaration checking in your application. If you need the Node API and accept skipping declaration checks, this temporary workaround allows the import:

```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

This setting skips checking all `.d.ts` files, including other libraries, while TypeScript still checks your source and typed API calls. Recheck the workaround after Redocly fixes the issue.

## Usage

The Node.js API accepts either a `URL`, `string`, or JSON object as input:

|   Type   | Description                 | Example                                                                                                                          |
| :------: | :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
|  `URL`   | Read a local or remote file | `await openapiTS(new URL('./schema.yaml', import.meta.url))`<br/>`await openapiTS(new URL('https://myapi.com/v1/openapi.yaml'))` |
| `string` | Read dynamic YAML or JSON   | `await openapiTS('openapi: "3.1" … ')`                                                                                           |
|  `JSON`  | Read dynamic JSON           | `await openapiTS({ openapi: '3.1', … })`                                                                                         |

It also accepts `Readable` streams and `Buffer` types that are resolved and treated as strings (validation, bundling, and type generation can’t really happen without the whole document).

The Node API returns a `Promise` with a TypeScript AST. You can then traverse / manipulate / modify the AST as you see fit.

To convert the TypeScript AST into a string, you can use `astToString()` helper which is a thin wrapper around [TypeScript’s printer](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#re-printing-sections-of-a-typescript-file):


```ts
import fs from "node:fs";
import openapiTS, { astToString } from "@ternaus/openapi-typescript";

const ast = await openapiTS(new URL("./my-schema.yaml", import.meta.url));
const contents = astToString(ast);

// (optional) write to file
fs.writeFileSync("./my-schema.ts", contents);
```


### Redoc config

A Redoc config isn’t required to use openapi-typescript. By default it extends the `"minimal"` built-in config. But if you want to modify the default settings, you’ll need to provide a fully-initialized Redoc config to the Node API. You can do this with the helpers in `@redocly/openapi-core`:


```ts
import { createConfig, loadConfig } from "@redocly/openapi-core";
import openapiTS from "@ternaus/openapi-typescript";

// option 1: create in-memory config
const redocly = await createConfig(
  {
    apis: {
      "core@v2": { … },
      "external@v1": { … },
    },
  },
  { extends: ["recommended"] },
);

// option 2: load from redocly.yaml file
const redocly = await loadConfig({ configPath: "redocly.yaml" });

const ast = await openapiTS(mySchema, { redocly });
```


## Options

The Node API supports all the [CLI flags](cli.md#flags) in `camelCase` format, plus the following additional options:

| Name               |      Type       |     Default     | Description                                                                                  |
| :----------------- | :-------------: | :-------------: | :------------------------------------------------------------------------------------------- |
| `transform`        |   `Function`    |                 | Override the default Schema Object ➝ TypeScript transformer in certain scenarios             |
| `postTransform`    |   `Function`    |                 | Same as `transform` but runs _after_ the TypeScript transformation                           |
| `transformProperty`|   `Function`    |                 | Transform individual property signatures for Schema Object properties                        |
| `silent`           |    `boolean`    |     `false`     | Silence warning messages (fatal errors will still show)                                      |
| `cwd`              | `string \| URL` | `process.cwd()` | (optional) Provide the current working directory to help resolve remote `$ref`s (if needed). |
| `inject`           |    `string`     |                 | Inject arbitrary TypeScript types into the start of the file                                 |

### transform / postTransform

Use the `transform()` and `postTransform()` options to override the default Schema Object transformer with your own. This is useful for providing nonstandard modifications for specific parts of your schema.

- `transform()` runs **before** the conversion to TypeScript (you’re working with the original OpenAPI nodes)
- `postTransform()` runs **after** the conversion to TypeScript (you’re working with TypeScript AST)

#### Example: `Date` types

For example, say your schema has the following property:

```yaml
properties:
  updated_at:
    type: string
    format: date-time
```

By default, openapiTS will generate `updated_at?: string;` because it’s not sure which format you want by `"date-time"` (formats are nonstandard and can be whatever you’d like). But we can enhance this by providing our own custom formatter, like so:


```ts
import openapiTS, { ts } from "@ternaus/openapi-typescript";

const DATE = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Date")); // `Date`
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull()); // `null`

const ast = await openapiTS(mySchema, {
  transform(schemaObject, metadata) {
    if (schemaObject.format === "date-time") {
      return schemaObject.nullable
        ? ts.factory.createUnionTypeNode([DATE, NULL])
        : DATE;
    }
  },
});
```


That would result in the following change:


```yaml
updated_at?: string; // [!code --]
updated_at: Date | null; // [!code ++]
```


#### Example: `Blob` types

Another common transformation is for file uploads, where the `body` of a request is a `multipart/form-data` with some `Blob` fields. Here's an example schema:


```yaml
Body_file_upload:
  type: object;
  properties:
    file:
      type: string;
      format: binary;
```


Use the same pattern to transform the types:


```ts
import openapiTS, { ts } from "@ternaus/openapi-typescript";

const BLOB = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Blob")); // `Blob`
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull()); // `null`

const ast = await openapiTS(mySchema, {
  transform(schemaObject, metadata) {
    if (schemaObject.format === "binary") {
      return schemaObject.nullable
        ? ts.factory.createUnionTypeNode([BLOB, NULL])
        : BLOB;
    }
  },
});
```


Resultant diff with correctly-typed `file` property:


```ts
file?: string; // [!code --]
file: Blob | null; // [!code ++]
```


#### Example: Add "?" token to property

It is not possible to create a property with the optional "?" token with the above `transform` functions. The transform function also accepts a different return object, which allows you to add a "?" token to the property. Here's an example schema:


```yaml
Body_file_upload:
  type: object;
  properties:
    file:
      type: string;
      format: binary;
      required: true;
```


Here we return an object with a schema property, which is the same as the above example, but we also add a `questionToken` property, which will add the "?" token to the property.


```ts
import openapiTS, { ts } from "@ternaus/openapi-typescript";

const BLOB = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("Blob")); // `Blob`
const NULL = ts.factory.createLiteralTypeNode(ts.factory.createNull()); // `null`

const ast = await openapiTS(mySchema, {
  transform(schemaObject, metadata) {
    if (schemaObject.format === "binary") {
      return {
        schema: schemaObject.nullable
          ? ts.factory.createUnionTypeNode([BLOB, NULL])
          : BLOB,
        questionToken: true,
      };
    }
  },
});
```


Resultant diff with correctly-typed `file` property and "?" token:


```ts
file: Blob; // [!code --]
file?: Blob | null; // [!code ++]
```


Any [Schema Object](https://spec.openapis.org/oas/latest.html#schema-object) present in your schema will be run through this formatter (even remote ones!). Also be sure to check the `metadata` parameter for additional context that may be helpful.

There are many other uses for this besides checking `format`. Because this must return a **string** you can produce any arbitrary TypeScript code you'd like (even your own custom types).

### transformProperty

Use the `transformProperty()` option to modify individual property signatures within Schema Objects. This is particularly useful for adding JSDoc comments, validation annotations, or modifying property-level attributes that can't be achieved with `transform` or `postTransform`.

- `transformProperty()` runs **after** type conversion but **before** JSDoc comments are added
- It receives the property signature, the original schema object, and transformation options
- It should return a modified `PropertySignature` or `undefined` to leave the property unchanged

#### Example: JSDoc validation annotations

A common use case is adding validation annotations based on OpenAPI schema constraints:


```yaml
components:
  schemas:
    User:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          pattern: "^[a-zA-Z0-9]+$"
        email:
          type: string
          format: email
        age:
          type: integer
          minimum: 0
          maximum: 120
      required: [name, email]
```



```ts
import fs from "node:fs";
import openapiTS, { astToString, ts } from "@ternaus/openapi-typescript";

const ast = await openapiTS(mySchema, {
  transformProperty(property, schemaObject, options) {
    const validationTags: string[] = [];

    // Add validation JSDoc tags based on schema constraints
    if (schemaObject.minLength !== undefined) {
      validationTags.push(`@minLength ${schemaObject.minLength}`);
    }
    if (schemaObject.maxLength !== undefined) {
      validationTags.push(`@maxLength ${schemaObject.maxLength}`);
    }
    if (schemaObject.minimum !== undefined) {
      validationTags.push(`@minimum ${schemaObject.minimum}`);
    }
    if (schemaObject.maximum !== undefined) {
      validationTags.push(`@maximum ${schemaObject.maximum}`);
    }
    if (schemaObject.pattern !== undefined) {
      validationTags.push(`@pattern ${schemaObject.pattern}`);
    }
    if (schemaObject.format !== undefined) {
      validationTags.push(`@format ${schemaObject.format}`);
    }

    // If we have validation tags, add them as JSDoc comments
    if (validationTags.length > 0) {
      // Create a new property signature
      const newProperty = ts.factory.updatePropertySignature(
        property,
        property.modifiers,
        property.name,
        property.questionToken,
        property.type,
      );

      // Add JSDoc comment
      const jsDocText = `*\n * ${validationTags.join('\n * ')}\n `;

      ts.addSyntheticLeadingComment(
        newProperty,
        ts.SyntaxKind.MultiLineCommentTrivia,
        jsDocText,
        true,
      );

      return newProperty;
    }

    return property;
  },
});

const contents = astToString(ast);
fs.writeFileSync("./my-schema.ts", contents);
```


This transforms the schema into TypeScript with validation annotations:


```ts
export interface components {
  schemas: {
    User: {
      /**
       * @minLength 1
       * @pattern ^[a-zA-Z0-9]+$
       */
      name: string;
      /**
       * @format email
       */
      email: string;
      /**
       * @minimum 0
       * @maximum 120
       */
      age?: number;
    };
  };
}
```


The `transformProperty` function provides access to:
- `property`: The TypeScript PropertySignature AST node
- `schemaObject`: The original OpenAPI Schema Object for this property
- `options`: Transformation context including path information and other utilities
