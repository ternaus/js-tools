import type ts from "@typescript/typescript6";
import { STRING, UNKNOWN } from "../lib/ts.js";
import type { MediaTypeObject, ParameterObject, TransformNodeOptions } from "../types.js";
import transformSchemaObject from "./schema-object.js";

/**
 * Transform ParameterObject nodes (4.8.12)
 * @see https://spec.openapis.org/oas/v3.1.0#parameter-object
 */
export default function transformParameterObject(
  parameterObject: ParameterObject,
  options: TransformNodeOptions,
): ts.TypeNode {
  if (parameterObject.schema) {
    return transformSchemaObject(parameterObject.schema, options);
  }
  if (parameterObject.content) {
    const first = Object.values(parameterObject.content)[0];
    const media = first && "$ref" in first ? options.ctx.resolve<MediaTypeObject>(first.$ref) : first;
    return media?.schema ? transformSchemaObject(media.schema, options) : UNKNOWN;
  }
  return STRING;
}
