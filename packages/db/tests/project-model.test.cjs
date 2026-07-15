const assert = require("node:assert/strict");
const test = require("node:test");

const db = require("../dist");

const makeProject = (overrides = {}) =>
  new db.ProjectModel({
    title: "Project",
    slug: `project-${Math.random().toString(16).slice(2)}`,
    shortDescription: "Short description",
    description: "Description",
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
    displayOrder: 1,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-06-01T00:00:00.000Z"),
    ...overrides,
  });

test("project model registration is reused", () => {
  assert.equal(db.ProjectModel.modelName, "Project");
  assert.equal(db.ProjectModel.collection.collectionName, "projects");
  assert.equal(db.mongoose.models.Project, db.ProjectModel);
});

test("project model accepts canonical completed and ongoing timelines", async () => {
  await makeProject().validate();
  await makeProject({ status: "in-progress", endDate: undefined }).validate();
  await makeProject({ status: "planned", endDate: undefined }).validate();
  await makeProject({ startDate: "2024-06", endDate: "2024-06" }).validate();
});

test("project model rejects unknown types and invalid timeline data", async () => {
  await assert.rejects(makeProject({ projectType: "custom-project" }).validate(), /not a valid enum value/);
  await assert.rejects(makeProject({ startDate: "2024-1" }).validate(), /YYYY-MM/);
  await assert.rejects(makeProject({ endDate: "2023-12" }).validate(), /earlier than start date/);
  await assert.rejects(makeProject({ endDate: undefined }).validate(), /required for completed/);
});

test("empty end dates are unset and serializers never depend on stored year", async () => {
  const project = makeProject({
    status: "in-progress",
    endDate: "",
    year: "legacy-value",
  });

  await project.validate();

  const stored = project.toObject();
  assert.equal(stored.endDate, undefined);
  assert.equal(Object.hasOwn(stored, "year"), false);

  const admin = db.serializeAdminProject(project);
  const publicProject = db.serializePublicProject(project);

  assert.equal(admin.startDate, "2024-01");
  assert.equal(publicProject.startDate, "2024-01");
  assert.equal(Object.hasOwn(admin, "year"), false);
  assert.equal(Object.hasOwn(publicProject, "year"), false);
});

test("stored case study content is optional, bounded, and serialized", async () => {
  const project = makeProject({ caseStudyMdx: "## Stored case study\n\n- Safe content" });
  await project.validate();

  const admin = db.serializeAdminProject(project);
  const publicProject = db.serializePublicProject(project);

  assert.equal(admin.caseStudyMdx, "## Stored case study\n\n- Safe content");
  assert.equal(publicProject.caseStudyMdx, admin.caseStudyMdx);

  const empty = makeProject({ status: "in-progress", endDate: undefined, caseStudyMdx: "   " });
  await empty.validate();
  assert.equal(empty.toObject().caseStudyMdx, undefined);

  await assert.rejects(
    makeProject({ caseStudyMdx: "x".repeat(100_001) }).validate(),
    /at most 100000 UTF-8 bytes/,
  );
});
