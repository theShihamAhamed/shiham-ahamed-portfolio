import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

test("case-study editor uses accessible Edit/Preview tabs and one full-width panel", () => {
  const source = read("apps/admin-frontend/components/admin/projects/case-study-editor-field.tsx");
  assert.match(source, /useState<EditorTab>\("edit"\)/);
  assert.match(source, /role="tablist"/);
  assert.match(source, /role="tab"/);
  assert.match(source, /role="tabpanel"/);
  assert.match(source, /aria-selected/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /ArrowLeft/);
  assert.match(source, /min-h-\[28rem\]/);
  assert.match(source, /min-h-\[34rem\]/);
  assert.doesNotMatch(source, /grid gap-4 lg:grid-cols-2/);
  assert.match(source, /GitHub-Flavoured Markdown/);
  assert.match(source, /getUtf8ByteLength/);
});

test("admin Preview uses the shared sanitized README pipeline and code blocks", () => {
  const renderer = read("apps/admin-frontend/components/admin/projects/case-study-readme-renderer.tsx");
  const codeBlock = read("apps/admin-frontend/components/admin/projects/case-study-code-block.tsx");
  assert.match(renderer, /remarkGfm/);
  assert.match(renderer, /rehypeRaw/);
  assert.match(renderer, /rehypeSanitize/);
  assert.match(renderer, /rehypeSlug/);
  assert.match(renderer, /caseStudySanitizeSchema/);
  assert.match(renderer, /AdminCaseStudyCodeBlock/);
  assert.match(codeBlock, /navigator\.clipboard/);
  assert.match(codeBlock, /execCommand\("copy"\)/);
  assert.match(codeBlock, /aria-live="polite"/);
});

test("create and edit adapters preserve the persisted caseStudyMdx name", () => {
  const create = read("apps/admin-frontend/components/admin/projects/project-form.utils.ts");
  const fields = read("apps/admin-frontend/components/admin/projects/project-form-fields.tsx");
  const edit = read("apps/admin-frontend/components/admin/projects/project-edit-page.tsx");
  assert.match(create, /caseStudyMdx/);
  assert.match(fields, /caseStudyMdx/);
  assert.match(edit, /caseStudyMdx/);
});
