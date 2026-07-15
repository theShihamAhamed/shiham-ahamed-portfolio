import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const root = path.resolve(process.cwd(), "../..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const controllerFiles = [
  "apps/backend/src/modules/projects/project.controller.ts",
  "apps/backend/src/modules/certifications/certification.controller.ts",
  "apps/backend/src/modules/achievements/achievement.controller.ts",
  "apps/backend/src/modules/currently-building/currently-building.controller.ts",
  "apps/backend/src/modules/site-settings/site-settings.controller.ts",
];

test("all public mutation controllers await cache invalidation", () => {
  for (const file of controllerFiles) {
    const source = read(file);
    assert.doesNotMatch(source, /void\s+revalidate/);
    assert.match(source, /await\s+revalidate/);
    assert.match(source, /cacheInvalidation/);
  }
});

test("reorder mutations perform one invalidation after the database operation", () => {
  const projectController = read(controllerFiles[0]);
  assert.doesNotMatch(projectController, /projects\.forEach\([\s\S]*revalidateProjectCache/);
  assert.match(projectController, /const projects = await reorderProjects/);
  assert.match(projectController, /const cacheInvalidation = projects\[0\]/);

  for (const file of controllerFiles.slice(1, 4)) {
    const source = read(file);
    assert.match(source, /const .* = await reorder/);
    assert.match(source, /const cacheInvalidation = await revalidate/);
  }
});
