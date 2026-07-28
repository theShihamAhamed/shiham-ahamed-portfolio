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

test("public README section has one primary container and a section-bounded sticky control", () => {
  const section = read("apps/frontend/components/projects/detail/case-study/project-readme-section.tsx");
  const expandable = read("apps/frontend/components/projects/detail/case-study/project-expandable-details.tsx");
  assert.match(section, /Project case study/);
  assert.match(section, /ProjectExpandableDetails/);
  assert.doesNotMatch(section, /ProjectMdxSection/);
  assert.match(expandable, /aria-expanded/);
  assert.match(expandable, /aria-controls/);
  assert.match(expandable, /history\.pushState/);
  assert.match(expandable, /NAV_OFFSET/);
  assert.doesNotMatch(expandable, /createPortal|document\.body/);
  assert.doesNotMatch(
    expandable,
    /subscribeToMountState|const mounted = React\.useSyncExternalStore/,
  );
  assert.match(expandable, /\{hasOverflow && !isExpanded \? \(\s*<div className="mt-6 flex justify-center">/s);
  assert.match(expandable, /Show full details/);
  assert.match(expandable, /Show less/);
  assert.equal((expandable.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((expandable.match(/aria-expanded="false"/g) ?? []).length, 1);
  assert.match(expandable, /\{isExpanded \? \(/);
  assert.match(expandable, /pointer-events-none sticky/);
  assert.match(expandable, /col-start-1 row-start-1/);
  assert.match(expandable, /100dvh/);
  assert.match(expandable, /env\(safe-area-inset-bottom\)/);
  assert.match(expandable, /pointer-events-auto inline-flex min-h-11/);
  assert.doesNotMatch(expandable, /\bfixed\b|bottom-4|inset-x-0/);
  assert.equal((expandable.match(/Show less/g) ?? []).length, 1);
  assert.match(
    expandable,
    /<div ref=\{sectionRef\}[\s\S]*\{isExpanded \? \([\s\S]*Show less[\s\S]*project-case-study-preview/s,
  );
  assert.match(expandable, /ref=\{expandButtonRef\}/);
  assert.match(expandable, /expandButtonRef\.current\?\.focus\(\{ preventScroll: true \}\)/);
  assert.match(expandable, /scrollToSectionTop/);
  assert.match(expandable, /isExpanded \? "pb-28 sm:pb-24" : undefined/);
  assert.doesNotMatch(expandable, /overflow-y-auto|overflow-y-scroll/);
  assert.doesNotMatch(expandable, /rounded-\[2rem\].*border/);
});

test("collapsed README previews clip and mask without painting over the glass surface", () => {
  const expandable = read("apps/frontend/components/projects/detail/case-study/project-expandable-details.tsx");
  const renderer = read("apps/frontend/components/projects/detail/case-study/project-readme-renderer.tsx");
  const surface = read("apps/frontend/components/projects/detail/project-detail-surface.tsx");
  const page = read("apps/frontend/app/projects/[slug]/page.tsx");
  const globalCss = read("apps/frontend/app/globals.css");
  const previewCss = globalCss.slice(
    globalCss.indexOf("Project case-study preview"),
    globalCss.indexOf("Project detail surfaces"),
  );
  const fallbackIndex = previewCss.indexOf('data-state="collapsed"');
  const supportsIndex = previewCss.indexOf("@supports (");
  const collapsedRule = previewCss.match(
    /\.project-case-study-preview\[data-state="collapsed"\]\s*\{[\s\S]*?\}/,
  )?.[0];

  assert.match(expandable, /className="project-case-study-preview"/);
  assert.match(expandable, /data-state=\{previewState\}/);
  assert.match(
    expandable,
    /inert=\{previewState === "collapsed" \? true : undefined\}/,
  );
  assert.match(expandable, /tabIndex=\{isExpanded \? -1 : undefined\}/);
  assert.match(expandable, /ResizeObserver/);
  assert.match(expandable, /PREVIEW_MAX_HEIGHT = 520/);
  assert.match(expandable, /pendingExpandFocusRef/);
  assert.match(expandable, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(
    expandable,
    /bg-gradient-to-t|from-background|via-background|pointer-events-none absolute inset-x-0 bottom-0/,
  );

  assert.ok(fallbackIndex >= 0);
  assert.ok(supportsIndex > fallbackIndex);
  assert.ok(collapsedRule);
  assert.match(collapsedRule, /max-height: 520px;/);
  assert.match(collapsedRule, /overflow: hidden;/);
  assert.match(collapsedRule, /overflow: clip;/);
  assert.ok(
    collapsedRule.indexOf("overflow: hidden;") <
      collapsedRule.indexOf("overflow: clip;"),
  );
  assert.match(collapsedRule, /contain: layout paint;/);
  assert.match(previewCss, /-webkit-mask-image: linear-gradient\(/);
  assert.match(previewCss, /(?<!-webkit-)mask-image: linear-gradient\(/);
  assert.match(previewCss, /#000 calc\(100% - 104px\)/);
  assert.match(
    previewCss,
    /\.project-case-study-preview\[data-state="expanded"\]\s*\{[\s\S]*?max-height: none;[\s\S]*?overflow: visible;[\s\S]*?contain: none;[\s\S]*?-webkit-mask-image: none;[\s\S]*?mask-image: none;[\s\S]*?\}/,
  );
  assert.equal((previewCss.match(/contain: layout paint/g) ?? []).length, 1);
  assert.equal((globalCss.match(/contain: layout paint/g) ?? []).length, 1);
  assert.doesNotMatch(renderer, /contain: layout paint/);
  assert.doesNotMatch(surface, /contain: layout paint/);
  assert.doesNotMatch(page, /contain: layout paint/);
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
