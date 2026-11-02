import { defineConfig, devices } from "@playwright/test";

const appPort = Number(process.env.NEXTJS_PORT || 4174);
const apiPort = Number(process.env.NEXTJS_API_PORT || 4175);
const appUrl = `http://127.0.0.1:${appPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}`;

export default defineConfig({
  testDir: "test",
  testMatch: "**/*.e2e.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: appUrl,
  },
  webServer: [
    {
      command: "node test/api-server.mjs",
      url: `${apiUrl}/fact?max_length=500`,
      env: { NEXTJS_API_PORT: String(apiPort) },
    },
    {
      command: `pnpm run build && pnpm run start --hostname 127.0.0.1 --port ${appPort}`,
      url: appUrl,
      env: { CAT_FACT_API_URL: apiUrl, NEXT_TELEMETRY_DISABLED: "1" },
      timeout: 120_000,
    },
  ],
});
