import { PublicApiError } from "@/lib/api/client";
import {
  getFeaturedProjectsFromMongo,
  getProjectBySlugFromMongo,
  getVisibleProjectsFromMongo,
} from "@/lib/server/public-data/projects";

export const getPublicFeaturedProjects = getFeaturedProjectsFromMongo;

export const getPublicVisibleProjects = getVisibleProjectsFromMongo;

export const getPublicProjectBySlug = async (slug: string) => {
  const project = await getProjectBySlugFromMongo(slug);

  if (!project) {
    throw new PublicApiError({
      status: 404,
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
    });
  }

  return project;
};
