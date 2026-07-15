import "server-only";

import type {
  PublicCurrentlyBuildingItem,
  PublicProject,
  PublicSiteSettings,
} from "@portfolio/shared";

import { getVisibleCurrentlyBuilding } from "@/lib/server/repositories/currently-building.repository";
import { getFeaturedProjects } from "@/lib/server/repositories/project.repository";
import { getPublicSiteSettings } from "@/lib/server/repositories/site-settings.repository";

export type HomePageData = {
  siteSettings: PublicSiteSettings | null;
  featuredProjects: PublicProject[];
  currentlyBuilding: PublicCurrentlyBuildingItem[];
  errors: {
    siteSettings?: string;
    featuredProjects?: string;
    currentlyBuilding?: string;
  };
};

const getSettledValue = <T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  context: string,
  message: string,
): { value: T; error?: string } => {
  if (result.status === "fulfilled") return { value: result.value };

  console.error(context, result.reason);
  return { value: fallback, error: message };
};

export const getHomePageData = async (): Promise<HomePageData> => {
  const [siteSettingsResult, featuredProjectsResult, currentlyBuildingResult] =
    await Promise.allSettled([
      getPublicSiteSettings(),
      getFeaturedProjects(),
      getVisibleCurrentlyBuilding(),
    ]);

  const siteSettings = getSettledValue(
    siteSettingsResult,
    null,
    "Failed to load home site settings",
    "Hero settings are temporarily unavailable.",
  );
  const featuredProjects = getSettledValue(
    featuredProjectsResult,
    [],
    "Failed to load home featured projects",
    "Featured projects are temporarily unavailable.",
  );
  const currentlyBuilding = getSettledValue(
    currentlyBuildingResult,
    [],
    "Failed to load home currently-building items",
    "Currently-building updates are temporarily unavailable.",
  );

  return {
    siteSettings: siteSettings.value,
    featuredProjects: featuredProjects.value,
    currentlyBuilding: currentlyBuilding.value,
    errors: {
      ...(siteSettings.error ? { siteSettings: siteSettings.error } : {}),
      ...(featuredProjects.error
        ? { featuredProjects: featuredProjects.error }
        : {}),
      ...(currentlyBuilding.error
        ? { currentlyBuilding: currentlyBuilding.error }
        : {}),
    },
  };
};
