import { DEFAULT_CTX, type TestCase, testSchemaObjects } from "../../test-helpers.js";

const DEFAULT_OPTIONS = {
  path: "#/components/schemas/schema-object",
  ctx: { ...DEFAULT_CTX },
};

describe("transformSchemaObject > number", () => {
  const tests: TestCase[] = [
    [
      "basic",
      {
        given: { type: "number" },
        want: "number",
      },
    ],
    [
      "enum",
      {
        given: { type: "number", enum: [-50, 50, 100, 200] },
        want: "-50 | 50 | 100 | 200",
      },
    ],
    [
      "integer",
      {
        given: { type: "integer" },
        want: "number",
      },
    ],
    [
      "nullable",
      {
        given: { type: ["number", "null"] },
        want: "number | null",
      },
    ],
    [
      "nullable (deprecated syntax)",
      {
        given: { type: "number", nullable: true },
        want: "number | null",
      },
    ],
  ];

  testSchemaObjects(tests, DEFAULT_OPTIONS);
});
