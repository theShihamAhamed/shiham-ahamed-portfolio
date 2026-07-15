import "server-only";

export {
  getProjectDetailCacheTag,
  getPublicCacheTagsForRevalidation,
  isPublicCacheTag,
  normalizeProjectCacheSlug,
  PUBLIC_CACHE_GROUP_NAMES,
  PUBLIC_CACHE_GROUPS,
  PUBLIC_CACHE_TAGS,
  PUBLIC_CACHE_TAG_VALUES,
  publicRevalidationRequestSchema,
} from "@portfolio/shared";
export type {
  ProjectDetailCacheTag,
  PublicCacheGroup,
  PublicCacheTag,
  PublicRevalidationRequest,
} from "@portfolio/shared";
