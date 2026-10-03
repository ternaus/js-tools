import vm from "node:vm";
import { expect, it } from "vitest";
import { defaultBodySerializer } from "../../src/index.js";
import { createObservedClient } from "../helpers.js";

type paths = {
  "/resources/{id}": {
    get: { parameters: { path: { id: string } }; responses: { 200: { content: { "application/json": string } } } };
  };
  "/text": {
    post: {
      requestBody: { content: { "text/plain": string } };
      responses: { 200: { content: { "application/json": string } } };
    };
  };
};

it.each(["text/plain", "text/plain; charset=utf-8", "TEXT/PLAIN"])(
  "sends unquoted text for %s",
  async (contentType) => {
    let received = "";
    const client = createObservedClient<paths>({}, async (request) => {
      received = await request.text();
      return Response.json("ok");
    });
    await client.POST("/text", { body: "hello", headers: { "Content-Type": contentType } });
    expect(received).toBe("hello");
  },
);

it("keeps scalar JSON strings quoted", async () => {
  let received = "";
  const client = createObservedClient<paths>({}, async (request) => {
    received = await request.text();
    return Response.json("ok");
  });
  await client.POST("/text", { body: "hello", headers: { "Content-Type": "application/json" } });
  expect(received).toBe('"hello"');
});

it("reads header getters from another JavaScript realm", () => {
  const headers = vm.runInNewContext('({get: () => "application/x-www-form-urlencoded; charset=utf-8"})');
  expect(defaultBodySerializer({ name: "a b" }, headers)).toBe("name=a+b");
});

it.each([".", ".."])("rejects a dot-segment parameter %s before sending a different route", async (id) => {
  let requests = 0;
  const client = createObservedClient<paths>({}, async () => {
    requests++;
    return Response.json("ok");
  });
  await expect(client.GET("/resources/{id}", { params: { path: { id } } })).rejects.toThrow("dot segment");
  expect(requests).toBe(0);
});

it.each(["file.txt", "%2e", ".well-known"])("preserves an ordinary path parameter %s", async (id) => {
  let pathname = "";
  const client = createObservedClient<paths>({}, async (request) => {
    pathname = new URL(request.url).pathname;
    return Response.json("ok");
  });
  await client.GET("/resources/{id}", { params: { path: { id } } });
  expect(decodeURIComponent(pathname)).toBe(`/resources/${id}`);
});
