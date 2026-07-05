import type { ImageAsset } from "../../types/image-asset";

export const projectStatuses = ["completed", "in-progress", "planned"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export type ProjectTechStackItem = {
  label: string;
  category?: string;
  color?: string;
  showOnCard?: boolean;
};

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

export type ProjectEntity = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  projectType: string;
  status: ProjectStatus;
  year: string;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
  videoPosterUrl?: string;
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
  createdAt: Date;
  updatedAt: Date;
};
