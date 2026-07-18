import { execFileSync } from "node:child_process";
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
const gitOutput = (args) => {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};
const gitHasMatch = (args) => gitOutput(args).length > 0;

const requiredBackendUploadSources = [
  "apps/backend/src/modules/uploads/uploads.controller.ts",
  "apps/backend/src/modules/uploads/uploads.routes.ts",
  "apps/backend/src/modules/uploads/uploads.service.ts",
  "apps/backend/src/modules/uploads/uploads.types.ts",
  "apps/backend/src/modules/uploads/uploads.validation.ts",
];

for (const file of requiredBackendUploadSources) {
  if (!exists(file)) fail("Missing backend upload source: " + file);
  if (!gitHasMatch(["ls-files", "--error-unmatch", "--", file])) {
    fail("Required backend upload source is not tracked: " + file);
  }
  if (gitHasMatch(["check-ignore", "--no-index", "--", file])) {
    fail("Required backend upload source is ignored: " + file);
  }
}

const ignoredSourceFiles = gitOutput([
  "ls-files",
  "--others",
  "--ignored",
  "--exclude-standard",
  "--",
  "apps",
  "packages",
])
  .split(/\r?\n/)
  .filter((file) => /^(?:apps|packages)\/[^/]+\/src\/.+\.(?:ts|tsx|mts|cts)$/.test(file));

if (ignoredSourceFiles.length > 0) {
  fail("Ignored TypeScript source files detected: " + ignoredSourceFiles.join(", "));
}

const rootPackage = JSON.parse(read("package.json"));
const activePackageManifests = ["package.json"];
for (const workspaceRoot of ["apps", "packages"]) {
  for (const entry of fs.readdirSync(path.join(root, workspaceRoot), { withFileTypes: true })) {
    if (entry.isDirectory() && exists(path.join(workspaceRoot, entry.name, "package.json"))) {
      activePackageManifests.push(path.join(workspaceRoot, entry.name, "package.json"));
    }
  }
}

for (const file of activePackageManifests) {
  const packageJson = JSON.parse(read(file));
  for (const [scriptName, command] of Object.entries(packageJson.scripts ?? {})) {
    if (typeof command === "string" && command.includes("--experimental-strip-types")) {
      fail(`${file} script ${scriptName} uses unsupported --experimental-strip-types.`);
    }
  }
}

for (const file of ["apps/admin-frontend/package.json", "apps/frontend/package.json"]) {
  const packageJson = JSON.parse(read(file));
  if (!packageJson.scripts?.test?.includes("node --import=tsx --test")) {
    fail(`${file} must run TypeScript tests with node --import=tsx.`);
  }
}

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
for (const script of ["lint", "typecheck", "test", "check:assets", "check:deployment", "build", "validate", "check:release", "cache:revalidate"]) {
  if (typeof rootPackage.scripts?.[script] !== "string") fail("Missing root script: " + script);
}
if (Object.keys(rootPackage.scripts).some((name) => name.includes("seed"))) {
  fail("Obsolete root seed script remains.");
}

const manualRevalidationScript = "scripts/revalidate-public-cache.mjs";
if (!exists(manualRevalidationScript)) {
  fail("Missing manual public-cache revalidation script.");
}
if (
  rootPackage.scripts["cache:revalidate"] !==
  "node --env-file=apps/frontend/.env.local scripts/revalidate-public-cache.mjs"
) {
  fail("Manual cache command must load the ignored frontend environment file.");
}
for (const pattern of [
  /MANUAL_REVALIDATE_URL/,
  /REVALIDATE_SECRET/,
  /group:\s*["']all["']/,
  /redirect:\s*["']error["']/,
]) {
  if (!pattern.test(read(manualRevalidationScript))) {
    fail("Manual cache script is missing a required protected request contract.");
  }
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

const render = read("render.yaml");
if (!render.includes("buildCommand: npm ci --include=dev && npm run build:packages && npm run build:backend")) {
  fail("Render must install dev dependencies before building internal packages and the backend.");
}
if (!/key:\s*NODE_VERSION\s*\r?\n\s+value:\s*[\"']20\.20\.2[\"']/.test(render)) {
  fail("Render must pin Node.js to 20.20.2.");
}
if (!render.includes("startCommand: npm run start --workspace=@portfolio/backend")) {
  fail("Render must start the backend workspace.");
}
if (!render.includes("healthCheckPath: /api/health/ready")) {
  fail("Render must use the backend readiness endpoint.");
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
for (const pattern of [
  /void\s+revalidate(?:PublicCache|ProjectCache|CertificationCache|AchievementCache|CurrentlyBuildingCache|SiteSettingsCache)?\s*\(/,
  /604800/,
  /7\s*\*\s*24\s*\*\s*60\s*\*\s*60/,
]) {
  if (pattern.test(sourceText)) fail("Forbidden active cache or invalidation pattern: " + pattern);
}
for (const file of [
  "apps/backend/src/lib/revalidate-public-cache.ts",
  "apps/frontend/app/api/revalidate/route.ts",
  "apps/frontend/app/sitemap.ts",
]) {
  if (!exists(file)) fail("Missing cache reliability source: " + file);
}
if (!sourceText.includes("FRONTEND_REVALIDATE_URL") || !sourceText.includes("FRONTEND_REVALIDATE_SECRET")) {
  fail("Cache revalidation environment configuration is missing from active source.");
}
requireText(
  "apps/backend/src/config/env.ts",
  /ALLOW_VERCEL_PREVIEW_ORIGINS:\s*booleanEnv\.default\(false\)/,
  "Vercel preview-origin access must default to false.",
);
requireText(
  "apps/backend/src/config/cors.ts",
  /hostname\.endsWith\(VERCEL_PREVIEW_HOST_SUFFIX\)/,
  "Vercel preview origins must use the hostname-boundary matcher.",
);
if (/origin\s*:\s*["']\*["']/.test(read("apps/backend/src/config/cors.ts"))) {
  fail("Credentialed CORS must not use a wildcard origin.");
}
for (const pattern of [/raw\.githubusercontent\.com/, /\bmdxUrl\b/, /NEXT_PUBLIC_MONGO_URI/, /hardcoded-production-domain-placeholder/]) {
  if (pattern.test(sourceText)) fail("Forbidden stale/release-risk source match: " + pattern);
}

console.log("Release-candidate checks passed.");
