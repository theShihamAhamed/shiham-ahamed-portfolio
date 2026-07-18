import type { ProjectStatus } from "./projects/project-statuses";
import type { ProjectTechnology } from "./technologies";
import type { ProjectType } from "./projects/project-types";

export { projectStatuses } from "./projects/project-statuses";
export type { ProjectStatus } from "./projects/project-statuses";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: unknown;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
export type PublicApiSuccessResponse<T> = ApiSuccessResponse<T>;
export type PublicApiErrorResponse = ApiErrorResponse;
export type PublicApiResponse<T> = ApiResponse<T>;

export type StoredImageAsset = {
  url: string;
  fileId: string;
  alt: string;
  width?: number;
  height?: number;
  name?: string;
};

export type ImageAsset = Omit<StoredImageAsset, "fileId"> & {
  fileId?: string;
};

export type PublicImageAsset = Omit<StoredImageAsset, "fileId">;

export type PublicProjectStatus = ProjectStatus;

export type ProjectTechStackItem = ProjectTechnology;

export type ProjectLinks = {
  github?: string;
  liveDemo?: string;
  article?: string;
};

export type ProjectArchitecture = {
  image?: ImageAsset;
  summary?: string;
  points?: string[];
};

export type PublicProjectArchitecture = {
  image?: PublicImageAsset;
  summary?: string;
  points?: string[];
};

export type AdminProject = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  projectType: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  caseStudyMdx?: string;
  thumbnail: ImageAsset;
  gallery: ImageAsset[];
  architecture?: ProjectArchitecture;
  links?: ProjectLinks;
  techStack: ProjectTechStackItem[];
  overview: string[];
  highlights: string[];
  challenges?: string[];
  futureImprovements?: string[];
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicProject = Omit<
  AdminProject,
  "thumbnail" | "gallery" | "architecture" | "isVisible" | "displayOrder"
> & {
  thumbnail: PublicImageAsset;
  gallery: PublicImageAsset[];
  architecture?: PublicProjectArchitecture;
};

export type AdminCertification = {
  id: string;
  title: string;
  provider: string;
  note: string;
  image: ImageAsset;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills: string[];
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicCertification = Omit<
  AdminCertification,
  "image" | "isVisible" | "displayOrder"
> & {
  image: PublicImageAsset;
};

export type AdminAchievement = {
  id: string;
  title: string;
  note: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicAchievement = Omit<
  AdminAchievement,
  "isVisible" | "displayOrder"
>;

export type AdminCurrentlyBuildingItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  currentFocus: string;
  techStack: string[];
  highlights: string[];
  link?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicCurrentlyBuildingItem = Omit<
  AdminCurrentlyBuildingItem,
  "isVisible" | "displayOrder"
>;

export type SiteSettingsHero = {
  badge: string;
  title: string;
  highlightedPhrase: string;
  description: string;
};

export type SiteSettingsEducation = {
  institution: string;
  degree: string;
  specialization: string;
  expectedGraduation: string;
};

export type AdminSiteSettings = {
  id: string;
  name: string;
  targetRole: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  hero: SiteSettingsHero;
  education: SiteSettingsEducation;
  createdAt: string;
  updatedAt: string;
};

export type PublicSiteSettings = AdminSiteSettings;

export type CreateProjectInput = {
  title: string;
  slug?: string;
  shortDescription: string;
  projectType: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  caseStudyMdx?: string;
  thumbnail: ImageAsset;
  gallery: ImageAsset[];
  architecture?: ProjectArchitecture;
  links?: ProjectLinks;
  techStack: ProjectTechStackItem[];
  overview: string[];
  highlights: string[];
  challenges?: string[];
  futureImprovements?: string[];
  isFeatured?: boolean;
  isVisible?: boolean;
};

export type UpdateProjectInput = Partial<
  Pick<
    CreateProjectInput,
    | "title"
    | "slug"
    | "shortDescription"
    | "projectType"
    | "status"
    | "startDate"
    | "endDate"
    | "videoUrl"
    | "videoPosterUrl"
    | "caseStudyMdx"
    | "links"
    | "techStack"
    | "overview"
    | "highlights"
    | "challenges"
    | "futureImprovements"
  >
> & {
  architecture?: Pick<ProjectArchitecture, "summary" | "points">;
};

export type CreateCertificationInput = Omit<
  AdminCertification,
  "id" | "createdAt" | "updatedAt" | "displayOrder" | "skills" | "isVisible"
> & {
  skills?: string[];
  isVisible?: boolean;
};

export type UpdateCertificationInput = Partial<
  Pick<
    CreateCertificationInput,
    "title" | "provider" | "note" | "verifyUrl" | "credentialId" | "date" | "skills"
  >
>;

export type CreateAchievementInput = Omit<
  AdminAchievement,
  "id" | "createdAt" | "updatedAt" | "displayOrder" | "isVisible"
> & { isVisible?: boolean };
export type UpdateAchievementInput = Partial<
  Omit<CreateAchievementInput, "isVisible">
>;

export type CreateCurrentlyBuildingInput = Omit<
  AdminCurrentlyBuildingItem,
  "id" | "createdAt" | "updatedAt" | "displayOrder" | "isVisible"
> & { isVisible?: boolean };
export type UpdateCurrentlyBuildingInput = Partial<
  Omit<CreateCurrentlyBuildingInput, "isVisible">
>;

export type UpdateSiteSettingsInput = Omit<
  AdminSiteSettings,
  "id" | "createdAt" | "updatedAt"
>;

export const siteSettingsSingletonKey = "primary" as const;
