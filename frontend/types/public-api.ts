export type PublicApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type PublicApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type PublicApiResponse<T> =
  | PublicApiSuccessResponse<T>
  | PublicApiErrorResponse;

export type PublicImageAsset = {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  name?: string;
};

export type PublicProjectStatus = "completed" | "in-progress" | "planned";

export type PublicProjectTechStackItem = {
  label: string;
  category?: string;
  color?: string;
  showOnCard?: boolean;
};

export type PublicProjectLinks = {
  github?: string;
  liveDemo?: string;
  article?: string;
};

export type PublicProjectArchitecture = {
  image?: PublicImageAsset;
  summary?: string;
  points?: string[];
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  projectType: string;
  status: PublicProjectStatus;
  year: string;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  thumbnail: PublicImageAsset;
  gallery: PublicImageAsset[];
  architecture?: PublicProjectArchitecture;
  links?: PublicProjectLinks;
  techStack: PublicProjectTechStackItem[];
  overview: string[];
  highlights: string[];
  challenges?: string[];
  futureImprovements?: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PublicCurrentlyBuildingItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  currentFocus: string;
  techStack: string[];
  highlights: string[];
  link?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicCertification = {
  id: string;
  title: string;
  provider: string;
  note: string;
  image: PublicImageAsset;
  verifyUrl?: string;
  credentialId?: string;
  date?: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
};

export type PublicAchievement = {
  id: string;
  title: string;
  note: string;
  event?: string;
  result?: string;
  date?: string;
  year?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
};

export type PublicSiteSettings = {
  id: string;
  name: string;
  targetRole: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  hero: {
    badge: string;
    title: string;
    highlightedPhrase: string;
    description: string;
  };
  education: {
    institution: string;
    degree: string;
    specialization: string;
    expectedGraduation: string;
  };
  createdAt: string;
  updatedAt: string;
};
