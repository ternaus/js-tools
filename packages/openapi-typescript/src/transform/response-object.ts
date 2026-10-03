import ts from "@typescript/typescript6";
import {
  addJSDocComment,
  NEVER,
  oapiRef,
  QUESTION_TOKEN,
  STRING,
  tsModifiers,
  tsPropertyIndex,
  UNKNOWN,
} from "../lib/ts.js";
import { createRef, getEntries } from "../lib/utils.js";
import type { ResponseObject, TransformNodeOptions } from "../types.js";
import transformHeaderObject from "./header-object.js";
import transformMediaTypeObject from "./media-type-object.js";

/**
 * Transform ResponseObject nodes (4.8.17)
 * @see https://spec.openapis.org/oas/v3.1.0#response-object
 */
export default function transformResponseObject(
  responseObject: ResponseObject,
  options: TransformNodeOptions,
): ts.TypeNode {
  const type: ts.TypeElement[] = [];

  const headersObject: ts.TypeElement[] = [];
  if (responseObject.headers) {
    for (const [name, headerObject] of getEntries(responseObject.headers, options.ctx)) {
      const optional = "$ref" in headerObject || headerObject.required ? undefined : QUESTION_TOKEN;
      const subType =
        "$ref" in headerObject
          ? oapiRef(headerObject.$ref)
          : transformHeaderObject(headerObject, {
              ...options,
              path: createRef([options.path, "headers", name]),
            });
      const property = ts.factory.createPropertySignature(
        tsModifiers({ readonly: options.ctx.immutable }),
        tsPropertyIndex(name),
        optional,
        subType,
      );
      addJSDocComment(headerObject, property);
      headersObject.push(property);
    }
  }
  // allow additional unknown headers
  headersObject.push(
    ts.factory.createIndexSignature(
      tsModifiers({ readonly: options.ctx.immutable }),
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          ts.factory.createIdentifier("name"),
          undefined,
          STRING,
        ),
      ],
      UNKNOWN,
    ),
  );
  type.push(
    ts.factory.createPropertySignature(
      undefined,
      tsPropertyIndex("headers"),
      undefined,
      ts.factory.createTypeLiteralNode(headersObject),
    ),
  );

  const contentObject: ts.TypeElement[] = [];
  if (responseObject.content) {
    for (const [contentType, mediaTypeObject] of getEntries(responseObject.content ?? {}, options.ctx)) {
      const property = ts.factory.createPropertySignature(
        tsModifiers({ readonly: options.ctx.immutable }),
        tsPropertyIndex(contentType),
        undefined,
        transformMediaTypeObject(mediaTypeObject, {
          ...options,
          path: createRef([options.path, "content", contentType]),
        }),
      );
      addJSDocComment(mediaTypeObject, property);
      contentObject.push(property);
    }
  }
  if (contentObject.length) {
    type.push(
      ts.factory.createPropertySignature(
        undefined,
        tsPropertyIndex("content"),
        undefined,
        ts.factory.createTypeLiteralNode(contentObject),
      ),
    );
  } else {
    type.push(ts.factory.createPropertySignature(undefined, tsPropertyIndex("content"), QUESTION_TOKEN, NEVER));
  }

  return ts.factory.createTypeLiteralNode(type);
}
