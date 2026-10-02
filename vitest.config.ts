import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: import.meta.dirname,
  test: {
    globals: true,
    environment: "node",
    projects: [
      {
        extends: true,
        test: { name: "openapi-typescript", root: "packages/openapi-typescript", clearMocks: true },
      },
      {
        extends: true,
        test: {
          name: "openapi-fetch",
          root: "packages/openapi-fetch",
          restoreMocks: true,
          typecheck: { enabled: true, tsconfig: "tsconfig.json" },
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: { name: "openapi-react-query", root: "packages/openapi-react-query", environment: "jsdom" },
      },
    ],
  },
});
