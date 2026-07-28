import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const projectCard = read(
  "apps/frontend/components/projects/shared/project-card.tsx",
);
const featuredProjects = read(
  "apps/frontend/components/sections/home/featured-projects/featured-projects-section.tsx",
);
const projectPage = read("apps/frontend/app/projects/[slug]/page.tsx");
const projectCatalog = read(
  "apps/frontend/components/projects/listing/project-catalog.tsx",
);
const sharedButton = read("apps/frontend/components/ui/button.tsx");

test("project cards pass full grid-track height through card wrappers", () => {
  const articleOpening = projectCard.slice(
    projectCard.indexOf("<article"),
    projectCard.indexOf(">", projectCard.indexOf("<article")) + 1,
  );

  assert.match(articleOpening, /flex h-full flex-col/);
  assert.match(projectCard, /className="flex flex-1 flex-col p-5 sm:p-6"/);
  assert.match(projectCard, /className="mt-4 mb-5 flex flex-wrap gap-1\.5"/);
  assert.match(
    projectCard,
    /className="mt-auto flex flex-wrap items-center justify-between/,
  );
  assert.match(projectCard, /relative aspect-video/);
  assert.match(projectCard, /line-clamp-2/);

  assert.match(
    featuredProjects,
    /<StaggerItem key=\{project\.id\} className="h-full">/,
  );
  assert.match(
    projectPage,
    /<StaggerItem key=\{relatedProject\.id\} className="h-full">/,
  );
  assert.match(
    projectCatalog,
    /<FeaturedProjectCard key=\{project\.id\} project=\{project\} \/>/,
  );
  assert.doesNotMatch(projectCatalog, /StaggerItem[\s\S]*FeaturedProjectCard/);
  assert.doesNotMatch(articleOpening, /h-\[[^\]]+\]|min-h-\[[^\]]+\]/);
});

test("View details remains the only compact project-detail navigation target", () => {
  const detailLinks =
    projectCard.match(/href=\{`\/projects\/\$\{project\.slug\}`\}/g) ?? [];

  assert.equal(detailLinks.length, 1);
  assert.match(projectCard, /<Button[\s\S]*?asChild[\s\S]*?<Link/s);
  assert.match(projectCard, />\s*View details\s*<MoveRight/s);
  assert.match(
    projectCard,
    /aria-label=\{`View details for \$\{project\.title\}`\}/,
  );
  assert.match(projectCard, /href=\{project\.links\.github\}/);
  assert.match(projectCard, /href=\{project\.links\.live\}/);
  assert.match(projectCard, /target="_blank"/);
  assert.match(sharedButton, /focus-visible:/);

  assert.doesNotMatch(projectCard, /<article[\s\S]*?onClick=/);
  assert.doesNotMatch(projectCard, /router\.push|stopPropagation|cursor-pointer/);
  assert.doesNotMatch(
    projectCard,
    /after:absolute|before:absolute|absolute inset-0[^"]*(?:Link|anchor)/,
  );
  assert.doesNotMatch(projectCard, /<Link[^>]*>\s*<article/);
});
