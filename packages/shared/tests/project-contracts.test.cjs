const assert = require("node:assert/strict");
const test = require("node:test");

const shared = require("../dist");

const baseProject = {
  title: "Project",
  shortDescription: "Short description",
  projectType: "full-stack-web-app",
  status: "completed",
  startDate: "2024-01",
  endDate: "2024-06",
  thumbnail: {
    url: "https://example.com/thumbnail.jpg",
    fileId: "project-thumbnail",
    alt: "Project thumbnail",
  },
  gallery: [
    {
      url: "https://example.com/gallery.jpg",
      fileId: "project-gallery",
      alt: "Project gallery",
    },
  ],
  techStack: [{ kind: "known", slug: "typescript", showOnCard: false }],
  overview: ["Overview"],
  highlights: ["Highlight"],
};

test("canonical project types and labels resolve from one registry", () => {
  const expected = [
    ["full-stack-web-app", "Full-stack Web App"],
    ["backend-api-service", "Backend API Service"],
    ["frontend-ui-experience", "Frontend UI Experience"],
    ["ecommerce-platform", "E-commerce Platform"],
    ["marketplace-booking-platform", "Marketplace / Booking Platform"],
    ["microservices-system", "Microservices System"],
    ["devops-cloud-project", "DevOps / Cloud Project"],
    ["ai-ml-prototype", "AI / ML Prototype"],
    ["academic-coursework-project", "Academic Coursework Project"],
    ["developer-tool", "Developer Tool"],
  ];

  assert.deepEqual(
    shared.PROJECT_TYPES.map(({ value, label }) => [value, label]),
    expected,
  );

  for (const [value, label] of expected) {
    assert.equal(shared.isProjectType(value), true);
    assert.equal(shared.projectTypeSchema.safeParse(value).success, true);
    assert.equal(shared.getProjectTypeLabel(value), label);
  }

  assert.equal(shared.isProjectType("custom-project"), false);
  assert.equal(shared.projectTypeSchema.safeParse("custom-project").success, false);
});

test("existing project statuses retain canonical values and labels", () => {
  assert.deepEqual(shared.projectStatuses, [
    "completed",
    "in-progress",
    "planned",
  ]);
  assert.deepEqual(
    shared.PROJECT_STATUSES.map(({ value, label }) => [value, label]),
    [
      ["completed", "Completed"],
      ["in-progress", "In Progress"],
      ["planned", "Planned"],
    ],
  );
});

test("project month validation accepts only real zero-padded months", () => {
  for (const value of ["2024-01", "2025-12"]) {
    assert.equal(shared.isProjectMonth(value), true);
    assert.equal(shared.projectMonthSchema.safeParse(value).success, true);
  }

  for (const value of ["2024", "2024-1", "2024-00", "2024-13", "January 2024"]) {
    assert.equal(shared.isProjectMonth(value), false);
    assert.equal(shared.projectMonthSchema.safeParse(value).success, false);
  }
});

test("month comparison, formatting, and year derivation avoid Date parsing", () => {
  assert.equal(shared.compareProjectMonths("2024-01", "2024-02") < 0, true);
  assert.equal(shared.compareProjectMonths("2024-06", "2024-06"), 0);
  assert.equal(shared.compareProjectMonths("2025-01", "2024-12") > 0, true);
  assert.equal(shared.getProjectStartYear("2025-08"), 2025);
  assert.equal(shared.formatProjectMonth("2025-08"), "Aug 2025");
  assert.equal(shared.formatProjectDateRange("2025-08", "2026-01"), "Aug 2025 – Jan 2026");
  assert.equal(shared.formatProjectDateRange("2025-08", undefined, true), "Aug 2025 – Present");
  assert.equal(shared.formatProjectYearRange("2024-01", "2025-12"), "2024–2025");
});

test("project API schema enforces date order and status rules", () => {
  assert.equal(shared.createProjectSchema.safeParse(baseProject).success, true);
  assert.equal(
    shared.createProjectSchema.safeParse({ ...baseProject, endDate: "2024-01" }).success,
    true,
  );
  assert.equal(
    shared.createProjectSchema.safeParse({ ...baseProject, endDate: "2023-12" }).success,
    false,
  );
  assert.equal(
    shared.createProjectSchema.safeParse({ ...baseProject, endDate: undefined }).success,
    false,
  );
  assert.equal(
    shared.createProjectSchema.safeParse({
      ...baseProject,
      status: "in-progress",
      endDate: undefined,
    }).success,
    true,
  );
  assert.equal(
    shared.createProjectSchema.safeParse({
      ...baseProject,
      status: "in-progress",
      endDate: "2024-08",
    }).success,
    true,
  );
  assert.equal(
    shared.createProjectSchema.safeParse({
      ...baseProject,
      status: "planned",
      endDate: undefined,
    }).success,
    true,
  );
});

test("strict API schemas reject legacy year and normalize clearable end dates", () => {
  assert.equal(
    shared.createProjectSchema.safeParse({ ...baseProject, year: "2024" }).success,
    false,
  );
  assert.equal(shared.updateProjectSchema.safeParse({ year: "2024" }).success, false);

  const cleared = shared.updateProjectSchema.parse({
    status: "in-progress",
    endDate: "",
  });

  assert.equal(Object.hasOwn(cleared, "endDate"), true);
  assert.equal(cleared.endDate, undefined);
});

test("project contracts reject the removed description property", () => {
  assert.equal(
    shared.createProjectSchema.safeParse({
      ...baseProject,
      description: "Removed detail introduction",
    }).success,
    false,
  );
  assert.equal(
    shared.updateProjectSchema.safeParse({
      description: "Removed detail introduction",
    }).success,
    false,
  );
});

test("centralized project content limits accept boundaries and reject overflow", () => {
  const limits = shared.PROJECT_CONTENT_LIMITS;

  assert.equal(limits.shortDescription.maxCharacters, 220);
  assert.equal(limits.overview.maxItems, 3);
  assert.equal(limits.overview.maxCharactersPerItem, 650);
  assert.equal(limits.highlights.maxItems, 7);
  assert.equal(limits.highlights.maxCharactersPerItem, 220);
  assert.equal(limits.architectureSummary.maxCharacters, 450);
  assert.equal(limits.architecturePoints.maxItems, 5);
  assert.equal(limits.architecturePoints.maxCharactersPerItem, 180);

  assert.equal(
    shared.createProjectSchema.safeParse({
      ...baseProject,
      shortDescription: "s".repeat(220),
      overview: Array.from({ length: 3 }, () => "o".repeat(650)),
      highlights: Array.from({ length: 7 }, () => "h".repeat(220)),
      architecture: {
        summary: "a".repeat(450),
        points: Array.from({ length: 5 }, () => "p".repeat(180)),
      },
    }).success,
    true,
  );

  const invalidCases = [
    { shortDescription: "s".repeat(221) },
    { overview: Array.from({ length: 4 }, () => "Overview") },
    { overview: ["o".repeat(651)] },
    { highlights: Array.from({ length: 8 }, () => "Highlight") },
    { highlights: ["h".repeat(221)] },
    { architecture: { summary: "a".repeat(451), points: [] } },
    { architecture: { points: Array.from({ length: 6 }, () => "Point") } },
    { architecture: { points: ["p".repeat(181)] } },
  ];

  for (const overrides of invalidCases) {
    assert.equal(
      shared.createProjectSchema.safeParse({ ...baseProject, ...overrides }).success,
      false,
    );
  }
});

test("media schemas reject obsolete seed identifiers and accept real file ids", () => {
  assert.equal(
    shared.apiImageAssetSchema.safeParse({
      url: "https://cdn.example.com/project.jpg",
      fileId: "seed:projects:demo",
      alt: "Project image",
    }).success,
    false,
  );
  assert.equal(
    shared.apiImageAssetSchema.safeParse({
      url: "https://cdn.example.com/project.jpg",
      fileId: "imagekit-project-123",
      alt: "Project image",
    }).success,
    true,
  );
});

test("admin form schemas attach timeline errors to the relevant controls", () => {
  const createForm = {
    ...baseProject,
    slug: "project",
    architecture: { points: [] },
    links: {},
    challenges: [],
    futureImprovements: [],
    isFeatured: false,
    isVisible: true,
  };

  const ongoing = shared.createProjectFormSchema.parse({
    ...createForm,
    status: "in-progress",
    endDate: "",
  });
  assert.equal(ongoing.endDate, undefined);

  const missingCompletedEnd = shared.createProjectFormSchema.safeParse({
    ...createForm,
    endDate: "",
  });
  assert.equal(missingCompletedEnd.success, false);
  assert.equal(
    missingCompletedEnd.error.issues.some(
      (issue) => issue.path.join(".") === "endDate",
    ),
    true,
  );

  const reversed = shared.createProjectFormSchema.safeParse({
    ...createForm,
    endDate: "2023-12",
  });
  assert.equal(reversed.success, false);
  assert.equal(
    reversed.error.issues.some((issue) =>
      issue.message.includes("earlier than start date"),
    ),
    true,
  );
});
