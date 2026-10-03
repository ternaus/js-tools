import { cpSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";

const packageRoot = new URL("../packages/eslint-plugin-react/", import.meta.url);
const siteRoot = new URL("../docs/eslint-plugin-react/", import.meta.url);
const packageUrl = "https://github.com/ternaus/js-tools/tree/main/packages/eslint-plugin-react";
rmSync(siteRoot, { recursive: true, force: true });
mkdirSync(siteRoot, { recursive: true });
cpSync(new URL("docs/", packageRoot), siteRoot, { recursive: true });
writeFileSync(
  new URL("index.md", siteRoot),
  readFileSync(new URL("README.md", packageRoot), "utf8").replace(
    /\]\((?!#|[a-z]+:|\/)([^)]+)\)/g,
    (_, target) =>
      `](${target.startsWith("docs/") ? target.slice(5).replace("README.md", "index.md") : `${packageUrl}/${target}`})`,
  ),
);
renameSync(new URL("rules/README.md", siteRoot), new URL("rules/index.md", siteRoot));
const catalog = new URL("rules/index.md", siteRoot);
writeFileSync(catalog, readFileSync(catalog, "utf8").replace("../../README.md", packageUrl));
const upstreamSupport = new URL("upstream-rule-support.md", siteRoot);
writeFileSync(upstreamSupport, readFileSync(upstreamSupport, "utf8").replace("rules/README.md", "rules/index.md"));
for (const path of ["html-react-attribute-contract.md", "rules/no-invalid-html-attribute.md"]) {
  const file = new URL(path, siteRoot);
  writeFileSync(file, readFileSync(file, "utf8").replace(/\]\(\.\.\/(?:\.\.\/)?lib\//g, `](${packageUrl}/lib/`));
}
const helpersRoot = new URL("../docs/openapi-typescript-helpers/", import.meta.url);
mkdirSync(helpersRoot, { recursive: true });
cpSync(new URL("../packages/openapi-typescript-helpers/README.md", import.meta.url), new URL("index.md", helpersRoot));
