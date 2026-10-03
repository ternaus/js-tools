import createClient, { createPathBasedClient } from "../src/index.js";

type paths = {
  "/items/{id}": {
    get: {
      parameters: { path: { id: string }; query?: { limit?: number } };
      responses: { 200: { content: { "application/json": string } } };
    };
    post: {
      parameters: { path: { id: string } };
      requestBody: { content: { "application/json": { name: string; values?: { value: number }[] } } };
      responses: { 200: { content: { "application/json": string } } };
    };
  };
  "/open": {
    get: {
      parameters: { query?: Record<string, string> };
      responses: { 200: { content: { "application/json": string } } };
    };
  };
};

export function requestContracts() {
  const client = createClient<paths>();
  client.GET("/items/{id}", { params: { path: { id: "1" }, query: { limit: 2 } }, traceId: "trace", parseAs: "text" });
  client.GET("/open", { params: { query: { anything: "allowed" } } });
  // @ts-expect-error undeclared path parameter
  client.GET("/items/{id}", { params: { path: { id: "1", extra: true } } });
  // @ts-expect-error undeclared query parameter
  client.GET("/items/{id}", { params: { path: { id: "1" }, query: { extra: true } } });
  // @ts-expect-error undeclared body property
  client.POST("/items/{id}", { params: { path: { id: "1" } }, body: { name: "x", extra: true } });
  client.POST("/items/{id}", {
    params: { path: { id: "1" } },
    // @ts-expect-error undeclared nested body property
    body: { name: "x", values: [{ value: 1, extra: true }] },
  });
  // @ts-expect-error request() uses the same parameter contract
  client.request("get", "/items/{id}", { params: { path: { id: "1", extra: true } } });
  const byPath = createPathBasedClient<paths>();
  // @ts-expect-error path-based clients use the same parameter contract
  byPath["/items/{id}"].GET({ params: { path: { id: "1", extra: true } } });
}
