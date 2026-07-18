import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_TIMEOUT_MS = 10_000;
const REVALIDATION_PATH = "/api/revalidate";
const MANUAL_REQUEST = Object.freeze({ group: "all" });

class ManualRevalidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ManualRevalidationError";
  }
}

const requireEnvironmentValue = (environment, name) => {
  const value = environment[name]?.trim();
  if (!value) {
    throw new ManualRevalidationError(`${name} is required.`);
  }
  return value;
};

const parseRevalidationUrl = (value) => {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ManualRevalidationError(
      "MANUAL_REVALIDATE_URL must be a valid URL.",
    );
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ManualRevalidationError(
      "MANUAL_REVALIDATE_URL must use HTTP or HTTPS.",
    );
  }

  if (url.username || url.password) {
    throw new ManualRevalidationError(
      "MANUAL_REVALIDATE_URL must not include credentials.",
    );
  }

  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  if (pathname !== REVALIDATION_PATH || url.search || url.hash) {
    throw new ManualRevalidationError(
      "MANUAL_REVALIDATE_URL must target /api/revalidate without a query or hash.",
    );
  }

  return url.toString();
};

const parseResponseJson = (rawBody) => {
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new ManualRevalidationError(
      "The revalidation endpoint returned invalid JSON.",
    );
  }
};

const getSuccessfulTags = (payload) => {
  if (!payload || typeof payload !== "object") return undefined;

  const revalidated = payload.revalidated;
  if (
    payload.success !== true ||
    !revalidated ||
    typeof revalidated !== "object" ||
    revalidated.group !== "all" ||
    !Array.isArray(revalidated.tags) ||
    revalidated.tags.length === 0 ||
    revalidated.tags.some((tag) => typeof tag !== "string") ||
    new Set(revalidated.tags).size !== revalidated.tags.length
  ) {
    return undefined;
  }

  return revalidated.tags;
};

export const revalidateAllPublicCaches = async ({
  environment = process.env,
  fetchImpl = globalThis.fetch,
  logger = console,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  createAbortController = () => new AbortController(),
  setTimeoutImpl = setTimeout,
  clearTimeoutImpl = clearTimeout,
} = {}) => {
  const targetUrl = parseRevalidationUrl(
    requireEnvironmentValue(environment, "MANUAL_REVALIDATE_URL"),
  );
  const secret = requireEnvironmentValue(environment, "REVALIDATE_SECRET");
  const controller = createAbortController();
  const timeout = setTimeoutImpl(() => controller.abort(), timeoutMs);

  logger.log(`Revalidating public caches at ${targetUrl}`);

  let response;
  let rawBody;
  try {
    response = await fetchImpl(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify(MANUAL_REQUEST),
      redirect: "error",
      signal: controller.signal,
    });
    rawBody = await response.text();
  } catch (error) {
    const timedOut =
      controller.signal.aborted ||
      (error && typeof error === "object" && error.name === "AbortError");
    throw new ManualRevalidationError(
      timedOut
        ? "The cache revalidation request timed out."
        : "The cache revalidation request could not be completed. Check the target and network connection.",
    );
  } finally {
    clearTimeoutImpl(timeout);
  }

  if (!response.ok) {
    throw new ManualRevalidationError(
      `Cache revalidation failed with HTTP ${response.status}.`,
    );
  }

  const payload = parseResponseJson(rawBody);
  const tags = getSuccessfulTags(payload);
  if (!tags) {
    throw new ManualRevalidationError(
      "The revalidation endpoint returned an unexpected success response.",
    );
  }

  logger.log("Public cache revalidation succeeded.");
  logger.log(`Invalidated ${tags.length} tag${tags.length === 1 ? "" : "s"}:`);
  tags.forEach((tag) => logger.log(`- ${tag}`));

  return { targetUrl, tags: [...tags] };
};

export const runManualRevalidationCli = async (dependencies = {}) => {
  const logger = dependencies.logger ?? console;

  try {
    await revalidateAllPublicCaches({ ...dependencies, logger });
    return 0;
  } catch (error) {
    logger.error(
      error instanceof ManualRevalidationError
        ? error.message
        : "Cache revalidation failed unexpectedly.",
    );
    return 1;
  }
};

const isDirectExecution = Boolean(
  process.argv[1] &&
    pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url,
);

if (isDirectExecution) {
  process.exitCode = await runManualRevalidationCli();
}
