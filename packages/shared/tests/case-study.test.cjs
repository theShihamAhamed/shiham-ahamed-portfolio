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
