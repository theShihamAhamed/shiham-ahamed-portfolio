import type { ProjectStatus, ProjectTechnology, ProjectType } from "@portfolio/shared";

export type { ProjectStatus, ProjectType } from "@portfolio/shared";

export type ProjectTag = {
  label: string;
  color?: string;
  technology?: ProjectTechnology;
};

export type ProjectLinks = {
  github?: string;
  live?: string;
  article?: string;
  other?: string;
};

export type ProjectMedia =
  | {
      kind: "image";
      src: string;
      alt?: string;
    }
  | {
      kind: "video";
      src: string;
      poster?: string;
    };

export type ProjectGalleryItem = {
  id?: number;
  src: string;
  alt: string;
  caption?: string;
};

export type QuickFact = {
  label: string;
  value: string;
};

export type ProjectTechDisplayGroup = {
  key:
    | "frontend"
    | "backend"
    | "database-storage"
    | "cloud-platform"
    | "languages"
    | "tools-other";
  label: string;
  items: ProjectTag[];
};

export type Project = {
  id?: number | string;
  slug: string;
  title: string;
  tagline?: string;

  shortDescription: string;

  thumbnail: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  heroMedia: ProjectMedia;

  featured: boolean;
  sortOrder: number;
  projectType: ProjectType;
  status: ProjectStatus;
  publishDate?: string;
  startDate: string; // Format: YYYY-MM (e.g., "2026-01")
  endDate?: string; // Format: YYYY-MM; undefined when no end month is stored

  tags?: ProjectTag[];
  techStack: ProjectTag[];
  links: ProjectLinks;

  quickFacts?: QuickFact[];

  overview: string[];
  highlights: string[];
  techGroups: ProjectTechDisplayGroup[];
  gallery: ProjectGalleryItem[];

  architectureImage?: string;
  architectureSummary?: string;
  architecturePoints?: string[];

  caseStudyMdx?: string;

  challenges: string[];
  futureImprovements: string[];
};

export type CurrentProject = {
  id?: number | string;
  title: string;
  description: string;
  status: string;
  tech?: string[];
  stack: string[];
  focus: string;
  link?: string;
  highlights: string[];
};
