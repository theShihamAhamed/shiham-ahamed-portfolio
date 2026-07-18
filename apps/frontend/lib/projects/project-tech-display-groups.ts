import {
  normalizeTechnologyTag,
  resolveProjectTechnology,
  type ProjectTechnology,
  type TechTagCategory,
} from "@portfolio/shared";

export const PROJECT_TECH_DISPLAY_GROUPS = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database-storage", label: "Database & storage" },
  { key: "cloud-platform", label: "Cloud & platform" },
  { key: "languages", label: "Languages" },
  { key: "tools-other", label: "Tools & other" },
] as const;

export type ProjectTechDisplayGroupKey =
  (typeof PROJECT_TECH_DISPLAY_GROUPS)[number]["key"];

export type ProjectTechnologyDisplayGroup<
  TTechnology extends ProjectTechnology = ProjectTechnology,
> = {
  key: ProjectTechDisplayGroupKey;
  label: string;
  items: TTechnology[];
};

const CATEGORY_DISPLAY_GROUPS: Record<
  TechTagCategory,
  ProjectTechDisplayGroupKey
> = {
  frontend: "frontend",
  ui: "frontend",
  mobile: "frontend",
  backend: "backend",
  auth: "backend",
  payment: "backend",
  messaging: "backend",
  architecture: "backend",
  database: "database-storage",
  storage: "database-storage",
  cloud: "cloud-platform",
  devops: "cloud-platform",
  observability: "cloud-platform",
  language: "languages",
  tooling: "tools-other",
  testing: "tools-other",
  "ai-ml": "tools-other",
  other: "tools-other",
};

export const groupProjectTechnologiesForDisplay = <
  TTechnology extends ProjectTechnology,
>(
  technologies: readonly TTechnology[],
): ProjectTechnologyDisplayGroup<TTechnology>[] => {
  const itemsByGroup = new Map<
    ProjectTechDisplayGroupKey,
    TTechnology[]
  >();
  const seen = new Set<string>();

  technologies.forEach((technology) => {
    const normalizedSlug = normalizeTechnologyTag(technology.slug);
    if (seen.has(normalizedSlug)) return;
    seen.add(normalizedSlug);

    const category = resolveProjectTechnology(technology)?.category;
    const groupKey = category
      ? CATEGORY_DISPLAY_GROUPS[category]
      : "tools-other";
    const currentItems = itemsByGroup.get(groupKey) ?? [];
    currentItems.push(technology);
    itemsByGroup.set(groupKey, currentItems);
  });

  return PROJECT_TECH_DISPLAY_GROUPS.flatMap(({ key, label }) => {
    const items = itemsByGroup.get(key);
    return items?.length ? [{ key, label, items }] : [];
  });
};
