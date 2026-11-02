import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

test("uses the default API URL when the environment variable is empty", async () => {
  vi.stubEnv("CAT_FACT_API_URL", "");
  const { default: client } = await import("../lib/api/index");
  expect(client.baseUrl).toBe("https://catfact.ninja");
});
