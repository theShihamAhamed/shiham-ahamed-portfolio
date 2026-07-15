import type { MetadataRoute } from "next";

import { getCanonicalUrl } from "@/lib/seo";
import { getVisibleProjects } from "@/lib/server/repositories/project.repository";

export const revalidate = 86400;

const publicRoutes = ["/", "/about", "/projects", "/contact"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = publicRoutes.map((pathname) => ({
    url: getCanonicalUrl(pathname).toString(),
  }));

  try {
    const projects = await getVisibleProjects();
    const projectEntries = projects.map((project) => ({
      url: getCanonicalUrl(`/projects/${project.slug}`).toString(),
      lastModified: new Date(project.updatedAt),
    }));

    return [...staticEntries, ...projectEntries];
  } catch (error) {
    console.error("Failed to build project sitemap entries", error);
    return staticEntries;
  }
}
