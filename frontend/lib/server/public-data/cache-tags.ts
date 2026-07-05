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

export const PUBLIC_CACHE_TAG_VALUES = [
  PUBLIC_CACHE_TAGS.siteSettings,
  PUBLIC_CACHE_TAGS.projects,
  PUBLIC_CACHE_TAGS.featuredProjects,
  PUBLIC_CACHE_TAGS.projectDetail,
  PUBLIC_CACHE_TAGS.certifications,
  PUBLIC_CACHE_TAGS.achievements,
  PUBLIC_CACHE_TAGS.currentlyBuilding,
] as const satisfies readonly PublicCacheTag[];

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
} as const satisfies Record<string, readonly PublicCacheTag[]>;

export const PUBLIC_CACHE_GROUP_NAMES = [
  "all",
  "projects",
  "about",
  "profile",
  "currentlyBuilding",
] as const;

export type PublicCacheGroup = (typeof PUBLIC_CACHE_GROUP_NAMES)[number];

export const isPublicCacheTag = (value: string): value is PublicCacheTag =>
  (PUBLIC_CACHE_TAG_VALUES as readonly string[]).includes(value);
