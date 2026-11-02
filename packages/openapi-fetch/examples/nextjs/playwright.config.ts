import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  testMatch: "**/*.e2e.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4174",
  },
  webServer: [
    {
      command: "node test/api-server.mjs",
      url: "http://127.0.0.1:4175/fact?max_length=500",
    },
    {
      command: "pnpm run build && pnpm run start --hostname 127.0.0.1 --port 4174",
      url: "http://127.0.0.1:4174",
      env: { CAT_FACT_API_URL: "http://127.0.0.1:4175", NEXT_TELEMETRY_DISABLED: "1" },
      timeout: 120_000,
    },
  ],
});
