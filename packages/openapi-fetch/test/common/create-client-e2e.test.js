import { expect, test, vi } from "vitest";
import createClient from "../../src/index.js";

test("forwards requestInitExt to the supplied fetch", async () => {
  const dispatcher = {};
  const fetch = vi.fn(async () => new Response("ok"));
  const client = createClient({
    baseUrl: "https://api.example.com",
    fetch,
    requestInitExt: { dispatcher },
  });

  const result = await client.GET("/v1/foo", { parseAs: "text" });

  expect(fetch).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining({ dispatcher }));
  expect(result.data).toBe("ok");
});
