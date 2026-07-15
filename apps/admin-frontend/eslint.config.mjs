import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@portfolio/db",
              message:
                "The admin frontend must use the backend API and cannot access the database package.",
            },
            {
              name: "mongoose",
              message:
                "The admin frontend must use the backend API and cannot access MongoDB directly.",
            },
          ],
          patterns: [
            {
              group: ["@portfolio/db/*", "mongoose/*"],
              message: "The admin frontend cannot import database internals.",
            },
          ],
        },
      ],
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
