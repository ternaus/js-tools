import { cpSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";

const packageRoot = new URL("../packages/eslint-plugin-react/", import.meta.url);
const siteRoot = new URL("../docs/eslint-plugin-react/", import.meta.url);
rmSync(siteRoot, { recursive: true, force: true });
mkdirSync(siteRoot, { recursive: true });
cpSync(new URL("docs/", packageRoot), siteRoot, { recursive: true });
renameSync(new URL("rules/README.md", siteRoot), new URL("rules/index.md", siteRoot));
const catalog = new URL("rules/index.md", siteRoot);
writeFileSync(
  catalog,
  readFileSync(catalog, "utf8").replace(
    "../../README.md",
    "https://github.com/ternaus/js-tools/tree/main/packages/eslint-plugin-react",
  ),
);
const upstreamSupport = new URL("upstream-rule-support.md", siteRoot);
writeFileSync(upstreamSupport, readFileSync(upstreamSupport, "utf8").replace("rules/README.md", "rules/index.md"));
