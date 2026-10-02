import eslintPlugin from "eslint-plugin-eslint-plugin";
import node from "eslint-plugin-n";
import globals from "globals";

const packageFiles = ["packages/eslint-plugin-react/**/*.{js,mjs}"];
const ruleFiles = ["packages/eslint-plugin-react/lib/rules/**/*.js"];
const testFiles = ["packages/eslint-plugin-react/tests/**/*.js"];

export default [
  {
    ignores: ["**/coverage/**", "**/node_modules/**", "**/dist/**", "packages/eslint-plugin-react/tests/fixtures/**"],
  },
  { ...node.configs["flat/recommended-module"], files: packageFiles },
  {
    files: packageFiles,
    languageOptions: {
      ecmaVersion: 2024,
      globals: globals.node,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "no-warning-comments": ["error", { terms: ["TODO", "FIXME", "XXX"], location: "anywhere" }],
      "preserve-caught-error": "error",
    },
  },
  {
    files: ruleFiles,
    plugins: {
      "eslint-plugin": eslintPlugin,
    },
    rules: {
      "eslint-plugin/require-meta-schema": "error",
      "eslint-plugin/require-meta-docs-url": "error",
    },
  },
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.node,
        after: "readonly",
        afterEach: "readonly",
        before: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        it: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: "module",
      },
    },
    rules: {
      "n/no-extraneous-require": "off",
      "n/no-unpublished-require": "off",
    },
  },
];
