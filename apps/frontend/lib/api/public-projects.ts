import { PublicApiError } from "@/lib/api/client";
import {
  getFeaturedProjects,
  getProjectBySlug,
  getVisibleProjects,
} from "@/lib/server/repositories/project.repository";

export const getPublicFeaturedProjects = getFeaturedProjects;

export const getPublicVisibleProjects = getVisibleProjects;

export const getPublicProjectBySlug = async (slug: string) => {
  const project = await getProjectBySlug(slug);

  if (!project) {
    throw new PublicApiError({
      status: 404,
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
    });
  }

  return project;
};
