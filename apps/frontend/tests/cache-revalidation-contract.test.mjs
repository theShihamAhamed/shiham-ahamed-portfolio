import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(process.cwd(), "../..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("frontend revalidation route keeps the protected canonical contract", () => {
  const source = read("apps/frontend/app/api/revalidate/route.ts");

  assert.match(source, /timingSafeEqual/);
  assert.match(source, /Cache-Control.*no-store/);
  assert.match(source, /application\/json/);
  assert.match(source, /MAX_BODY_BYTES/);
  assert.match(source, /publicRevalidationRequestSchema/);
  assert.match(source, /getPublicCacheTagsForRevalidation/);
  assert.match(source, /revalidateTag\(tag, \{ expire: 0 \}\)/);
  assert.doesNotMatch(source, /revalidatePath/);
  assert.doesNotMatch(source, /body\.tags|body\.paths|request\.tags|request\.paths/);
});

test("public fallback TTLs and sitemap policy remain one day", () => {
  const config = read("apps/frontend/lib/server/cache/cache-config.ts");
  const sitemap = read("apps/frontend/app/sitemap.ts");

  assert.equal((config.match(/86_400/g) ?? []).length, 5);
  assert.match(sitemap, /export const revalidate = 86400/);
});
