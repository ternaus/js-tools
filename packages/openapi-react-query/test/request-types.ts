import createFetchClient from "@ternaus/openapi-fetch";
import createClient, { type UseMutationMethod } from "../src/index.js";
import type { paths } from "./fixtures/api.js";

export function useRequestContracts() {
  const client = createClient(createFetchClient<paths>());
  const useMutation: UseMutationMethod<paths, `${string}/${string}`> = (...args) => client.useMutation(...args);
  useMutation("put", "/comment");
  client.queryOptions("get", "/paginated-data", { params: { query: { limit: 2 } } }, { retry: false });
  // @ts-expect-error retry belongs in the query options argument
  client.useQuery("get", "/string-array", { retry: false });
  // @ts-expect-error undeclared query parameter
  client.queryOptions("get", "/paginated-data", { params: { query: { limit: 2, extra: true } } });
  // @ts-expect-error undeclared path parameter
  client.useQuery("get", "/blogposts/{post_id}", { params: { path: { post_id: "1", extra: true } } });
  // @ts-expect-error undeclared body property
  client.useMutation("put", "/comment").mutate({ body: { message: "x", replied_at: 1, extra: true } });
}
