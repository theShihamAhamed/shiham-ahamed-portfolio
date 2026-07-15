import { createCustomTechnologySlug } from "@portfolio/shared";
import type {
  CreateProjectFormValues,
  ParsedCreateProjectFormValues,
  ParsedUpdateProjectFormValues,
  UpdateProjectFormValues,
} from "../../../schemas/project.schema";
import type {
  AdminProject,
  CreateProjectInput,
  ProjectArchitecture,
  ProjectLinks,
  ProjectTechStackItem,
  UpdateProjectInput,
} from "../../../types/project";

export const createEmptyTechItem = (
  category = "other",
): ProjectTechStackItem => ({
  kind: "custom",
  slug: "",
  label: "",
  category: (category === "other" ? category : "other"),
  color: "#64748B",
  showOnCard: false,
});

export type EmptyTechStackGroup = { id: string; name: string };

export const createEmptyTechGroup = (id: string): EmptyTechStackGroup => ({
  id,
  name: "",
});

export const areEmptyTechGroupsValid = (
  groups: EmptyTechStackGroup[],
): boolean => groups.every((group) => Boolean(group.name.trim()));

export const removeTechItemsAtIndexes = (
  items: ProjectTechStackItem[],
  indexes: number[],
): ProjectTechStackItem[] => {
  const indexesToRemove = new Set(indexes);
  return items.filter((_, index) => !indexesToRemove.has(index));
};

export const createProjectDefaultValues = (): CreateProjectFormValues => ({
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  projectType: "full-stack-web-app",
  status: "completed",
  startDate: "",
  endDate: "",
  videoUrl: "",
  videoPosterUrl: "",
  caseStudyMdx: "",
  thumbnail: undefined,
  gallery: [],
  architecture: {
    image: undefined,
    summary: "",
    points: [],
  },
  links: {
    github: "",
    liveDemo: "",
    article: "",
  },
  techStack: [],
  overview: [],
  highlights: [],
  challenges: [],
  futureImprovements: [],
  isFeatured: false,
  isVisible: true,
});

const omitEmptyObject = <T extends Record<string, unknown>>(object: T) => {
  const entries = Object.entries(object).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;

    return value !== undefined && value !== "";
  });

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

export const cleanTechStack = (items: ReadonlyArray<{ kind: "known" | "custom"; slug: string; label?: string; category?: string; color?: string; showOnCard?: boolean }>): ProjectTechStackItem[] =>
  items.map((item) => item.kind === "known"
    ? { kind: "known", slug: item.slug as never, showOnCard: item.showOnCard ?? false }
    : { kind: "custom", slug: createCustomTechnologySlug(item.label ?? ""), label: (item.label ?? "").trim(), category: (item.category ?? "other") as never, color: (item.color ?? "#64748B") as `#${string}`, showOnCard: item.showOnCard ?? false });

export const toCreateProjectInput = (
  values: ParsedCreateProjectFormValues,
): CreateProjectInput => {
  if (!values.thumbnail) throw new Error("Thumbnail image is required.");

  const links = omitEmptyObject<ProjectLinks>({
    github: values.links.github,
    liveDemo: values.links.liveDemo,
    article: values.links.article,
  });
  const architecture = omitEmptyObject<ProjectArchitecture>({
    image: values.architecture.image,
    summary: values.architecture.summary,
    points: values.architecture.points,
  });

  return {
    title: values.title,
    ...(values.slug ? { slug: values.slug } : {}),
    shortDescription: values.shortDescription,
    description: values.description,
    projectType: values.projectType,
    status: values.status,
    startDate: values.startDate,
    ...(values.endDate ? { endDate: values.endDate } : {}),
    ...(values.videoUrl ? { videoUrl: values.videoUrl } : {}),
    ...(values.videoPosterUrl ? { videoPosterUrl: values.videoPosterUrl } : {}),
    ...(values.caseStudyMdx ? { caseStudyMdx: values.caseStudyMdx } : {}),
    thumbnail: values.thumbnail,
    gallery: values.gallery,
    ...(architecture ? { architecture } : {}),
    ...(links ? { links } : {}),
    techStack: cleanTechStack(values.techStack),
    overview: values.overview,
    highlights: values.highlights,
    ...(values.challenges.length ? { challenges: values.challenges } : {}),
    ...(values.futureImprovements.length
      ? { futureImprovements: values.futureImprovements }
      : {}),
    isFeatured: values.isFeatured,
    isVisible: values.isVisible,
  };
};

export const toProjectFormValues = (
  project: AdminProject,
): UpdateProjectFormValues => ({
  title: project.title,
  slug: project.slug,
  shortDescription: project.shortDescription,
  description: project.description,
  projectType: project.projectType,
  status: project.status,
  startDate: project.startDate,
  endDate: project.endDate ?? "",
  videoUrl: project.videoUrl ?? "",
  videoPosterUrl: project.videoPosterUrl ?? "",
  caseStudyMdx: project.caseStudyMdx ?? "",
  links: {
    github: project.links?.github ?? "",
    liveDemo: project.links?.liveDemo ?? "",
    article: project.links?.article ?? "",
  },
  techStack: project.techStack.map((item) => ({ ...item })),
  overview: [...project.overview],
  highlights: [...project.highlights],
  architecture: {
    summary: project.architecture?.summary ?? "",
    points: [...(project.architecture?.points ?? [])],
  },
  challenges: [...(project.challenges ?? [])],
  futureImprovements: [...(project.futureImprovements ?? [])],
});

export const toUpdateProjectInput = (
  values: ParsedUpdateProjectFormValues,
): UpdateProjectInput => ({
  title: values.title,
  slug: values.slug,
  shortDescription: values.shortDescription,
  description: values.description,
  projectType: values.projectType,
  status: values.status,
  startDate: values.startDate,
  endDate: values.endDate,
  videoUrl: values.videoUrl,
  videoPosterUrl: values.videoPosterUrl,
  caseStudyMdx: values.caseStudyMdx,
  links: {
    github: values.links.github,
    liveDemo: values.links.liveDemo,
    article: values.links.article,
  } satisfies ProjectLinks,
  techStack: cleanTechStack(values.techStack),
  overview: values.overview,
  highlights: values.highlights,
  architecture: {
    summary: values.architecture.summary,
    points: values.architecture.points,
  },
  challenges: values.challenges,
  futureImprovements: values.futureImprovements,
});
