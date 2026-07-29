import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(process.cwd(), "../..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

const layout = read("apps/frontend/app/layout.tsx");
const projectDetail = read("apps/frontend/app/projects/[slug]/page.tsx");
const socialImagePath = path.join(
  repoRoot,
  "apps/frontend/public/social/shiham-ahamed-portfolio-social-card-v1.png",
);
const socialImage = fs.readFileSync(socialImagePath);

test("root social metadata uses one complete branded large-image contract", () => {
  assert.match(layout, /metadataBase: getPublicSiteUrl\(\)/);
  assert.match(layout, /alternates: \{ canonical: "\/" \}/);
  assert.match(layout, /type: "website"/);
  assert.match(layout, /siteName: "Shiham Ahamed Portfolio"/);
  assert.match(layout, /title: "Shiham Ahamed \| Portfolio"/);
  assert.match(
    layout,
    /description: "Practical web applications, backend systems, and engineering work by Shiham Ahamed\."/,
  );

  assert.match(
    layout,
    /url: "\/social\/shiham-ahamed-portfolio-social-card-v1\.png"/,
  );
  assert.match(layout, /width: 1200/);
  assert.match(layout, /height: 630/);
  assert.match(layout, /type: "image\/png"/);
  assert.match(
    layout,
    /alt: "Shiham Ahamed software engineering portfolio preview"/,
  );
  assert.match(layout, /images: \[socialPreviewImage\]/);
  assert.match(layout, /card: "summary_large_image"/);
  assert.match(layout, /url: socialPreviewImage\.url/);
  assert.match(layout, /alt: socialPreviewImage\.alt/);

  assert.doesNotMatch(layout, /images:[^\n]*logo\.svg/);
  assert.doesNotMatch(layout, /localhost|vercel\.app\/(?!social)/);
  assert.doesNotMatch(layout, /<meta|<Head|ImageResponse/);
});

test("static routes inherit the default while project details keep their image", () => {
  for (const route of [
    "apps/frontend/app/page.tsx",
    "apps/frontend/app/about/page.tsx",
    "apps/frontend/app/projects/page.tsx",
    "apps/frontend/app/contact/page.tsx",
  ]) {
    const source = read(route);
    assert.doesNotMatch(source, /\bopenGraph\s*:/);
    assert.doesNotMatch(source, /\btwitter\s*:/);
  }

  assert.match(projectDetail, /type: "article"/);
  assert.match(
    projectDetail,
    /images: \[\{ url: getAbsoluteUrl\(project\.thumbnail\.url\)/,
  );
  assert.match(projectDetail, /card: "summary_large_image"/);
  assert.match(
    projectDetail,
    /images: \[getAbsoluteUrl\(project\.thumbnail\.url\)\]/,
  );
});

test("social preview asset is an opaque 1200 by 630 RGB PNG under 500 KB", () => {
  assert.equal(
    socialImage.subarray(0, 8).toString("hex"),
    "89504e470d0a1a0a",
  );
  assert.equal(socialImage.subarray(12, 16).toString("ascii"), "IHDR");
  assert.equal(socialImage.readUInt32BE(16), 1200);
  assert.equal(socialImage.readUInt32BE(20), 630);
  assert.equal(socialImage[24], 8);
  assert.equal(socialImage[25], 2);
  assert.ok(socialImage.byteLength <= 500 * 1024);

  assert.equal(
    fs.existsSync(path.join(repoRoot, "apps/frontend/app/opengraph-image.tsx")),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(repoRoot, "apps/frontend/app/twitter-image.tsx")),
    false,
  );
});
