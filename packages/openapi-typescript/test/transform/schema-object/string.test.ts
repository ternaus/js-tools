import { DEFAULT_CTX, type TestCase, testSchemaObjects } from "../../test-helpers.js";

const DEFAULT_OPTIONS = {
  path: "#/components/schemas/schema-object",
  ctx: { ...DEFAULT_CTX },
};

const BINARY_AS_STRING_OPTIONS = {
  ...DEFAULT_OPTIONS,
  ctx: { ...DEFAULT_CTX, binaryAsBlob: false },
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
    [
      "options > binaryAsBlob: false > format: binary",
      {
        given: { type: "string", format: "binary" },
        want: "string",
        options: BINARY_AS_STRING_OPTIONS,
      },
    ],
    [
      "options > binaryAsBlob: false > contentMediaType",
      {
        given: { type: "string", contentMediaType: "application/octet-stream" },
        want: "string",
        options: BINARY_AS_STRING_OPTIONS,
      },
    ],
    [
      "binary > format: binary",
      {
        given: { type: "string", format: "binary" },
        want: "Blob",
      },
    ],
    [
      "binary > contentMediaType",
      {
        given: { type: "string", contentMediaType: "application/octet-stream" },
        want: "Blob",
      },
    ],
    [
      "binary > contentMediaType without type",
      {
        given: { contentMediaType: "image/png" },
        want: "Blob",
      },
    ],
    [
      "binary > nullable",
      {
        given: { type: ["string", "null"], contentMediaType: "application/octet-stream" },
        want: "Blob | null",
      },
    ],
    [
      "binary > text contents stay string",
      {
        given: { type: "string", contentMediaType: "application/json" },
        want: "string",
      },
    ],
    [
      "binary > base64 stays string",
      {
        given: { type: "string", contentMediaType: "image/png", contentEncoding: "base64" },
        want: "string",
      },
    ],
    [
      "binary > format: binary with contentEncoding stays string",
      {
        given: { type: "string", format: "binary", contentMediaType: "image/png", contentEncoding: "base64" },
        want: "string",
      },
    ],
    [
      "binary > textual media type with whitespace before parameters stays string",
      {
        given: { type: "string", contentMediaType: "application/json ; charset=utf-8" },
        want: "string",
      },
    ],
  ];

  testSchemaObjects(tests, DEFAULT_OPTIONS);
});
