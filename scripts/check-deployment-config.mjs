import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const fail = (message) => {
  console.error(`Deployment configuration check failed: ${message}`);
  process.exitCode = 1;
};

const examples = {
  "apps/frontend/.env.example": [
    "MONGO_URI",
    "NEXT_PUBLIC_SITE_URL",
    "REVALIDATE_SECRET",
    "RESEND_API_KEY",
    "CONTACT_TO_EMAIL",
    "CONTACT_FROM_EMAIL",
  ],
  "apps/admin-frontend/.env.example": ["NEXT_PUBLIC_API_BASE_URL"],
  "apps/backend/.env.example": [
    "MONGO_URI",
    "ADMIN_FRONTEND_ORIGINS",
    "PUBLIC_FRONTEND_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "IMAGEKIT_PRIVATE_KEY",
    "FRONTEND_REVALIDATE_URL",
    "FRONTEND_REVALIDATE_SECRET",
    "AUTH_COOKIE_SAME_SITE",
    "AUTH_COOKIE_SECURE",
    "TRUST_PROXY",
  ],
};

for (const [file, variables] of Object.entries(examples)) {
  const source = read(file);
  for (const variable of variables) {
    if (!new RegExp(`^${variable}=`, "m").test(source)) {
      fail(`${file} does not document ${variable}`);
    }
  }
}

const publicExample = read("apps/frontend/.env.example");
const adminExample = read("apps/admin-frontend/.env.example");
const backendExample = read("apps/backend/.env.example");

if (/NEXT_PUBLIC_(?:MONGO|JWT|IMAGEKIT_PRIVATE|REVALIDATE_SECRET)/.test(
  `${publicExample}\n${adminExample}\n${backendExample}`,
)) {
  fail("a server-only variable is incorrectly browser-prefixed");
}

if (/CLIENT_ORIGIN|seed-public-data|audit fix --force/.test(
  `${publicExample}\n${adminExample}\n${backendExample}\n${read(".github/workflows/ci.yml")}`,
)) {
  fail("an obsolete or unsafe deployment reference remains in active configuration");
}

const workflow = read(".github/workflows/ci.yml");
if (!workflow.includes("npm ci") || /vercel deploy|render deploy|audit fix/.test(workflow)) {
  fail("CI must install from the root and must not deploy or auto-fix audits");
}

const render = read("render.yaml");
if (!render.includes("healthCheckPath: /api/health/ready") || !render.includes("sync: false")) {
  fail("Render blueprint is missing readiness or secret-sync safeguards");
}

for (const file of ["apps/frontend/app/sitemap.ts", "apps/frontend/app/robots.ts"]) {
  if (!fs.existsSync(path.join(root, file))) fail(`${file} is missing`);
}

if (process.exitCode) process.exit();
console.log("Deployment configuration checks passed.");
