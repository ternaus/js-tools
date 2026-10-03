import { DEFAULT_CTX, type TestCase, testSchemaObjects } from "../../test-helpers.js";

const DEFAULT_OPTIONS = {
  path: "#/components/schemas/schema-object",
  ctx: { ...DEFAULT_CTX },
};

describe("transformSchemaObject > boolean", () => {
  const tests: TestCase[] = [
    [
      "basic",
      {
        given: { type: "boolean" },
        want: "boolean",
      },
    ],
    [
      "enum",
      {
        given: { type: "boolean", enum: [false] },
        want: "false",
      },
    ],
    [
      "nullable",
      {
        given: { type: ["boolean", "null"] },
        want: "boolean | null",
      },
    ],
    [
      "nullable (deprecated syntax)",
      {
        given: { type: "boolean", nullable: true },
        want: "boolean | null",
      },
    ],
  ];

  testSchemaObjects(tests, DEFAULT_OPTIONS);
});
