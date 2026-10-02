import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

rmSync("dist", { recursive: true, force: true });
execFileSync(
  process.execPath,
  [fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url)), "-p", "tsconfig.build.json"],
  {
    stdio: "inherit",
  },
);
if (existsSync("src/index.d.ts")) {
  copyFileSync("src/index.d.ts", "dist/index.d.ts");
}
