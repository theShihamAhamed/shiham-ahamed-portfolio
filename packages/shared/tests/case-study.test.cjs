const assert = require("node:assert/strict");
const test = require("node:test");

const shared = require("../dist");

test("case study content normalizes blanks and measures UTF-8 bytes", () => {
  assert.equal(shared.normalizeCaseStudyMdx("  \n  "), undefined);
  assert.equal(shared.normalizeCaseStudyMdx("  ## Hello  "), "## Hello");
  assert.equal(shared.getUtf8ByteLength("é"), 2);
  assert.equal(shared.getUtf8ByteLength("🙂"), 4);
});

test("case study schemas enforce the byte limit and controlled syntax", () => {
  assert.equal(
    shared.optionalCaseStudyMdxSchema.safeParse("").success,
    true,
  );
  assert.equal(
    shared.optionalCaseStudyMdxSchema.parse("   "),
    undefined,
  );
  assert.equal(
    shared.optionalCaseStudyMdxSchema.safeParse("## Safe\n\n- GFM").success,
    true,
  );
  assert.equal(
    shared.optionalCaseStudyMdxSchema.safeParse("import Thing from 'x'").success,
    false,
  );
  assert.equal(
    shared.optionalCaseStudyMdxSchema.safeParse("[run](javascript:alert(1))").success,
    false,
  );
  assert.equal(
    shared.optionalCaseStudyMdxSchema.safeParse("<script>alert(1)</script>").success,
    false,
  );
  assert.equal(
    shared.optionalCaseStudyMdxSchema.safeParse("🙂".repeat(30_000)).success,
    false,
  );
});

test("README Markdown and the supported safe HTML subset are accepted", () => {
  const readme = `# Project title

- GitHub-Flavoured Markdown
- [x] Completed task

<p align="center">
  <img
    src="https://example.com/logo.png"
    width="160"
    alt="Project logo"
  />
</p>

<details>
  <summary>Installation</summary>

  Run the following command.

  \`\`\`bash
  npm install
  \`\`\`
</details>

| Feature | Status |
| --- | --- |
| Tables | Supported |

[Documentation](/docs/readme)
![Badge](https://example.com/badge.svg)
`;

  assert.equal(shared.optionalCaseStudyMdxSchema.safeParse(readme).success, true);
});

test("code examples are not mistaken for active imports or HTML", () => {
  const code = `\`\`\`js
import express from "express";
const example = "<script>alert('not active')</script>";
\`\`\`

Inline \`<script>alert(1)</script>\` and \`import React from "react"\`.`;

  assert.equal(shared.optionalCaseStudyMdxSchema.safeParse(code).success, true);
});

test("active HTML, JSX-shaped tags, handlers, and unsafe URLs are rejected", () => {
  const unsafeValues = [
    "<script>alert(1)</script>",
    '<iframe src="https://example.com"></iframe>',
    '<div onclick="alert(1)">Unsafe</div>',
    '<a href="javascript:alert(1)">Unsafe</a>',
    "<form><input /></form>",
    "<Component />",
    "[run](javascript:alert(1))",
  ];

  for (const value of unsafeValues) {
    assert.equal(
      shared.optionalCaseStudyMdxSchema.safeParse(value).success,
      false,
      value,
    );
  }
});

test("case-study URL and code-copy helpers keep their narrow contracts", () => {
  assert.equal(shared.isSafeCaseStudyUrl("/projects/demo", "link"), true);
  assert.equal(shared.isSafeCaseStudyUrl("#installation", "link"), true);
  assert.equal(shared.isSafeCaseStudyUrl("mailto:hello@example.com", "link"), true);
  assert.equal(shared.isSafeCaseStudyUrl("javascript:alert(1)", "link"), false);
  assert.equal(shared.isSafeCaseStudyUrl("data:image/png;base64,AAAA", "image"), false);
  assert.equal(
    shared.extractCaseStudyCodeText({
      props: { children: ["import ", { props: { children: "express" } }] },
    }),
    "import express",
  );
  assert.equal(shared.removeCaseStudyRendererNewline("line 1\n"), "line 1");
  assert.equal(shared.removeCaseStudyRendererNewline("line 1\n\n"), "line 1\n");
  assert.equal(shared.getCaseStudyLanguageLabel("language-ts"), "TypeScript");
  assert.equal(shared.getCaseStudyLanguageLabel("language-bash"), "Shell");
  assert.equal(shared.getCaseStudyLanguageLabel(undefined), undefined);
});

test("project API and form contracts keep external articles separate", () => {
  const base = {
    title: "Project",
    shortDescription: "Short",
    description: "Description",
    projectType: "full-stack-web-app",
    status: "completed",
    startDate: "2024-01",
    endDate: "2024-06",
    thumbnail: { url: "https://example.com/a.jpg", fileId: "a", alt: "A" },
    gallery: [{ url: "https://example.com/b.jpg", fileId: "b", alt: "B" }],
    techStack: [{ kind: "known", slug: "typescript", showOnCard: false }],
    overview: ["Overview"],
    highlights: ["Highlight"],
    links: { article: "https://example.com/article" },
    caseStudyMdx: "## Stored case study",
  };

  assert.equal(shared.createProjectSchema.safeParse(base).success, true);
  assert.equal(shared.updateProjectSchema.safeParse({ caseStudyMdx: "" }).success, true);
  assert.equal(shared.updateProjectSchema.parse({ caseStudyMdx: "" }).caseStudyMdx, undefined);
  assert.equal(shared.updateProjectSchema.safeParse({ mdxUrl: "https://example.com/old" }).success, false);
  assert.equal(shared.createProjectFormSchema.parse({
    ...base,
    architecture: { points: [] },
    links: {},
    challenges: [],
    futureImprovements: [],
    isFeatured: false,
    isVisible: true,
    caseStudyMdx: undefined,
  }).caseStudyMdx, "");
});
