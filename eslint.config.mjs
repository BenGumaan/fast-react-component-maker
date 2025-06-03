import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    env: {
      node: true,  // Tells ESLint to use Node.js environment
    },
    rules: {
      curly: "warn",
      eqeqeq: "warn",
      semi: "warn",
      "no-throw-literal": "warn",
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/naming-convention": [
          "warn",
          {
          selector: "import",
          format: ["camelCase", "PascalCase"],
          }
      ]
    }
  }
];
