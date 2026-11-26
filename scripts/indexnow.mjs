// Submits every sitemap URL of the documentation site to IndexNow (Bing, Yandex and other participants).
// Run after a deploy: `pnpm run docs:indexnow`. The key is the file name of docs/public/<key>.txt.
import { readdirSync, readFileSync } from "node:fs";

const SITE = "https://ternaus.github.io/js-tools/";
const publicDir = new URL("../docs/public/", import.meta.url);

const keyFiles = readdirSync(publicDir).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name));
if (keyFiles.length !== 1) {
  throw new Error(`Expected exactly one IndexNow key file in docs/public/, found ${keyFiles.length}`);
}
const key = keyFiles[0].replace(".txt", "");
if (readFileSync(new URL(keyFiles[0], publicDir), "utf8").trim() !== key) {
  throw new Error("IndexNow key file content must equal its file name (ignoring the trailing newline)");
}

const sitemap = await fetch(`${SITE}sitemap.xml`);
if (!sitemap.ok) {
  throw new Error(`Sitemap request failed: HTTP ${sitemap.status}`);
}
const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key,
    keyLocation: `${SITE}${key}.txt`,
    urlList: urls,
  }),
});
console.log(`IndexNow HTTP ${response.status} for ${urls.length} URLs`);
if (!response.ok) {
  throw new Error(await response.text());
}
