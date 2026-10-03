import { parseRef } from "../../src/lib/ref.js";
import { createRef, getEntries } from "../../src/lib/utils.js";

describe("getEntries", () => {
  test("operates like Object.entries()", () => {
    expect(getEntries({ z: "z", a: "a" })).toEqual([
      ["z", "z"],
      ["a", "a"],
    ]);
  });

  describe("options", () => {
    test("alphabetize: true", () => {
      expect(getEntries({ z: "z", 0: 0, a: "a" }, { alphabetize: true })).toEqual([
        ["0", 0],
        ["a", "a"],
        ["z", "z"],
      ]);
    });

    test("excludeDeprecated: true", () => {
      expect(
        getEntries(
          {
            z: "z",
            a: "a",
            deprecated: {
              deprecated: true,
            },
          },
          { excludeDeprecated: true },
        ),
      ).toEqual([
        ["z", "z"],
        ["a", "a"],
      ]);
    });
  });
});

describe("createRef", () => {
  test("basic", () => {
    expect(createRef(["components", "schemas", "SchemaObject"])).toBe("#/components/schemas/SchemaObject");
  });

  test("escapes", () => {
    expect(createRef(["paths", "/foo/{bar}", "get", "parameters"])).toBe("#/paths/~1foo~1%7Bbar%7D/get/parameters");
    expect(createRef(["components", "schemas", "~SchemaObject"])).toBe("#/components/schemas/~0SchemaObject");
  });

  test("handles partial paths", () => {
    expect(createRef(["#/paths/~1foo~1{bar}", "parameters", "query", "page"])).toBe(
      "#/paths/~1foo~1%7Bbar%7D/parameters/query/page",
    );
  });

  test.each(["25%", "café", "a#b", "#/literal", "a/b", "~", ""])("preserves property name %j", (name) => {
    const ref = createRef(["components", "schemas", "Data", name]);
    expect(parseRef(ref).pointer).toEqual(["components", "schemas", "Data", name]);
  });
});
