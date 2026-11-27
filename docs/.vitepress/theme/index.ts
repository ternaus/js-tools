import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import SupportBanner from "./SupportBanner.js";
import "./custom.css";

const theme: Theme = {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      "doc-before": () => h(SupportBanner),
      "home-hero-before": () => h(SupportBanner),
    }),
};

export default theme;
