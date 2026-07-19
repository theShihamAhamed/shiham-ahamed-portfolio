import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import test from "node:test";

const root = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const service = read("apps/backend/src/modules/currently-building/currently-building.service.ts");
const routes = read("apps/backend/src/modules/currently-building/currently-building.routes.ts");
const controller = read("apps/backend/src/modules/currently-building/currently-building.controller.ts");

test("currently-building routes retain strict shared create and update validation", () => {
  assert.match(routes, /validate\(\{ body: createCurrentlyBuildingSchema \}\)/);
  assert.match(routes, /body: updateCurrentlyBuildingSchema/);
  assert.match(routes, /query: adminCurrentlyBuildingQuerySchema/);
});

test("currently-building search excludes status and preserves relevant optional fields", () => {
  const filterSource = service.slice(
    service.indexOf("const buildCurrentlyBuildingFilter"),
    service.indexOf("export const getAdminCurrentlyBuildingItems"),
  );

  for (const field of ["title", "description", "currentFocus", "techStack", "highlights"]) {
    assert.match(filterSource, new RegExp(`\\{ ${field}: searchRegex \\}`));
  }
  assert.doesNotMatch(filterSource, /status/);
});

test("currently-building visibility, ordering, reorder, and cache invalidation remain", () => {
  assert.match(service, /find\(\{ isVisible: true \}\)/);
  assert.match(service, /sort\(\{ displayOrder: 1, createdAt: -1 \}\)/);
  assert.match(service, /runWithOptionalTransaction/);
  assert.match(service, /orderedIds\.length !== totalItems/);
  assert.match(controller, /entity: "currentlyBuilding"/);
  assert.match(controller, /await revalidateCurrentlyBuildingCache/);
});
