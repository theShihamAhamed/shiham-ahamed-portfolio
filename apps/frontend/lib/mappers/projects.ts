import type {
  Project,
  ProjectTag,
} from "@/types/project";
import type {
  PublicProject,
  PublicProjectTechStackItem,
} from "@/types/public-api";
import { isYouTubeVideoUrl } from "@/lib/video/youtube";
import { groupProjectTechnologiesForDisplay } from "@/lib/projects/project-tech-display-groups";
import { resolveProjectTechnology } from "@portfolio/shared";

export const mapPublicTechToProjectTag = (
  item: PublicProjectTechStackItem,
): ProjectTag => ({
  label: resolveProjectTechnology(item)?.label ?? (item.kind === "known" ? item.slug : item.label),
  color: resolveProjectTechnology(item)?.color,
  technology: item,
});

export const getProjectCardTechs = (
  project: Pick<PublicProject, "techStack">,
  limit = 6,
) => {
  const selectedItems = project.techStack.filter((item) => item.showOnCard);
  const itemsForCard =
    selectedItems.length > 0 ? selectedItems : project.techStack.slice(0, 4);

  return itemsForCard.slice(0, limit);
};

export const mapPublicProjectToViewerProject = (
  project: PublicProject,
  index = 0,
): Project => {
  const hasYouTubeVideo = isYouTubeVideoUrl(project.videoUrl);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    shortDescription: project.shortDescription,
    thumbnail: project.thumbnail.url,
    videoUrl: project.videoUrl,
    videoPosterUrl: project.videoPosterUrl,
    heroMedia: hasYouTubeVideo
      ? {
          kind: "video",
          src: project.videoUrl as string,
          poster: project.videoPosterUrl ?? project.thumbnail.url,
        }
      : {
          kind: "image",
          src: project.thumbnail.url,
          alt: project.thumbnail.alt,
        },
    featured: project.isFeatured,
    sortOrder: index + 1,
    projectType: project.projectType,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    techStack: getProjectCardTechs(project).map(mapPublicTechToProjectTag),
    links: {
      github: project.links?.github,
      live: project.links?.liveDemo,
      article: project.links?.article,
    },
    overview: project.overview,
    highlights: project.highlights,
    techGroups: groupProjectTechnologiesForDisplay(project.techStack).map(
      (group) => ({
        ...group,
        items: group.items.map(mapPublicTechToProjectTag),
      }),
    ),
    gallery: project.gallery.map((image, galleryIndex) => ({
      id: galleryIndex + 1,
      src: image.url,
      alt: image.alt,
      caption: image.name,
    })),
    architectureImage: project.architecture?.image?.url,
    architectureSummary: project.architecture?.summary,
    architecturePoints: project.architecture?.points,
    caseStudyMdx: project.caseStudyMdx,
    challenges: project.challenges ?? [],
    futureImprovements: project.futureImprovements ?? [],
  };
};
