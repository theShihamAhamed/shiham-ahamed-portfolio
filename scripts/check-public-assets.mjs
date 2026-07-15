import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workspaces = ["apps/frontend", "apps/admin-frontend"];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"]);
const assetPattern = /["'`](\/[^"'`\r\n]+\.(?:svg|png|jpe?g|webp|gif|mp4|webm|ico))(?:["'`]|[?#])/gi;
const ignoredDirectories = new Set(["node_modules", ".next", "dist", "build", "public", "tests"]);

const collectSourceFiles = (directory) => {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      files.push(...collectSourceFiles(path.join(directory, entry.name)));
    } else if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
};

const missing = [];

for (const workspace of workspaces) {
  const workspaceRoot = path.join(root, workspace);
  const publicRoot = path.join(workspaceRoot, "public");

  for (const file of collectSourceFiles(workspaceRoot)) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(assetPattern)) {
      const assetPath = match[1];
      const absoluteAsset = path.join(publicRoot, assetPath.slice(1));
      const appRouteAsset = path.join(workspaceRoot, "app", assetPath.slice(1));
      if (!fs.existsSync(absoluteAsset) && !fs.existsSync(appRouteAsset)) {
        missing.push(`${path.relative(root, file)} -> ${assetPath}`);
      }
    }
  }
}

if (missing.length > 0) {
  console.error("Missing local public assets:");
  missing.forEach((entry) => console.error(`- ${entry}`));
  process.exitCode = 1;
} else {
  console.log("Public asset references passed.");
}
