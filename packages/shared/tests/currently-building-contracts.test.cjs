const assert = require("node:assert/strict");
const test = require("node:test");

const shared = require("../dist");

const minimumItem = {
  title: "Exploring React Native with Expo",
  description:
    "Learning mobile application development by building cross-platform interfaces.",
};

test("currently-building create accepts only title and description", () => {
  const parsed = shared.createCurrentlyBuildingSchema.parse(minimumItem);

  assert.equal(parsed.title, minimumItem.title);
  assert.equal(parsed.description, minimumItem.description);
  assert.equal(parsed.currentFocus, undefined);
  assert.equal(parsed.techStack, undefined);
  assert.equal(parsed.highlights, undefined);
  assert.equal(parsed.link, undefined);

  for (const invalid of [
    { description: minimumItem.description },
    { ...minimumItem, title: "   " },
    { title: minimumItem.title },
    { ...minimumItem, description: "   " },
  ]) {
    assert.equal(shared.createCurrentlyBuildingSchema.safeParse(invalid).success, false);
  }
});

test("currently-building API schemas normalize optional strings and lists", () => {
  const parsed = shared.createCurrentlyBuildingSchema.parse({
    ...minimumItem,
    currentFocus: "   ",
    link: "",
    techStack: [" React Native ", " ", "Expo"],
    highlights: [" Prototype navigation ", ""],
  });

  assert.equal(parsed.currentFocus, undefined);
  assert.equal(parsed.link, undefined);
  assert.deepEqual(parsed.techStack, ["React Native", "Expo"]);
  assert.deepEqual(parsed.highlights, ["Prototype navigation"]);
  assert.deepEqual(
    shared.createCurrentlyBuildingSchema.parse({
      ...minimumItem,
      techStack: [" ", ""],
      highlights: [],
    }).techStack,
    [],
  );

  assert.equal(
    shared.createCurrentlyBuildingSchema.safeParse({
      ...minimumItem,
      link: "https://example.com/mobile",
    }).success,
    true,
  );
  assert.equal(
    shared.createCurrentlyBuildingSchema.safeParse({
      ...minimumItem,
      link: "not-a-url",
    }).success,
    false,
  );
});

test("currently-building update supports deliberate clearing and remains non-empty", () => {
  const parsed = shared.updateCurrentlyBuildingSchema.parse({
    currentFocus: "",
    link: "   ",
    techStack: [],
    highlights: [" ", ""],
  });

  assert.equal(Object.hasOwn(parsed, "currentFocus"), true);
  assert.equal(parsed.currentFocus, undefined);
  assert.equal(Object.hasOwn(parsed, "link"), true);
  assert.equal(parsed.link, undefined);
  assert.deepEqual(parsed.techStack, []);
  assert.deepEqual(parsed.highlights, []);
  assert.equal(shared.updateCurrentlyBuildingSchema.safeParse({ title: "Updated" }).success, true);
  assert.equal(shared.updateCurrentlyBuildingSchema.safeParse({}).success, false);
});

test("currently-building strict contracts reject obsolete status and unknown fields", () => {
  for (const result of [
    shared.createCurrentlyBuildingSchema.safeParse({ ...minimumItem, status: "In progress" }),
    shared.updateCurrentlyBuildingSchema.safeParse({ status: "In progress" }),
    shared.adminCurrentlyBuildingQuerySchema.safeParse({ status: "In progress" }),
    shared.createCurrentlyBuildingSchema.safeParse({ ...minimumItem, unknown: true }),
    shared.updateCurrentlyBuildingSchema.safeParse({ unknown: true }),
  ]) {
    assert.equal(result.success, false);
  }

  assert.equal(
    shared.adminCurrentlyBuildingQuerySchema.safeParse({ search: "Expo", isVisible: "true" }).success,
    true,
  );
});

test("currently-building form schemas align on optional controlled values", () => {
  const create = shared.createCurrentlyBuildingFormSchema.parse({
    ...minimumItem,
    isVisible: true,
  });
  const update = shared.updateCurrentlyBuildingFormSchema.parse(minimumItem);

  for (const parsed of [create, update]) {
    assert.equal(parsed.currentFocus, "");
    assert.equal(parsed.link, "");
    assert.deepEqual(parsed.techStack, []);
    assert.deepEqual(parsed.highlights, []);
  }

  const normalized = shared.updateCurrentlyBuildingFormSchema.parse({
    ...minimumItem,
    currentFocus: "   ",
    techStack: [" Expo ", " "],
    highlights: [""],
    link: "",
  });
  assert.equal(normalized.currentFocus, "");
  assert.deepEqual(normalized.techStack, ["Expo"]);
  assert.deepEqual(normalized.highlights, []);
});
