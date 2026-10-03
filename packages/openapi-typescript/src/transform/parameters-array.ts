import ts from "@typescript/typescript6";
import { parseRef } from "../lib/ref.js";
import { addJSDocComment, NEVER, oapiRef, QUESTION_TOKEN, tsModifiers, tsPropertyIndex } from "../lib/ts.js";
import { createRef } from "../lib/utils.js";
import type { ParameterObject, ReferenceObject, TransformNodeOptions } from "../types.js";
import transformParameterObject from "./parameter-object.js";

const PATH_PARAM_RE = /\{([^}]+)\}/g;

/**
 * Synthetic type. Array of (ParameterObject | ReferenceObject)s found in OperationObject and PathItemObject.
 */
export function transformParametersArray(
  parametersArray: (ParameterObject | ReferenceObject)[],
  options: TransformNodeOptions,
): ts.TypeElement[] {
  const workingParameters = [...parametersArray];

  if (options.ctx.generatePathParams && options.path) {
    const path = parseRef(options.path).pointer.join("/");
    for (const [, name] of path.matchAll(PATH_PARAM_RE)) {
      const exists = workingParameters.some((parameter) => {
        const resolved = "$ref" in parameter ? options.ctx.resolve<ParameterObject>(parameter.$ref) : parameter;
        return resolved?.in === "path" && resolved.name === name;
      });
      if (!exists) {
        workingParameters.push({ name, in: "path", required: true, schema: { type: "string" } });
      }
    }
  }

  let operationParameters = workingParameters.map((parameter) => ({
    original: parameter,
    resolved: "$ref" in parameter ? options.ctx.resolve<ParameterObject>(parameter.$ref) : parameter,
  }));
  if (options.ctx.alphabetize) {
    operationParameters.sort((a, b) => (a.resolved?.name ?? "").localeCompare(b.resolved?.name ?? ""));
  }
  if (options.ctx.excludeDeprecated) {
    operationParameters = operationParameters.filter(
      ({ resolved }) => !resolved?.deprecated && !resolved?.schema?.deprecated,
    );
  }

  const paramType: ts.TypeElement[] = [];
  for (const paramIn of ["query", "header", "path", "cookie"] as ParameterObject["in"][]) {
    const paramLocType: ts.TypeElement[] = [];
    for (const { original, resolved } of operationParameters) {
      if (resolved?.in !== paramIn) {
        continue;
      }
      let optional: ts.QuestionToken | undefined;
      if (paramIn !== "path" && !resolved.required) {
        optional = QUESTION_TOKEN;
      }
      const subType =
        "$ref" in original
          ? oapiRef(original.$ref, resolved)
          : transformParameterObject(resolved, {
              ...options,
              path: createRef([options.path, "parameters", resolved.in, resolved.name]),
            });
      const property = ts.factory.createPropertySignature(
        tsModifiers({ readonly: options.ctx.immutable }),
        tsPropertyIndex(resolved.name),
        optional,
        subType,
      );
      addJSDocComment(resolved, property);
      paramLocType.push(property);
    }
    const allOptional = paramLocType.every((node) => !!node.questionToken);
    paramType.push(
      ts.factory.createPropertySignature(
        tsModifiers({ readonly: options.ctx.immutable }),
        tsPropertyIndex(paramIn),
        allOptional ? QUESTION_TOKEN : undefined,
        paramLocType.length ? ts.factory.createTypeLiteralNode(paramLocType) : NEVER,
      ),
    );
  }
  return [
    ts.factory.createPropertySignature(
      tsModifiers({ readonly: options.ctx.immutable }),
      tsPropertyIndex("parameters"),
      undefined,
      ts.factory.createTypeLiteralNode(paramType),
    ),
  ];
}
