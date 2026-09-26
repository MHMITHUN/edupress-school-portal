import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Flat config. eslint-config-next 16 ships native flat-config arrays,
 * so no FlatCompat translation is needed.
 *
 * wordpress-plugin/ is a standalone PHP plugin (spec 17.10) — it never
 * enters the Next.js runtime, so ESLint ignores it entirely.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "playwright-report/**",
      "test-results/**",
      "wordpress-plugin/**",
    ],
  },
  ...coreWebVitals,
  ...nextTypescript,
  {
    // Leading-underscore names mark intentionally unused parameters
    // (e.g. the WordPress placeholder store's unimplemented signatures).
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
