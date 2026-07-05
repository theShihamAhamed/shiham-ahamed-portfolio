export type ProjectStatus = "Completed" | "In Progress" | "Planned";

export type ProjectTag = {
  label: string;
  color?: string;
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

export type TechGroups = {
  frontend?: string[];
  backend?: string[];
  infrastructure?: string[];
  tools?: string[];
  languages?: string[];
  frameworks?: string[];
  databases?: string[];
  platforms?: string[];
  [key: string]: string[] | undefined;
};

export type Project = {
  id?: number | string;
  slug: string;
  title: string;
  tagline?: string;

  shortDescription: string;
  longDescription: string;

  thumbnail: string;
  videoUrl?: string;
  videoPosterUrl?: string;
  heroMedia: ProjectMedia;

  featured: boolean;
  sortOrder: number;
  projectType: string;
  status: ProjectStatus;
  year: string;
  publishDate?: string;
  startDate?: string; // Format: YYYY-MM (e.g., "2026-01")
  endDate?: string; // Format: YYYY-MM, null/undefined if ongoing

  tags?: ProjectTag[];
  techStack: ProjectTag[];
  links: ProjectLinks;

  quickFacts?: QuickFact[];

  overview: string[];
  highlights: string[];
  techGroups: TechGroups;
  gallery: ProjectGalleryItem[];

  architectureImage?: string;
  architectureSummary?: string;
  architecturePoints?: string[];

  mdxUrl?: string;

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
