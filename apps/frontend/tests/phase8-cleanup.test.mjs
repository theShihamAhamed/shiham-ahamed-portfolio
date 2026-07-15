import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");

const read = (relativePath) =>
  fs.readFileSync(path.join(repoRoot, relativePath), "utf8");

test("obsolete seed and static project sources are absent", () => {
  assert.equal(
    fs.existsSync(path.join(repoRoot, "apps/frontend/scripts/seed-public-data.mjs")),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(repoRoot, "apps/frontend/data/projects/projects.ts")),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(repoRoot, "apps/frontend/data/site/currently-building.ts")),
    false,
  );
});

test("empty-database UI fallbacks do not inject personal demo data", () => {
  const hero = read("apps/frontend/components/sections/home/hero/hero-section.tsx");
  const contact = read("apps/frontend/app/contact/page.tsx");
  const projectNotFound = read("apps/frontend/app/projects/[slug]/not-found.tsx");

  assert.match(hero, /Portfolio content will appear here after it is published/);
  assert.match(contact, /Contact details will appear here after they are configured/);
  assert.doesNotMatch(hero, /drive\.google\.com|theshihamahamed/);
  assert.doesNotMatch(contact, /theshihamahamed/);
  assert.doesNotMatch(projectNotFound, /not seeded/);
});

test("frontend no longer owns the seed-only Mongoose dependency", () => {
  const packageJson = JSON.parse(read("apps/frontend/package.json"));

  assert.equal(packageJson.dependencies.mongoose, undefined);
});
