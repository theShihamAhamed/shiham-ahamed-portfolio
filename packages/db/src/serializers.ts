import type { AdminAchievement, AdminCertification, AdminCurrentlyBuildingItem, AdminProject, AdminSiteSettings, ImageAsset, PublicAchievement, PublicCertification, PublicCurrentlyBuildingItem, PublicImageAsset, PublicProject, PublicSiteSettings, StoredImageAsset } from "@portfolio/shared";
import type { AchievementDocument, CertificationDocument, CurrentlyBuildingDocument, ProjectDocument, SiteSettingsDocument } from "./models";

function serializeImage(image: StoredImageAsset, includeFileId: true): ImageAsset;
function serializeImage(image: StoredImageAsset, includeFileId: false): PublicImageAsset;
function serializeImage(image: StoredImageAsset, includeFileId: boolean): ImageAsset {
  return { url: image.url, ...(includeFileId ? { fileId: image.fileId } : {}), alt: image.alt, ...(image.width ? { width: image.width } : {}), ...(image.height ? { height: image.height } : {}), ...(image.name ? { name: image.name } : {}) };
}
const links = (value: ProjectDocument["links"]) => value ? ({ ...(value.github ? { github: value.github } : {}), ...(value.liveDemo ? { liveDemo: value.liveDemo } : {}), ...(value.article ? { article: value.article } : {}) }) : undefined;
const architecture = (value: ProjectDocument["architecture"], includeFileId: boolean) => { if (!value) return undefined; const result = { ...(value.image ? { image: includeFileId ? serializeImage(value.image, true) : serializeImage(value.image, false) } : {}), ...(value.summary ? { summary: value.summary } : {}), ...(value.points?.length ? { points: value.points } : {}) }; return Object.keys(result).length ? result : undefined; };
const tech = (items: ProjectDocument["techStack"]) => items.map((item) => ({ ...item, showOnCard: item.showOnCard ?? false }));
const optionalTrimmedString = (value: unknown): string | undefined => typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
const normalizedStringList = (value: unknown): string[] => Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean) : [];

export const serializeAdminProject = (project: ProjectDocument): AdminProject => {
  const item = project.toObject();
  const arch = architecture(item.architecture, true);
  const projectLinks = links(item.links);

  return {
    id: item._id.toString(), title: item.title, slug: item.slug,
    shortDescription: item.shortDescription, projectType: item.projectType,
    status: item.status, startDate: item.startDate,
    ...(item.endDate ? { endDate: item.endDate } : {}),
    ...(item.videoUrl ? { videoUrl: item.videoUrl } : {}),
    ...(item.videoPosterUrl ? { videoPosterUrl: item.videoPosterUrl } : {}),
    ...(item.caseStudyMdx ? { caseStudyMdx: item.caseStudyMdx } : {}),
    thumbnail: serializeImage(item.thumbnail, true),
    gallery: item.gallery.map((image) => serializeImage(image, true)),
    ...(arch ? { architecture: arch } : {}),
    ...(projectLinks ? { links: projectLinks } : {}),
    techStack: tech(item.techStack), overview: item.overview, highlights: item.highlights,
    ...(item.challenges?.length ? { challenges: item.challenges } : {}),
    ...(item.futureImprovements?.length ? { futureImprovements: item.futureImprovements } : {}),
    isFeatured: item.isFeatured, isVisible: item.isVisible,
    displayOrder: item.displayOrder, createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  } as AdminProject;
};

export const serializePublicProject = (project: ProjectDocument): PublicProject => {
  const item = project.toObject();
  const arch = architecture(item.architecture, false);
  const projectLinks = links(item.links);

  return {
    id: item._id.toString(), title: item.title, slug: item.slug,
    shortDescription: item.shortDescription, projectType: item.projectType,
    status: item.status, startDate: item.startDate,
    ...(item.endDate ? { endDate: item.endDate } : {}),
    ...(item.videoUrl ? { videoUrl: item.videoUrl } : {}),
    ...(item.videoPosterUrl ? { videoPosterUrl: item.videoPosterUrl } : {}),
    ...(item.caseStudyMdx ? { caseStudyMdx: item.caseStudyMdx } : {}),
    thumbnail: serializeImage(item.thumbnail, false),
    gallery: item.gallery.map((image) => serializeImage(image, false)),
    ...(arch ? { architecture: arch } : {}),
    ...(projectLinks ? { links: projectLinks } : {}),
    techStack: tech(item.techStack), overview: item.overview, highlights: item.highlights,
    ...(item.challenges?.length ? { challenges: item.challenges } : {}),
    ...(item.futureImprovements?.length ? { futureImprovements: item.futureImprovements } : {}),
    isFeatured: item.isFeatured, createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  } as PublicProject;
};

export const serializeAdminCertification = (value: CertificationDocument): AdminCertification => { const doc = value.toObject(); return { id: doc._id.toString(), title: doc.title, provider: doc.provider, note: doc.note, image: serializeImage(doc.image, true), ...(doc.verifyUrl ? { verifyUrl: doc.verifyUrl } : {}), ...(doc.credentialId ? { credentialId: doc.credentialId } : {}), ...(doc.date ? { date: doc.date } : {}), skills: doc.skills ?? [], isVisible: doc.isVisible, displayOrder: doc.displayOrder, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() }; };
export const serializePublicCertification = (value: CertificationDocument): PublicCertification => { const doc = value.toObject(); return { id: doc._id.toString(), title: doc.title, provider: doc.provider, note: doc.note, image: serializeImage(doc.image, false), ...(doc.verifyUrl ? { verifyUrl: doc.verifyUrl } : {}), ...(doc.credentialId ? { credentialId: doc.credentialId } : {}), ...(doc.date ? { date: doc.date } : {}), skills: doc.skills ?? [], createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() }; };

export const serializeAdminAchievement = (value: AchievementDocument): AdminAchievement => { const doc = value.toObject(); return { id: doc._id.toString(), title: doc.title, note: doc.note, ...(doc.event ? { event: doc.event } : {}), ...(doc.result ? { result: doc.result } : {}), ...(doc.date ? { date: doc.date } : {}), ...(doc.year ? { year: doc.year } : {}), ...(doc.icon ? { icon: doc.icon } : {}), isVisible: doc.isVisible, displayOrder: doc.displayOrder, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() }; };
export const serializePublicAchievement = (value: AchievementDocument): PublicAchievement => { const { isVisible: _isVisible, displayOrder: _displayOrder, ...publicValue } = serializeAdminAchievement(value); return publicValue; };

export const serializeAdminCurrentlyBuilding = (value: CurrentlyBuildingDocument): AdminCurrentlyBuildingItem => {
  const doc = value.toObject();
  const currentFocus = optionalTrimmedString(doc.currentFocus);
  const link = optionalTrimmedString(doc.link);

  return { id: doc._id.toString(), title: doc.title, description: doc.description, ...(currentFocus ? { currentFocus } : {}), techStack: normalizedStringList(doc.techStack), highlights: normalizedStringList(doc.highlights), ...(link ? { link } : {}), isVisible: doc.isVisible, displayOrder: doc.displayOrder, createdAt: doc.createdAt.toISOString(), updatedAt: doc.updatedAt.toISOString() };
};
export const serializePublicCurrentlyBuilding = (value: CurrentlyBuildingDocument): PublicCurrentlyBuildingItem => { const { isVisible: _isVisible, displayOrder: _displayOrder, ...publicValue } = serializeAdminCurrentlyBuilding(value); return publicValue; };

export const serializeSiteSettings = (value: SiteSettingsDocument): AdminSiteSettings & PublicSiteSettings => { const item = value.toObject(); return { id: item._id.toString(), name: item.name, targetRole: item.targetRole, email: item.email, githubUrl: item.githubUrl, linkedinUrl: item.linkedinUrl, resumeUrl: item.resumeUrl, hero: { badge: item.hero.badge, title: item.hero.title, highlightedPhrase: item.hero.highlightedPhrase, description: item.hero.description }, education: { institution: item.education.institution, degree: item.education.degree, specialization: item.education.specialization, expectedGraduation: item.education.expectedGraduation }, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() }; };
