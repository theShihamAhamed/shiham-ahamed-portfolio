import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  aboutSectionNavigation,
  homeSectionNavigation,
} from "../data/site/section-navigation.ts";
import {
  getActiveSectionId,
  getDuplicateSectionIds,
  getSectionScrollOffset,
} from "../lib/section-navigation.ts";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));

const readFrontendFile = (relativePath) =>
  fs.readFileSync(path.resolve(testDirectory, "..", relativePath), "utf8");

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

test("configured home and about section navigation ids remain unique", () => {
  assert.deepEqual(
    getDuplicateSectionIds(homeSectionNavigation.map((item) => item.id)),
    [],
  );
  assert.deepEqual(
    getDuplicateSectionIds(aboutSectionNavigation.map((item) => item.id)),
    [],
  );
});

test("home and about pages share the section quick navigation component", () => {
  const homePage = readFrontendFile("app/page.tsx");
  const aboutPage = readFrontendFile("app/about/page.tsx");

  for (const page of [homePage, aboutPage]) {
    assert.match(page, /components\/navigation\/section-quick-nav/);
    assert.match(page, /<SectionQuickNav\s+items=/);
  }
});

test("section quick navigation keeps native semantics and accessible state", () => {
  const source = readFrontendFile(
    "components/navigation/section-quick-nav.tsx",
  );

  assert.match(source, /<nav/);
  assert.match(source, /aria-label="On this page"/);
  assert.match(source, /<button/);
  assert.match(source, /aria-label=\{`Jump to \$\{item\.label\}`\}/);
  assert.match(source, /aria-current=\{isActive \? "location" : undefined\}/);
  assert.ok(
    (source.match(/aria-hidden="true"/g) ?? []).length >= 2,
    "decorative indicators and detached labels should be hidden from assistive technology",
  );
});

test("section quick navigation respects reduced motion without layout-expanding labels", () => {
  const source = readFrontendFile(
    "components/navigation/section-quick-nav.tsx",
  );

  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /motion-reduce:transition-none/);
  assert.match(source, /group\/item/);
  assert.match(source, /absolute right-full/);
  assert.doesNotMatch(source, /group-hover:max-w-/);
  assert.doesNotMatch(source, /group-focus-within:max-w-/);
  assert.doesNotMatch(source, /max-w-36/);
});
