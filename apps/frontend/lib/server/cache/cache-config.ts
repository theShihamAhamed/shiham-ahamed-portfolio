import "server-only";

export const PUBLIC_REVALIDATE_SECONDS = {
  projects: 86_400,
  about: 86_400,
  currentlyBuilding: 86_400,
  siteSettings: 86_400,
  sitemap: 86_400,
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
