import { DEFAULT_CTX, type TestCase, testSchemaObjects } from "../../test-helpers.js";

const DEFAULT_OPTIONS = {
  path: "#/components/schemas/schema-object",
  ctx: { ...DEFAULT_CTX },
};

describe("transformSchemaObject > empty/unknown", () => {
  const tests: TestCase[] = [
    [
      "true",
      {
        given: true,
        want: "unknown",
      },
    ],
    [
      "false",
      {
        given: false,
        want: "never",
      },
    ],
    [
      "empty object",
      {
        given: {},
        want: "unknown",
      },
    ],
  ];

  testSchemaObjects(tests, DEFAULT_OPTIONS);
});
