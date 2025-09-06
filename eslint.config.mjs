import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import tsLint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default defineConfig([
  {
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "unused-imports": unusedImports,
      prettier,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    extends: [
      js.configs.recommended,
      ...tsLint.configs.recommended,
      prettierConfig, // turn off ESLint rules that conflict with Prettier
    ],
    rules: {
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "import",
          format: ["camelCase", "PascalCase"],
        },
      ],
      curly: "warn",
      eqeqeq: "warn",
      "no-throw-literal": "warn",

      // Run Prettier as an ESLint rule
      "prettier/prettier": "warn",
    },
  },
]);
