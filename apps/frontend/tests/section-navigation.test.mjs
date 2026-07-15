import assert from "node:assert/strict";
import test from "node:test";

import {
  getActiveSectionId,
  getDuplicateSectionIds,
  getSectionScrollOffset,
} from "../lib/section-navigation.ts";

test("section navigation activates the section at the shared header line", () => {
  const sections = [
    { id: "hero", top: -300 },
    { id: "about", top: -20 },
    { id: "projects", top: 700 },
  ];

  assert.equal(getActiveSectionId(sections, 88, 400, 800, 2_000), "about");
  assert.equal(getActiveSectionId(sections, 88, 1_200, 800, 2_000), "projects");
});

test("section navigation uses the final section at the document bottom", () => {
  assert.equal(
    getActiveSectionId(
      [
        { id: "hero", top: -800 },
        { id: "contact", top: 300 },
      ],
      88,
      1_201,
      800,
      2_000,
    ),
    "contact",
  );
});

test("section navigation validates CSS offsets and duplicate ids", () => {
  assert.equal(getSectionScrollOffset("80px"), 80);
  assert.equal(getSectionScrollOffset("invalid"), 80);
  assert.deepEqual(
    getDuplicateSectionIds(["hero", "about", "hero", "contact", "about"]),
    ["hero", "about"],
  );
});
