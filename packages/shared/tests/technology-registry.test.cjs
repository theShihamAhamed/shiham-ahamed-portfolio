const assert = require("node:assert/strict");
const test = require("node:test");
const shared = require("../dist");

test("technology registry has unique canonical slugs and resolvable aliases", () => {
  const slugs = new Set(); const owners = new Map();
  for (const entry of shared.TECHNOLOGY_REGISTRY) {
    assert.equal(slugs.has(entry.slug), false); slugs.add(entry.slug);
    assert.match(entry.brandColor, /^#[0-9a-f]{6}$/i);
    assert.match(entry.color, /^#[0-9a-f]{6}$/i);
    assert.ok(shared.TECH_TAG_CATEGORIES.includes(entry.category));
    for (const alias of entry.aliases) { const key = shared.normalizeTechnologyTag(alias); assert.equal(owners.has(key), false); owners.set(key, entry.slug); assert.equal(shared.findTechnologyByNameOrAlias(alias).slug, entry.slug); }
  }
  assert.deepEqual(shared.validateTechnologyRegistry(), []);
});

test("technology lookup normalizes meaningful punctuation and search ordering", () => {
  assert.equal(shared.findTechnologyByNameOrAlias(" NEXT.JS ").slug, "nextjs");
  assert.equal(shared.findTechnologyByNameOrAlias("k8s").slug, "kubernetes");
  assert.equal(shared.findTechnologyByNameOrAlias("Node.js").slug, "nodejs");
  assert.equal(shared.findTechnologyByNameOrAlias("C#").slug, "c-sharp");
  assert.equal(shared.findTechnologyByNameOrAlias("C++").slug, "cpp");
  assert.equal(shared.findTechnologyByNameOrAlias(".NET").slug, "dotnet");
  assert.equal(shared.findTechnologyByNameOrAlias("Socket.IO").slug, "socketio");
  assert.equal(shared.searchTechnologies("next")[0].slug, "nextjs");
  assert.equal(shared.searchTechnologies("", "backend").length > 0, true);
  assert.equal(shared.findTechnologyByNameOrAlias("not-real"), undefined);
});

test("known and custom technology schemas enforce minimal safe persistence", () => {
  assert.equal(shared.knownProjectTechnologySchema.safeParse({ kind: "known", slug: "typescript", showOnCard: true }).success, true);
  assert.equal(shared.knownProjectTechnologySchema.safeParse({ kind: "known", slug: "missing", showOnCard: true }).success, false);
  assert.equal(shared.customProjectTechnologySchema.safeParse({ kind: "custom", slug: "internal-tool", label: "Internal Tool", category: "tooling", color: "#64748B", showOnCard: false }).success, true);
  assert.equal(shared.customProjectTechnologySchema.safeParse({ kind: "custom", slug: "react", label: "React", category: "frontend", color: "red", showOnCard: false }).success, false);
  assert.equal(shared.projectTechnologyListSchema.safeParse([{ kind: "known", slug: "typescript", showOnCard: false }, { kind: "known", slug: "typescript", showOnCard: true }]).success, false);
});

test("resolved presentation keeps known metadata canonical and custom accents isolated", () => {
  const known = shared.resolveProjectTechnology({ kind: "known", slug: "react", showOnCard: true });
  assert.equal(known.label, "React");
  assert.equal(known.showOnCard, true);
  assert.notEqual(known.light.bg, known.brandColor);
  const custom = shared.resolveProjectTechnology({ kind: "custom", slug: "internal-tool", label: "Internal Tool", category: "tooling", color: "#FF00AA", showOnCard: false });
  assert.equal(custom.light.bg, "#f1f5f9");
  assert.equal(custom.dark.bg, "#17232b");
  assert.equal(custom.light.border, "#FF00AA");
});
