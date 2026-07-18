import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(process.cwd(), "../..");
const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

test("frontend revalidation route keeps the protected canonical contract", () => {
  const source = read("apps/frontend/app/api/revalidate/route.ts");

  assert.match(source, /timingSafeEqual/);
  assert.match(source, /Cache-Control.*no-store/);
  assert.match(source, /application\/json/);
  assert.match(source, /MAX_BODY_BYTES/);
  assert.match(source, /publicRevalidationOperationSchema/);
  assert.match(source, /getPublicCacheTagsForRevalidation/);
  assert.match(source, /"group" in parsed\.data/);
  assert.match(source, /revalidateTag\(tag, \{ expire: 0 \}\)/);
  assert.doesNotMatch(source, /revalidatePath/);
  assert.doesNotMatch(source, /body\.tags|body\.paths|request\.tags|request\.paths/);
});

test("manual cache package command targets the guarded native script", () => {
  const packageJson = JSON.parse(read("package.json"));
  const script = packageJson.scripts?.["cache:revalidate"];

  assert.equal(
    script,
    "node --env-file=apps/frontend/.env.local scripts/revalidate-public-cache.mjs",
  );
  assert.equal(
    fs.existsSync(path.join(root, "scripts/revalidate-public-cache.mjs")),
    true,
  );
});

const scriptUrl = pathToFileURL(
  path.join(root, "scripts/revalidate-public-cache.mjs"),
).href;

const createLogger = () => {
  const output = [];
  return {
    output,
    logger: {
      log: (...values) => output.push(values.join(" ")),
      error: (...values) => output.push(values.join(" ")),
    },
  };
};

test("importing the manual cache script does not perform a request", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("unexpected request");
  };

  try {
    await import(`${scriptUrl}?import-safety`);
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("manual cache script sends the exact protected all-group request", async () => {
  const { runManualRevalidationCli } = await import(scriptUrl);
  const secret = "s".repeat(32);
  const { logger, output } = createLogger();
  let captured;

  const exitCode = await runManualRevalidationCli({
    environment: {
      MANUAL_REVALIDATE_URL: "http://localhost:3000/api/revalidate",
      REVALIDATE_SECRET: secret,
    },
    fetchImpl: async (url, init) => {
      captured = { url, init };
      return new Response(
        JSON.stringify({
          success: true,
          revalidated: {
            group: "all",
            tags: ["site-settings", "projects"],
          },
        }),
        { status: 200 },
      );
    },
    logger,
  });

  assert.equal(exitCode, 0);
  assert.equal(captured.url, "http://localhost:3000/api/revalidate");
  assert.equal(captured.init.method, "POST");
  assert.equal(captured.init.headers["Content-Type"], "application/json");
  assert.equal(captured.init.headers.Authorization, `Bearer ${secret}`);
  assert.equal(captured.init.body, JSON.stringify({ group: "all" }));
  assert.equal(captured.init.redirect, "error");
  assert.match(
    output.join("\n"),
    /Invalidated 2 tags:[\s\S]*site-settings[\s\S]*projects/,
  );
});

test("manual cache script rejects missing and invalid configuration", async (t) => {
  const { runManualRevalidationCli } = await import(scriptUrl);
  const cases = [
    ["missing URL", { REVALIDATE_SECRET: "s".repeat(32) }],
    [
      "missing secret",
      { MANUAL_REVALIDATE_URL: "http://localhost:3000/api/revalidate" },
    ],
    [
      "invalid URL",
      {
        MANUAL_REVALIDATE_URL: "not-a-url",
        REVALIDATE_SECRET: "s".repeat(32),
      },
    ],
    [
      "query",
      {
        MANUAL_REVALIDATE_URL: "http://localhost:3000/api/revalidate?x=1",
        REVALIDATE_SECRET: "s".repeat(32),
      },
    ],
    [
      "hash",
      {
        MANUAL_REVALIDATE_URL: "http://localhost:3000/api/revalidate#x",
        REVALIDATE_SECRET: "s".repeat(32),
      },
    ],
    [
      "wrong path",
      {
        MANUAL_REVALIDATE_URL: "http://localhost:3000/projects",
        REVALIDATE_SECRET: "s".repeat(32),
      },
    ],
    [
      "URL credentials",
      {
        MANUAL_REVALIDATE_URL: "http://user:password@localhost:3000/api/revalidate",
        REVALIDATE_SECRET: "s".repeat(32),
      },
    ],
  ];

  for (const [name, environment] of cases) {
    await t.test(name, async () => {
      let calls = 0;
      const { logger } = createLogger();
      const exitCode = await runManualRevalidationCli({
        environment,
        fetchImpl: async () => {
          calls += 1;
          throw new Error("should not run");
        },
        logger,
      });
      assert.equal(exitCode, 1);
      assert.equal(calls, 0);
    });
  }
});

test("manual cache script handles transport and response failures safely", async (t) => {
  const { runManualRevalidationCli } = await import(scriptUrl);
  const secret = "private-secret-".padEnd(32, "x");
  const environment = {
    MANUAL_REVALIDATE_URL: "http://localhost:3000/api/revalidate",
    REVALIDATE_SECRET: secret,
  };
  const malformedSuccesses = [
    "not-json",
    JSON.stringify({ success: true }),
    JSON.stringify({
      success: true,
      revalidated: { group: "all", tags: [] },
    }),
    JSON.stringify({
      success: true,
      revalidated: { group: "all", tags: ["projects", "projects"] },
    }),
    JSON.stringify({
      success: true,
      revalidated: { group: "all", tags: ["projects", 1] },
    }),
  ];

  const cases = [
    ["redirect", async () => new Response("", { status: 302 })],
    [
      "network",
      async () => {
        throw new TypeError("fetch failed");
      },
    ],
    [
      "non-2xx",
      async () =>
        new Response(JSON.stringify({ error: { message: secret } }), {
          status: 401,
        }),
    ],
    ...malformedSuccesses.map((body, index) => [
      `malformed success ${index + 1}`,
      async () => new Response(body, { status: 200 }),
    ]),
  ];

  for (const [name, fetchImpl] of cases) {
    await t.test(name, async () => {
      const { logger, output } = createLogger();
      const exitCode = await runManualRevalidationCli({
        environment,
        fetchImpl,
        logger,
      });
      assert.equal(exitCode, 1);
      assert.equal(output.join("\n").includes(secret), false);
    });
  }

  await t.test("timeout", async () => {
    const { logger } = createLogger();
    const exitCode = await runManualRevalidationCli({
      environment,
      fetchImpl: async (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            const error = new Error("aborted");
            error.name = "AbortError";
            reject(error);
          });
        }),
      logger,
      timeoutMs: 1,
    });
    assert.equal(exitCode, 1);
  });
});

test("public fallback TTLs and sitemap policy remain one day", () => {
  const config = read("apps/frontend/lib/server/cache/cache-config.ts");
  const sitemap = read("apps/frontend/app/sitemap.ts");

  assert.equal((config.match(/86_400/g) ?? []).length, 5);
  assert.match(sitemap, /export const revalidate = 86400/);
});
