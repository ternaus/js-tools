import type { MediaType } from "@ternaus/openapi-typescript-helpers";
import createClient from "../src/index.js";

export function createObservedClient<T extends {}, M extends MediaType = MediaType>(
  options?: Parameters<typeof createClient<T>>[0],
  onRequest: (input: Request) => Promise<Response> = async () => Response.json({ status: 200, message: "OK" }),
) {
  return createClient<T, M>({
    ...options,
    baseUrl: options?.baseUrl || "https://fake-api.example",
    fetch: onRequest,
  });
}

export function headersToObj(headers: Headers | Record<string, string>): Record<string, string> {
  return Object.fromEntries(headers instanceof Headers ? headers.entries() : Object.entries(headers));
}
