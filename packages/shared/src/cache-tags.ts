import { z } from "zod";

import { slugPattern } from "./slug";

export const PUBLIC_CACHE_TAGS = {
  siteSettings: "site-settings",
  projects: "projects",
  featuredProjects: "featured-projects",
  projectDetail: "project-detail",
  certifications: "certifications",
  achievements: "achievements",
  currentlyBuilding: "currently-building",
} as const;

export const PUBLIC_CACHE_TAG_VALUES = [
  PUBLIC_CACHE_TAGS.siteSettings,
  PUBLIC_CACHE_TAGS.projects,
  PUBLIC_CACHE_TAGS.featuredProjects,
  PUBLIC_CACHE_TAGS.projectDetail,
  PUBLIC_CACHE_TAGS.certifications,
  PUBLIC_CACHE_TAGS.achievements,
  PUBLIC_CACHE_TAGS.currentlyBuilding,
] as const;

export type StaticPublicCacheTag = (typeof PUBLIC_CACHE_TAG_VALUES)[number];
export type ProjectDetailCacheTag = `${typeof PUBLIC_CACHE_TAGS.projectDetail}:${string}`;
export type PublicCacheTag = StaticPublicCacheTag | ProjectDetailCacheTag;

export const PUBLIC_CACHE_GROUPS = {
  all: PUBLIC_CACHE_TAG_VALUES,
  projects: [
    PUBLIC_CACHE_TAGS.projects,
    PUBLIC_CACHE_TAGS.featuredProjects,
    PUBLIC_CACHE_TAGS.projectDetail,
  ],
  about: [PUBLIC_CACHE_TAGS.certifications, PUBLIC_CACHE_TAGS.achievements],
  profile: [PUBLIC_CACHE_TAGS.siteSettings],
  currentlyBuilding: [PUBLIC_CACHE_TAGS.currentlyBuilding],
} as const satisfies Record<string, readonly StaticPublicCacheTag[]>;

export const PUBLIC_CACHE_GROUP_NAMES = [
  "all",
  "projects",
  "about",
  "profile",
  "currentlyBuilding",
] as const;
export type PublicCacheGroup = (typeof PUBLIC_CACHE_GROUP_NAMES)[number];

export const normalizeProjectCacheSlug = (value: string): string | undefined => {
  const normalized = value.trim().toLowerCase();
  return slugPattern.test(normalized) ? normalized : undefined;
};

export const getProjectDetailCacheTag = (
  slug: string,
): ProjectDetailCacheTag | undefined => {
  const normalizedSlug = normalizeProjectCacheSlug(slug);
  return normalizedSlug
    ? `${PUBLIC_CACHE_TAGS.projectDetail}:${normalizedSlug}`
    : undefined;
};

export const isPublicCacheTag = (value: string): value is PublicCacheTag => {
  if ((PUBLIC_CACHE_TAG_VALUES as readonly string[]).includes(value)) return true;

  const prefix = `${PUBLIC_CACHE_TAGS.projectDetail}:`;
  return value.startsWith(prefix) && Boolean(normalizeProjectCacheSlug(value.slice(prefix.length)));
};

export const PUBLIC_REVALIDATION_ENTITIES = [
  "project",
  "certification",
  "achievement",
  "currentlyBuilding",
  "siteSettings",
] as const;
export const PUBLIC_REVALIDATION_ACTIONS = ["create", "update", "delete"] as const;

export type PublicRevalidationEntity = (typeof PUBLIC_REVALIDATION_ENTITIES)[number];
export type PublicRevalidationAction = (typeof PUBLIC_REVALIDATION_ACTIONS)[number];

export const publicRevalidationRequestSchema = z
  .object({
    entity: z.enum(PUBLIC_REVALIDATION_ENTITIES),
    action: z.enum(PUBLIC_REVALIDATION_ACTIONS),
    slug: z.string().trim().optional(),
    previousSlug: z.string().trim().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const isProject = value.entity === "project";

    if (!isProject && (value.slug || value.previousSlug)) {
      context.addIssue({
        code: "custom",
        path: ["slug"],
        message: "Only project revalidation accepts slugs.",
      });
    }

    if (isProject) {
      if (!value.slug || !slugPattern.test(value.slug)) {
        context.addIssue({
          code: "custom",
          path: ["slug"],
          message: "A valid project slug is required.",
        });
      }

      if (value.previousSlug && !slugPattern.test(value.previousSlug)) {
        context.addIssue({
          code: "custom",
          path: ["previousSlug"],
          message: "Previous project slug must be valid.",
        });
      }

      if (value.action !== "update" && value.previousSlug) {
        context.addIssue({
          code: "custom",
          path: ["previousSlug"],
          message: "Previous project slug is only valid for updates.",
        });
      }
    }
  });

export type PublicRevalidationRequest = z.infer<
  typeof publicRevalidationRequestSchema
>;

const unique = (tags: PublicCacheTag[]): PublicCacheTag[] =>
  Array.from(new Set(tags));

export const getPublicCacheTagsForRevalidation = (
  request: PublicRevalidationRequest,
): PublicCacheTag[] => {
  switch (request.entity) {
    case "project": {
      const detailTags = [
        getProjectDetailCacheTag(request.slug ?? ""),
        getProjectDetailCacheTag(request.previousSlug ?? ""),
      ].filter((tag): tag is ProjectDetailCacheTag => Boolean(tag));

      return unique([
        PUBLIC_CACHE_TAGS.projects,
        PUBLIC_CACHE_TAGS.featuredProjects,
        PUBLIC_CACHE_TAGS.projectDetail,
        ...detailTags,
      ]);
    }
    case "certification":
      return [PUBLIC_CACHE_TAGS.certifications];
    case "achievement":
      return [PUBLIC_CACHE_TAGS.achievements];
    case "currentlyBuilding":
      return [PUBLIC_CACHE_TAGS.currentlyBuilding];
    case "siteSettings":
      return [PUBLIC_CACHE_TAGS.siteSettings];
  }
};
