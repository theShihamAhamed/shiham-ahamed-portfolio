import type { CacheInvalidationResult } from "../lib/revalidate-public-cache";

export const getCacheInvalidationResponseOptions = (
  message: string,
  cacheInvalidation: CacheInvalidationResult,
  meta: Record<string, unknown> = {},
) => ({
  message: cacheInvalidation.success
    ? message
    : `${message}, but the public cache refresh could not be confirmed`,
  meta: {
    ...meta,
    cacheInvalidation,
  },
});
