import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const types = read("apps/frontend/types/project.ts");
const mapper = read("apps/frontend/lib/mappers/currently-building.ts");
const card = read("apps/frontend/components/sections/home/currently-building/current-project-card.tsx");
const certification = read("apps/frontend/components/sections/about/certification-card.tsx");

test("currently-building public model and mapper use topics without stored status", () => {
  const currentProject = types.slice(types.indexOf("export type CurrentProject"));
  assert.match(currentProject, /topics: string\[\]/);
  assert.match(currentProject, /focus\?: string/);
  assert.doesNotMatch(currentProject, /status:|tech\?:|stack:|link\?:/);
  assert.match(mapper, /topics: item\.techStack \?\? \[\]/);
  assert.match(mapper, /item\.currentFocus \? \{ focus: item\.currentFocus \} : \{\}/);
  assert.match(mapper, /highlights: item\.highlights \?\? \[\]/);
  assert.doesNotMatch(mapper, /item\.status|item\.link|stack:/);
});

test("currently-building card owns fixed status and conditionally renders optional sections", () => {
  assert.match(card, /const CURRENTLY_BUILDING_STATUS_LABEL = "In progress"/);
  assert.match(card, /\{CURRENTLY_BUILDING_STATUS_LABEL\}/);
  assert.doesNotMatch(card, /project\.status/);
  assert.match(card, /project\.focus \? \(/);
  assert.match(card, /project\.topics\.length > 0 \? \(/);
  assert.match(card, /project\.highlights\.length > 0 \? \(/);
  assert.match(card, /<article/);
  assert.match(card, /hover:-translate-y-0\.5/);
  assert.match(card, /sm:p-7/);
});

test("certification Skills sit outside the responsive top grid", () => {
  const topGridStart = certification.indexOf('className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-start"');
  const topGridEnd = certification.indexOf("\n      </div>\n\n      {item.skills", topGridStart);
  assert.ok(topGridStart >= 0);
  assert.ok(topGridEnd > topGridStart);
  assert.doesNotMatch(certification.slice(topGridStart, topGridEnd), /item\.skills/);
  assert.match(certification.slice(topGridEnd), /item\.skills && item\.skills\.length > 0/);
  assert.match(certification.slice(topGridEnd), /mt-4 flex flex-wrap gap-2/);
});

test("certification preview keeps accessible dialog behavior and accurate sizing", () => {
  assert.match(certification, /<DialogTrigger asChild>/);
  assert.match(certification, /<button/);
  assert.match(certification, /w-full cursor-pointer/);
  assert.match(certification, /aria-label=\{`Preview \$\{item\.title\} certificate`\}/);
  assert.match(certification, /focus-visible:ring-2/);
  assert.match(certification, /<DialogTitle/);
  assert.match(certification, /<DialogDescription/);
  assert.match(certification, /sizes="\(min-width: 640px\) 120px, calc\(100vw - 2rem\)"/);
  assert.doesNotMatch(certification, /sizes="120px"/);
  assert.match(certification, /item\.verifyUrl \? \(/);
  assert.match(certification, /target="_blank"/);
  assert.match(certification, /rel="noopener noreferrer"/);
  assert.match(certification, /!h-dvh !w-screen/);
});
