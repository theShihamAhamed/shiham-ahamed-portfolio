import type { Types } from "mongoose";

import type {
  AchievementDocument,
  AchievementEntity,
} from "@/lib/server/models/achievement";
import type {
  CertificationDocument,
  CertificationEntity,
} from "@/lib/server/models/certification";
import type {
  CurrentlyBuildingDocument,
  CurrentlyBuildingEntity,
} from "@/lib/server/models/currently-building";
import type {
  ProjectArchitectureEntity,
  ProjectDocument,
  ProjectEntity,
  ProjectLinksEntity,
  ProjectTechStackItemEntity,
} from "@/lib/server/models/project";
import type {
  ImageAssetEntity,
} from "@/lib/server/models/shared";
import type {
  SiteSettingsDocument,
  SiteSettingsEntity,
} from "@/lib/server/models/site-settings";
import type {
  PublicAchievement,
  PublicCertification,
  PublicCurrentlyBuildingItem,
  PublicImageAsset,
  PublicProject,
  PublicProjectArchitecture,
  PublicProjectLinks,
  PublicProjectTechStackItem,
  PublicSiteSettings,
} from "@/types/public-api";

type DocumentId = {
  _id: Types.ObjectId;
};

export const serializePublicImageAsset = (
  image: ImageAssetEntity,
): PublicImageAsset => ({
  url: image.url,
  alt: image.alt,
  ...(image.width ? { width: image.width } : {}),
  ...(image.height ? { height: image.height } : {}),
  ...(image.name ? { name: image.name } : {}),
});

const serializeProjectLinks = (
  links?: ProjectLinksEntity,
): PublicProjectLinks | undefined => {
  if (!links) return undefined;

  const serialized = {
    ...(links.github ? { github: links.github } : {}),
    ...(links.liveDemo ? { liveDemo: links.liveDemo } : {}),
    ...(links.article ? { article: links.article } : {}),
  };

  return Object.keys(serialized).length ? serialized : undefined;
};

const serializeProjectArchitecture = (
  architecture?: ProjectArchitectureEntity,
): PublicProjectArchitecture | undefined => {
  if (!architecture) return undefined;

  const serialized = {
    ...(architecture.image
      ? { image: serializePublicImageAsset(architecture.image) }
      : {}),
    ...(architecture.summary ? { summary: architecture.summary } : {}),
    ...(architecture.points?.length ? { points: architecture.points } : {}),
  };

  return Object.keys(serialized).length ? serialized : undefined;
};

const serializeTechStack = (
  techStack: ProjectTechStackItemEntity[],
): PublicProjectTechStackItem[] =>
  techStack.map((item) => ({
    label: item.label,
    ...(item.category !== undefined ? { category: item.category } : {}),
    ...(item.color !== undefined ? { color: item.color } : {}),
    showOnCard: item.showOnCard ?? false,
  }));

export const serializePublicProject = (
  project: ProjectDocument,
): PublicProject => {
  const doc = project.toObject() as ProjectEntity & DocumentId;
  const architecture = serializeProjectArchitecture(doc.architecture);
  const links = serializeProjectLinks(doc.links);

  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    shortDescription: doc.shortDescription,
    description: doc.description,
    projectType: doc.projectType,
    status: doc.status,
    year: doc.year,
    ...(doc.startDate ? { startDate: doc.startDate } : {}),
    ...(doc.endDate ? { endDate: doc.endDate } : {}),
    ...(doc.videoUrl ? { videoUrl: doc.videoUrl } : {}),
    ...(doc.videoPosterUrl ? { videoPosterUrl: doc.videoPosterUrl } : {}),
    thumbnail: serializePublicImageAsset(doc.thumbnail),
    gallery: doc.gallery.map(serializePublicImageAsset),
    ...(architecture ? { architecture } : {}),
    ...(links ? { links } : {}),
    techStack: serializeTechStack(doc.techStack),
    overview: doc.overview,
    highlights: doc.highlights,
    ...(doc.challenges?.length ? { challenges: doc.challenges } : {}),
    ...(doc.futureImprovements?.length
      ? { futureImprovements: doc.futureImprovements }
      : {}),
    isFeatured: doc.isFeatured,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicCertification = (
  certification: CertificationDocument,
): PublicCertification => {
  const doc = certification.toObject() as CertificationEntity & DocumentId;

  return {
    id: doc._id.toString(),
    title: doc.title,
    provider: doc.provider,
    note: doc.note,
    image: serializePublicImageAsset(doc.image),
    ...(doc.verifyUrl ? { verifyUrl: doc.verifyUrl } : {}),
    ...(doc.credentialId ? { credentialId: doc.credentialId } : {}),
    ...(doc.date ? { date: doc.date } : {}),
    skills: doc.skills ?? [],
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicAchievement = (
  achievement: AchievementDocument,
): PublicAchievement => {
  const doc = achievement.toObject() as AchievementEntity & DocumentId;

  return {
    id: doc._id.toString(),
    title: doc.title,
    note: doc.note,
    ...(doc.event ? { event: doc.event } : {}),
    ...(doc.result ? { result: doc.result } : {}),
    ...(doc.date ? { date: doc.date } : {}),
    ...(doc.year ? { year: doc.year } : {}),
    ...(doc.icon ? { icon: doc.icon } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicCurrentlyBuilding = (
  item: CurrentlyBuildingDocument,
): PublicCurrentlyBuildingItem => {
  const doc = item.toObject() as CurrentlyBuildingEntity & DocumentId;

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    status: doc.status,
    currentFocus: doc.currentFocus,
    techStack: doc.techStack,
    highlights: doc.highlights,
    ...(doc.link ? { link: doc.link } : {}),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const serializePublicSiteSettings = (
  settings: SiteSettingsDocument,
): PublicSiteSettings => {
  const doc = settings.toObject() as SiteSettingsEntity & DocumentId;

  return {
    id: doc._id.toString(),
    name: doc.name,
    targetRole: doc.targetRole,
    email: doc.email,
    githubUrl: doc.githubUrl,
    linkedinUrl: doc.linkedinUrl,
    resumeUrl: doc.resumeUrl,
    hero: {
      badge: doc.hero.badge,
      title: doc.hero.title,
      highlightedPhrase: doc.hero.highlightedPhrase,
      description: doc.hero.description,
    },
    education: {
      institution: doc.education.institution,
      degree: doc.education.degree,
      specialization: doc.education.specialization,
      expectedGraduation: doc.education.expectedGraduation,
    },
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};
