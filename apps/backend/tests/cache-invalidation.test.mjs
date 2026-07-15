/* global Response */

import assert from "node:assert/strict";
import process from "node:process";
import test from "node:test";

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
  MAX_UPLOAD_SIZE_MB: "8",
  AUTH_COOKIE_SAME_SITE: "lax",
  AUTH_COOKIE_SECURE: "false",
  TRUST_PROXY: "false",
};

for (const [key, value] of Object.entries(testEnvironment)) {
  process.env[key] ??= value;
}

const { createPublicCacheInvalidator } = await import(
  "../dist/lib/revalidate-public-cache.js"
);

const request = { entity: "currentlyBuilding", action: "update" };
const successResponse = () =>
  new Response(
    JSON.stringify({
      success: true,
      revalidated: {
        entity: request.entity,
        action: request.action,
        tags: ["currently-building"],
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

const responseForStatus = (status, headers = {}) =>
  new Response("", { status, headers });

const createLogger = () => {
  const entries = [];
  const logger = Object.fromEntries(
    ["debug", "info", "warn", "error"].map((level) => [
      level,
      (entry) => entries.push({ level, entry }),
    ]),
  );
  return { entries, logger };
};

const createInvalidator = (fetchImpl, overrides = {}) => {
  const { entries, logger } = createLogger();
  const delays = [];
  const invalidator = createPublicCacheInvalidator({
    config: {
      url: "https://portfolio.example/api/revalidate",
      secret: "s".repeat(32),
    },
    fetchImpl,
    logger,
    sleep: async (durationMs) => delays.push(durationMs),
    ...overrides,
  });
  return { delays, entries, invalidator };
};

test("cache invalidation succeeds on the first attempt and validates the response", async () => {
  let calls = 0;
  const { entries, invalidator } = createInvalidator(async (_url, init) => {
    calls += 1;
    assert.equal(init.method, "POST");
    assert.equal(init.headers.Authorization, `Bearer ${"s".repeat(32)}`);
    return successResponse();
  });

  const result = await invalidator(request, "test success");

  assert.equal(calls, 1);
  assert.equal(result.success, true);
  assert.equal(result.attempts, 1);
  assert.deepEqual(result.invalidatedTags, ["currently-building"]);
  assert.equal(entries.at(-1).entry.success, true);
});

test("retryable HTTP failures use bounded delays and stop after success", async () => {
  const statuses = [500, 429, 200];
  const { delays, invalidator } = createInvalidator(async () => {
    const status = statuses.shift();
    return status === 200 ? successResponse() : responseForStatus(status);
  });

  const result = await invalidator(request, "test retries");

  assert.equal(result.success, true);
  assert.equal(result.attempts, 3);
  assert.deepEqual(delays, [300, 1_000]);
});

test("Retry-After is respected but bounded", async () => {
  const { delays, invalidator } = createInvalidator(async () => {
    if (delays.length === 0) {
      return responseForStatus(503, { "Retry-After": "0.1" });
    }
    return successResponse();
  });

  const result = await invalidator(request, "test retry-after");

  assert.equal(result.success, true);
  assert.deepEqual(delays, [100]);
});

test("network errors and timeouts retry three times", async () => {
  let networkCalls = 0;
  const network = createInvalidator(async () => {
    networkCalls += 1;
    throw new TypeError("network failure");
  });
  const networkResult = await network.invalidator(request, "test network");
  assert.equal(networkCalls, 3);
  assert.equal(networkResult.success, false);
  assert.equal(networkResult.errorType, "network_error");
  assert.equal(networkResult.attempts, 3);

  let timeoutCalls = 0;
  const timeout = createInvalidator(
    async (_url, init) => {
      timeoutCalls += 1;
      return new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => {
          const error = new Error("aborted");
          error.name = "AbortError";
          reject(error);
        });
      });
    },
    { timeoutMs: 1 },
  );
  const timeoutResult = await timeout.invalidator(request, "test timeout");
  assert.equal(timeoutCalls, 3);
  assert.equal(timeoutResult.success, false);
  assert.equal(timeoutResult.errorType, "timeout");
  assert.equal(timeoutResult.attempts, 3);
});

test("non-retryable HTTP statuses make one attempt", async (t) => {
  for (const status of [400, 401, 403, 404, 413, 415, 422]) {
    await t.test(`status ${status}`, async () => {
      let calls = 0;
      const { delays, invalidator } = createInvalidator(async () => {
        calls += 1;
        return responseForStatus(status);
      });
      const result = await invalidator(request, `test status ${status}`);
      assert.equal(calls, 1);
      assert.deepEqual(delays, []);
      assert.equal(result.success, false);
      assert.equal(result.attempts, 1);
      assert.equal(
        result.errorType,
        status === 401 || status === 403 ? "unauthorized" : "validation_error",
      );
    });
  }
});

test("malformed success responses fail without a retry", async () => {
  let calls = 0;
  const { delays, invalidator } = createInvalidator(async () => {
    calls += 1;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  });

  const result = await invalidator(request, "test malformed response");

  assert.equal(calls, 1);
  assert.deepEqual(delays, []);
  assert.equal(result.success, false);
  assert.equal(result.errorType, "unexpected_response");
});

test("missing configuration is observable without a network request", async () => {
  let calls = 0;
  const { logger } = createLogger();
  const invalidator = createPublicCacheInvalidator({
    config: {},
    fetchImpl: async () => {
      calls += 1;
      return successResponse();
    },
    logger,
  });

  const result = await invalidator(request, "test missing config");

  assert.equal(calls, 0);
  assert.equal(result.success, false);
  assert.equal(result.errorType, "not_configured");
});

test("logs never contain the bearer secret or authorization header", async () => {
  const secret = "s".repeat(32);
  const { entries, invalidator } = createInvalidator(async () => responseForStatus(401));
  await invalidator(request, "test secret logging");
  const serialized = JSON.stringify(entries);
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes("Authorization"), false);
});
