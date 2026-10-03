import { assertType, describe, expect, test } from "vitest";
import { createObservedClient } from "../helpers.js";
import type { components, paths } from "./schemas/never-response.js";

describe("GET", () => {
  test("sends correct method", async () => {
    let method = "";
    const client = createObservedClient<paths>({}, async (req) => {
      method = req.method;
      return Response.json({});
    });
    await client.GET("/posts");
    expect(method).toBe("GET");
  });

  test("sends correct options, returns success", async () => {
    const mockData = {
      id: 123,
      title: "My Post",
    };

    let actualPathname = "";
    const client = createObservedClient<paths>({}, async (req) => {
      actualPathname = new URL(req.url).pathname;
      return Response.json(mockData);
    });

    const { data, error, response } = await client.GET("/posts/{id}", {
      params: { path: { id: 123 } },
    });

    assertType<typeof mockData | undefined>(data);

    expect(actualPathname).toBe("/posts/123");

    expect(data).toEqual(mockData);
    expect(response.status).toBe(200);

    expect(error).toBeUndefined();
  });

  test("sends correct options, returns undefined on 204", async () => {
    let actualPathname = "";
    const client = createObservedClient<paths>({}, async (req) => {
      actualPathname = new URL(req.url).pathname;
      return new Response(null, { status: 204 });
    });

    const { data, error, response } = await client.GET("/posts/{id}", {
      params: { path: { id: 123 } },
    });

    assertType<components["schemas"]["Post"] | undefined>(data);

    expect(actualPathname).toBe("/posts/123");

    expect(data).toEqual(undefined);
    expect(response.status).toBe(204);

    expect(error).toBeUndefined();
  });

  test("sends correct options, returns error", async () => {
    const mockError = { code: 404, message: "Post not found" };

    let method = "";
    let actualPathname = "";
    const client = createObservedClient<paths>({}, async (req) => {
      method = req.method;
      actualPathname = new URL(req.url).pathname;
      return Response.json(mockError, { status: 404 });
    });

    const { data, error, response } = await client.GET("/posts/{id}", {
      params: { path: { id: 123 } },
    });

    assertType<typeof mockError | undefined>(error);

    expect(actualPathname).toBe("/posts/123");

    expect(method).toBe("GET");

    expect(error).toEqual(mockError);
    expect(response.status).toBe(404);

    expect(data).toBeUndefined();
  });

  test("handles array-type responses", async () => {
    const client = createObservedClient<paths>({}, async () => Response.json([]));

    const { data } = await client.GET("/posts", { params: {} });
    if (!data) {
      throw new Error("data empty");
    }

    expect(data.length).toBe(0);
  });

  test("handles empty-array-type 204 response", async () => {
    let method = "";
    let actualPathname = "";
    const client = createObservedClient<paths>({}, async (req) => {
      method = req.method;
      actualPathname = new URL(req.url).pathname;
      return new Response(null, { status: 204 });
    });

    const { data } = await client.GET("/posts", { params: {} });

    assertType<components["schemas"]["Post"][] | unknown[] | undefined>(data);

    expect(actualPathname).toBe("/posts");

    expect(method).toBe("GET");

    expect(data).toEqual(undefined);
  });

  test("gracefully handles invalid JSON for errors", async () => {
    const client = createObservedClient<paths>({}, async () => new Response("Unauthorized", { status: 401 }));

    const { data, error } = await client.GET("/posts");

    expect(data).toBeUndefined();
    expect(error).toBe("Unauthorized");
  });
});
