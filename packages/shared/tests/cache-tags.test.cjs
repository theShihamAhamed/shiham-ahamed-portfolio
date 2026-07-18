const assert = require("node:assert/strict");
const test = require("node:test");
const shared = require("../dist");

test("project detail tags normalize slugs and preserve canonical scope", () => {
  assert.equal(
    shared.getProjectDetailCacheTag("  Portfolio-App "),
    "project-detail:portfolio-app",
  );
  assert.equal(shared.getProjectDetailCacheTag("not a valid slug"), undefined);
});

test("project updates invalidate collection, detail, and old/new slug tags", () => {
  const tags = shared.getPublicCacheTagsForRevalidation({
    entity: "project",
    action: "update",
    slug: "new-slug",
    previousSlug: "old-slug",
  });

  assert.deepEqual(tags, [
    "projects",
    "featured-projects",
    "project-detail",
    "project-detail:new-slug",
    "project-detail:old-slug",
  ]);
});

test("manual all-group revalidation resolves canonical tags once and in order", () => {
  const expected = [...shared.PUBLIC_CACHE_GROUPS.all];
  const mutableAllGroup = shared.PUBLIC_CACHE_GROUPS.all;

  mutableAllGroup.push("projects");
  try {
    const parsed = shared.publicRevalidationOperationSchema.safeParse({
      group: "all",
    });
    assert.equal(parsed.success, true);
    assert.deepEqual(
      shared.getPublicCacheTagsForRevalidation(parsed.data),
      expected,
    );
  } finally {
    mutableAllGroup.pop();
  }
});

test("operation union keeps automatic requests and rejects mixed input", () => {
  assert.equal(
    shared.publicRevalidationOperationSchema.safeParse({
      entity: "certification",
      action: "update",
    }).success,
    true,
  );
  assert.equal(
    shared.publicRevalidationOperationSchema.safeParse({
      entity: "project",
      action: "update",
      slug: "new-project",
      previousSlug: "old-project",
    }).success,
    true,
  );

  for (const invalid of [
    {},
    { group: "unknown" },
    {
      group: "all",
      entity: "project",
      action: "update",
      slug: "example",
    },
    { group: "all", tags: ["projects"] },
    { paths: ["/projects"] },
  ]) {
    assert.equal(
      shared.publicRevalidationOperationSchema.safeParse(invalid).success,
      false,
    );
  }
});

test("revalidation schema rejects arbitrary tags and invalid entity combinations", () => {
  assert.equal(
    shared.publicRevalidationRequestSchema.safeParse({
      tags: ["projects"],
    }).success,
    false,
  );
  assert.equal(
    shared.publicRevalidationRequestSchema.safeParse({
      entity: "certification",
      action: "update",
      slug: "certificate",
    }).success,
    false,
  );
  assert.equal(
    shared.publicRevalidationRequestSchema.safeParse({
      entity: "project",
      action: "delete",
      slug: "deleted-project",
      previousSlug: "old-project",
    }).success,
    false,
  );
});
