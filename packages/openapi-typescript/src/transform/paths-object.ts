import { performance } from "node:perf_hooks";
import ts from "@typescript/typescript6";
import { addJSDocComment, BOOLEAN, NUMBER, oapiRef, STRING, tsModifiers, tsPropertyIndex } from "../lib/ts.js";
import { createRef, debug, getEntries } from "../lib/utils.js";
import type {
  GlobalContext,
  OperationObject,
  ParameterObject,
  PathItemObject,
  PathsObject,
  ReferenceObject,
} from "../types.js";
import transformPathItemObject, { type Method } from "./path-item-object.js";

const PATH_PARAM_RE = /\{[^}]+\}/g;

/**
 * Transform the PathsObject node (4.8.8)
 * @see https://spec.openapis.org/oas/v3.1.0#operation-object
 */
export default function transformPathsObject(pathsObject: PathsObject, ctx: GlobalContext): ts.TypeNode {
  const type: ts.TypeElement[] = [];
  for (const [url, pathItemObject] of getEntries(pathsObject, ctx)) {
    if (!pathItemObject || typeof pathItemObject !== "object") {
      continue;
    }

    const pathT = performance.now();

    if ("$ref" in pathItemObject) {
      const property = ts.factory.createPropertySignature(
        tsModifiers({ readonly: ctx.immutable }),
        tsPropertyIndex(url),
        undefined,
        oapiRef(pathItemObject.$ref),
      );
      addJSDocComment(pathItemObject, property);
      type.push(property);
    } else {
      const pathItemType = transformPathItemObject(pathItemObject, {
        path: createRef(["paths", url]),
        ctx,
      });

      if (ctx.pathParamsAsTypes && url.includes("{")) {
        const pathParams = extractPathParams(pathItemObject, ctx);
        const matches = [...url.matchAll(PATH_PARAM_RE)];
        const first = matches[0];
        if (first) {
          const spans = matches.map((match, index) => {
            const schemaType = pathParams[match[0].slice(1, -1)]?.schema?.type;
            const parameterType =
              schemaType === "number" || schemaType === "integer"
                ? NUMBER
                : schemaType === "boolean"
                  ? BOOLEAN
                  : STRING;
            const text = url.slice(match.index + match[0].length, matches[index + 1]?.index);
            const literal =
              index === matches.length - 1
                ? ts.factory.createTemplateTail(text)
                : ts.factory.createTemplateMiddle(text);
            return ts.factory.createTemplateLiteralTypeSpan(parameterType, literal);
          });
          const pathType = ts.factory.createTemplateLiteralType(
            ts.factory.createTemplateHead(url.slice(0, first.index)),
            spans,
          );
          type.push(
            ts.factory.createIndexSignature(
              tsModifiers({ readonly: ctx.immutable }),
              [ts.factory.createParameterDeclaration(undefined, undefined, "path", undefined, pathType, undefined)],
              pathItemType,
            ),
          );
          continue;
        }
      }

      type.push(
        ts.factory.createPropertySignature(
          tsModifiers({ readonly: ctx.immutable }),
          tsPropertyIndex(url),
          undefined,
          pathItemType,
        ),
      );

      debug(`Transformed path "${url}"`, "ts", performance.now() - pathT);
    }
  }

  return ts.factory.createTypeLiteralNode(type);
}

function extractPathParams(pathItemObject: PathItemObject, ctx: GlobalContext) {
  const params: Record<string, ParameterObject> = {};
  for (const p of pathItemObject.parameters ?? []) {
    const resolved = "$ref" in p && p.$ref ? ctx.resolve<ParameterObject>(p.$ref) : (p as ParameterObject);
    if (resolved && resolved.in === "path") {
      params[resolved.name] = resolved;
    }
  }
  for (const method of ["get", "put", "post", "delete", "options", "head", "patch", "trace"] as Method[]) {
    if (!(method in pathItemObject)) {
      continue;
    }
    const resolvedMethod = (pathItemObject[method] as ReferenceObject).$ref
      ? ctx.resolve<OperationObject>((pathItemObject[method] as ReferenceObject).$ref)
      : (pathItemObject[method] as OperationObject);
    if (resolvedMethod?.parameters) {
      for (const p of resolvedMethod.parameters) {
        const resolvedParam = "$ref" in p && p.$ref ? ctx.resolve<ParameterObject>(p.$ref) : (p as ParameterObject);
        if (resolvedParam && resolvedParam.in === "path") {
          params[resolvedParam.name] = resolvedParam;
        }
      }
    }
  }
  return params;
}
