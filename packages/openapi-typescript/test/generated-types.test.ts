import ts from "@typescript/typescript6";
import openapiTS, { astToString } from "../src/index.js";
import type { OpenAPITSOptions } from "../src/types.js";

async function generate(schemas: Record<string, unknown>, options: OpenAPITSOptions = {}) {
  return astToString(
    await openapiTS(
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "Generated types", version: "1" },
        paths: {},
        components: { schemas },
      }),
      options,
    ),
  );
}

function expectTypechecks(source: string, consumer: string) {
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    target: ts.ScriptTarget.ESNext,
    lib: ["lib.esnext.d.ts"],
    types: [],
    skipLibCheck: true,
  };
  const host = ts.createCompilerHost(options);
  const getSourceFile = host.getSourceFile.bind(host);
  host.getSourceFile = (filename, languageVersion, onError, shouldCreateNewSourceFile) =>
    filename === "generated.ts"
      ? ts.createSourceFile(filename, `${source}\n${consumer}`, languageVersion, true)
      : getSourceFile(filename, languageVersion, onError, shouldCreateNewSourceFile);
  const program = ts.createProgram(["generated.ts"], options, host);
  expect(
    ts.getPreEmitDiagnostics(program).map(({ messageText }) => ts.flattenDiagnosticMessageText(messageText, "\n")),
  ).toEqual([]);
}

test("generates nested object properties containing URI fragment characters", async () => {
  const output = await generate({
    Data: {
      type: "object",
      properties: {
        "25%": { type: "object", properties: { color: { type: "string" } } },
      },
    },
  });
  expectTypechecks(output, 'const data: components["schemas"]["Data"] = { "25%": { color: "red" } };');
});

test("generates an enum member for an empty string", async () => {
  const output = await generate({ Value: { type: "string", enum: ["", "foo"] } }, { enum: true });
  expectTypechecks(output, 'const value: components["schemas"]["Value"] = Value[""];');
});

test("keeps enum descriptions inside comments for every JavaScript line terminator", async () => {
  const output = await generate(
    {
      Value: {
        type: "integer",
        enum: [100, 101, 102, 103],
        "x-enum-descriptions": ["first\nsecond", "first\rsecond", "first\u2028second", "first\u2029second"],
      },
    },
    { enum: true },
  );
  expectTypechecks(output, 'const value: components["schemas"]["Value"] = Value.Value100;');
  expect(output.match(/\/\/ first second/g)).toHaveLength(4);
});

test("keeps different enum values distinct when their custom member names match", async () => {
  const output = await generate(
    {
      First: { type: "string", enum: ["one"], "x-enum-varnames": ["A"] },
      Second: { type: "string", enum: ["two"], "x-enum-varnames": ["A"] },
    },
    { enum: true, dedupeEnums: true },
  );
  expectTypechecks(output, 'const second: components["schemas"]["Second"] = Second.A; const value: "two" = second;');
});

test("deduplicates equivalent enums while retaining each value's custom member name", async () => {
  const output = await generate(
    {
      First: { type: "string", enum: ["red", "blue"], "x-enum-varnames": ["Red", "Blue"] },
      Second: { type: "string", enum: ["blue", "red"], "x-enum-varnames": ["Blue", "Red"] },
    },
    { enum: true, dedupeEnums: true },
  );
  expectTypechecks(output, 'const second: components["schemas"]["Second"] = First.Red;');
  expect(output.match(/export enum /g)).toHaveLength(1);
});

test("generates enum names independently of earlier documents", async () => {
  await generate({ First: { type: "string", enum: ["value"] } }, { enum: true, dedupeEnums: true });
  const output = await generate({ Second: { type: "string", enum: ["value"] } }, { enum: true, dedupeEnums: true });
  expectTypechecks(output, 'const second: components["schemas"]["Second"] = Second.value;');
});

test("keeps sanitized enum member names unique without overwriting existing labels", async () => {
  const output = await generate(
    { Collision: { type: "string", enum: ["a-b", "a b", "a_b", "a_b_2"] } },
    { enum: true },
  );
  expectTypechecks(
    output,
    'const first: "a-b" = Collision.a_b; const second: "a b" = Collision.a_b_3; const third: "a_b" = Collision.a_b_4; const reserved: "a_b_2" = Collision.a_b_2;',
  );
});

test("escapes quoted and backslash enum member names", async () => {
  const output = await generate({ Value: { type: "string", enum: ['"', "\\"] } }, { enum: true });
  expectTypechecks(output, 'const quote: \'"\' = Value[\'"\']; const slash: "\\\\" = Value["\\\\"];');
});

test("parses flow-style YAML through the Node API", async () => {
  const output = astToString(
    await openapiTS(
      '{openapi: 3.1.0, info: {title: Flow, version: "1"}, paths: {}, components: {schemas: {Value: {type: string}}}}',
    ),
  );
  expectTypechecks(output, 'const value: components["schemas"]["Value"] = "text";');
});

test("applies required-only allOf constraints to inherited properties", async () => {
  const output = await generate({
    Base: { type: "object", properties: { name: { type: "string" } } },
    Derived: { allOf: [{ $ref: "#/components/schemas/Base" }, { type: "object", required: ["name"] }] },
  });
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Derived"] = { name: "present" };
// @ts-expect-error name is required by the allOf constraint
const missing: components["schemas"]["Derived"] = {};
`,
  );
});

test("retains sibling constraints around anyOf", async () => {
  const output = await generate({
    Value: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
      anyOf: [
        { type: "object", properties: { a: { type: "number" } }, required: ["a"] },
        { type: "object", properties: { b: { type: "string" } }, required: ["b"] },
      ],
    },
  });
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Value"] = { name: "present", a: 1 };
// @ts-expect-error every alternative still requires name
const missing: components["schemas"]["Value"] = { a: 1 };
`,
  );
});

test("applies sibling composition once to each primitive type array", async () => {
  const output = await generate({
    Value: { type: ["string", "null"], allOf: [{ type: "string" }] },
  });
  expect(output).toContain("Value: (string | null) & string;");
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Value"] = "x";
// @ts-expect-error the allOf schema excludes null
const invalid: components["schemas"]["Value"] = null;
`,
  );
});

test("includes both array length bounds and rejects values below minItems", async () => {
  const output = await generate(
    { Value: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 3 } },
    { arrayLength: true },
  );
  expectTypechecks(
    output,
    `
const min: components["schemas"]["Value"] = ["a"];
const max: components["schemas"]["Value"] = ["a", "b", "c"];
// @ts-expect-error minItems is one
const empty: components["schemas"]["Value"] = [];
// @ts-expect-error maxItems is three
const extra: components["schemas"]["Value"] = ["a", "b", "c", "d"];
`,
  );
});

test("preserves nested tuple arrays without adding an array level", async () => {
  const output = await generate(
    {
      Value: {
        type: "array",
        minItems: 2,
        maxItems: 2,
        items: { type: "array", minItems: 2, maxItems: 2, items: { type: "string" } },
      },
    },
    { arrayLength: true },
  );
  expectTypechecks(output, 'const value: components["schemas"]["Value"] = [["a", "b"], ["c", "d"]];');
});

test("preserves unbounded nested arrays", async () => {
  const output = await generate({ Value: { type: "array", items: { type: "array", items: { type: "string" } } } });
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Value"] = [["a"], ["b"]];
// @ts-expect-error the outer array contains arrays
const flat: components["schemas"]["Value"] = ["a"];
`,
  );
});

test("allows the items tail after prefixItems", async () => {
  const output = await generate({
    Value: {
      type: "array",
      prefixItems: [{ type: "number" }, { type: "number" }],
      minItems: 2,
      items: { type: "string" },
    },
  });
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Value"] = [1, 2, "tail"];
// @ts-expect-error the tail contains strings
const wrong: components["schemas"]["Value"] = [1, 2, true];
`,
  );
});

test("keeps arrayLength output readonly when immutable is enabled", async () => {
  const output = await generate(
    { Value: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 2 } },
    { arrayLength: true, immutable: true },
  );
  expectTypechecks(
    output,
    `
declare const value: components["schemas"]["Value"];
// @ts-expect-error immutable arrays cannot be mutated
const mutable: string[] = value;
`,
  );
});

test("keeps prefix items optional and closes the tail only when items is false", async () => {
  const output = await generate({
    Open: { type: "array", prefixItems: [{ type: "string" }] },
    Closed: { type: "array", prefixItems: [{ type: "string" }], items: false },
  });
  expectTypechecks(
    output,
    `
const empty: components["schemas"]["Open"] = [];
const tail: components["schemas"]["Open"] = ["x", 1, true];
const closed: components["schemas"]["Closed"] = [];
// @ts-expect-error a present prefix value must match its schema
const wrongPrefix: components["schemas"]["Open"] = [1];
// @ts-expect-error items:false disallows a tail
const wrongTail: components["schemas"]["Closed"] = ["x", 1];
`,
  );
});

test("generates distinct paths enum members without operationId", async () => {
  const output = astToString(
    await openapiTS(
      {
        openapi: "3.1.0",
        info: { title: "Path names", version: "1" },
        paths: {
          "/api/block": { get: { responses: { "200": { description: "OK" } } } },
          "/api/block/{blockId}": {
            get: {
              parameters: [{ name: "blockId", in: "path", required: true, schema: { type: "string" } }],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      },
      { makePathsEnum: true },
    ),
  );
  expectTypechecks(
    output,
    'const first: "/api/block" = ApiPaths.GetApiBlock; const second: "/api/block/{blockId}" = ApiPaths.GetApiBlock_2;',
  );
});

test("uses a parameter content schema for its type", async () => {
  const output = astToString(
    await openapiTS({
      openapi: "3.1.0",
      info: { title: "Content parameter", version: "1" },
      paths: {
        "/filter": {
          get: {
            parameters: [
              {
                name: "filter",
                in: "query",
                content: {
                  "application/json": {
                    schema: { type: "object", properties: { active: { type: "boolean" } }, required: ["active"] },
                  },
                },
              },
            ],
            responses: { "200": { description: "OK" } },
          },
        },
      },
    }),
  );
  expectTypechecks(
    output,
    `
const query: NonNullable<paths["/filter"]["get"]["parameters"]["query"]> = { filter: { active: true } };
// @ts-expect-error filter content is an object
const wrong: NonNullable<paths["/filter"]["get"]["parameters"]["query"]> = { filter: "text" };
`,
  );
});

test("keeps inline visibility helpers consistent with the library contracts", async () => {
  const output = await generate(
    {
      Value: {
        type: "object",
        properties: {
          id: { type: "number", readOnly: true },
          password: { type: "string", writeOnly: true },
          date: { type: "string", format: "date-time" },
          identity: { type: "string", format: "id" },
          optional: { type: "null" },
          values: { type: "array", items: { type: "string" } },
        },
        required: ["id", "password", "date", "identity", "values"],
      },
    },
    {
      readWriteMarkers: true,
      immutable: true,
      inject: 'type Id = string & { readonly __brand: "Id" };',
      transform(schema) {
        if (schema.format === "date-time") {
          return ts.factory.createTypeReferenceNode("Date");
        }
        if (schema.format === "id") {
          return ts.factory.createTypeReferenceNode("Id");
        }
      },
    },
  );
  expectTypechecks(
    output,
    `
declare const value: Readable<components["schemas"]["Value"]>;
const date: Date = value.date;
const identity: Id = value.identity;
const optional: null | undefined = value.optional;
const values: readonly string[] = value.values;
declare const id: Id;
const valid: Writable<components["schemas"]["Value"]> = { password: "secret", date: new Date(), identity: id, values: [] };
// @ts-expect-error writeOnly properties are absent from responses
value.password;
// @ts-expect-error readOnly properties cannot be written
const writable: Writable<components["schemas"]["Value"]> = { ...valid, id: 1 };
`,
  );
});

test("compiles enumValues with immutable arrays", async () => {
  const output = await generate(
    {
      Value: {
        type: "object",
        properties: {
          fields: {
            type: "array",
            items: { type: "object", properties: { name: { type: "string", enum: ["a", "b"] } } },
          },
        },
      },
    },
    { enumValues: true, immutable: true },
  );
  expectTypechecks(output, 'const values: readonly ("a" | "b")[] = valueFieldsNameValues;');
});

test("compiles enumValues below nullable objects", async () => {
  const output = await generate(
    {
      Value: {
        type: "object",
        properties: {
          submission: {
            type: ["object", "null"],
            properties: { status: { type: "string", enum: ["draft", "submitted"] } },
          },
        },
      },
    },
    { enumValues: true },
  );
  expectTypechecks(output, 'const values: readonly ("draft" | "submitted")[] = valueSubmissionStatusValues;');
});

test("uses nested $defs without requiring them in the payload", async () => {
  const output = await generate({
    Value: {
      type: "object",
      $defs: { name: { type: "string" } },
      properties: { name: { $ref: "#/components/schemas/Value/$defs/name" } },
      required: ["name"],
    },
  });
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Value"] = { name: "text" };
// @ts-expect-error the referenced definition is a string
const wrong: components["schemas"]["Value"] = { name: 1 };
`,
  );
});

test("escapes literal backticks in typed path templates", async () => {
  const output = astToString(
    await openapiTS(
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "Typed paths", version: "1" },
        paths: {
          "/quoted`/{id}": {
            get: {
              parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
              responses: { "200": { description: "OK" } },
            },
          },
        },
      }),
      { pathParamsAsTypes: true },
    ),
  );
  expectTypechecks(
    output,
    'const path: keyof paths = "/quoted`/12";\n// @ts-expect-error id is numeric\nconst wrong: keyof paths = "/quoted`/text";',
  );
});

test("preserves declared discriminator values instead of replacing them with schema names", async () => {
  const output = await generate({
    Comments: {
      oneOf: [{ $ref: "#/components/schemas/TextComment" }, { $ref: "#/components/schemas/QuoteComment" }],
      discriminator: { propertyName: "type" },
    },
    TextComment: { type: "object", required: ["type"], properties: { type: { type: "string", enum: ["text"] } } },
    QuoteComment: { type: "object", required: ["type"], properties: { type: { type: "string", enum: ["quote"] } } },
  });
  expectTypechecks(output, 'const text: components["schemas"]["TextComment"] = { type: "text" };');
});

test("does not add a discriminator value to a wrapper around a discriminated union", async () => {
  const output = await generate({
    Choice: {
      oneOf: [{ $ref: "#/components/schemas/Cat" }, { $ref: "#/components/schemas/Dog" }],
      discriminator: {
        propertyName: "type",
        mapping: { cat: "#/components/schemas/Cat", dog: "#/components/schemas/Dog" },
      },
    },
    Wrapped: { allOf: [{ $ref: "#/components/schemas/Choice" }] },
    Cat: { type: "object", properties: { type: { type: "string", enum: ["cat"] } }, required: ["type"] },
    Dog: { type: "object", properties: { type: { type: "string", enum: ["dog"] } }, required: ["type"] },
  });
  expectTypechecks(output, 'const wrapped: components["schemas"]["Wrapped"] = { type: "cat" };');
});

test("keeps child discriminator mappings when the parent has its own allOf", async () => {
  const output = await generate({
    A: { allOf: [{ $ref: "#/components/schemas/Base" }], properties: { name: { type: "string" } } },
    Base: {
      allOf: [{ $ref: "#/components/schemas/Root" }],
      properties: { id: { type: "string" } },
      discriminator: { propertyName: "type", mapping: { a: "#/components/schemas/A", z: "#/components/schemas/Z" } },
    },
    Root: { type: "object", properties: { type: { type: "string" } }, discriminator: { propertyName: "type" } },
    Z: { allOf: [{ $ref: "#/components/schemas/Base" }], properties: { name: { type: "string" } } },
  });
  expectTypechecks(
    output,
    'const a: components["schemas"]["A"] = { type: "a" }; const z: components["schemas"]["Z"] = { type: "z" };',
  );
});

test("does not duplicate an existing discriminator constraint in allOf", async () => {
  const output = await generate({
    Image: {
      oneOf: [{ $ref: "#/components/schemas/AgentImage" }],
      discriminator: { propertyName: "type", mapping: { agent: "#/components/schemas/AgentImage" } },
    },
    ImageBase: { type: "object", properties: { url: { type: "string" } }, required: ["url"] },
    AgentImage: {
      allOf: [
        { $ref: "#/components/schemas/ImageBase" },
        { type: "object", properties: { type: { type: "string", enum: ["agent"] } }, required: ["type"] },
      ],
    },
  });
  expectTypechecks(output, 'const image: components["schemas"]["AgentImage"] = { type: "agent", url: "url" };');
  expect(output.match(/type: "agent"/g)).toHaveLength(1);
});

test("keeps unrelated required properties on discriminator-patched references", async () => {
  const output = await generate({
    CatProps: {
      type: "object",
      properties: { kittens: { type: "number" }, sound: { type: "string" } },
      required: ["sound"],
    },
    DogProps: {
      type: "object",
      properties: { puppies: { type: "number" }, sound: { type: "string" } },
      required: ["sound"],
    },
    Cat: { allOf: [{ $ref: "#/components/schemas/CatProps" }], required: ["kittens"] },
    Update: {
      oneOf: [{ $ref: "#/components/schemas/CatProps" }, { $ref: "#/components/schemas/DogProps" }],
      discriminator: {
        propertyName: "sound",
        mapping: { meow: "#/components/schemas/CatProps", bark: "#/components/schemas/DogProps" },
      },
    },
  });
  expectTypechecks(
    output,
    `
const cat: components["schemas"]["Cat"] = { sound: "meow", kittens: 1 };
// @ts-expect-error kittens remains required
const missing: components["schemas"]["Cat"] = { sound: "meow" };
`,
  );
});

test("generates finite inheritance types when the parent union references its children", async () => {
  const output = await generate({
    Animal: {
      type: "object",
      required: ["type", "name"],
      properties: { type: { type: "string" }, name: { type: "string" } },
      oneOf: [{ $ref: "#/components/schemas/Cat" }, { $ref: "#/components/schemas/Dog" }],
      discriminator: {
        propertyName: "type",
        mapping: { cat: "#/components/schemas/Cat", dog: "#/components/schemas/Dog" },
      },
    },
    Cat: {
      allOf: [{ $ref: "#/components/schemas/Animal" }, { type: "object", properties: { age: { type: "number" } } }],
    },
    Dog: {
      allOf: [{ $ref: "#/components/schemas/Animal" }, { type: "object", properties: { bark: { type: "boolean" } } }],
    },
  });
  expectTypechecks(
    output,
    `
const cat: components["schemas"]["Animal"] = { type: "cat", name: "Misty", age: 1 };
// @ts-expect-error inherited name remains required
const missing: components["schemas"]["Cat"] = { type: "cat" };
// @ts-expect-error discriminator rejects an unknown variant
const wrong: components["schemas"]["Animal"] = { type: "fish", name: "Nemo" };
`,
  );
});

test("accepts the parent enum member while retaining the generated child enum export", async () => {
  const output = await generate(
    {
      PetType: { type: "string", enum: ["Cat", "Dog"] },
      Pet: {
        type: "object",
        properties: { type: { $ref: "#/components/schemas/PetType" } },
        required: ["type"],
        discriminator: { propertyName: "type", mapping: { Cat: "#/components/schemas/Cat" } },
      },
      Cat: {
        allOf: [{ $ref: "#/components/schemas/Pet" }, { type: "object", properties: { name: { type: "string" } } }],
      },
    },
    { enum: true },
  );
  expectTypechecks(
    output,
    `
const parent: components["schemas"]["Cat"] = { type: PetType.Cat };
const child: components["schemas"]["Cat"] = { type: CatType.Cat };
// @ts-expect-error the parent enum's other member is not a Cat
const dog: components["schemas"]["Cat"] = { type: PetType.Dog };
`,
  );
});

test("honors referenced readOnly and writeOnly property annotations", async () => {
  const schemas = {
    Payload: {
      type: "object",
      properties: { role: { $ref: "#/components/schemas/Role" }, password: { $ref: "#/components/schemas/Password" } },
      required: ["role", "password"],
    },
    Role: { type: "string", enum: ["admin", "user"], readOnly: true },
    Password: { type: "string", writeOnly: true },
  };
  const output = await generate(schemas, { enum: true });
  expectTypechecks(
    output,
    `
declare let payload: components["schemas"]["Payload"];
// @ts-expect-error the referenced enum is readonly
payload.role = Role.user;
`,
  );
  const marked = await generate(schemas, { readWriteMarkers: true });
  expect(marked).toContain('$Read<components["schemas"]["Role"]>');
  expect(marked).toContain('$Write<components["schemas"]["Password"]>');
});

test("keeps an empty object member neutral within allOf without admitting primitives", async () => {
  const output = await generate({
    Base: { type: "object", properties: { type: { type: "string" } }, required: ["type"] },
    Extended: { allOf: [{ $ref: "#/components/schemas/Base" }, { type: "object" }] },
    Closed: { allOf: [{ $ref: "#/components/schemas/Base" }, { type: "object", additionalProperties: false }] },
    Impossible: { allOf: [{ type: "string" }, { type: "object" }] },
  });
  expectTypechecks(
    output,
    `
const value: components["schemas"]["Extended"] = { type: "external" };
// @ts-expect-error the empty member does not allow undeclared Base properties
const extra: components["schemas"]["Extended"] = { type: "external", extra: true };
// @ts-expect-error an explicitly closed empty object forbids Base properties
const closed: components["schemas"]["Closed"] = { type: "external" };
// @ts-expect-error an object constraint cannot be satisfied by a string
const primitive: components["schemas"]["Impossible"] = "text";
`,
  );
});
