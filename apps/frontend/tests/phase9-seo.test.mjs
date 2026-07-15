import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

test("public SEO routes and canonical metadata are present", () => {
  assert.match(read("apps/frontend/app/layout.tsx"), /metadataBase/);
  assert.match(read("apps/frontend/app/layout.tsx"), /openGraph/);
  assert.match(read("apps/frontend/app/sitemap.ts"), /getVisibleProjects/);
  assert.match(read("apps/frontend/app/robots.ts"), /sitemap/);
  assert.match(read("apps/frontend/app/page.tsx"), /application\/ld\+json|StructuredData/);
  assert.match(read("apps/frontend/app/projects/[slug]/page.tsx"), /generateMetadata/);
});

test("SEO output excludes internal routes and admin indexing", () => {
  const robots = read("apps/frontend/app/robots.ts");
  const adminLayout = read("apps/admin-frontend/app/layout.tsx");

  assert.match(robots, /\/api\//);
  assert.match(robots, /_next/);
  assert.match(adminLayout, /index: false/);
  assert.match(adminLayout, /follow: false/);
});
