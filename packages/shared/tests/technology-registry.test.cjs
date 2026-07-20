const assert = require("node:assert/strict");
const test = require("node:test");
const shared = require("../dist");

const previousRegistrySlugs = [
  "react", "nextjs", "typescript", "javascript", "html", "css",
  "tailwind-css", "sass", "bootstrap", "shadcn-ui", "nodejs",
  "expressjs", "nestjs", "spring-boot", "java", "python", "c-sharp",
  "cpp", "dotnet", "mongodb", "mongoose", "postgresql", "mysql",
  "redis", "prisma", "drizzle", "neon", "rest-api", "graphql",
  "websocket", "socketio", "microservices", "kafka", "jwt", "oauth",
  "bcrypt", "docker", "docker-compose", "kubernetes", "kubectl",
  "github-actions", "git", "github", "aws", "amazon-s3", "vercel",
  "linux", "jest", "vitest", "playwright", "cypress", "postman",
  "tensorflow", "rag", "stripe", "cloudinary", "imagekit", "resend",
  "zod", "tanstack-query", "react-hook-form", "vite", "nx", "gsap",
  "mdx", "font-awesome", "swagger", "yaml", "minikube", "multer",
];

const representativeFutureSlugs = [
  "react-native", "expo", "flutter", "dart", "redux", "redux-toolkit",
  "rtk-query", "supabase", "firebase", "openid-connect", "terraform",
  "opentelemetry", "openai-api", "langchain", "rabbitmq",
  "cloudflare-workers",
];

test("technology registry satisfies canonical integrity, category, color, and contrast contracts", () => {
  const slugs = new Set();
  const labels = new Set();
  const owners = new Map();

  assert.ok(shared.TECHNOLOGY_REGISTRY.length >= 300);
  for (const entry of shared.TECHNOLOGY_REGISTRY) {
    assert.equal(slugs.has(entry.slug), false);
    slugs.add(entry.slug);
    const normalizedLabel = shared.normalizeTechnologyTag(entry.label);
    assert.equal(labels.has(normalizedLabel), false);
    labels.add(normalizedLabel);
    assert.ok(shared.TECH_TAG_CATEGORIES.includes(entry.category));

    for (const color of [
      entry.brandColor, entry.color, entry.light.bg, entry.light.text,
      entry.light.border, entry.dark.bg, entry.dark.text, entry.dark.border,
    ]) {
      assert.match(color, /^#[0-9a-f]{6}$/i);
    }
    assert.ok(shared.contrastRatio(entry.light.text, entry.light.bg) >= 4.5);
    assert.ok(shared.contrastRatio(entry.dark.text, entry.dark.bg) >= 4.5);

    for (const value of [entry.slug, entry.label, ...entry.aliases]) {
      const key = shared.normalizeTechnologyTag(value);
      const owner = owners.get(key);
      assert.ok(!owner || owner === entry.slug, `${value} collides with ${owner}`);
      owners.set(key, entry.slug);
      assert.equal(shared.findTechnologyByNameOrAlias(value).slug, entry.slug);
    }

    assert.equal(shared.TECHNOLOGY_REGISTRY_BY_SLUG[entry.slug], entry);
  }

  assert.equal(Object.keys(shared.TECHNOLOGY_REGISTRY_BY_SLUG).length, shared.TECHNOLOGY_REGISTRY.length);
  assert.deepEqual(shared.validateTechnologyRegistry(), []);
});

test("expanded registry preserves every previous slug and representative future-ready entries", () => {
  for (const slug of previousRegistrySlugs) {
    assert.ok(shared.TECHNOLOGY_REGISTRY_BY_SLUG[slug], `missing previous slug ${slug}`);
  }
  for (const slug of representativeFutureSlugs) {
    assert.ok(shared.TECHNOLOGY_REGISTRY_BY_SLUG[slug], `missing future-ready slug ${slug}`);
  }
  assert.ok(shared.TECHNOLOGY_REGISTRY_BY_SLUG.oauth);
  assert.equal(shared.TECHNOLOGY_REGISTRY_BY_SLUG.arcjet, undefined);
});

test("technology lookup normalizes meaningful punctuation and search ordering", () => {
  const aliases = {
    "reactjs": "react", " NEXT.JS ": "nextjs", "ts": "typescript",
    "js": "javascript", "ecmascript": "javascript", "node.js": "nodejs",
    "express.js": "expressjs", "springboot": "spring-boot",
    "react native": "react-native", "react-native": "react-native",
    "expo router": "expo-router", "redux toolkit": "redux-toolkit",
    "rtk": "redux-toolkit", "rtk query": "rtk-query",
    "postgres": "postgresql", "psql": "postgresql", "mongo": "mongodb",
    "k8s": "kubernetes", "amazon web services": "aws", "s3": "amazon-s3",
    "oidc": "openid-connect", "oauth2": "oauth",
    "github actions": "github-actions", "tfjs": "tensorflowjs",
    "retrieval augmented generation": "rag",
    "model context protocol": "model-context-protocol",
    "infrastructure as code": "terraform", "iac": "terraform",
    "react query": "tanstack-query", "react hook form": "react-hook-form",
    "rhf": "react-hook-form", "openai": "openai-api",
    "C#": "c-sharp", "C++": "cpp", ".NET": "dotnet",
    "Socket.IO": "socketio",
  };

  for (const [alias, slug] of Object.entries(aliases)) {
    assert.equal(shared.findTechnologyByNameOrAlias(alias).slug, slug);
  }
  for (const broadAlias of ["AI", "cloud", "database", "auth", "API", "testing"]) {
    assert.equal(shared.findTechnologyByNameOrAlias(broadAlias), undefined);
  }
  assert.equal(shared.searchTechnologies("next")[0].slug, "nextjs");
  assert.equal(shared.searchTechnologies("nextjs")[0].slug, "nextjs");
  assert.equal(shared.searchTechnologies("nextjs")[0].label, "Next.js");
  assert.equal(shared.searchTechnologies("drizzle")[0].slug, "drizzle");
  assert.equal(shared.searchTechnologies("drizzle")[0].label, "Drizzle ORM");
  assert.equal(shared.searchTechnologies("next js")[0].slug, "nextjs");
  assert.equal(shared.searchTechnologies("next.js")[0].slug, "nextjs");
  assert.equal(shared.searchTechnologies("nextjs-toploader")[0].slug, "nextjs-toploader");
  assert.equal(shared.searchTechnologies("next top loader")[0].slug, "nextjs-toploader");
  assert.equal(shared.searchTechnologies("nextjs", "frontend")[0].slug, "nextjs");
  assert.equal(shared.searchTechnologies("nextjs", "ui")[0].slug, "nextjs-toploader");
  assert.equal(shared.findTechnologyBySlug("nextjs").label, "Next.js");
  assert.equal(shared.findTechnologyBySlug("drizzle").label, "Drizzle ORM");
  assert.equal(shared.searchTechnologies("rtk")[0].slug, "redux-toolkit");
  assert.equal(shared.searchTechnologies("remote")[0].slug, "next-mdx-remote");
  assert.equal(shared.searchTechnologies("", "mobile").length > 0, true);
  assert.equal(shared.searchTechnologies("", "backend").length > 0, true);
  for (const entry of shared.TECHNOLOGY_REGISTRY) {
    assert.equal(
      shared.searchTechnologies(entry.slug)[0]?.slug,
      entry.slug,
      `canonical slug ${entry.slug} should resolve to itself`,
    );
  }
  assert.equal(shared.findTechnologyByNameOrAlias("not-real"), undefined);
});

test("known and custom technology schemas enforce minimal safe persistence", () => {
  assert.equal(shared.knownProjectTechnologySchema.safeParse({ kind: "known", slug: "typescript", showOnCard: true }).success, true);
  assert.equal(shared.knownProjectTechnologySchema.safeParse({ kind: "known", slug: "missing", showOnCard: true }).success, false);
  assert.equal(shared.customProjectTechnologySchema.safeParse({ kind: "custom", slug: "internal-tool", label: "Internal Tool", category: "tooling", color: "#64748B", showOnCard: false }).success, true);
  assert.equal(shared.customProjectTechnologySchema.safeParse({ kind: "custom", slug: "arcjet", label: "arcjet", category: "backend", color: "#64748B", showOnCard: false }).success, true);
  assert.equal(shared.customProjectTechnologySchema.safeParse({ kind: "custom", slug: "react", label: "React", category: "frontend", color: "red", showOnCard: false }).success, false);
  assert.equal(shared.projectTechnologyListSchema.safeParse([{ kind: "known", slug: "typescript", showOnCard: false }, { kind: "known", slug: "typescript", showOnCard: true }]).success, false);
});

test("resolved presentation keeps known metadata canonical and custom accents isolated", () => {
  const known = shared.resolveProjectTechnology({ kind: "known", slug: "react", showOnCard: true });
  assert.equal(known.label, "React");
  assert.equal(known.showOnCard, true);
  assert.notEqual(known.light.bg, known.brandColor);
  assert.equal(shared.resolveProjectTechnology({ kind: "known", slug: "react", showOnCard: false }).showOnCard, false);
  const custom = shared.resolveProjectTechnology({ kind: "custom", slug: "internal-tool", label: "Internal Tool", category: "tooling", color: "#FF00AA", showOnCard: false });
  assert.equal(custom.light.bg, "#f1f5f9");
  assert.equal(custom.dark.bg, "#17232b");
  assert.equal(custom.light.border, "#FF00AA");
});
