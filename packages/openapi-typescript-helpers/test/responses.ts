import type { SuccessResponse } from "../src/index.js";

export function responseContracts() {
  const fallback: SuccessResponse<{ default: { content: { "application/json": { id: string } } } }> = { id: "x" };
  type Specific = SuccessResponse<{
    200: { content: { "application/json": { id: number } } };
    default: { content: { "application/json": { error: string } } };
  }>;
  const explicit: Specific = { id: 1 };
  // @ts-expect-error an explicit success response takes precedence
  const error: Specific = { error: "x" };
  return { fallback, explicit, error };
}
