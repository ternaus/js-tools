import { assertType, describe, expect, test } from "vitest";
import { createObservedClient } from "../helpers.js";
import type { paths } from "./schemas/delete.js";

describe("DELETE", () => {
  test("returns empty object on 204", async () => {
    const client = createObservedClient<paths>({}, async () => new Response(null, { status: 204 }));
    const { data, error, response } = await client.DELETE("/tags/{name}", {
      params: { path: { name: "New Tag" } },
    });

    assertType<undefined>(data);
    expect(data).toEqual(undefined);
    expect(response.status).toBe(204);

    expect(error).toBeUndefined();
  });

  test("sends the correct method", async () => {
    let method = "";
    const client = createObservedClient<paths>({}, async (req) => {
      method = req.method;
      return new Response(null, { status: 204 });
    });
    await client.DELETE("/tags/{name}", { params: { path: { name: "Tag" } } });
    expect(method).toBe("DELETE");
  });

  test("returns undefined on Content-Length: 0", async () => {
    const client = createObservedClient<paths>(
      {},
      async () => new Response(null, { status: 200, headers: { "Content-Length": "0" } }),
    );
    const { data, error } = await client.DELETE("/tags/{name}", {
      params: {
        path: { name: "Tag" },
      },
    });

    assertType<undefined>(data);
    expect(data).toEqual(undefined);

    expect(error).toBeUndefined();
  });

  test("handles error response with empty body when Content-Length header is stripped by proxy", async () => {
    // Simulate proxy stripping Content-Length header from an empty error response
    const client = createObservedClient<paths>(
      {},
      async () => new Response(null, { status: 500 }), // No Content-Length header
    );
    const { data, error, response } = await client.DELETE("/tags/{name}", {
      params: {
        path: { name: "Tag" },
      },
    });

    expect(data).toBeUndefined();

    expect(error).toBeUndefined();

    expect(response.status).toBe(500);
    expect(response.ok).toBe(false);
  });

  test("handles success response with empty body when Content-Length header is stripped by proxy", async () => {
    // Simulate proxy stripping Content-Length header from an empty success response
    const client = createObservedClient<paths>(
      {},
      async () => new Response(null, { status: 200 }), // No Content-Length header
    );
    const { data, error, response } = await client.DELETE("/tags/{name}", {
      params: {
        path: { name: "Tag" },
      },
    });

    expect(data).toBeUndefined();

    expect(error).toBeUndefined();

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });
});
