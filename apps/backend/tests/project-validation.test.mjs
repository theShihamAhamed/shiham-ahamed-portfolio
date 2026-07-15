import assert from "node:assert/strict";
import test from "node:test";

import validation from "../dist/modules/projects/project.validation.js";
import timeline from "../dist/modules/projects/project.timeline.js";

const baseProject = {
  title: "Project",
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
};

test("backend create validation rejects arbitrary types, invalid dates, and year", () => {
  assert.equal(validation.createProjectSchema.safeParse(baseProject).success, true);
  assert.equal(
    validation.createProjectSchema.safeParse({
      ...baseProject,
      projectType: "custom-project",
    }).success,
    false,
  );
  assert.equal(
    validation.createProjectSchema.safeParse({
      ...baseProject,
      endDate: "2023-12",
    }).success,
    false,
  );
  assert.equal(
    validation.createProjectSchema.safeParse({
      ...baseProject,
      year: "2024",
    }).success,
    false,
  );
});

test("backend update validation is strict and preserves explicit end-date clearing", () => {
  assert.equal(validation.updateProjectSchema.safeParse({ year: "2024" }).success, false);
  assert.equal(
    validation.updateProjectSchema.safeParse({
      projectType: "custom-project",
    }).success,
    false,
  );

  const update = validation.updateProjectSchema.parse({
    status: "in-progress",
    endDate: "",
  });

  assert.equal(Object.hasOwn(update, "endDate"), true);
  assert.equal(update.endDate, undefined);
  assert.equal(
    validation.updateProjectSchema.parse({ caseStudyMdx: "" }).caseStudyMdx,
    undefined,
  );
  assert.equal(
    validation.updateProjectSchema.safeParse({ caseStudyMdx: "<script>alert(1)</script>" }).success,
    false,
  );
});

test("backend merged timeline guard protects partial updates", () => {
  assert.doesNotThrow(() =>
    timeline.assertValidProjectTimeline({
      status: "in-progress",
      startDate: "2024-01",
    }),
  );
  assert.doesNotThrow(() =>
    timeline.assertValidProjectTimeline({
      status: "planned",
      startDate: "2024-01",
      endDate: "2024-01",
    }),
  );
  assert.throws(
    () =>
      timeline.assertValidProjectTimeline({
        status: "completed",
        startDate: "2024-01",
      }),
    (error) => error.code === "VALIDATION_ERROR" && error.statusCode === 422,
  );
  assert.throws(
    () =>
      timeline.assertValidProjectTimeline({
        status: "in-progress",
        startDate: "2024-06",
        endDate: "2024-05",
      }),
    (error) =>
      error.code === "VALIDATION_ERROR" &&
      error.details.some((issue) =>
        issue.message.includes("earlier than start date"),
      ),
  );
});

test("backend project-type query filter accepts only canonical slugs", () => {
  assert.equal(
    validation.adminProjectQuerySchema.safeParse({
      projectType: "backend-api-service",
    }).success,
    true,
  );
  assert.equal(
    validation.adminProjectQuerySchema.safeParse({
      projectType: "Backend API",
    }).success,
    false,
  );
});
