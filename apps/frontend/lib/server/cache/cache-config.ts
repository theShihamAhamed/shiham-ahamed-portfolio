import "server-only";

export const PUBLIC_REVALIDATE_SECONDS = {
  projects: 60 * 60,
  about: 6 * 60 * 60,
  currentlyBuilding: 60 * 60,
  siteSettings: 60 * 60,
} as const;

export const PUBLIC_CACHE_KEYS = {
  projects: ["public", "projects", "visible"] as const,
  featuredProjects: ["public", "projects", "featured"] as const,
  certifications: ["public", "about", "certifications"] as const,
  achievements: ["public", "about", "achievements"] as const,
  currentlyBuilding: ["public", "currently-building", "visible"] as const,
  siteSettings: ["public", "site-settings", "primary"] as const,
} as const;

export const getProjectDetailCacheKey = (slug: string) => [
  "public",
  "projects",
  "detail",
  slug,
] as const;
