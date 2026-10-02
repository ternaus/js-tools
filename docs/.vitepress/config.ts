import { defineConfig } from "vitepress";
import en from "./en.js";
import ja from "./ja.js";
import shared from "./shared.js";
import zh from "./zh.js";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  ...shared,
  locales: {
    root: { label: "English", ...en },
    zh: { label: "简体中文", link: "/zh/introduction", ...zh },
    ja: { label: "日本語", link: "/ja/introduction", ...ja },
  },
});
