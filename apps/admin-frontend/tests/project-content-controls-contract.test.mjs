import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const fields = read(
  "apps/admin-frontend/components/admin/projects/project-form-fields.tsx",
);
const createForm = read(
  "apps/admin-frontend/components/admin/projects/project-form.tsx",
);
const editForm = read(
  "apps/admin-frontend/components/admin/projects/project-edit-page.tsx",
);
const formUtils = read(
  "apps/admin-frontend/components/admin/projects/project-form.utils.ts",
);
const dynamicList = read(
  "apps/admin-frontend/components/forms/dynamic-string-list-input.tsx",
);

test("project forms remove the detail introduction from every adapter", () => {
  for (const source of [fields, createForm, editForm, formUtils]) {
    assert.doesNotMatch(source, /Detail introduction/);
    assert.doesNotMatch(source, /register\("description"\)/);
  }

  assert.doesNotMatch(formUtils, /description:\s*(?:""|project\.description|values\.description)/);
  assert.match(createForm, /getFirstFormErrorMessage\(errors\.overview\)/);
  assert.match(editForm, /getFirstFormErrorMessage\(errors\.architecture\?\.points\)/);
});

test("project content controls share limits, guidance, and visible counters", () => {
  assert.match(fields, /PROJECT_CONTENT_LIMITS/);
  assert.match(fields, /Aim for 120–180 characters\. Maximum 220\./);
  assert.match(fields, /Use 2–3 concise paragraphs/);
  assert.match(fields, /Aim for about 5 detailed highlights/);
  assert.match(fields, /Use 2–3 concise sentences\. Maximum 450 characters\./);
  assert.match(fields, /List 3–5 major architectural decisions/);
  assert.match(fields, /shortDescription\.trim\(\)\.length/);
  assert.match(fields, /architectureSummary\.trim\(\)\.length/);
  assert.match(fields, /errorMessage=\{errors\.architecturePoints\}/);
});

test("dynamic list input enforces optional item and character limits without affecting unlimited callers", () => {
  assert.match(dynamicList, /maxItems\?: number/);
  assert.match(dynamicList, /maxLength\?: number/);
  assert.match(dynamicList, /showCharacterCount\?: boolean/);
  assert.match(dynamicList, /multiline\?: boolean/);
  assert.match(dynamicList, /event\.(?:metaKey|ctrlKey)/);
  assert.match(dynamicList, /Maximum of {maxItems} {countLabel} reached/);

  const challenges = fields.slice(
    fields.indexOf('label="Challenges"'),
    fields.indexOf('label="Future improvements"'),
  );
  const future = fields.slice(
    fields.indexOf('label="Future improvements"'),
    fields.indexOf("</div>", fields.indexOf('label="Future improvements"')),
  );
  assert.doesNotMatch(challenges, /maxItems|maxLength/);
  assert.doesNotMatch(future, /maxItems|maxLength/);
});
