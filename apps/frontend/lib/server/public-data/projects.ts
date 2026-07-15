import "server-only";

export {
  getFeaturedProjects,
  getFeaturedProjectsUncached,
  getProjectBySlug,
  getProjectBySlugUncached,
  getVisibleProjects,
  getVisibleProjectsUncached,
} from "@/lib/server/repositories/project.repository";

export {
  getFeaturedProjects as getFeaturedProjectsFromMongo,
  getFeaturedProjectsUncached as getFeaturedProjectsFromMongoUncached,
  getProjectBySlug as getProjectBySlugFromMongo,
  getProjectBySlugUncached as getProjectBySlugFromMongoUncached,
  getVisibleProjects as getVisibleProjectsFromMongo,
  getVisibleProjectsUncached as getVisibleProjectsFromMongoUncached,
} from "@/lib/server/repositories/project.repository";
