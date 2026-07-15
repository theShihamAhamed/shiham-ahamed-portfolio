import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const packageName = process.argv[2];
const rules = {
  shared: {
    root: "packages/shared/src",
    blocked: /^(?:@portfolio\/db(?:\/|$)|mongoose(?:\/|$)|mongodb(?:\/|$)|next(?:\/|$)|react(?:\/|$)|express(?:\/|$)|server-only$)/,
  },
  db: {
    root: "packages/db/src",
    blocked: /^(?:@portfolio\/(?:frontend|admin|backend)(?:\/|$)|next(?:\/|$)|react(?:\/|$)|express(?:\/|$))/,
  },
};

if (!(packageName in rules)) {
  console.error("Usage: node scripts/check-package-boundaries.mjs <shared|db>");
  process.exit(2);
}

const rule = rules[packageName];
const probeSpecifier = process.argv[3];
if (probeSpecifier) {
  if (rule.blocked.test(probeSpecifier)) {
    console.error(`Invalid ${packageName} package import: ${probeSpecifier}`);
    process.exit(1);
  }
  console.log(`${packageName} package import allowed: ${probeSpecifier}`);
  process.exit(0);
}
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(repositoryRoot, rule.root);
const sourceFiles = [];

const collect = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(target);
    else if (/\.(?:ts|tsx|mts|cts|js|mjs|cjs)$/.test(entry.name)) sourceFiles.push(target);
  }
};

await collect(root);
const violations = [];
const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;

for (const file of sourceFiles) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (rule.blocked.test(specifier)) violations.push(`${path.relative(repositoryRoot, file)}: ${specifier}`);
    if (specifier.startsWith(".")) {
      const resolved = path.resolve(path.dirname(file), specifier);
      if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) violations.push(`${path.relative(repositoryRoot, file)}: ${specifier} escapes package source`);
    }
  }
}

if (violations.length) {
  console.error(`Invalid ${packageName} package imports:\n${violations.join("\n")}`);
  process.exit(1);
}

console.log(`${packageName} package boundaries passed (${sourceFiles.length} source files checked).`);
