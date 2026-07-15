import assert from "node:assert/strict";
import http from "node:http";
import process from "node:process";
import test from "node:test";

import express from "express";

const testEnvironment = {
  NODE_ENV: "development",
  PORT: "5000",
  MONGO_URI: "mongodb://127.0.0.1:27017/portfolio-test",
  ADMIN_FRONTEND_ORIGINS: "http://localhost:3000",
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
  MAX_UPLOAD_SIZE_MB: "1",
  AUTH_COOKIE_SAME_SITE: "lax",
  AUTH_COOKIE_SECURE: "false",
  TRUST_PROXY: "false",
};

for (const [key, value] of Object.entries(testEnvironment)) {
  process.env[key] ??= value;
}

const uploadMiddleware = await import("../dist/middleware/upload.middleware.js");
const uploadController = await import("../dist/modules/uploads/uploads.controller.js");
const uploadRoutes = await import("../dist/modules/uploads/uploads.routes.js");
const uploadService = await import("../dist/modules/uploads/uploads.service.js");
const uploadValidation = await import("../dist/modules/uploads/uploads.validation.js");

test("upload routes, controller, service, and validation import without provider calls", () => {
  assert.ok(uploadRoutes.default);
  assert.equal(typeof uploadController.uploadSingleImage, "function");
  assert.equal(typeof uploadController.uploadMultipleImages, "function");
  assert.equal(typeof uploadController.deleteUploadedImage, "function");
  assert.equal(typeof uploadService.uploadImage, "function");
  assert.equal(typeof uploadService.uploadImages, "function");
  assert.equal(typeof uploadService.deleteImage, "function");
  assert.equal(typeof uploadValidation.singleUploadBodySchema.parse, "function");
});

test("upload validation rejects invalid delete IDs and seed-style IDs", () => {
  assert.equal(
    uploadValidation.deleteImageParamsSchema.safeParse({ fileId: "imagekit-file-1" }).success,
    true,
  );
  assert.equal(
    uploadValidation.deleteImageParamsSchema.safeParse({ fileId: "seed:demo" }).success,
    false,
  );
  assert.equal(
    uploadValidation.deleteImageParamsSchema.safeParse({ fileId: "../private-key" }).success,
    false,
  );
});

const startUploadServer = async () => {
  const app = express();
  app.post(
    "/upload",
    uploadMiddleware.uploadSingleImage("file"),
    (_req, res) => res.status(200).json({ ok: true }),
  );
  app.use((error, _req, res, _next) => {
    void _next;
    res.status(error.statusCode ?? 500).json({ code: error.code });
  });

  const server = http.createServer(app);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert.equal(typeof address, "object");
  return { server, url: `http://127.0.0.1:${address.port}/upload` };
};

test("upload middleware rejects unsupported media types", async () => {
  const { server, url } = await startUploadServer();
  try {
    const form = new globalThis.FormData();
    form.append(
      "file",
      new globalThis.Blob(["not an image"], { type: "image/gif" }),
      "image.gif",
    );
    const response = await globalThis.fetch(url, { method: "POST", body: form });
    assert.equal(response.status, 415);
    assert.deepEqual(await response.json(), { code: "UNSUPPORTED_FILE_TYPE" });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("upload middleware rejects oversized files", async () => {
  const { server, url } = await startUploadServer();
  try {
    const form = new globalThis.FormData();
    form.append(
      "file",
      new globalThis.Blob([new Uint8Array(1024 * 1024 + 1)], { type: "image/png" }),
      "large.png",
    );
    const response = await globalThis.fetch(url, { method: "POST", body: form });
    assert.equal(response.status, 413);
    assert.deepEqual(await response.json(), { code: "FILE_TOO_LARGE" });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
