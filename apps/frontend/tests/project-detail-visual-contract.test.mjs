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
const gallery = read(
  "apps/frontend/components/projects/detail/project-gallery.tsx",
);
const projectDetailSurface = read(
  "apps/frontend/components/projects/detail/project-detail-surface.tsx",
);
const projectDetailHeader = read(
  "apps/frontend/components/projects/detail/project-detail-section-header.tsx",
);
const readmeSection = read(
  "apps/frontend/components/projects/detail/case-study/project-readme-section.tsx",
);
const readmeRenderer = read(
  "apps/frontend/components/projects/detail/case-study/project-readme-renderer.tsx",
);
const expandableDetails = read(
  "apps/frontend/components/projects/detail/case-study/project-expandable-details.tsx",
);
const projectPage = read("apps/frontend/app/projects/[slug]/page.tsx");
const globalCss = read("apps/frontend/app/globals.css");
const projectDetailCss = globalCss.slice(
  globalCss.indexOf("Project detail surfaces"),
  globalCss.indexOf("@keyframes portfolio-loading-progress"),
);
const projectPageCanvasCss = globalCss.slice(
  globalCss.indexOf("Project detail page canvas"),
  globalCss.indexOf("Project case-study preview"),
);

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

test("technology inventory formats neutral semantic legend groups", () => {
  const legendLabel = techGroups.slice(
    techGroups.indexOf("<h3"),
    techGroups.indexOf("</h3>") + "</h3>".length,
  );
  const legendStyles = projectDetailCss.slice(
    projectDetailCss.indexOf(".project-detail-tech-legend {"),
    projectDetailCss.indexOf(".project-detail-tech-list"),
  );

  assert.doesNotMatch(techGroups, /TechTag|tech-badge-theme|--tech-brand/);
  assert.match(techGroups, /<ProjectDetailSurface/);
  assert.match(techGroups, /accent="violet"/);
  assert.match(techGroups, /<ProjectDetailSectionHeader/);
  assert.match(techGroups, /<h3/);
  assert.match(techGroups, /aria-labelledby/);
  assert.match(techGroups, /<ul/);
  assert.match(techGroups, /<li/);
  assert.match(techGroups, /title="Technology stack"/);
  assert.match(techGroups, /\{group\.label\}/);
  assert.match(techGroups, /project-technology-group-\$\{group\.key\}/);
  assert.doesNotMatch(techGroups, /formatTechnologyGroupLabel|technologyGroupLabelOverrides/);
  assert.doesNotMatch(legendLabel, /aria-hidden|rounded-full|size-\[5px\]/);
  assert.match(techGroups, /project-detail-tech-legend/);
  assert.match(techGroups, /mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2/);
  assert.match(projectDetailCss, /border: 1\.5px dashed/);
  assert.match(legendStyles, /padding: 14px/);
  assert.match(legendStyles, /position: static/);
  assert.match(legendStyles, /margin-bottom: 8px/);
  assert.match(legendStyles, /background: transparent/);
  assert.doesNotMatch(
    legendStyles,
    /position: absolute|top:|left:|backdrop-filter|box-shadow/,
  );
  assert.doesNotMatch(projectDetailCss, /--project-detail-legend-/);
  assert.doesNotMatch(
    techGroups,
    /TechTag|tech-badge-theme|--tech-brand|backdrop-blur|shadow|hover:/,
  );
});

test("technology items use decorative non-final dividers without bullets", () => {
  const technologyList = techGroups.slice(
    techGroups.indexOf('<ul className="project-detail-tech-list">'),
    techGroups.indexOf("</ul>") + "</ul>".length,
  );
  const technologyListCss = projectDetailCss.slice(
    projectDetailCss.indexOf(".project-detail-tech-list"),
    projectDetailCss.indexOf(".project-detail-list-check"),
  );

  assert.match(technologyList, /<li key=\{label\}/);
  assert.match(technologyList, /project-detail-tech-name/);
  assert.match(technologyList, /itemIndex < group\.items\.length - 1/);
  assert.match(technologyList, /aria-hidden="true"/);
  assert.match(technologyList, /project-detail-tech-separator/);
  assert.doesNotMatch(technologyList, /rounded-full|size-1\.5|bg-muted-foreground/);
  assert.doesNotMatch(technologyList, /<button|<a\s|onClick|hover:|TechTag/);
  assert.match(technologyListCss, /height: 15px/);
  assert.match(technologyListCss, /width: 1px/);
  assert.match(technologyListCss, /row-gap: 6px/);
  assert.match(technologyListCss, /margin-inline: 10px/);
  assert.match(technologyListCss, /background: var\(--border\)/);
  assert.doesNotMatch(
    technologyListCss,
    /backdrop-filter|box-shadow|filter:\s*blur/,
  );
});

test("detail facts share semantic editorial lists without item cards", () => {
  assert.match(projectList, /icon: LucideIcon/);
  assert.match(projectList, /marker\?: "dot" \| "check"/);
  assert.match(projectList, /accent\?: Exclude<ProjectDetailSurfaceAccent, "aurora">/);
  assert.match(projectList, /<ProjectDetailSurface/);
  assert.match(projectList, /<ProjectDetailSectionHeader/);
  assert.match(projectList, /<ul/);
  assert.match(projectList, /<li/);
  assert.match(projectList, /divide-y divide-border\/40/);
  assert.match(projectList, /py-2\.5/);
  assert.match(projectList, /text-sm leading-6 text-foreground/);
  assert.match(projectList, /aria-hidden="true"/);
  assert.doesNotMatch(
    projectList,
    /radial-gradient|backdrop-blur|shadow|rounded-\[1\.25rem\]|bg-background\/70/,
  );

  assert.match(highlights, /<ProjectListSection/);
  assert.match(highlights, /title="Key highlights"/);
  assert.match(highlights, /icon=\{Sparkles\}/);
  assert.match(highlights, /marker="check"/);
  assert.match(highlights, /accent="violet"/);
});

test("architecture points are semantic while image lightbox behavior remains", () => {
  const architectureText = architecture.slice(0, architecture.indexOf("<button"));

  assert.match(architectureText, /<section aria-labelledby="project-architecture-heading">/);
  assert.match(architectureText, /<ProjectDetailSectionHeader/);
  assert.match(architectureText, /icon=\{Network\}/);
  assert.match(architectureText, /accent="warm"/);
  assert.match(architecture, /accent="violet"/);
  assert.match(architecture, /intensity="primary"/);
  assert.match(architecture, /const hasText = Boolean/);
  assert.match(architecture, /hasText && image && "xl:grid-cols-12 xl:items-start"/);
  assert.match(architectureText, /<ul/);
  assert.match(architectureText, /<li/);
  assert.match(architectureText, /mt-4 flex flex-col gap-3/);
  assert.match(architectureText, /space-y-2\.5/);
  assert.match(architectureText, /text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7/);
  assert.doesNotMatch(
    architectureText,
    /radial-gradient|backdrop-blur|shadow|rounded-\[1\.25rem\]|bg-background\/70/,
  );
  assert.match(architecture, /aria-label="Preview architecture diagram"/);
  assert.match(architecture, /focus-visible:ring-2/);
  assert.match(architecture, /<ProjectImageLightbox/);
  assert.match(architecture, /setLightboxOpen\(true\)/);
});

test("bounded project detail surfaces use fallback-first translucent glass", () => {
  const fallbackIndex = projectDetailCss.indexOf(
    "--project-detail-fallback-alpha: 0.94",
  );
  const supportsIndex = projectDetailCss.indexOf("@supports (");

  assert.match(
    projectDetailSurface,
    /projectDetailSurfaceAccents = \[\s*"aurora",\s*"cool",\s*"violet",\s*"warm",\s*"neutral",\s*\] as const/s,
  );
  assert.match(
    projectDetailSurface,
    /projectDetailSurfaceIntensities = \[\s*"primary",\s*"secondary",\s*"subtle",\s*\] as const/s,
  );
  assert.match(projectDetailSurface, /as\?: "section" \| "div"/);
  assert.match(projectDetailSurface, /HTMLAttributes<HTMLElement>/);
  assert.doesNotMatch(projectDetailSurface, /accent\?: string|intensity\?: string/);
  assert.doesNotMatch(
    projectDetailSurface,
    /motion|framer|animate|animation|overflow-hidden/,
  );

  assert.match(projectDetailCss, /border: 1px solid transparent/);
  assert.match(projectDetailCss, /padding-box/);
  assert.match(projectDetailCss, /border-box/);
  assert.match(projectDetailCss, /box-shadow:/);
  assert.match(projectDetailCss, /\.dark \.project-detail-surface/);
  assert.ok(fallbackIndex >= 0);
  assert.ok(supportsIndex > fallbackIndex);
  assert.match(
    projectDetailCss,
    /--project-detail-surface-fill: rgba\([\s\S]*?--project-detail-fallback-alpha/,
  );
  assert.match(projectDetailCss, /--project-detail-glass-alpha: 0\.8/);
  assert.match(projectDetailCss, /--project-detail-glass-alpha: 0\.74/);
  assert.match(projectDetailCss, /--project-detail-glass-alpha: 0\.58/);
  assert.match(projectDetailCss, /--project-detail-glass-alpha: 0\.52/);
  assert.match(
    projectDetailCss,
    /@supports \(\s*\(backdrop-filter: blur\(1px\)\) or\s*\(-webkit-backdrop-filter: blur\(1px\)\)/s,
  );
  assert.match(
    projectDetailCss,
    /-webkit-backdrop-filter: blur\(var\(--project-detail-backdrop-blur\)\)/,
  );
  assert.match(
    projectDetailCss,
    /(?<!-webkit-)backdrop-filter: blur\(var\(--project-detail-backdrop-blur\)\)/,
  );
  assert.match(projectDetailCss, /--project-detail-backdrop-blur: 16px/);
  assert.match(projectDetailCss, /--project-detail-backdrop-blur: 18px/);
  assert.doesNotMatch(
    projectDetailCss,
    /@keyframes|animation:|(?<!backdrop-)filter:\s*blur|mask-composite|-webkit-mask|hover:/,
  );
});

test("project detail headers stay semantic, bounded, and static", () => {
  assert.match(projectDetailHeader, /icon: LucideIcon/);
  assert.match(projectDetailHeader, /<h2 id=\{id\}/);
  assert.match(projectDetailHeader, /aria-hidden="true"/);
  assert.match(projectDetailCss, /width: 36px/);
  assert.match(projectDetailCss, /height: 36px/);
  assert.match(projectDetailCss, /font-size: 18px/);
  assert.match(projectDetailCss, /font-size: 20px/);
  assert.match(projectDetailCss, /width: 44px/);
  assert.match(projectDetailCss, /pointer-events: none/);
  assert.doesNotMatch(projectDetailHeader, /motion|animate|onClick|button/);
});

test("overview uses the restrained surface and existing detail grids remain", () => {
  const overviewStart = projectPage.indexOf("{/* Overview + Tech */}");
  const overviewEnd = projectPage.indexOf("{/* Gallery + Highlights */}");
  const overview = projectPage.slice(overviewStart, overviewEnd);

  assert.match(overview, /xl:grid-cols-12/);
  assert.match(overview, /xl:col-span-5/);
  assert.match(overview, /xl:col-span-7/);
  assert.match(overview, /<ProjectDetailSurface/);
  assert.match(overview, /accent="warm"/);
  assert.match(overview, /title="Overview"/);
  assert.match(overview, /icon=\{FileText\}/);
  assert.match(overview, /mt-4 space-y-3/);
  assert.match(overview, /text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7/);
  assert.doesNotMatch(overview, /TechTag|backdrop-blur|shadow/);
  assert.match(
    projectPage,
    /mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7/,
  );
  assert.match(projectPage, /\{project\.shortDescription\}/);
  assert.doesNotMatch(projectPage, /longDescription/);
  assert.match(projectPage, /title="Challenges & learnings"/);
  assert.match(projectPage, /title="Future improvements"/);
  assert.match(projectPage, /icon=\{Mountain\}/);
  assert.match(projectPage, /icon=\{TrendingUp\}/);
  assert.match(projectPage, /accent="cool"/);
  assert.match(projectPage, /accent="violet"/);
  assert.match(projectPage, /className="grid gap-6 lg:grid-cols-2"/);
});

test("one bounded blue-violet-cyan canvas spans the project detail page", () => {
  assert.match(
    projectPage,
    /<main className="project-detail-page pb-20 sm:pb-24 lg:pb-28">/,
  );
  assert.equal((projectPage.match(/project-detail-page/g) ?? []).length, 1);
  assert.doesNotMatch(projectPage, /bg-\[radial-gradient/);
  assert.doesNotMatch(
    projectPage,
    /pointer-events-none absolute inset-0 z-0[\s\S]*radial-gradient/,
  );

  assert.match(projectPageCanvasCss, /--project-page-background: var\(--background\)/);
  assert.match(projectPageCanvasCss, /--project-brand-primary-rgb: 59, 130, 246/);
  assert.match(projectPageCanvasCss, /--project-brand-secondary-rgb: 139, 92, 246/);
  assert.match(projectPageCanvasCss, /--project-brand-tertiary-rgb: 34, 211, 238/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-primary: 0\.1/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-secondary: 0\.11/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-tertiary: 0\.06/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-lower: 0\.02/);
  assert.match(projectPageCanvasCss, /\.dark \.project-detail-page/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-primary: 0\.15/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-secondary: 0\.16/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-tertiary: 0\.08/);
  assert.match(projectPageCanvasCss, /--project-page-ambient-lower: 0\.04/);
  assert.doesNotMatch(
    projectPageCanvasCss,
    /245,\s*158,\s*11|amber|position:\s*(?:absolute|fixed)|background-attachment:\s*fixed|(?<!backdrop-)filter:|@keyframes|animation:/i,
  );
});

test("gallery controls and lightbox remain inside the shared surface", () => {
  assert.match(gallery, /<ProjectDetailSurface/);
  assert.match(gallery, /accent="cool"/);
  assert.match(gallery, /title="Gallery"/);
  assert.match(gallery, /icon=\{Images\}/);
  assert.match(gallery, /<AnimatePresence mode="wait">/);
  assert.match(gallery, /aria-label="Previous screenshot"/);
  assert.match(gallery, /aria-label="Next screenshot"/);
  assert.match(gallery, /aria-pressed=\{activeIndex === index\}/);
  assert.match(gallery, /<ProjectImageLightbox/);
  assert.match(gallery, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(
    gallery.slice(gallery.indexOf("<ProjectDetailSurface"), gallery.indexOf("<ProjectImageLightbox")),
    /backdrop-blur-xl|shadow-sm|radial-gradient/,
  );
});

test("README rendering and expansion controls remain editorial and functional", () => {
  assert.match(readmeSection, /<ProjectDetailSurface/);
  assert.match(readmeSection, /accent="neutral"/);
  assert.match(readmeSection, /intensity="subtle"/);
  assert.match(readmeSection, /<h2/);
  assert.match(readmeSection, /<ProjectExpandableDetails>/);
  assert.match(readmeSection, /<ProjectReadmeRenderer source=\{caseStudyMdx\}/);
  assert.match(readmeRenderer, /rehypeSanitize/);
  assert.match(readmeRenderer, /<ProjectCodeBlock/);
  assert.match(expandableDetails, /Show full details/);
  assert.match(expandableDetails, /Show less/);
  assert.doesNotMatch(expandableDetails, /createPortal|document\.body/);
  assert.match(expandableDetails, /pointer-events-none sticky/);
  assert.match(expandableDetails, /col-start-1 row-start-1/);
  assert.equal((expandableDetails.match(/Show less/g) ?? []).length, 1);
  assert.match(expandableDetails, /focus\(\{ preventScroll: true \}\)/);
  assert.match(expandableDetails, /env\(safe-area-inset-bottom\)/);
  assert.match(expandableDetails, /min-h-11/);
});

test("project detail visual refinements add no animation dependency", () => {
  assert.doesNotMatch(projectDetailSurface, /motion|framer-motion/);
  assert.doesNotMatch(projectDetailHeader, /motion|framer-motion/);
  assert.doesNotMatch(projectDetailCss, /@keyframes|animation:/);
  assert.doesNotMatch(projectPageCanvasCss, /@keyframes|animation:/);
});
