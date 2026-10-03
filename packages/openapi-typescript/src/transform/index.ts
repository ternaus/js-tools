import { performance } from "node:perf_hooks";
import ts from "@typescript/typescript6";
import { READ_WRITE_HELPER_TYPES } from "../lib/read-write-types.js";
import { enumCache, NEVER, STRING, stringToAST, tsModifiers, tsRecord } from "../lib/ts.js";
import { debug } from "../lib/utils.js";
import type { GlobalContext, OpenAPI3 } from "../types.js";
import transformComponentsObject from "./components-object.js";
import makeApiPathsEnum from "./paths-enum.js";
import transformPathsObject from "./paths-object.js";
import transformWebhooksObject from "./webhooks-object.js";

type SchemaTransforms = keyof Pick<OpenAPI3, "paths" | "webhooks" | "components">;

const transformers: Record<SchemaTransforms, (node: any, options: GlobalContext) => ts.Node | ts.Node[]> = {
  paths: transformPathsObject,
  webhooks: transformWebhooksObject,
  components: transformComponentsObject,
};

export default function transformSchema(schema: OpenAPI3, ctx: GlobalContext) {
  enumCache.clear();
  const type: ts.Node[] = [];

  if (ctx.readWriteMarkers) {
    type.push(...stringToAST(READ_WRITE_HELPER_TYPES));
  }

  if (ctx.inject) {
    type.push(...stringToAST(ctx.inject));
  }

  for (const root of Object.keys(transformers) as SchemaTransforms[]) {
    const emptyObj = ts.factory.createTypeAliasDeclaration(
      tsModifiers({ export: true }),
      root,
      undefined,
      tsRecord(STRING, NEVER),
    );

    if (schema[root] && typeof schema[root] === "object") {
      const rootT = performance.now();
      const subTypes = ([] as ts.Node[]).concat(transformers[root](schema[root], ctx));
      for (const subType of subTypes) {
        if (ts.isTypeLiteralNode(subType)) {
          if (subType.members.length) {
            type.push(
              ctx.exportType
                ? ts.factory.createTypeAliasDeclaration(tsModifiers({ export: true }), root, undefined, subType)
                : ts.factory.createInterfaceDeclaration(
                    tsModifiers({ export: true }),
                    root,
                    undefined,
                    undefined,
                    subType.members,
                  ),
            );
            debug(`${root} done`, "ts", performance.now() - rootT);
          } else {
            type.push(emptyObj);
            debug(`${root} done (skipped)`, "ts", 0);
          }
        } else if (ts.isTypeAliasDeclaration(subType)) {
          type.push(subType);
        } else {
          type.push(emptyObj);
          debug(`${root} done (skipped)`, "ts", 0);
        }
      }
    } else {
      type.push(emptyObj);
      debug(`${root} done (skipped)`, "ts", 0);
    }
  }

  const hasOperations = ctx.injectFooter.some(
    (node) => (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name.text === "operations",
  );
  type.push(...ctx.injectFooter);
  if (!hasOperations) {
    type.push(
      ts.factory.createTypeAliasDeclaration(
        tsModifiers({ export: true }),
        "operations",
        undefined,
        tsRecord(STRING, NEVER),
      ),
    );
  }

  if (ctx.makePathsEnum && schema.paths) {
    type.push(makeApiPathsEnum(schema.paths));
  }

  return type;
}
