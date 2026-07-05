import type { CurrentProject } from "@/types/project";
import type { PublicCurrentlyBuildingItem } from "@/types/public-api";

export const mapPublicCurrentlyBuildingToCurrentProject = (
  item: PublicCurrentlyBuildingItem,
): CurrentProject => ({
  id: item.id,
  title: item.title,
  description: item.description,
  status: item.status,
  tech: item.techStack,
  stack: item.techStack,
  focus: item.currentFocus,
  link: item.link,
  highlights: item.highlights,
});
