import type { ImageAsset } from "../../types/image-asset";
import type { ProjectDocument } from "./project.model";
import type {
  ProjectArchitecture,
  ProjectLinks,
  ProjectTechStackItem,
} from "./project.types";

type SerializedImageAsset = Omit<ImageAsset, "fileId"> & {
  fileId?: string;
};

const serializeImageAsset = (
  image: ImageAsset,
  includeFileId: boolean,
): SerializedImageAsset => ({
  url: image.url,
  ...(includeFileId ? { fileId: image.fileId } : {}),
  alt: image.alt,
  ...(image.width ? { width: image.width } : {}),
  ...(image.height ? { height: image.height } : {}),
  ...(image.name ? { name: image.name } : {}),
});

const serializeLinks = (links?: ProjectLinks) => {
  if (!links) return undefined;

  return {
    ...(links.github ? { github: links.github } : {}),
    ...(links.liveDemo ? { liveDemo: links.liveDemo } : {}),
    ...(links.article ? { article: links.article } : {}),
  };
};

const serializeArchitecture = (
  architecture: ProjectArchitecture | undefined,
  includeFileId: boolean,
) => {
  if (!architecture) return undefined;

  const serialized = {
    ...(architecture.image
      ? { image: serializeImageAsset(architecture.image, includeFileId) }
      : {}),
    ...(architecture.summary ? { summary: architecture.summary } : {}),
    ...(architecture.points?.length ? { points: architecture.points } : {}),
  };

  return Object.keys(serialized).length > 0 ? serialized : undefined;
};

const serializeTechStack = (techStack: ProjectTechStackItem[]) =>
  techStack.map((item) => ({
    label: item.label,
    ...(item.category !== undefined ? { category: item.category } : {}),
    ...(item.color !== undefined ? { color: item.color } : {}),
    showOnCard: item.showOnCard ?? false,
  }));

export const serializeAdminProject = (project: ProjectDocument) => {
  const item = project.toObject();

  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    description: item.description,
    projectType: item.projectType,
    status: item.status,
    year: item.year,
    ...(item.startDate ? { startDate: item.startDate } : {}),
    ...(item.endDate ? { endDate: item.endDate } : {}),
    ...(item.videoUrl ? { videoUrl: item.videoUrl } : {}),
    ...(item.videoPosterUrl ? { videoPosterUrl: item.videoPosterUrl } : {}),
    thumbnail: serializeImageAsset(item.thumbnail, true),
    gallery: item.gallery.map((image) => serializeImageAsset(image, true)),
    ...(serializeArchitecture(item.architecture, true)
      ? { architecture: serializeArchitecture(item.architecture, true) }
      : {}),
    ...(serializeLinks(item.links) ? { links: serializeLinks(item.links) } : {}),
    techStack: serializeTechStack(item.techStack),
    overview: item.overview,
    highlights: item.highlights,
    ...(item.challenges?.length ? { challenges: item.challenges } : {}),
    ...(item.futureImprovements?.length
      ? { futureImprovements: item.futureImprovements }
      : {}),
    isFeatured: item.isFeatured,
    isVisible: item.isVisible,
    displayOrder: item.displayOrder,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
};

export const serializePublicProject = (project: ProjectDocument) => {
  const item = project.toObject();

  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    shortDescription: item.shortDescription,
    description: item.description,
    projectType: item.projectType,
    status: item.status,
    year: item.year,
    ...(item.startDate ? { startDate: item.startDate } : {}),
    ...(item.endDate ? { endDate: item.endDate } : {}),
    ...(item.videoUrl ? { videoUrl: item.videoUrl } : {}),
    ...(item.videoPosterUrl ? { videoPosterUrl: item.videoPosterUrl } : {}),
    thumbnail: serializeImageAsset(item.thumbnail, false),
    gallery: item.gallery.map((image) => serializeImageAsset(image, false)),
    ...(serializeArchitecture(item.architecture, false)
      ? { architecture: serializeArchitecture(item.architecture, false) }
      : {}),
    ...(serializeLinks(item.links) ? { links: serializeLinks(item.links) } : {}),
    techStack: serializeTechStack(item.techStack),
    overview: item.overview,
    highlights: item.highlights,
    ...(item.challenges?.length ? { challenges: item.challenges } : {}),
    ...(item.futureImprovements?.length
      ? { futureImprovements: item.futureImprovements }
      : {}),
    isFeatured: item.isFeatured,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
};
