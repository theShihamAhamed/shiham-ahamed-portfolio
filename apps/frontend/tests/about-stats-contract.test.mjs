import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const page = read("apps/frontend/app/about/page.tsx");
const data = read("apps/frontend/data/site/about.ts");
const types = read("apps/frontend/types/about.ts");
const query = read(
  "apps/frontend/lib/server/queries/get-about-page-data.ts",
);
const stats = read(
  "apps/frontend/components/sections/about/about-stats-section.tsx",
);

test("About statistics use current local sources without a runtime GitHub request", () => {
  assert.match(query, /getVisibleProjects/);
  assert.match(query, /projects\.value\.length/);
  assert.match(query, /visibleProjectCount: number \| null/);
  assert.match(query, /visibleProjectCount: projects\.error \? null/);
  assert.doesNotMatch(data, /value:\s*17/);

  assert.match(data, /const publicRepositoryCount = 22/);
  assert.match(data, /2026-07-28/);
  assert.match(data, /label: "Public repositories"/);
  assert.match(data, /note: "on GitHub"/);
  assert.match(data, /value: focusAreas\.length/);
  assert.match(data, /label: "Core focus areas"/);
  assert.match(data, /note: "in active practice"/);
  assert.doesNotMatch(data, /12\+|Large Systems|value:\s*"4"/);

  assert.match(types, /value: number \| null/);
  assert.match(types, /suffix\?: string/);
  assert.match(types, /unavailableLabel\?: string/);
  assert.doesNotMatch(
    `${page}\n${data}\n${query}\n${stats}`,
    /fetch\([^)]*github|api\.github\.com/i,
  );
});

test("About keeps data on the server and limits client behavior to the stats leaf", () => {
  assert.doesNotMatch(page.slice(0, 40), /"use client"/);
  assert.match(page, /const stats = getAboutStats\(data\.visibleProjectCount\)/);
  assert.match(page, /<AboutStatsSection stats=\{stats\} \/>/);
  assert.match(stats.slice(0, 40), /"use client"/);
  assert.match(stats, /useInView\(sectionRef/);
  assert.match(stats, /once: true/);
  assert.match(stats, /amount: 0\.35/);
});

test("count-up animation is one-time, exact, accessible, and reduced-motion safe", () => {
  assert.match(stats, /COUNT_DURATION_MS = 900/);
  assert.match(stats, /1 - Math\.pow\(1 - progress, 3\)/);
  assert.match(stats, /Math\.min\(/);
  assert.match(stats, /Math\.max\(/);
  assert.match(stats, /Math\.round\(targetValue \* easedProgress\)/);
  assert.match(stats, /setDisplayValue\(targetValue\)/);
  assert.match(stats, /hasCompletedRef\.current = true/);
  assert.match(stats, /requestAnimationFrame\(updateValue\)/);
  assert.match(stats, /cancelAnimationFrame\(frameId\)/);
  assert.doesNotMatch(stats, /setInterval|aria-live/);

  const effect = stats.slice(
    stats.indexOf("useEffect(() =>"),
    stats.indexOf("const visualValue"),
  );
  assert.ok(
    effect.indexOf("if (shouldReduceMotion)") <
      effect.indexOf("requestAnimationFrame(updateValue)"),
  );
  assert.match(stats, /useSyncExternalStore/);
  assert.match(stats, /className="sr-only"/);
  assert.match(stats, /aria-hidden="true"/);
  assert.match(data, /Portfolio project count temporarily unavailable/);
  assert.match(stats, /stat\.unavailableLabel/);
  assert.match(stats, /targetValue === null[\s\S]*?"\\u2014"/);
});
