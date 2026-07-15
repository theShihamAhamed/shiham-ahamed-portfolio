import "server-only";

import { cache } from "react";

import {
  getProjectBySlug,
  getVisibleProjects,
} from "@/lib/server/repositories/project.repository";
import type { PublicProject } from "@portfolio/shared";

export type ProjectDetailData = {
  project: PublicProject;
  relatedProjects: PublicProject[];
  relatedProjectsError?: string;
};

export const getProjectForRequest = cache(getProjectBySlug);

export const getProjectDetailData = cache(
  async (slug: string): Promise<ProjectDetailData | null> => {
    const project = await getProjectForRequest(slug);
    if (!project) return null;

    try {
      const visibleProjects = await getVisibleProjects();

      return {
        project,
        relatedProjects: visibleProjects
          .filter((item) => item.slug !== project.slug)
          .slice(0, 3),
      };
    } catch (error) {
      console.error("Failed to load related project data", error);

      return {
        project,
        relatedProjects: [],
        relatedProjectsError: "Related projects are temporarily unavailable.",
      };
    }
  },
);
