import {
  getPublicCacheTagsForRevalidation,
  publicRevalidationRequestSchema,
  type PublicRevalidationRequest,
} from "@portfolio/shared";

import { env } from "../config/env";

export type { PublicRevalidationRequest } from "@portfolio/shared";

export type CacheInvalidationErrorType =
  | "not_configured"
  | "timeout"
  | "network_error"
  | "unauthorized"
  | "validation_error"
  | "server_error"
  | "unexpected_response";

export type CacheInvalidationResult =
  | {
      success: true;
      attempts: number;
      statusCode: number;
      durationMs: number;
      invalidatedTags: string[];
    }
  | {
      success: false;
      attempts: number;
      durationMs: number;
      errorType: CacheInvalidationErrorType;
      statusCode?: number;
      message: string;
    };

type CacheInvalidationConfig = {
  url?: string;
  secret?: string;
};

type CacheInvalidationLogger = Pick<Console, "debug" | "info" | "warn" | "error">;

type CacheInvalidationDependencies = {
  config?: CacheInvalidationConfig;
  fetchImpl?: typeof fetch;
  sleep?: (durationMs: number) => Promise<void>;
  now?: () => number;
  setTimeoutImpl?: typeof setTimeout;
  clearTimeoutImpl?: typeof clearTimeout;
  logger?: CacheInvalidationLogger;
  timeoutMs?: number;
  maxAttempts?: number;
};

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [300, 1_000] as const;
const MAX_RETRY_AFTER_MS = 2_000;

const safeMessages: Record<CacheInvalidationErrorType, string> = {
  not_configured: "Public cache revalidation is not configured.",
  timeout: "Public cache revalidation timed out.",
  network_error: "Public cache revalidation could not reach the frontend.",
  unauthorized: "The frontend rejected the cache revalidation request.",
  validation_error: "The frontend rejected the cache revalidation operation.",
  server_error: "The frontend cache revalidation service returned an error.",
  unexpected_response: "The frontend returned an unexpected cache revalidation response.",
};

const wait = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));

const getErrorName = (error: unknown) =>
  error && typeof error === "object" && "name" in error
    ? String(error.name)
    : undefined;

const isRetryableStatus = (statusCode: number) =>
  statusCode === 408 || statusCode === 429 || statusCode >= 500;

const getNonRetryableErrorType = (
  statusCode: number,
): CacheInvalidationErrorType => {
  if (statusCode === 401 || statusCode === 403) return "unauthorized";
  if (statusCode >= 400 && statusCode < 500) return "validation_error";
  return "unexpected_response";
};

const getRetryAfterMs = (response: Response): number | undefined => {
  const value = response.headers.get("retry-after")?.trim();
  if (!value) return undefined;

  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(MAX_RETRY_AFTER_MS, seconds * 1_000);
  }

  const timestamp = Date.parse(value);
  if (!Number.isNaN(timestamp)) {
    return Math.min(MAX_RETRY_AFTER_MS, Math.max(0, timestamp - Date.now()));
  }

  return undefined;
};

const isSuccessfulResponse = (value: unknown, expectedTags: string[]) => {
  if (!value || typeof value !== "object") return false;
  const payload = value as {
    success?: unknown;
    revalidated?: { tags?: unknown };
  };

  if (payload.success !== true || !Array.isArray(payload.revalidated?.tags)) {
    return false;
  }

  const tags = payload.revalidated.tags;
  return (
    tags.length === expectedTags.length &&
    tags.every((tag, index) => tag === expectedTags[index])
  );
};

const getRequestFields = (request: PublicRevalidationRequest) => ({
  entity: request.entity,
  action: request.action,
  ...(request.slug ? { slug: request.slug } : {}),
  ...(request.previousSlug ? { previousSlug: request.previousSlug } : {}),
});

const logFailure = (
  logger: CacheInvalidationLogger,
  errorType: CacheInvalidationErrorType,
  context: string,
  request: PublicRevalidationRequest,
  attempts: number,
  maximumAttempts: number,
  durationMs: number,
  statusCode?: number,
): CacheInvalidationResult => {
  const result: CacheInvalidationResult = {
    success: false,
    attempts,
    durationMs,
    errorType,
    ...(statusCode === undefined ? {} : { statusCode }),
    message: safeMessages[errorType],
  };
  logger.error({
    event: "public_cache_invalidation",
    context,
    ...getRequestFields(request),
    attempt: attempts,
    maximumAttempts,
    ...(statusCode === undefined ? {} : { statusCode }),
    durationMs,
    errorType,
    success: false,
  });
  return result;
};

export const createPublicCacheInvalidator = (
  dependencies: CacheInvalidationDependencies = {},
) => {
  const config = dependencies.config ?? {
    url: env.FRONTEND_REVALIDATE_URL,
    secret: env.FRONTEND_REVALIDATE_SECRET,
  };
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const sleep = dependencies.sleep ?? wait;
  const now = dependencies.now ?? Date.now;
  const setTimeoutImpl = dependencies.setTimeoutImpl ?? setTimeout;
  const clearTimeoutImpl = dependencies.clearTimeoutImpl ?? clearTimeout;
  const logger = dependencies.logger ?? console;
  const timeoutMs = dependencies.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = dependencies.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  return async (
    request: PublicRevalidationRequest,
    context: string,
  ): Promise<CacheInvalidationResult> => {
    const startedAt = now();
    const parsed = publicRevalidationRequestSchema.safeParse(request);

    if (!parsed.success) {
      return logFailure(logger, "validation_error", context, request, 0, maxAttempts, now() - startedAt);
    }

    if (!config.url || !config.secret) {
      return logFailure(logger, "not_configured", context, parsed.data, 0, maxAttempts, now() - startedAt);
    }

    const tags = getPublicCacheTagsForRevalidation(parsed.data);
    if (tags.length === 0) {
      return logFailure(logger, "validation_error", context, parsed.data, 0, maxAttempts, now() - startedAt);
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeoutImpl(() => controller.abort(), timeoutMs);

      try {
        const response = await fetchImpl(config.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${config.secret}`,
          },
          body: JSON.stringify(parsed.data),
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          const timeoutError = new Error("Cache revalidation request timed out.");
          timeoutError.name = "AbortError";
          throw timeoutError;
        }

        if (response.ok) {
          let payload: unknown;
          try {
            payload = await response.json();
          } catch {
            payload = undefined;
          }

          if (!isSuccessfulResponse(payload, tags)) {
            return logFailure(logger, "unexpected_response", context, parsed.data, attempt, maxAttempts, now() - startedAt, response.status);
          }

          const result: CacheInvalidationResult = {
            success: true,
            attempts: attempt,
            statusCode: response.status,
            durationMs: now() - startedAt,
            invalidatedTags: tags,
          };
          logger.info({
            event: "public_cache_invalidation",
            context,
            ...getRequestFields(parsed.data),
            attempt,
            maximumAttempts: maxAttempts,
            statusCode: response.status,
            durationMs: result.durationMs,
            success: true,
          });
          return result;
        }

        if (!isRetryableStatus(response.status) || attempt >= maxAttempts) {
          const errorType = isRetryableStatus(response.status)
            ? "server_error"
            : getNonRetryableErrorType(response.status);
          return logFailure(logger, errorType, context, parsed.data, attempt, maxAttempts, now() - startedAt, response.status);
        }

        logger.warn({
          event: "public_cache_invalidation",
          context,
          ...getRequestFields(parsed.data),
          attempt,
          maximumAttempts: maxAttempts,
          statusCode: response.status,
          errorType: "server_error",
          success: false,
        });
        await sleep(getRetryAfterMs(response) ?? RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS[1]);
      } catch (error) {
        const errorType: CacheInvalidationErrorType =
          getErrorName(error) === "AbortError" ? "timeout" : "network_error";

        if (attempt >= maxAttempts) {
          return logFailure(logger, errorType, context, parsed.data, attempt, maxAttempts, now() - startedAt);
        }

        logger.warn({
          event: "public_cache_invalidation",
          context,
          ...getRequestFields(parsed.data),
          attempt,
          maximumAttempts: maxAttempts,
          errorType,
          success: false,
        });
        await sleep(RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS[1]);
      } finally {
        clearTimeoutImpl(timeout);
      }
    }

    return logFailure(logger, "unexpected_response", context, parsed.data, maxAttempts, maxAttempts, now() - startedAt);
  };
};

export const revalidatePublicCache = createPublicCacheInvalidator();
