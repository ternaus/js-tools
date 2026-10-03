import { DEFAULT_CTX, type TestCase, testSchemaObjects } from "../../test-helpers.js";

const DEFAULT_OPTIONS = {
  path: "#/components/schemas/schema-object",
  ctx: { ...DEFAULT_CTX },
};

describe("transformSchemaObject > string", () => {
  const tests: TestCase[] = [
    [
      "basic",
      {
        given: { type: "string" },
        want: "string",
      },
    ],
    [
      "enum",
      {
        given: { type: "string", enum: ["blue", "green", "yellow", ""] },
        want: `"blue" | "green" | "yellow" | ""`,
      },
    ],
    [
      "enum (inferred)",
      {
        given: { properties: { status: { enum: ["complete", "incomplete"] } } },
        want: `{
    /** @enum {unknown} */
    status?: "complete" | "incomplete";
}`,
      },
    ],
    [
      "enum (whitespace)",
      {
        given: { type: "string", enum: [" blue", "green ", " ", ""] },
        want: `" blue" | "green " | " " | ""`,
      },
    ],
    [
      "enum (UTF-8)",
      {
        given: { type: "string", enum: ["赤", "青", "緑"] },
        want: `"赤" | "青" | "緑"`,
      },
    ],
    [
      "enum (quotes)",
      {
        given: { type: "string", enum: ['"', "'", '"', "`"] },
        want: `"\\"" | "'" | "\\"" | "\`"`,
      },
    ],
    [
      "nullable",
      {
        given: { type: ["string", "null"] },
        want: "string | null",
      },
    ],
    [
      "nullable (deprecated syntax)",
      {
        given: { type: "string", nullable: true },
        want: "string | null",
      },
    ],
    [
      "enum + nullable",
      {
        given: { type: ["string", "null"], enum: ["A", "B", "C"] },
        want: '"A" | "B" | "C" | null',
      },
    ],
    [
      "enum + nullable + null value",
      {
        given: { type: ["string", "null"], enum: ["A", "B", "C", null] },
        want: '"A" | "B" | "C" | null',
      },
    ],
    [
      "enum + nullable (deprecated syntax)",
      {
        given: { type: "string", enum: ["A", "B", "C"], nullable: true },
        want: '"A" | "B" | "C" | null',
      },
    ],
    [
      "default + nullable",
      {
        given: { type: ["string", "null"], default: "en" },
        want: "string | null",
      },
    ],
    [
      "default + nullable + enum",
      {
        given: { type: ["string", "null"], enum: ["en", "es", "fr", "de"], default: "en" },
        want: '"en" | "es" | "fr" | "de" | null',
      },
    ],
    [
      "default + nullable (deprecated syntax)",
      {
        given: { type: "string", default: "en", nullable: true },
        want: "string | null",
      },
    ],
    [
      "enum + additionalProperties",
      {
        given: {
          type: "string",
          enum: ["A", "B", "C"],
          additionalProperties: true,
        },
        want: `("A" | "B" | "C") | (string & {})`,
      },
    ],
  ];

  testSchemaObjects(tests, DEFAULT_OPTIONS);
});
