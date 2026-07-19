import type { CurrentProject } from "@/types/project";
import type { PublicCurrentlyBuildingItem } from "@/types/public-api";

export const mapPublicCurrentlyBuildingToCurrentProject = (
  item: PublicCurrentlyBuildingItem,
): CurrentProject => ({
  id: item.id,
  title: item.title,
  description: item.description,
  topics: item.techStack ?? [],
  ...(item.currentFocus ? { focus: item.currentFocus } : {}),
  highlights: item.highlights ?? [],
});
