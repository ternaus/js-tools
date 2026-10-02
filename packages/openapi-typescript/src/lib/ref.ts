import { unescapePointerFragment } from "@redocly/openapi-core";

export function parseRef(ref: string): { pointer: string[] } {
  const fragment = decodeURIComponent(ref.split("#")[1] ?? "");
  return { pointer: fragment.startsWith("/") ? fragment.slice(1).split("/").map(unescapePointerFragment) : [] };
}
