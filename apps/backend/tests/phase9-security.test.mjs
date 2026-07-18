import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

const testEnvironment = {
  NODE_ENV: "development",
  PORT: "5000",
  MONGO_URI: "mongodb://127.0.0.1:27017/portfolio-test",
  ADMIN_FRONTEND_ORIGINS: "http://localhost:3000,https://admin.example.test",
  PUBLIC_FRONTEND_URL: "http://localhost:3000",
  ADMIN_EMAIL: "admin@example.invalid",
  ADMIN_PASSWORD_HASH: "bcrypt-test-hash",
  JWT_ACCESS_SECRET: "a".repeat(32),
  JWT_REFRESH_SECRET: "b".repeat(32),
  ACCESS_TOKEN_EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  IMAGEKIT_PUBLIC_KEY: "imagekit-public-test",
  IMAGEKIT_PRIVATE_KEY: "imagekit-private-test",
  IMAGEKIT_URL_ENDPOINT: "https://ik.imagekit.io/test",
  MAX_UPLOAD_SIZE_MB: "8",
  AUTH_COOKIE_SAME_SITE: "lax",
  AUTH_COOKIE_SECURE: "false",
  TRUST_PROXY: "false",
};

for (const [key, value] of Object.entries(testEnvironment)) {
  process.env[key] ??= value;
}

const { parseBackendEnv } = await import("../dist/config/env.js");
const { createRefreshCookieOptions } = await import("../dist/config/cookies.js");
const { createCorsOptions, isVercelPreviewOrigin } = await import(
  "../dist/config/cors.js"
);
const { parseOriginList } = await import("../dist/config/origins.js");
const uploadValidation = await import("../dist/modules/uploads/uploads.validation.js");

const evaluateCorsOrigin = (options, origin) =>
  new Promise((resolve) => {
    assert.equal(typeof options.origin, "function");
    options.origin(origin, (error, allowed) => resolve({ allowed, error }));
  });

test("environment validation accepts development and secure production modes", () => {
  const development = parseBackendEnv(testEnvironment);
  assert.deepEqual(development.ADMIN_FRONTEND_ORIGIN_LIST, [
    "http://localhost:3000",
    "https://admin.example.test",
  ]);
  assert.equal(development.ALLOW_VERCEL_PREVIEW_ORIGINS, false);

  const production = parseBackendEnv({
    ...testEnvironment,
    NODE_ENV: "production",
    PUBLIC_FRONTEND_URL: "https://shihamahamed.dev",
    AUTH_COOKIE_SECURE: "true",
    FRONTEND_REVALIDATE_URL: "https://shihamahamed.dev/api/revalidate",
    FRONTEND_REVALIDATE_SECRET: "c".repeat(32),
  });
  assert.equal(production.AUTH_COOKIE_SECURE, true);
  assert.equal(production.FRONTEND_REVALIDATE_URL, "https://shihamahamed.dev/api/revalidate");
});

test("Vercel preview origin flag parses strictly and defaults off", () => {
  assert.equal(
    parseBackendEnv(testEnvironment).ALLOW_VERCEL_PREVIEW_ORIGINS,
    false,
  );
  assert.equal(
    parseBackendEnv({
      ...testEnvironment,
      ALLOW_VERCEL_PREVIEW_ORIGINS: "true",
    }).ALLOW_VERCEL_PREVIEW_ORIGINS,
    true,
  );
  assert.equal(
    parseBackendEnv({
      ...testEnvironment,
      ALLOW_VERCEL_PREVIEW_ORIGINS: "false",
    }).ALLOW_VERCEL_PREVIEW_ORIGINS,
    false,
  );
  assert.throws(
    () =>
      parseBackendEnv({
        ...testEnvironment,
        ALLOW_VERCEL_PREVIEW_ORIGINS: "yes",
      }),
    /ALLOW_VERCEL_PREVIEW_ORIGINS/,
  );
});

test("environment validation rejects unsafe cookie and origin combinations", () => {
  assert.throws(
    () => parseBackendEnv({ ...testEnvironment, NODE_ENV: "production" }),
    /AUTH_COOKIE_SECURE must be true in production/,
  );
  assert.throws(
    () => parseBackendEnv({
      ...testEnvironment,
      NODE_ENV: "production",
      AUTH_COOKIE_SECURE: "true",
    }),
    /FRONTEND_REVALIDATE_URL and FRONTEND_REVALIDATE_SECRET are required in production/,
  );
  assert.throws(
    () => parseBackendEnv({
      ...testEnvironment,
      NODE_ENV: "production",
      AUTH_COOKIE_SECURE: "true",
      FRONTEND_REVALIDATE_URL: "https://shihamahamed.dev/api/revalidate",
    }),
    /FRONTEND_REVALIDATE_URL and FRONTEND_REVALIDATE_SECRET are both required in production/,
  );
  assert.throws(
    () => parseBackendEnv({
      ...testEnvironment,
      FRONTEND_REVALIDATE_URL: "https://shihamahamed.dev/api/revalidate",
    }),
    /must be configured together/,
  );
  assert.throws(
    () => parseBackendEnv({
      ...testEnvironment,
      FRONTEND_REVALIDATE_URL: "ftp://shihamahamed.dev/api/revalidate",
      FRONTEND_REVALIDATE_SECRET: "c".repeat(32),
    }),
    /FRONTEND_REVALIDATE_URL: URL must use http or https/,
  );
  assert.throws(
    () => parseBackendEnv({
      ...testEnvironment,
      FRONTEND_REVALIDATE_URL: "https://shihamahamed.dev/not-revalidate",
      FRONTEND_REVALIDATE_SECRET: "c".repeat(32),
    }),
    /must target \/api\/revalidate/,
  );
  assert.throws(
    () => parseBackendEnv({
      ...testEnvironment,
      FRONTEND_REVALIDATE_URL: "https://shihamahamed.dev/api/revalidate",
      FRONTEND_REVALIDATE_SECRET: "short",
    }),
    /FRONTEND_REVALIDATE_SECRET must be at least 32 characters/,
  );
  assert.throws(
    () => parseBackendEnv({ ...testEnvironment, AUTH_COOKIE_SAME_SITE: "none" }),
    /AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAME_SITE is none/,
  );
  assert.throws(
    () => parseBackendEnv({ ...testEnvironment, ADMIN_FRONTEND_ORIGINS: "https://admin.example.test/path" }),
    /ADMIN_FRONTEND_ORIGINS/,
  );
  assert.throws(
    () => parseBackendEnv({ ...testEnvironment, JWT_ACCESS_SECRET: "short" }),
    (error) => error instanceof Error && !error.message.includes("short"),
  );
});

test("cookie options keep creation and clearing attributes aligned", () => {
  const expiry = new Date(Date.now() + 60_000);
  const sameSite = createRefreshCookieOptions(
    { sameSite: "lax", secure: true, domain: "admin.example.test" },
    expiry,
  );
  const cleared = createRefreshCookieOptions(
    { sameSite: "lax", secure: true, domain: "admin.example.test" },
  );

  assert.equal(sameSite.httpOnly, true);
  assert.equal(sameSite.sameSite, "lax");
  assert.equal(sameSite.secure, true);
  assert.equal(sameSite.domain, "admin.example.test");
  assert.equal(sameSite.path, "/api/auth");
  assert.equal(cleared.path, sameSite.path);
  assert.equal(cleared.domain, sameSite.domain);
  assert.equal(cleared.sameSite, sameSite.sameSite);
  assert.equal(cleared.secure, sameSite.secure);
});

test("origin parsing is exact and seed-only upload IDs remain rejected", () => {
  assert.deepEqual(parseOriginList("http://localhost:3000, https://admin.example.test"), [
    "http://localhost:3000",
    "https://admin.example.test",
  ]);
  assert.throws(() => parseOriginList("https://admin.example.test/anything"));
  assert.equal(
    uploadValidation.deleteImageParamsSchema.safeParse({ fileId: "imagekit-file-1" }).success,
    true,
  );
  assert.equal(
    uploadValidation.deleteImageParamsSchema.safeParse({ fileId: "seed:demo" }).success,
    false,
  );
});

test("CORS preserves exact origins and adds only valid opt-in Vercel previews", async () => {
  const origins = [
    "http://localhost:3000",
    "https://admin.example.test",
  ];
  const disabled = createCorsOptions({
    origins,
    allowVercelPreviewOrigins: false,
  });
  const enabled = createCorsOptions({
    origins,
    allowVercelPreviewOrigins: true,
  });

  for (const origin of origins) {
    const result = await evaluateCorsOrigin(disabled, origin);
    assert.equal(result.error, null);
    assert.equal(result.allowed, true);
  }

  const noOrigin = await evaluateCorsOrigin(disabled, undefined);
  assert.equal(noOrigin.error, null);
  assert.equal(noOrigin.allowed, true);

  const disabledPreview = await evaluateCorsOrigin(
    disabled,
    "https://example-preview.vercel.app",
  );
  assert.match(disabledPreview.error.message, /CORS origin denied/);

  for (const origin of [
    "https://example-preview.vercel.app",
    "https://admin-project-git-feature-name.vercel.app",
  ]) {
    assert.equal(isVercelPreviewOrigin(origin), true);
    const result = await evaluateCorsOrigin(enabled, origin);
    assert.equal(result.error, null);
    assert.equal(result.allowed, true);
  }

  for (const origin of [
    "http://example-preview.vercel.app",
    "https://example-preview.vercel.app:8443",
    "https://vercel.app",
    "https://preview.vercel.app.attacker.com",
    "https://example.vercel.com",
    "not-a-url",
    "https://example-preview.vercel.app/",
    "https://example-preview.vercel.app/path",
    "https://example-preview.vercel.app?query=1",
    "https://example-preview.vercel.app#fragment",
    "https://user@example-preview.vercel.app",
    "https://admin.example.test/",
  ]) {
    assert.equal(isVercelPreviewOrigin(origin), false);
    const result = await evaluateCorsOrigin(enabled, origin);
    assert.match(result.error.message, /CORS origin denied/);
  }

  assert.equal(enabled.credentials, true);
  assert.deepEqual(enabled.methods, [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ]);
  assert.deepEqual(enabled.allowedHeaders, ["Content-Type", "Authorization"]);
  assert.equal(enabled.optionsSuccessStatus, 204);
});
