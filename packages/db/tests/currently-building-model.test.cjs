const assert = require("node:assert/strict");
const test = require("node:test");

const db = require("../dist");

const dates = {
  createdAt: new Date("2026-07-01T00:00:00.000Z"),
  updatedAt: new Date("2026-07-02T00:00:00.000Z"),
};

const makeItem = (overrides = {}) =>
  new db.CurrentlyBuildingModel({
    title: "Mobile exploration",
    description: "Exploring cross-platform application workflows.",
    displayOrder: 1,
    ...dates,
    ...overrides,
  });

test("currently-building model requires only core content", async () => {
  const item = makeItem();
  await item.validate();

  const stored = item.toObject();
  assert.equal(stored.currentFocus, undefined);
  assert.equal(stored.link, undefined);
  assert.deepEqual(stored.techStack, []);
  assert.deepEqual(stored.highlights, []);
  assert.equal(stored.isVisible, true);

  await assert.rejects(makeItem({ title: "" }).validate());
  await assert.rejects(makeItem({ description: "" }).validate());
});

test("currently-building model normalizes optional strings and arrays", async () => {
  const item = makeItem({
    currentFocus: "   ",
    link: " ",
    techStack: [" React Native ", " ", "Expo"],
    highlights: [" Prototype navigation ", ""],
  });
  await item.validate();

  const stored = item.toObject();
  assert.equal(stored.currentFocus, undefined);
  assert.equal(stored.link, undefined);
  assert.deepEqual(stored.techStack, ["React Native", "Expo"]);
  assert.deepEqual(stored.highlights, ["Prototype navigation"]);
});

test("currently-building schema removes status while preserving operational indexes", () => {
  assert.equal(db.currentlyBuildingSchema.path("status"), undefined);

  const indexes = db.currentlyBuildingSchema.indexes().map(([fields]) => fields);
  assert.deepEqual(indexes, [
    { displayOrder: 1 },
    { isVisible: 1, displayOrder: 1 },
  ]);
});

test("currently-building serializers safely ignore legacy status and malformed optionals", () => {
  const legacy = db.CurrentlyBuildingModel.hydrate({
    _id: new db.mongoose.Types.ObjectId(),
    title: "Legacy active work",
    description: "A record created before status removal.",
    status: "Paused",
    currentFocus: "   ",
    techStack: [" Expo ", " "],
    highlights: undefined,
    link: "   ",
    isVisible: false,
    displayOrder: 3,
    ...dates,
  });
  const before = legacy.toObject();
  assert.equal(before.status, "Paused");

  const admin = db.serializeAdminCurrentlyBuilding(legacy);
  const publicItem = db.serializePublicCurrentlyBuilding(legacy);

  assert.equal(Object.hasOwn(admin, "status"), false);
  assert.equal(Object.hasOwn(publicItem, "status"), false);
  assert.equal(Object.hasOwn(admin, "currentFocus"), false);
  assert.equal(Object.hasOwn(admin, "link"), false);
  assert.deepEqual(admin.techStack, ["Expo"]);
  assert.deepEqual(admin.highlights, []);
  assert.equal(admin.isVisible, false);
  assert.equal(admin.displayOrder, 3);
  assert.equal(Object.hasOwn(publicItem, "isVisible"), false);
  assert.equal(Object.hasOwn(publicItem, "displayOrder"), false);
  assert.deepEqual(legacy.toObject(), before);
});
