import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

test("public case studies use non-executable GFM plus raw-HTML sanitization", () => {
  const renderer = read("apps/frontend/components/projects/detail/case-study/project-readme-renderer.tsx");
  const packageJson = JSON.parse(read("apps/frontend/package.json"));
  assert.equal(packageJson.dependencies["next-mdx-remote"], undefined);
  assert.equal(packageJson.dependencies["github-slugger"], undefined);
  assert.match(renderer, /remarkGfm/);
  assert.match(renderer, /rehypeRaw/);
  assert.match(renderer, /rehypeSanitize/);
  assert.match(renderer, /rehypeSlug/);
  assert.match(renderer, /caseStudySanitizeSchema/);
  assert.match(renderer, /ProjectCodeBlock/);
  assert.match(renderer, /overflow-x-auto/);
  assert.match(renderer, /max-w-full/);
  assert.doesNotMatch(renderer, /dangerouslySetInnerHTML/);
  assert.equal(fs.existsSync(path.join(repoRoot, "apps/frontend/lib/projects/mdx.ts")), false);
});

test("public README section has one primary container and a viewport-fixed expansion control", () => {
  const section = read("apps/frontend/components/projects/detail/case-study/project-readme-section.tsx");
  const expandable = read("apps/frontend/components/projects/detail/case-study/project-expandable-details.tsx");
  assert.match(section, /Project case study/);
  assert.match(section, /ProjectExpandableDetails/);
  assert.doesNotMatch(section, /ProjectMdxSection/);
  assert.match(expandable, /aria-expanded/);
  assert.match(expandable, /aria-controls/);
  assert.match(expandable, /history\.pushState/);
  assert.match(expandable, /NAV_OFFSET/);
  assert.match(expandable, /import \{ createPortal \} from "react-dom"/);
  assert.match(expandable, /const mounted = React\.useSyncExternalStore/);
  assert.match(
    expandable,
    /React\.useSyncExternalStore\(\s*subscribeToMountState,\s*\(\) => true,\s*\(\) => false/s,
  );
  assert.match(expandable, /mounted && expanded\s*\? createPortal\(/s);
  assert.match(expandable, /document\.body/);
  assert.match(expandable, /\{!expanded \? \(\s*<div className="mt-6 flex justify-center">/s);
  assert.match(expandable, /Show full details/);
  assert.match(expandable, /Show less/);
  assert.equal((expandable.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((expandable.match(/aria-expanded="false"/g) ?? []).length, 1);
  assert.match(expandable, /fixed inset-x-0/);
  assert.doesNotMatch(expandable, /sticky bottom-4/);
  assert.equal((expandable.match(/Show less/g) ?? []).length, 1);
  assert.match(
    expandable,
    /<\/div>\s*\{mounted && expanded\s*\? createPortal\(/s,
  );
  assert.match(expandable, /ref=\{expandButtonRef\}/);
  assert.match(expandable, /expandButtonRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(expandable, /scrollToSectionTop/);
  assert.doesNotMatch(expandable, /rounded-\[2rem\].*border/);
});

test("public code blocks copy only code and expose a temporary accessible status", () => {
  const source = read("apps/frontend/components/projects/detail/case-study/project-code-block.tsx");
  const renderer = read("apps/frontend/components/projects/detail/case-study/project-readme-renderer.tsx");
  assert.match(source, /aria-label="Copy code"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /1800/);
  assert.match(renderer, /removeCaseStudyRendererNewline/);
  assert.match(renderer, /code: \(\{ children, className/);
  assert.match(renderer, /pre: \(\{ children/);
});
