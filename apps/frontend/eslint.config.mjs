import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    ignores: ["lib/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@portfolio/db",
              message:
                "Database imports belong in the public frontend server data layer under lib/server.",
            },
            {
              name: "mongoose",
              message:
                "Mongoose imports belong in the shared server-only database package.",
            },
          ],
          patterns: [
            {
              group: ["@portfolio/db/*", "mongoose/*"],
              message:
                "Deep database imports are forbidden; use the frontend server data layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["lib/server/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement[directive='use client']",
          message: "Files under lib/server must remain server-only.",
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
