import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { ProjectModel } from "@/lib/server/models/project";
import { serializePublicProject } from "@/lib/server/public-data/serializers";
import {
  getProjectDetailCacheTag,
  normalizeProjectCacheSlug,
  PUBLIC_CACHE_TAGS,
} from "@/lib/server/cache/cache-tags";
import {
  getProjectDetailCacheKey,
  PUBLIC_CACHE_KEYS,
  PUBLIC_REVALIDATE_SECONDS,
} from "@/lib/server/cache/cache-config";
import type { PublicProject } from "@portfolio/shared";

const maxFeaturedProjects = 6;

export const getVisibleProjectsUncached = async (): Promise<PublicProject[]> => {
  await connectMongo();

  const projects = await ProjectModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .exec();

  return projects.map(serializePublicProject);
};

export const getVisibleProjects = unstable_cache(
  getVisibleProjectsUncached,
  [...PUBLIC_CACHE_KEYS.projects],
  {
    tags: [PUBLIC_CACHE_TAGS.projects],
    revalidate: PUBLIC_REVALIDATE_SECONDS.projects,
  },
);

export const getFeaturedProjectsUncached = async (): Promise<PublicProject[]> => {
  await connectMongo();

  const projects = await ProjectModel.find({
    isVisible: true,
    isFeatured: true,
  })
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .limit(maxFeaturedProjects)
    .exec();

  return projects.map(serializePublicProject);
};

export const getFeaturedProjects = unstable_cache(
  getFeaturedProjectsUncached,
  [...PUBLIC_CACHE_KEYS.featuredProjects],
  {
    tags: [PUBLIC_CACHE_TAGS.projects, PUBLIC_CACHE_TAGS.featuredProjects],
    revalidate: PUBLIC_REVALIDATE_SECONDS.projects,
  },
);

export const getProjectBySlugUncached = async (
  slug: string,
): Promise<PublicProject | null> => {
  await connectMongo();

  const project = await ProjectModel.findOne({
    slug,
    isVisible: true,
  }).exec();

  return project ? serializePublicProject(project) : null;
};

const getCachedProjectBySlug = (slug: string) => {
  const detailTag = getProjectDetailCacheTag(slug);

  if (!detailTag) return async () => null;

  return unstable_cache(
    () => getProjectBySlugUncached(slug),
    [...getProjectDetailCacheKey(slug)],
    {
      tags: [PUBLIC_CACHE_TAGS.projects, PUBLIC_CACHE_TAGS.projectDetail, detailTag],
      revalidate: PUBLIC_REVALIDATE_SECONDS.projects,
    },
  );
};

export const getProjectBySlug = cache(
  async (slug: string): Promise<PublicProject | null> => {
    const normalizedSlug = normalizeProjectCacheSlug(slug);
    if (!normalizedSlug) return null;

    return getCachedProjectBySlug(normalizedSlug)();
  },
);
