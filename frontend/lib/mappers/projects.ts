import type {
  Project,
  ProjectStatus,
  ProjectTag,
  TechGroups,
} from "@/types/project";
import type {
  PublicProject,
  PublicProjectStatus,
  PublicProjectTechStackItem,
} from "@/types/public-api";
import { isYouTubeVideoUrl } from "@/lib/video/youtube";

export type GroupedProjectTechStack = {
  category: string;
  items: PublicProjectTechStackItem[];
};

const otherCategoryLabel = "Other";

export const mapPublicProjectStatus = (
  status: PublicProjectStatus,
): ProjectStatus => {
  const statusLabels: Record<PublicProjectStatus, ProjectStatus> = {
    completed: "Completed",
    "in-progress": "In Progress",
    planned: "Planned",
  };

  return statusLabels[status];
};

export const mapPublicTechToProjectTag = (
  item: PublicProjectTechStackItem,
): ProjectTag => ({
  label: item.label,
  color: item.color,
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

export const groupProjectTechStack = (
  project: Pick<PublicProject, "techStack">,
): GroupedProjectTechStack[] => {
  const groups = new Map<string, PublicProjectTechStackItem[]>();

  project.techStack.forEach((item) => {
    const category = item.category?.trim() || otherCategoryLabel;
    const currentItems = groups.get(category) ?? [];

    groups.set(category, [...currentItems, item]);
  });

  return Array.from(groups, ([category, items]) => ({ category, items }));
};

export const mapPublicProjectTechGroups = (
  project: Pick<PublicProject, "techStack">,
): TechGroups => {
  return groupProjectTechStack(project).reduce<TechGroups>(
    (groups, group) => ({
      ...groups,
      [group.category]: group.items.map((item) => item.label),
    }),
    {},
  );
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
    longDescription: project.description,
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
    status: mapPublicProjectStatus(project.status),
    year: project.year,
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
    techGroups: mapPublicProjectTechGroups(project),
    gallery: project.gallery.map((image, galleryIndex) => ({
      id: galleryIndex + 1,
      src: image.url,
      alt: image.alt,
      caption: image.name,
    })),
    architectureImage: project.architecture?.image?.url,
    architectureSummary: project.architecture?.summary,
    architecturePoints: project.architecture?.points,
    mdxUrl: project.links?.article,
    challenges: project.challenges ?? [],
    futureImprovements: project.futureImprovements ?? [],
  };
};
