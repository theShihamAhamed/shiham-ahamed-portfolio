import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const source = fs.readFileSync(
  path.join(repoRoot, "apps/admin-frontend/components/forms/tech-stack-input.tsx"),
  "utf8",
);

test("technology selector stays search-first and bounded for the expanded registry", () => {
  assert.match(source, /searchTechnologies\(query\)\.slice\(0, 8\)/);
  assert.match(source, /useMemo\(\(\) => searchTechnologies\(query\)/);
  assert.match(source, /role="combobox"/);
  assert.match(source, /role="listbox"/);
  assert.match(source, /role="option"/);
  assert.doesNotMatch(source, /TECHNOLOGY_REGISTRY\.map/);
});

test("technology selector preserves typed known, custom, duplicate, and card behavior", () => {
  assert.match(source, /type TechnologySlug/);
  assert.match(source, /addKnown = \(slug: TechnologySlug\)/);
  assert.match(source, /if \(selected\.has\(slug\)\) return/);
  assert.match(source, /disabled=\{selected\.has\(entry\.slug\)\}/);
  assert.match(source, /findTechnologyByNameOrAlias\(label\)/);
  assert.match(source, /createCustomTechnologySlug\(label\)/);
  assert.match(source, /kind: "known", slug, showOnCard: false/);
  assert.match(source, /kind: "custom"/);
  assert.match(source, /TECH_TAG_CATEGORY_DEFINITIONS\.map/);
  assert.match(source, /checked=\{item\.showOnCard\}/);
  assert.match(source, /showOnCard: checked/);
});
