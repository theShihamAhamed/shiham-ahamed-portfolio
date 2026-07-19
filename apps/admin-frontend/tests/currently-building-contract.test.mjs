import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const form = read("apps/admin-frontend/components/admin/currently-building/currently-building-form.tsx");
const list = read("apps/admin-frontend/components/admin/currently-building/currently-building-list.tsx");
const api = read("apps/admin-frontend/lib/api/currently-building.ts");

test("currently-building admin removes editable and filterable status", () => {
  assert.doesNotMatch(form, /id="status"|field\("status"\)|errors\.status|values\.status|item\.status/);
  assert.doesNotMatch(list, /statusBadgeVariant|deferredStatus|setStatus|item\.status|<TableHead>Status/);
  assert.doesNotMatch(api, /status\?: string/);
});

test("currently-building form requires only title and description", () => {
  assert.equal((form.match(/text-red-700">\*<\/span>/g) ?? []).length, 2);
  assert.match(form, /Current focus <span className="text-\[var\(--admin-muted\)\]">optional<\/span>/);
  assert.match(form, /Link <span className="text-\[var\(--admin-muted\)\]">optional<\/span>/);
  assert.match(form, /currentFocus: item\.currentFocus \?\? ""/);
  assert.match(form, /techStack: item\.techStack \?\? \[\]/);
  assert.match(form, /highlights: item\.highlights \?\? \[\]/);
});

test("currently-building Topics and Highlights are optional and general-purpose", () => {
  assert.match(form, /title="Topics"/);
  assert.match(form, /technologies, platforms, development areas, engineering concepts, or project categories/);
  assert.match(form, /label="Topics"/);
  assert.match(form, /placeholder="React Native"/);
  assert.match(form, /addLabel="Add topic"/);
  assert.match(form, /emptyMessage="No topics added yet\."/);
  assert.match(form, /emptyMessage="No highlights added yet\."/);
  assert.doesNotMatch(form, /minItems=\{1\}/);
  assert.match(list, /<TableHead>Topics<\/TableHead>/);
  assert.match(list, /No topics/);
  assert.match(list, /Not set/);
});

test("currently-building adapters omit empty creates and preserve explicit update clears", () => {
  assert.match(form, /values\.currentFocus \? \{ currentFocus: values\.currentFocus \} : \{\}/);
  assert.match(form, /values\.techStack\.length \? \{ techStack: values\.techStack \} : \{\}/);
  assert.match(form, /values\.highlights\.length \? \{ highlights: values\.highlights \} : \{\}/);
  assert.match(form, /currentFocus: values\.currentFocus/);
  assert.match(form, /techStack: values\.techStack/);
  assert.match(form, /highlights: values\.highlights/);
  assert.match(form, /link: values\.link/);
});

test("currently-building visibility, reorder, and list link behavior remain", () => {
  assert.match(form, /Set currently-building visibility/);
  assert.match(form, /Visibility is controlled from the list page/);
  assert.match(list, /KeyboardSensor/);
  assert.match(list, /sortableKeyboardCoordinates/);
  assert.match(list, /hasActiveFilters/);
  assert.match(list, /toggleCurrentlyBuildingVisibility/);
  assert.match(list, /reorderCurrentlyBuildingItems/);
  assert.match(list, /href=\{item\.link\}/);
});
