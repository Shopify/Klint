import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "coverage/**", "src/vendor/**"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-debugger": "error",
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
    },
  },
];
