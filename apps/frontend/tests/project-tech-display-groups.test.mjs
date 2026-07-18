import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  PROJECT_TECH_DISPLAY_GROUPS,
  groupProjectTechnologiesForDisplay,
} from "../lib/projects/project-tech-display-groups.ts";

const custom = (slug, label, category) => ({
  kind: "custom",
  slug,
  label,
  category,
  color: "#64748B",
  showOnCard: false,
});

test("technology categories collapse into six fixed display groups", () => {
  const groups = groupProjectTechnologiesForDisplay([
    custom("react-ui", "React UI", "ui"),
    custom("react-native", "React Native", "mobile"),
    custom("react-web", "React Web", "frontend"),
    custom("express", "Express", "backend"),
    custom("oauth", "OAuth", "auth"),
    custom("stripe", "Stripe", "payment"),
    custom("rabbitmq", "RabbitMQ", "messaging"),
    custom("clean-architecture", "Clean Architecture", "architecture"),
    custom("postgresql", "PostgreSQL", "database"),
    custom("s3", "S3", "storage"),
    custom("aws", "AWS", "cloud"),
    custom("docker", "Docker", "devops"),
    custom("sentry", "Sentry", "observability"),
    custom("typescript", "TypeScript", "language"),
    custom("vite", "Vite", "tooling"),
    custom("vitest", "Vitest", "testing"),
    custom("openai", "OpenAI", "ai-ml"),
    custom("misc", "Miscellaneous", "other"),
  ]);

  assert.deepEqual(
    groups.map(({ key, label }) => ({ key, label })),
    PROJECT_TECH_DISPLAY_GROUPS,
  );
  assert.deepEqual(
    groups.map((group) => group.items.map((item) => item.slug)),
    [
      ["react-ui", "react-native", "react-web"],
      ["express", "oauth", "stripe", "rabbitmq", "clean-architecture"],
      ["postgresql", "s3"],
      ["aws", "docker", "sentry"],
      ["typescript"],
      ["vite", "vitest", "openai", "misc"],
    ],
  );
});

test("display grouping preserves first occurrence, hides empty groups, and falls back safely", () => {
  const first = custom("same.tech", "First", "frontend");
  const duplicate = custom("same-tech", "Duplicate", "backend");
  const unknownKnownTechnology = {
    kind: "known",
    slug: "future-unregistered-technology",
    showOnCard: false,
  };

  const groups = groupProjectTechnologiesForDisplay([
    first,
    duplicate,
    unknownKnownTechnology,
  ]);

  assert.deepEqual(groups.map((group) => group.key), ["frontend", "tools-other"]);
  assert.equal(groups[0].items[0], first);
  assert.equal(groups[0].items.includes(duplicate), false);
  assert.equal(groups[1].items[0], unknownKnownTechnology);
});

test("viewer mapping has no detail-description compatibility property", () => {
  const mapper = fs.readFileSync(
    path.resolve(process.cwd(), "lib/mappers/projects.ts"),
    "utf8",
  );
  const viewerTypes = fs.readFileSync(
    path.resolve(process.cwd(), "types/project.ts"),
    "utf8",
  );

  assert.doesNotMatch(mapper, /project\.description|longDescription/);
  assert.doesNotMatch(viewerTypes, /longDescription/);
  assert.match(mapper, /groupProjectTechnologiesForDisplay\(project\.techStack\)/);
});
