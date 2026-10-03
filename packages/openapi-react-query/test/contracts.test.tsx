import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import createFetchClient from "@ternaus/openapi-fetch";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, expect, it } from "vitest";
import createClient from "../src/index.js";
import type { paths } from "./fixtures/api.js";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
afterEach(() => queryClient.clear());

it("separates API servers while sharing normalized base URLs", async () => {
  const client = (baseUrl: string, value: string) =>
    createClient(createFetchClient<paths>({ baseUrl, fetch: async () => Response.json([value]) }));
  const a = client("https://a.example/", "a");
  const same = client("https://a.example", "unused");
  const b = client("https://b.example", "b");
  expect(a.queryOptions("get", "/string-array").queryKey).toEqual(same.queryOptions("get", "/string-array").queryKey);
  await queryClient.fetchQuery(a.queryOptions("get", "/string-array"));
  await queryClient.fetchQuery(b.queryOptions("get", "/string-array"));
  expect(queryClient.getQueryData(a.queryOptions("get", "/string-array").queryKey)).toEqual(["a"]);
  expect(queryClient.getQueryData(b.queryOptions("get", "/string-array").queryKey)).toEqual(["b"]);
});

it("isolates explicit cache keys on the same API server", () => {
  const fetchClient = createFetchClient<paths>({ baseUrl: "https://api.example" });
  const a = createClient(fetchClient, { cacheKey: "alice" });
  const b = createClient(fetchClient, { cacheKey: "bob" });
  expect(a.queryOptions("get", "/string-array").queryKey).not.toEqual(b.queryOptions("get", "/string-array").queryKey);
});

it("separates normal and infinite data and preserves an undefined first cursor", async () => {
  const urls: URL[] = [];
  const client = createClient(
    createFetchClient<paths>({
      baseUrl: "https://api.example",
      fetch: async (request) => {
        urls.push(new URL((request as Request).url));
        return Response.json(["value"]);
      },
    }),
  );
  await queryClient.fetchQuery(client.queryOptions("get", "/string-array"));
  const { result } = renderHook(
    () =>
      client.useInfiniteQuery(
        "get",
        "/string-array",
        {},
        {
          initialPageParam: undefined,
          getNextPageParam: () => undefined,
        },
      ),
    { wrapper },
  );
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.pages).toEqual([["value"]]);
  expect(queryClient.getQueryData(client.queryOptions("get", "/string-array").queryKey)).toEqual(["value"]);
  expect(urls).toHaveLength(2);
  expect(urls[1]?.searchParams.has("cursor")).toBe(false);
});

it.each([false, 0, null, "", { code: 500, message: "failure" }])(
  "rejects an HTTP error payload %j unchanged",
  async (payload) => {
    const client = createClient(
      createFetchClient<paths>({
        baseUrl: "https://api.example",
        fetch: async () => Response.json(payload, { status: 500 }),
      }),
    );
    await expect(queryClient.fetchQuery(client.queryOptions("get", "/string-array"))).rejects.toEqual(payload);
  },
);

it("rejects empty HTTP errors with their status and original response", async () => {
  const response = new Response(null, { status: 502 });
  const client = createClient(
    createFetchClient<paths>({ baseUrl: "https://api.example", fetch: async () => response }),
  );
  await expect(queryClient.fetchQuery(client.queryOptions("get", "/string-array"))).rejects.toMatchObject({
    message: expect.stringContaining("502"),
    cause: response,
  });
});

it("returns null for an empty successful query", async () => {
  const client = createClient(
    createFetchClient<paths>({
      baseUrl: "https://api.example",
      fetch: async () => new Response(null, { status: 200 }),
    }),
  );
  await expect(queryClient.fetchQuery(client.queryOptions("get", "/string-array"))).resolves.toBeNull();
});

it("applies the empty error contract to mutations", async () => {
  const response = new Response(null, { status: 503 });
  const client = createClient(
    createFetchClient<paths>({ baseUrl: "https://api.example", fetch: async () => response }),
  );
  const { result } = renderHook(() => client.useMutation("delete", "/blogposts/{post_id}"), { wrapper });
  await act(async () => {
    await expect(result.current.mutateAsync({ params: { path: { post_id: "1" } } })).rejects.toMatchObject({
      cause: response,
    });
  });
  await waitFor(() => expect(result.current.isError).toBe(true));
});
