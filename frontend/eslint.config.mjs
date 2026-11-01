import eslintConfigPrettier from "eslint-config-prettier"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import tailwind from "eslint-plugin-tailwindcss"
import { defineConfig } from "eslint/config"
import tseslint from "typescript-eslint"

export default defineConfig(
  // TypeScript
  ...tseslint.configs.recommended,

  // React 19 + modern JSX transform
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],

  // Latest React Hooks recommendations
  reactHooks.configs.flat["recommended-latest"],

  // Tailwind
  ...tailwind.configs.recommended,

  // Project configuration
  {
    files: ["**/*.{ts,tsx}"],

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      // TypeScript
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // Practical, but don't allow explicit `any`
      "@typescript-eslint/no-explicit-any": "warn",

      // Development
      "no-console": "off",
      "no-debugger": "off",

      // Prettier already sorts Tailwind classes
      "tailwindcss/classnames-order": "off",
    },
  },

  // Prettier owns formatting
  eslintConfigPrettier
)