import assert from "node:assert/strict";
import test from "node:test";

import {
  IMAGE_UPLOAD_MAX_FILES,
  IMAGE_UPLOAD_MAX_SIZE_BYTES,
  removeItemAt,
  replaceItemAt,
  validateImageFile,
  validateImageFiles,
} from "../lib/image-upload.ts";
import {
  areEmptyTechGroupsValid,
  createEmptyTechGroup,
  createEmptyTechItem,
  createProjectDefaultValues,
  removeTechItemsAtIndexes,
  toCreateProjectInput,
  toProjectFormValues,
  toUpdateProjectInput,
} from "../components/admin/projects/project-form.utils.ts";

const uploadedImage = {
  url: "https://example.com/project.webp",
  fileId: "project-image",
  alt: "Project preview",
  name: "project.webp",
};

const formValues = {
  title: "Project",
  slug: "project",
  shortDescription: "Short project description",
  description: "Detailed project introduction",
  projectType: "developer-tool",
  status: "in-progress",
  startDate: "2026-01",
  endDate: undefined,
  videoUrl: undefined,
  videoPosterUrl: undefined,
  thumbnail: uploadedImage,
  gallery: [uploadedImage],
  architecture: { image: undefined, summary: undefined, points: [] },
  links: { github: undefined, liveDemo: undefined, article: undefined },
  techStack: [createEmptyTechItem("Frontend")],
  overview: ["Overview"],
  highlights: ["Highlight"],
  challenges: [],
  futureImprovements: [],
  isFeatured: false,
  isVisible: true,
};

test("dynamic technology factories contain no fake persisted values", () => {
  assert.deepEqual(createEmptyTechGroup("group-1"), {
    id: "group-1",
    name: "",
  });
  assert.deepEqual(createEmptyTechItem(), {
    kind: "custom",
    slug: "",
    label: "",
    category: "other",
    color: "#64748B",
    showOnCard: false,
  });
});

test("empty groups are invalid and group removal updates technology data", () => {
  assert.equal(areEmptyTechGroupsValid([createEmptyTechGroup("group-1")]), false);
  assert.equal(
    areEmptyTechGroupsValid([{ id: "group-1", name: "Frontend" }]),
    true,
  );

  const items = [
    { kind: "known", slug: "react", showOnCard: true },
    { kind: "custom", slug: "internal-node-tool", label: "Internal Node Tool", category: "backend", color: "#64748B", showOnCard: false },
    { kind: "known", slug: "css", showOnCard: false },
  ];
  assert.deepEqual(removeTechItemsAtIndexes(items, [0, 2]), [items[1]]);
});

test("create defaults contain no placeholder values or project year", () => {
  const defaults = createProjectDefaultValues();

  assert.deepEqual(defaults.techStack, []);
  assert.equal(defaults.startDate, "");
  assert.equal(defaults.endDate, "");
  assert.equal("year" in defaults, false);
  assert.equal(JSON.stringify(defaults).includes("New group"), false);
});

test("create adapter preserves the canonical slug and omits empty optional values", () => {
  const input = toCreateProjectInput({
    ...formValues,
    techStack: [{ kind: "known", slug: "react", showOnCard: false }],
  });

  assert.equal(input.projectType, "developer-tool");
  assert.equal(input.endDate, undefined);
  assert.equal("year" in input, false);
  assert.deepEqual(input.techStack, [
    { kind: "known", slug: "react", showOnCard: false },
  ]);
});

test("edit hydration and update adapter preserve values and explicit end clearing", () => {
  const project = {
    ...formValues,
    id: "project-id",
    slug: "project",
    endDate: undefined,
    videoUrl: undefined,
    videoPosterUrl: undefined,
    links: undefined,
    architecture: undefined,
    techStack: [{ kind: "known", slug: "react", showOnCard: true }],
    displayOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
  const hydrated = toProjectFormValues(project);

  assert.equal(hydrated.projectType, "developer-tool");
  assert.equal(hydrated.endDate, "");
  assert.equal(hydrated.techStack[0].slug, "react");
  assert.equal("year" in hydrated, false);

  const update = toUpdateProjectInput({
    ...hydrated,
    endDate: "",
  });
  assert.equal(update.endDate, "");
  assert.equal(update.projectType, "developer-tool");
  assert.equal("year" in update, false);
});

test("image validation accepts supported files and rejects type and size violations", () => {
  assert.deepEqual(
    validateImageFile({ name: "project.webp", type: "image/webp", size: 1024 }),
    { valid: true },
  );

  const unsupported = validateImageFile({
    name: "project.svg",
    type: "image/svg+xml",
    size: 1024,
  });
  assert.equal(unsupported.valid, false);
  assert.match(unsupported.message, /JPEG, PNG, or WebP/);

  const oversized = validateImageFile({
    name: "large.png",
    type: "image/png",
    size: IMAGE_UPLOAD_MAX_SIZE_BYTES + 1,
  });
  assert.equal(oversized.valid, false);
  assert.match(oversized.message, /cannot exceed/);
});

test("multi-file validation and media list helpers are deterministic", () => {
  const validFile = { name: "project.jpg", type: "image/jpeg", size: 1024 };
  assert.deepEqual(validateImageFiles([validFile]), { valid: true });
  assert.equal(
    validateImageFiles(Array.from({ length: IMAGE_UPLOAD_MAX_FILES + 1 }, () => validFile))
      .valid,
    false,
  );
  assert.deepEqual(removeItemAt(["a", "b", "c"], 1), ["a", "c"]);
  assert.deepEqual(replaceItemAt(["a", "b"], 1, "updated"), ["a", "updated"]);
});
