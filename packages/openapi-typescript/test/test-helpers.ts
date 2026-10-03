import { fileURLToPath } from "node:url";
import { createConfig } from "@redocly/openapi-core";
import { expect, test } from "vitest";
import { astToString } from "../src/lib/ts.js";
import { resolveRef } from "../src/lib/utils.js";
import transformSchemaObject from "../src/transform/schema-object.js";
import type { GlobalContext, TransformNodeOptions } from "../src/types.js";

export const DEFAULT_CTX: GlobalContext = {
  additionalProperties: false,
  alphabetize: false,
  arrayLength: false,
  defaultNonNullable: true,
  discriminators: {
    objects: {},
    refsHandled: [],
  },
  emptyObjectsUnknown: false,
  enum: false,
  enumValues: false,
  conditionalEnums: false,
  dedupeEnums: false,
  excludeDeprecated: false,
  exportType: false,
  immutable: false,
  injectFooter: [],
  pathParamsAsTypes: false,
  postTransform: undefined,
  propertiesRequiredByDefault: false,
  rootTypes: false,
  rootTypesNoSchemaPrefix: false,
  rootTypesKeepCasing: false,
  redoc: await createConfig({ extends: ["minimal"] }),
  resolve($ref) {
    return resolveRef({}, $ref, { silent: false });
  },
  silent: true,
  transform: undefined,
  transformProperty: undefined,
  makePathsEnum: false,
  generatePathParams: false,
  readWriteMarkers: false,
};

export type TestCase<T = any, O = TransformNodeOptions> = [
  string,
  {
    // Fixtures may contain invalid schemas.
    given: T;
    want: string | URL;
    options?: O;
    ci?: { timeout?: number; skipIf?: boolean };
  },
];

export function testSchemaObjects(tests: TestCase[], defaultOptions: TransformNodeOptions) {
  for (const [name, { given, want, options = defaultOptions, ci }] of tests) {
    test.skipIf(ci?.skipIf)(
      name,
      async () => {
        const result = astToString(transformSchemaObject(given, options));
        if (want instanceof URL) {
          await expect(result).toMatchFileSnapshot(fileURLToPath(want));
        } else {
          expect(result).toBe(`${want}\n`);
        }
      },
      ci?.timeout,
    );
  }
}
