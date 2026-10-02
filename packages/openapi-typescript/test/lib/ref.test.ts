import { expect, test } from "vitest";
import { parseRef } from "../../src/lib/ref.js";

test("preserves empty JSON Pointer property names", () => {
  expect(parseRef("#/components/schemas/").pointer).toEqual(["components", "schemas", ""]);
});

test("decodes URI fragments and JSON Pointer escapes", () => {
  expect(parseRef("#/components/schemas/caf%C3%A9~1a~0b").pointer).toEqual(["components", "schemas", "café/a~b"]);
});

test("keeps document and anchor references separate from JSON Pointers", () => {
  expect(parseRef("/schema.yaml").pointer).toEqual([]);
  expect(parseRef("schema.yaml#named-anchor").pointer).toEqual([]);
});
