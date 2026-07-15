import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));
const fail = (message) => {
  throw new Error(message);
};
const requireText = (relativePath, pattern, message) => {
  if (!pattern.test(read(relativePath))) fail(relativePath + ": " + message);
};

const rootPackage = JSON.parse(read("package.json"));
const requiredWorkspaces = [
  "apps/frontend/package.json",
  "apps/admin-frontend/package.json",
  "apps/backend/package.json",
  "packages/shared/package.json",
  "packages/db/package.json",
];
for (const file of requiredWorkspaces) {
  if (!exists(file)) fail("Missing workspace manifest: " + file);
}
for (const script of ["lint", "typecheck", "test", "check:assets", "check:deployment", "build", "validate", "check:release"]) {
  if (typeof rootPackage.scripts?.[script] !== "string") fail("Missing root script: " + script);
}
if (Object.keys(rootPackage.scripts).some((name) => name.includes("seed"))) {
  fail("Obsolete root seed script remains.");
}

const backendPackage = JSON.parse(read("apps/backend/package.json"));
if (backendPackage.main !== "dist/server.js" || backendPackage.scripts?.start !== "node dist/server.js") {
  fail("Backend production entrypoint is not the compiled dist/server.js command.");
}

for (const file of ["packages/shared/tsconfig.json", "packages/db/tsconfig.json", "apps/backend/tsconfig.json"]) {
  requireText(file, /"moduleResolution"\s*:\s*"NodeNext"/, "Node packages must use NodeNext resolution.");
  requireText(file, /"module"\s*:\s*"NodeNext"/, "Node packages must use NodeNext modules.");
}
for (const file of ["apps/frontend/tsconfig.json", "apps/admin-frontend/tsconfig.json"]) {
  requireText(file, /"moduleResolution"\s*:\s*"bundler"/, "Next apps must retain Bundler resolution.");
}

for (const file of [
  ".github/workflows/ci.yml",
  "render.yaml",
  "apps/frontend/app/sitemap.ts",
  "apps/frontend/app/robots.ts",
  "apps/frontend/app/layout.tsx",
  "apps/admin-frontend/app/layout.tsx",
  "docs/release-readiness-report.md",
  "docs/final-deployment-checklist.md",
  "docs/post-deployment-smoke-test.md",
]) {
  if (!exists(file)) fail("Missing release artifact: " + file);
}
const workflow = read(".github/workflows/ci.yml");
for (const command of ["npm ci", "npm run lint", "npm run typecheck", "npm test", "npm run check:assets", "npm run check:deployment", "npm run check:release", "npm run build"]) {
  if (!workflow.includes(command)) fail("CI does not run " + command + ".");
}
if (/\bdeploy\b|\bseed\b|production credentials/i.test(workflow)) {
  fail("CI contains a deployment, seed, or production-credential action.");
}

const sourceExtensions = new Set([".ts", ".tsx", ".mts", ".cts", ".mjs", ".cjs"]);
const collect = (directory) => {
  const result = [];
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", "dist", ".next", "tests"].includes(entry.name)) result.push(...collect(relative));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      if (entry.name !== "eslint.config.mjs") result.push(relative);
    }
  }
  return result;
};

for (const file of collect("apps/admin-frontend")) {
  if (/@portfolio\/db|mongoose/.test(read(file))) fail("Admin server-only dependency in " + file + ".");
}
for (const file of collect("apps/frontend")) {
  const isServerLayer = file.replaceAll("\\", "/").includes("apps/frontend/lib/server/");
  if (!isServerLayer && /@portfolio\/db|mongoose/.test(read(file))) {
    fail("Public frontend client-boundary dependency in " + file + ".");
  }
}
for (const file of collect("packages/shared")) {
  if (/(?:import\s+[^;]*?from\s+|import\s*\(|require\s*\()["'][^"']*(?:mongoose|express|next\/)["']|process\.env|JWT_|IMAGEKIT_PRIVATE_KEY|RESEND_API_KEY/.test(read(file))) {
    fail("Browser-safe shared package contains server-only code in " + file + ".");
  }
}

const sourceText = [
  ...collect("apps/frontend"),
  ...collect("apps/admin-frontend"),
  ...collect("apps/backend"),
  ...collect("packages/shared"),
  ...collect("packages/db"),
].map(read).join("\n");
for (const pattern of [/raw\.githubusercontent\.com/, /\bmdxUrl\b/, /NEXT_PUBLIC_MONGO_URI/, /hardcoded-production-domain-placeholder/]) {
  if (pattern.test(sourceText)) fail("Forbidden stale/release-risk source match: " + pattern);
}

console.log("Release-candidate checks passed.");
