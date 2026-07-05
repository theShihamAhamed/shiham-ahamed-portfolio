import { env } from "../config/env";

export const PUBLIC_CACHE_TAGS = {
  siteSettings: "site-settings",
  projects: "projects",
  featuredProjects: "featured-projects",
  projectDetail: "project-detail",
  certifications: "certifications",
  achievements: "achievements",
  currentlyBuilding: "currently-building",
} as const;

export type PublicCacheTag =
  (typeof PUBLIC_CACHE_TAGS)[keyof typeof PUBLIC_CACHE_TAGS];

const REVALIDATE_TIMEOUT_MS = 5_000;

export const revalidatePublicCache = async (
  tags: readonly PublicCacheTag[],
  context: string,
): Promise<void> => {
  if (!env.FRONTEND_REVALIDATE_URL || !env.FRONTEND_REVALIDATE_SECRET) {
    console.info(
      `Public cache revalidation skipped after ${context}: frontend revalidation env is not configured.`,
    );
    return;
  }

  const uniqueTags = Array.from(new Set(tags));

  if (uniqueTags.length === 0) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REVALIDATE_TIMEOUT_MS);

  try {
    const response = await fetch(env.FRONTEND_REVALIDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.FRONTEND_REVALIDATE_SECRET}`,
      },
      body: JSON.stringify({ tags: uniqueTags }),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.warn(
        `Public cache revalidation failed after ${context}: status ${response.status}.`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.warn(
      `Public cache revalidation request failed after ${context}: ${message}`,
    );
  } finally {
    clearTimeout(timeout);
  }
};
