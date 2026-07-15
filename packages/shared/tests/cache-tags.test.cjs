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
