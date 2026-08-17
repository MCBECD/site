import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", ".next", "out", "content", "public", "coverage"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "no-empty": ["error", { allowEmptyCatch: true }],
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
      },
    },
  },
  // video-kit is a self-contained Node script package (playwright recorder +
  // static server). Its record.mjs embeds browser-context code inside
  // page.evaluate(), so it legitimately references browser globals too.
  {
    files: ["video-kit/**/*.mjs"],
    languageOptions: {
      globals: {
        // Node
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        Buffer: "readonly",
        // Browser (page.evaluate / injected cursor layer)
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        location: "readonly",
      },
    },
  },
);
