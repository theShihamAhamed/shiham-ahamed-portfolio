import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const importedStateModule = await import(
  "../components/projects/listing/project-catalog-state.ts"
);
const stateApi = importedStateModule.default ?? importedStateModule;
const {
  PROJECT_CATALOG_DEFAULT_STATE,
  filterAndSortProjects,
  getActiveProjectFilterCount,
  getProjectCatalogOptions,
  getProjectCatalogSummaries,
  parseProjectCatalogState,
  removeProjectCatalogSummary,
  resetProjectCatalogState,
  resetProjectFiltersAndSort,
  serializeProjectCatalogState,
} = stateApi;

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(testDirectory, "..");
const read = (relativePath) =>
  fs.readFileSync(path.resolve(frontendRoot, relativePath), "utf8");

const projects = [
  {
    id: "cloud-console",
    title: "Cloud Console",
    shortDescription: "A deployment control plane",
    projectType: "devops-cloud-project",
    status: "in-progress",
    techStack: [{ label: "TypeScript" }, { label: "React" }],
    featured: true,
    sortOrder: 2,
    startDate: "2025-08",
  },
  {
    id: "api-studio",
    title: "API Studio",
    shortDescription: "Reliable services and authentication",
    projectType: "backend-api-service",
    status: "completed",
    techStack: [{ label: "Node.js" }, { label: "MongoDB" }],
    featured: false,
    sortOrder: 1,
    startDate: "2024-03",
  },
  {
    id: "canvas-lab",
    title: "Canvas Lab",
    shortDescription: "An interface prototyping workspace",
    projectType: "frontend-ui-experience",
    status: "planned",
    techStack: [{ label: "React" }],
    featured: true,
    sortOrder: 1,
    startDate: "2026-01",
  },
];

const options = getProjectCatalogOptions(projects);
const state = (overrides = {}) => ({
  ...PROJECT_CATALOG_DEFAULT_STATE,
  ...overrides,
});
const ids = (items) => items.map((project) => project.id);

test("catalog defaults and options preserve the existing project semantics", () => {
  assert.deepEqual(PROJECT_CATALOG_DEFAULT_STATE, {
    q: "",
    type: "all",
    tech: "All",
    status: "all",
    sort: "featured",
  });
  assert.deepEqual(
    options.projectTypes.map((projectType) => projectType.value),
    [
      "backend-api-service",
      "frontend-ui-experience",
      "devops-cloud-project",
    ],
  );
  assert.deepEqual(options.techOptions, [
    "All",
    "TypeScript",
    "React",
    "Node.js",
    "MongoDB",
  ]);
});

test("search matches title, description, project type label, and technology", () => {
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ q: "canvas" }))),
    ["canvas-lab"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ q: "authentication" }))),
    ["api-studio"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ q: "DevOps" }))),
    ["cloud-console"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ q: "mongodb" }))),
    ["api-studio"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ q: "  REACT  " }))),
    ["canvas-lab", "cloud-console"],
  );
});

test("type, technology, status, combined filters, and zero results work", () => {
  assert.deepEqual(
    ids(
      filterAndSortProjects(
        projects,
        state({ type: "backend-api-service" }),
      ),
    ),
    ["api-studio"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ tech: "React" }))),
    ["canvas-lab", "cloud-console"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ status: "planned" }))),
    ["canvas-lab"],
  );
  assert.deepEqual(
    ids(
      filterAndSortProjects(
        projects,
        state({ tech: "React", status: "in-progress" }),
      ),
    ),
    ["cloud-console"],
  );
  assert.deepEqual(
    filterAndSortProjects(
      projects,
      state({ tech: "MongoDB", status: "planned" }),
    ),
    [],
  );
});

test("featured, newest, oldest, and title sorting remain deterministic", () => {
  assert.deepEqual(ids(filterAndSortProjects(projects, state())), [
    "canvas-lab",
    "cloud-console",
    "api-studio",
  ]);
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ sort: "newest" }))),
    ["canvas-lab", "cloud-console", "api-studio"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ sort: "oldest" }))),
    ["api-studio", "cloud-console", "canvas-lab"],
  );
  assert.deepEqual(
    ids(filterAndSortProjects(projects, state({ sort: "title" }))),
    ["api-studio", "canvas-lab", "cloud-console"],
  );
});

test("URL parsing accepts valid available state and ignores malformed values", () => {
  assert.deepEqual(
    parseProjectCatalogState(
      {
        q: "api",
        type: "backend-api-service",
        tech: "Node.js",
        status: "completed",
        sort: "newest",
      },
      options,
    ),
    state({
      q: "api",
      type: "backend-api-service",
      tech: "Node.js",
      status: "completed",
      sort: "newest",
    }),
  );

  assert.deepEqual(
    parseProjectCatalogState(
      new URLSearchParams({
        q: "kept",
        type: "not-a-type",
        tech: "Unavailable",
        status: "archived",
        sort: "popular",
      }),
      options,
    ),
    state({ q: "kept" }),
  );

  assert.equal(
    parseProjectCatalogState(
      { type: "full-stack-web-app" },
      options,
    ).type,
    "all",
    "valid but unavailable values are ignored",
  );
});

test("serialization omits defaults and round trips encoded values", () => {
  assert.equal(serializeProjectCatalogState(state()).toString(), "");
  assert.equal(
    serializeProjectCatalogState(
      state({
        q: "React API",
        type: "backend-api-service",
        tech: "Node.js",
        status: "completed",
        sort: "oldest",
      }),
    ).toString(),
    "q=React+API&type=backend-api-service&tech=Node.js&status=completed&sort=oldest",
  );

  const expected = state({
    q: "React API",
    type: "backend-api-service",
    tech: "Node.js",
    status: "completed",
    sort: "oldest",
  });
  assert.deepEqual(
    parseProjectCatalogState(serializeProjectCatalogState(expected), options),
    expected,
  );
});

test("filter badge excludes search and sort while summaries retain sort", () => {
  const active = state({
    q: "api",
    tech: "React",
    sort: "newest",
  });

  assert.equal(getActiveProjectFilterCount(active), 1);
  assert.equal(
    getActiveProjectFilterCount(state({ q: "api", sort: "newest" })),
    0,
  );
  assert.deepEqual(
    getProjectCatalogSummaries(active).map((summary) => summary.label),
    ["Technology: React", "Sort: Newest"],
  );
});

test("chip removal and reset actions have narrow, explicit effects", () => {
  const active = state({
    q: "api",
    type: "backend-api-service",
    tech: "Node.js",
    status: "completed",
    sort: "newest",
  });

  assert.deepEqual(removeProjectCatalogSummary(active, "tech"), {
    ...active,
    tech: "All",
  });
  assert.deepEqual(removeProjectCatalogSummary(active, "sort"), {
    ...active,
    sort: "featured",
  });
  assert.deepEqual(resetProjectFiltersAndSort(active), state({ q: "api" }));
  assert.deepEqual(resetProjectCatalogState(), state());
});

test("toolbar source keeps search-first disclosure and Sheet accessibility", () => {
  const toolbar = read(
    "components/projects/listing/project-catalog-toolbar.tsx",
  );

  assert.match(toolbar, /type="search"/);
  assert.match(toolbar, /htmlFor="project-search"[\s\S]*Search projects/);
  assert.match(toolbar, /<SheetTrigger asChild>/);
  assert.match(toolbar, /<SheetTitle>Filters<\/SheetTitle>/);
  assert.match(toolbar, /<SheetDescription>/);
  assert.match(toolbar, /Changes apply[\s\S]*immediately/);
  assert.match(toolbar, /aria-expanded=\{desktopOpen\}/);
  assert.match(toolbar, /aria-controls=\{DESKTOP_PANEL_ID\}/);
  assert.match(toolbar, /id=\{DESKTOP_PANEL_ID\}/);
  assert.match(toolbar, /desktopOpen \? \([\s\S]*<motion\.div/);
  assert.match(toolbar, /View \{resultCount\} project/);
  assert.match(toolbar, /Reset filters &amp; sort/);
  assert.match(toolbar, /<SheetFooter className="shrink-0/);
  assert.equal((toolbar.match(/h-11 w-full rounded-xl sm:flex-1/g) ?? []).length, 2);
  assert.match(toolbar, /aria-live="polite"/);
  assert.match(toolbar, /aria-atomic="true"/);
  assert.match(toolbar, /min-h-11/);
  assert.match(toolbar, /h-11/g);
  assert.match(toolbar, /duration: shouldReduceMotion \? 0 : 0\.18/);
  assert.match(toolbar, /duration: shouldReduceMotion \? 0 : 0\.14/);
  assert.match(toolbar, /motion-reduce:/);
  assert.match(toolbar, /window\.matchMedia\("\(min-width: 1024px\)"\)/);
  assert.match(toolbar, /event\.key !== "Escape"/);
  assert.doesNotMatch(toolbar, /role="menu"|role="menuitem"/);

  const mobileTrigger = toolbar.match(
    /<SheetTrigger asChild>([\s\S]*?)<\/SheetTrigger>/,
  )?.[1];
  assert.ok(mobileTrigger);
  assert.doesNotMatch(mobileTrigger, /aria-expanded|aria-controls/);

  for (const label of ["Project type", "Technology", "Status", "Sort"]) {
    assert.match(toolbar, new RegExp(`label=\\"${label}\\"`));
  }
});

test("catalog uses one state utility and URL history without duplicating filters", () => {
  const catalog = read("components/projects/listing/project-catalog.tsx");
  const serverPage = read("app/projects/page.tsx");

  assert.match(catalog, /filterAndSortProjects\(projects, catalogState\)/);
  assert.doesNotMatch(catalog, /projects\.filter\(|\.sort\(\(first, second\)/);
  assert.match(catalog, /SEARCH_URL_DEBOUNCE_MS = 250/);
  assert.match(catalog, /writeCatalogUrl\(nextState, "replace"\)/);
  assert.match(catalog, /writeCatalogUrl\(nextState, "push"\)/);
  assert.match(catalog, /const historyMethod = mode === "push" \? "pushState" : "replaceState"/);
  assert.match(catalog, /window\.history\[historyMethod\]\(null, "", href\)/);
  assert.doesNotMatch(catalog, /useRouter|router\.(?:push|replace)/);
  assert.match(catalog, /cancelPendingSearchWrite\(\)/);
  assert.match(catalog, /window\.addEventListener\("popstate", handlePopState\)/);
  assert.match(catalog, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(catalog, />\s*Reset all\s*</);

  assert.match(serverPage, /searchParams: Promise<ProjectCatalogSearchParams>/);
  assert.match(serverPage, /parseProjectCatalogState\(/);
  assert.match(serverPage, /initialState=\{initialState\}/);
});
