import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const techTag = read(
  "apps/frontend/components/projects/shared/tech-tag.tsx",
);
const projectCard = read(
  "apps/frontend/components/projects/shared/project-card.tsx",
);
const techGroups = read(
  "apps/frontend/components/projects/detail/project-tech-groups.tsx",
);
const projectList = read(
  "apps/frontend/components/projects/detail/project-points-section.tsx",
);
const highlights = read(
  "apps/frontend/components/projects/detail/project-highlights.tsx",
);
const architecture = read(
  "apps/frontend/components/projects/detail/project-architecture.tsx",
);
const projectPage = read("apps/frontend/app/projects/[slug]/page.tsx");
const globalCss = read("apps/frontend/app/globals.css");

const hexToRgb = (hex) =>
  [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));

const mixSrgb = (first, second, firstWeight) =>
  first.map((channel, index) =>
    Math.round(channel * firstWeight + second[index] * (1 - firstWeight)),
  );

const relativeLuminance = (rgb) =>
  rgb
    .map((channel) => {
      const value = channel / 255;
      return value <= 0.03928
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    })
    .reduce(
      (sum, channel, index) =>
        sum + channel * [0.2126, 0.7152, 0.0722][index],
      0,
    );

const contrastRatio = (foreground, background) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);

  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
};

test("promotional technology badges stay read-only and presentation-only", () => {
  assert.match(techTag, /<span/);
  assert.match(techTag, /"--tech-brand": brand/);
  assert.match(techTag, /resolved\?\.brandColor \?\? tag\.color/);
  assert.doesNotMatch(techTag, /<button|<Link|onClick|cursor-|hover:|transition|shadow/);
  assert.doesNotMatch(techTag, /\bborder(?:-|\s)/);
});

test("technology badge CSS provides a fallback before guarded brand mixes", () => {
  const fallbackIndex = globalCss.indexOf(".tech-badge-theme");
  const supportsIndex = globalCss.indexOf(
    "@supports (color: color-mix(in srgb, red, blue))",
  );

  assert.ok(fallbackIndex >= 0);
  assert.ok(supportsIndex > fallbackIndex);
  assert.match(
    globalCss,
    /\.tech-badge-theme\s*\{\s*background: var\(--muted\);\s*color: var\(--foreground\);/s,
  );
  assert.match(globalCss, /var\(--tech-brand\) 12%/);
  assert.match(globalCss, /var\(--tech-brand\) 35%/);
  assert.match(globalCss, /var\(--tech-brand\) 16%/);
  assert.match(globalCss, /var\(--tech-brand\) 50%/);
});

test("brand mix targets retain readable contrast for registry and extreme colors", () => {
  const registry = read(
    "packages/shared/src/technologies/technology-registry.ts",
  );
  const registryColors = [...registry.matchAll(
    /\["[^"]+",\s*"[^"]+",\s*\[[^\]]*\],\s*"[^"]+",\s*"(#[0-9a-fA-F]{6})"\]/g,
  )].map((match) => match[1]);
  const colors = new Set([...registryColors, "#000000", "#FFFFFF"]);
  const lightSurface = hexToRgb("#FFFFFF");
  const lightForeground = hexToRgb("#0A0A0A");
  const darkSurface = hexToRgb("#0A0A0A");
  const darkForeground = hexToRgb("#FAFAFA");

  assert.ok(registryColors.length > 60, "expected the complete technology registry");

  for (const color of colors) {
    const brand = hexToRgb(color);
    const lightBackground = mixSrgb(brand, lightSurface, 0.12);
    const lightText = mixSrgb(brand, lightForeground, 0.35);
    const darkBackground = mixSrgb(brand, darkSurface, 0.16);
    const darkText = mixSrgb(brand, darkForeground, 0.5);

    assert.ok(
      contrastRatio(lightText, lightBackground) >= 4.5,
      `${color} light badge contrast is below 4.5:1`,
    );
    assert.ok(
      contrastRatio(darkText, darkBackground) >= 4.5,
      `${color} dark badge contrast is below 4.5:1`,
    );
  }
});

test("promotional badge usage remains limited to hero and shared project cards", () => {
  const featuredProjects = read(
    "apps/frontend/components/sections/home/featured-projects/featured-projects-section.tsx",
  );
  const catalog = read(
    "apps/frontend/components/projects/listing/project-catalog.tsx",
  );

  assert.match(projectPage, /<TechTag/);
  assert.match(projectCard, /<TechTag/);
  assert.match(featuredProjects, /<FeaturedProjectCard/);
  assert.match(catalog, /<FeaturedProjectCard/);
  assert.match(projectPage, /relatedProjects\.map[\s\S]*<FeaturedProjectCard/);

  const overflowToken = projectCard.slice(
    projectCard.indexOf("{project.techStack.length > 5"),
    projectCard.indexOf("{/* Divider + Actions */}"),
  );
  assert.match(overflowToken, /h-6/);
  assert.match(overflowToken, /bg-muted\/60/);
  assert.doesNotMatch(overflowToken, /border|shadow|hover:|cursor-/);
});

test("technology inventory uses neutral semantic legend groups", () => {
  assert.doesNotMatch(techGroups, /TechTag|tech-badge-theme|--tech-brand/);
  assert.match(techGroups, /<h2/);
  assert.match(techGroups, /<h3/);
  assert.match(techGroups, /aria-labelledby/);
  assert.match(techGroups, /<ul/);
  assert.match(techGroups, /<li/);
  assert.match(techGroups, /aria-hidden="true"/);
  assert.match(techGroups, /border-dashed/);
  assert.match(techGroups, /bg-card/);
  assert.doesNotMatch(
    techGroups,
    /radial-gradient|backdrop-blur|shadow|bg-background\/70/,
  );
});

test("detail facts share semantic editorial lists without item cards", () => {
  assert.match(projectList, /icon\?: LucideIcon/);
  assert.match(projectList, /marker\?: "dot" \| "check"/);
  assert.match(projectList, /<h2/);
  assert.match(projectList, /<ul/);
  assert.match(projectList, /<li/);
  assert.match(projectList, /divide-y divide-border\/40/);
  assert.match(projectList, /aria-hidden="true"/);
  assert.doesNotMatch(
    projectList,
    /radial-gradient|backdrop-blur|shadow|rounded-\[1\.25rem\]|bg-background\/70/,
  );

  assert.match(highlights, /<ProjectListSection/);
  assert.match(highlights, /title="Key highlights"/);
  assert.match(highlights, /icon=\{Sparkles\}/);
  assert.match(highlights, /marker="check"/);
});

test("architecture points are semantic while image lightbox behavior remains", () => {
  const architectureText = architecture.slice(0, architecture.indexOf("<button"));

  assert.match(architectureText, /<h2/);
  assert.match(architectureText, /<ul/);
  assert.match(architectureText, /<li/);
  assert.doesNotMatch(
    architectureText,
    /radial-gradient|backdrop-blur|shadow|rounded-\[1\.25rem\]|bg-background\/70/,
  );
  assert.match(architecture, /aria-label="Preview architecture diagram"/);
  assert.match(architecture, /focus-visible:ring-2/);
  assert.match(architecture, /<ProjectImageLightbox/);
  assert.match(architecture, /setLightboxOpen\(true\)/);
});

test("overview matches the calm surface and existing detail grids remain", () => {
  const overviewStart = projectPage.indexOf("{/* Overview + Tech */}");
  const overviewEnd = projectPage.indexOf("{/* Gallery + Highlights */}");
  const overview = projectPage.slice(overviewStart, overviewEnd);

  assert.match(overview, /xl:grid-cols-12/);
  assert.match(overview, /xl:col-span-5/);
  assert.match(overview, /xl:col-span-7/);
  assert.match(overview, /bg-card/);
  assert.match(overview, /<h2[^>]*>[\s\S]*Overview/);
  assert.doesNotMatch(overview, /radial-gradient|backdrop-blur|shadow/);
  assert.match(projectPage, /title="Challenges & learnings"/);
  assert.match(projectPage, /title="Future improvements"/);
  assert.match(projectPage, /className="grid gap-6 lg:grid-cols-2"/);
});
