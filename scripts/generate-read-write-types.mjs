import { existsSync, readFileSync, writeFileSync } from "node:fs";

const source = new URL("../packages/openapi-typescript-helpers/src/read-write.ts", import.meta.url);
const target = new URL("../packages/openapi-typescript/src/lib/read-write-types.ts", import.meta.url);
const definitions = readFileSync(source, "utf8")
  .replace(/\/\*\*[\s\S]*?\*\//g, "")
  .replace(/\n{3,}/g, "\n\n")
  .trim();
const expected = `// Generated from openapi-typescript-helpers/src/read-write.ts. Run pnpm generate:read-write-types.\nexport const READ_WRITE_HELPER_TYPES =\n  ${JSON.stringify(definitions)};\n`;
const current = existsSync(target) ? readFileSync(target, "utf8") : "";

if (process.argv.includes("--check")) {
  if (current !== expected) {
    throw new Error("Read/write helper definitions are stale. Run pnpm generate:read-write-types.");
  }
} else if (current !== expected) {
  writeFileSync(target, expected);
}
