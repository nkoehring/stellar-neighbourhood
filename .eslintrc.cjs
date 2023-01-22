/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    // see https://eslint.org/docs/latest/rules/no-prototype-builtins#when-not-to-use-it
    "no-prototype-builtins": "off",
    // as long as it is explicit, it is fine to use any
    "@typescript-eslint/no-explicit-any": "off",
  },
};
