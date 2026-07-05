import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { ProjectModel } from "@/lib/server/models/project";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/public-data/cache-tags";
import { serializePublicProject } from "@/lib/server/public-data/serializers";

const maxFeaturedProjects = 6;
const projectRevalidateSeconds = 60 * 60;

export const getVisibleProjectsFromMongoUncached = async () => {
  await connectMongo();

  const projects = await ProjectModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();

  return projects.map(serializePublicProject);
};

export const getVisibleProjectsFromMongo = unstable_cache(
  getVisibleProjectsFromMongoUncached,
  ["public-visible-projects"],
  {
    tags: [PUBLIC_CACHE_TAGS.projects],
    revalidate: projectRevalidateSeconds,
  },
);

export const getFeaturedProjectsFromMongoUncached = async () => {
  await connectMongo();

  const projects = await ProjectModel.find({
    isVisible: true,
    isFeatured: true,
  })
    .sort({ displayOrder: 1, createdAt: -1 })
    .limit(maxFeaturedProjects)
    .exec();

  return projects.map(serializePublicProject);
};

export const getFeaturedProjectsFromMongo = unstable_cache(
  getFeaturedProjectsFromMongoUncached,
  ["public-featured-projects"],
  {
    tags: [PUBLIC_CACHE_TAGS.projects, PUBLIC_CACHE_TAGS.featuredProjects],
    revalidate: projectRevalidateSeconds,
  },
);

export const getProjectBySlugFromMongoUncached = async (slug: string) => {
  await connectMongo();

  const project = await ProjectModel.findOne({ slug, isVisible: true }).exec();

  return project ? serializePublicProject(project) : null;
};

export const getProjectBySlugFromMongo = unstable_cache(
  getProjectBySlugFromMongoUncached,
  ["public-project-by-slug"],
  {
    tags: [PUBLIC_CACHE_TAGS.projects, PUBLIC_CACHE_TAGS.projectDetail],
    revalidate: projectRevalidateSeconds,
  },
);
