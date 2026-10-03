import type ts from "@typescript/typescript6";
import { tsEnum } from "../lib/ts.js";
import { getEntries } from "../lib/utils.js";
import type { PathsObject } from "../types.js";

export default function makeApiPathsEnum(pathsObject: PathsObject): ts.EnumDeclaration {
  const enumKeys = [];
  const enumMetaData = [];

  for (const [url, pathItemObject] of getEntries(pathsObject)) {
    for (const [method, operation] of Object.entries(pathItemObject)) {
      if (!["get", "put", "post", "delete", "options", "head", "patch", "trace"].includes(method)) {
        continue;
      }

      let pathName: string;
      if (operation.operationId) {
        pathName = operation.operationId;
      } else {
        pathName = (method + url)
          .split("/")
          .map((part) => {
            const capitalised = part.charAt(0).toUpperCase() + part.slice(1);

            // Remove any characters not allowed as enum keys, and attempt to remove
            //  named parameters.
            return capitalised.replace(/{.*}|:.*|[^a-zA-Z\d_]+/, "");
          })
          .join("");
      }
      enumKeys.push(url);
      enumMetaData.push({
        name: pathName,
      });
    }
  }

  return tsEnum("ApiPaths", enumKeys, enumMetaData, {
    export: true,
  });
}
