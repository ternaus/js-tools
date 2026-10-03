import { performance } from "node:perf_hooks";
import ts from "@typescript/typescript6";
import * as changeCase from "change-case";
import { addJSDocComment, NEVER, QUESTION_TOKEN, tsModifiers, tsPropertyIndex } from "../lib/ts.js";
import { createRef, debug, getEntries } from "../lib/utils.js";
import type { ComponentsObject, GlobalContext, SchemaObject, TransformNodeOptions } from "../types.js";
import transformHeaderObject from "./header-object.js";
import transformParameterObject from "./parameter-object.js";
import transformPathItemObject from "./path-item-object.js";
import transformRequestBodyObject from "./request-body-object.js";
import transformResponseObject from "./response-object.js";
import transformSchemaObject from "./schema-object.js";

/** Root aliases must not duplicate declarations already emitted by --enum. */
export function isEnumSchema(schema: unknown): boolean {
  return (
    typeof schema === "object" &&
    schema !== null &&
    !Array.isArray(schema) &&
    "enum" in schema &&
    Array.isArray(schema.enum) &&
    (!("type" in schema) || schema.type !== "object") &&
    !("properties" in schema) &&
    !("additionalProperties" in schema)
  );
}

type ComponentTransforms = keyof Omit<ComponentsObject, "examples" | "securitySchemes" | "links" | "callbacks">;

const transformers: Record<ComponentTransforms, (node: any, options: TransformNodeOptions) => ts.TypeNode> = {
  schemas: transformSchemaObject,
  responses: transformResponseObject,
  parameters: transformParameterObject,
  requestBodies: transformRequestBodyObject,
  headers: transformHeaderObject,
  pathItems: transformPathItemObject,
};

/**
 * Transform the ComponentsObject (4.8.7)
 * @see https://spec.openapis.org/oas/latest.html#components-object
 */
export default function transformComponentsObject(componentsObject: ComponentsObject, ctx: GlobalContext): ts.Node[] {
  const type: ts.TypeElement[] = [];
  const rootTypeAliases: { [key: string]: ts.TypeAliasDeclaration } = {};
  for (const key of Object.keys(transformers) as ComponentTransforms[]) {
    const componentT = performance.now();

    const items: ts.TypeElement[] = [];
    if (componentsObject[key]) {
      for (const [name, item] of getEntries<SchemaObject>(componentsObject[key], ctx)) {
        let subType = transformers[key](item, {
          path: createRef(["components", key, name]),
          schema: item,
          ctx,
        });

        let hasQuestionToken = false;
        if (ctx.transform) {
          const result = ctx.transform(item, {
            path: createRef(["components", key, name]),
            schema: item,
            ctx,
          });
          if (result) {
            if ("schema" in result) {
              subType = result.schema;
              hasQuestionToken = result.questionToken;
            } else {
              subType = result;
            }
          }
        }

        const property = ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex(name),
          hasQuestionToken ? QUESTION_TOKEN : undefined,
          subType,
        );
        addJSDocComment(item, property);
        items.push(property);

        if (ctx.rootTypes) {
          const shouldSkipEnumSchema = ctx.enum && key === "schemas" && isEnumSchema(item);

          if (!shouldSkipEnumSchema) {
            const componentKey = changeCase.pascalCase(singularizeComponentKey(key));
            const componentName = ctx.rootTypesKeepCasing && key === "schemas" ? name : changeCase.pascalCase(name);
            let aliasName = `${componentKey}${componentName}`;

            let conflictCounter = 1;

            while (rootTypeAliases[aliasName] !== undefined) {
              conflictCounter++;
              aliasName = `${componentKey}${componentName}_${conflictCounter}`;
            }
            const ref = ts.factory.createTypeReferenceNode(`components['${key}']['${name}']`);
            if (ctx.rootTypesNoSchemaPrefix && key === "schemas") {
              aliasName = aliasName.replace(componentKey, "");
            }
            const typeAlias = ts.factory.createTypeAliasDeclaration(
              tsModifiers({ export: true }),
              aliasName,
              undefined,
              ref,
            );
            rootTypeAliases[aliasName] = typeAlias;
          }
        }
      }
    }
    type.push(
      ts.factory.createPropertySignature(
        undefined,
        tsPropertyIndex(key),
        undefined,
        items.length ? ts.factory.createTypeLiteralNode(items) : NEVER,
      ),
    );

    debug(`Transformed components → ${key}`, "ts", performance.now() - componentT);
  }

  let rootTypes: ts.TypeAliasDeclaration[] = [];
  if (ctx.rootTypes) {
    rootTypes = Object.keys(rootTypeAliases).map((k) => rootTypeAliases[k]);
  }

  return [ts.factory.createTypeLiteralNode(type), ...rootTypes];
}

export function singularizeComponentKey(
  key: `x-${string}` | "schemas" | "responses" | "parameters" | "requestBodies" | "headers" | "pathItems",
): string {
  switch (key) {
    case "requestBodies":
      return "requestBody";
    default:
      return key.slice(0, -1);
  }
}
