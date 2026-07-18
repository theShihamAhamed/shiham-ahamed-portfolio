import type { ProjectStatus, ProjectType, ProjectTechStackItem, SiteSettingsEducation, SiteSettingsHero, StoredImageAsset } from "@portfolio/shared";

export type ProjectEntity = {
  title: string; slug: string; shortDescription: string; projectType: ProjectType;
  status: ProjectStatus; startDate: string; endDate?: string; videoUrl?: string; videoPosterUrl?: string;
  caseStudyMdx?: string;
  thumbnail: StoredImageAsset; gallery: StoredImageAsset[];
  architecture?: { image?: StoredImageAsset; summary?: string; points?: string[] };
  links?: { github?: string; liveDemo?: string; article?: string };
  techStack: ProjectTechStackItem[];
  overview: string[]; highlights: string[]; challenges?: string[]; futureImprovements?: string[];
  isFeatured: boolean; isVisible: boolean; displayOrder: number; createdAt: Date; updatedAt: Date;
};
export type CertificationEntity = { title: string; provider: string; note: string; image: StoredImageAsset; verifyUrl?: string; credentialId?: string; date?: string; skills?: string[]; isVisible: boolean; displayOrder: number; createdAt: Date; updatedAt: Date };
export type AchievementEntity = { title: string; note: string; event?: string; result?: string; date?: string; year?: string; icon?: string; isVisible: boolean; displayOrder: number; createdAt: Date; updatedAt: Date };
export type CurrentlyBuildingEntity = { title: string; description: string; status: string; currentFocus: string; techStack: string[]; highlights: string[]; link?: string; isVisible: boolean; displayOrder: number; createdAt: Date; updatedAt: Date };
export type SiteSettingsEntity = { singletonKey: "primary"; name: string; targetRole: string; email: string; githubUrl: string; linkedinUrl: string; resumeUrl: string; hero: SiteSettingsHero; education: SiteSettingsEducation; createdAt: Date; updatedAt: Date };
