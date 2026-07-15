import {
  getPublicCacheTagsForRevalidation,
  publicRevalidationRequestSchema,
  type PublicRevalidationRequest,
} from "@portfolio/shared";

import { env } from "../config/env";

export type { PublicRevalidationRequest } from "@portfolio/shared";

const REVALIDATE_TIMEOUT_MS = 5_000;

export const revalidatePublicCache = async (
  request: PublicRevalidationRequest,
  context: string,
): Promise<boolean> => {
  if (!env.FRONTEND_REVALIDATE_URL || !env.FRONTEND_REVALIDATE_SECRET) {
    console.info(
      `Public cache revalidation skipped after ${context}: frontend revalidation env is not configured.`,
    );
    return false;
  }

  const parsed = publicRevalidationRequestSchema.safeParse(request);

  if (!parsed.success) {
    console.warn(
      `Public cache revalidation skipped after ${context}: invalid operation payload.`,
    );
    return false;
  }

  const tags = getPublicCacheTagsForRevalidation(parsed.data);
  if (tags.length === 0) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REVALIDATE_TIMEOUT_MS);

  try {
    const response = await fetch(env.FRONTEND_REVALIDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.FRONTEND_REVALIDATE_SECRET}`,
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `Public cache revalidation failed after ${context}: ${parsed.data.entity}/${parsed.data.action} returned status ${response.status}.`,
      );
      return false;
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.warn(
      `Public cache revalidation request failed after ${context}: ${parsed.data.entity}/${parsed.data.action}: ${message}`,
    );
    return false;
  } finally {
    clearTimeout(timeout);
  }
};
