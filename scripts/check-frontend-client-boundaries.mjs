import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontendRoot = path.join(repositoryRoot, "apps", "frontend");
const blocked = /^(?:@portfolio\/db(?:\/|$)|mongoose(?:\/|$)|@\/lib\/server(?:\/|$))/;
const probeSpecifier = process.argv[2];

if (probeSpecifier) {
  if (blocked.test(probeSpecifier)) {
    console.error(`Invalid frontend client import: ${probeSpecifier}`);
    process.exit(1);
  }
  console.log(`Frontend client import allowed: ${probeSpecifier}`);
  process.exit(0);
}

const files = [];
const collect = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if ([".next", "node_modules"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(target);
    else if (/\.(?:ts|tsx|mts|cts|js|jsx|mjs|cjs)$/.test(entry.name)) files.push(target);
  }
};

await collect(frontendRoot);
const violations = [];
const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
for (const file of files) {
  const source = await readFile(file, "utf8");
  if (!/^\s*["']use client["'];/m.test(source.slice(0, 512))) continue;
  for (const match of source.matchAll(importPattern)) {
    if (blocked.test(match[1])) violations.push(`${path.relative(repositoryRoot, file)}: ${match[1]}`);
  }
}

if (violations.length) {
  console.error(`Invalid frontend client imports:\n${violations.join("\n")}`);
  process.exit(1);
}
console.log(`Frontend client boundaries passed (${files.length} source files checked).`);
