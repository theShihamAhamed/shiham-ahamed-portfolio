import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const frontendRoot = path.join(repoRoot, "apps", "frontend");
const adminRoot = path.join(repoRoot, "apps", "admin-frontend");

const readText = (filePath) => fs.readFileSync(filePath, "utf8");
const readJson = (filePath) => JSON.parse(readText(filePath));
const dependencyValue = (manifest, dependency) =>
  manifest.dependencies?.[dependency] ?? manifest.devDependencies?.[dependency];

const rootPackage = readJson(path.join(repoRoot, "package.json"));
const frontendPackage = readJson(path.join(frontendRoot, "package.json"));
const adminPackage = readJson(path.join(adminRoot, "package.json"));
const layoutSource = readText(path.join(frontendRoot, "app", "layout.tsx"));

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".next", "node_modules"].includes(entry.name)) return [];

    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return /\.(?:[cm]?[jt]sx?)$/.test(entry.name) ? [entryPath] : [];
  });
}

test("the public frontend owns a stable major-2 Analytics dependency", () => {
  const analyticsVersion = frontendPackage.dependencies?.["@vercel/analytics"];

  assert.equal(typeof analyticsVersion, "string");
  assert.match(analyticsVersion, /^(?:\^|~)?2\.\d+\.\d+$/);
  assert.equal(dependencyValue(rootPackage, "@vercel/analytics"), undefined);
  assert.equal(dependencyValue(adminPackage, "@vercel/analytics"), undefined);

  for (const manifest of [rootPackage, frontendPackage, adminPackage]) {
    assert.equal(dependencyValue(manifest, "@vercel/speed-insights"), undefined);
  }
});

test("the root server layout renders one prop-free Analytics component in body", () => {
  assert.match(
    layoutSource,
    /import\s*\{\s*Analytics\s*\}\s*from\s*["']@vercel\/analytics\/next["'];?/,
  );
  assert.doesNotMatch(layoutSource, /^[ \t]*["']use client["'];?/m);
  assert.equal((layoutSource.match(/<Analytics\b/g) ?? []).length, 1);
  assert.equal((layoutSource.match(/<Analytics\s*\/>/g) ?? []).length, 1);

  const bodyStart = layoutSource.indexOf("<body");
  const analyticsPosition = layoutSource.indexOf("<Analytics />");
  const bodyEnd = layoutSource.indexOf("</body>");
  assert.ok(bodyStart >= 0 && bodyStart < analyticsPosition);
  assert.ok(analyticsPosition < bodyEnd);
  assert.ok(layoutSource.indexOf("</ThemeProvider>") < analyticsPosition);
});

test("the integration uses no custom collection or script behavior", () => {
  assert.doesNotMatch(
    layoutSource,
    /\b(?:beforeSend|debug|eventEndpoint|mode|scriptSrc|viewEndpoint)\s*=/,
  );
  assert.doesNotMatch(layoutSource, /<script\b|next\/script|\/_vercel\/insights|injectAnalytics/);
  assert.doesNotMatch(layoutSource, /\btrack\s*\(/);
  assert.doesNotMatch(layoutSource, /@vercel\/speed-insights/);
});

test("the admin frontend contains no Analytics integration", () => {
  const adminSource = sourceFiles(adminRoot).map(readText).join("\n");

  assert.doesNotMatch(adminSource, /@vercel\/analytics/);
  assert.doesNotMatch(adminSource, /<Analytics\b/);
  assert.doesNotMatch(adminSource, /@vercel\/speed-insights/);
});
