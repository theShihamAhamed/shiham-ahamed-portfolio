import "server-only";

import { getVisibleProjects } from "@/lib/server/repositories/project.repository";

export const getProjectsPageData = getVisibleProjects;
