import {
  compareProjectMonths,
  getProjectStatusLabel,
  getProjectTypeLabel,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProjectStatus,
  type ProjectType,
} from "@portfolio/shared";

import type { Project } from "@/types/project";

export type ProjectCatalogSort =
  | "featured"
  | "newest"
  | "oldest"
  | "title";
export type ProjectTypeFilter = "all" | ProjectType;
export type ProjectStatusFilter = "all" | ProjectStatus;

export type ProjectCatalogState = {
  q: string;
  type: ProjectTypeFilter;
  tech: "All" | string;
  status: ProjectStatusFilter;
  sort: ProjectCatalogSort;
};

export type ProjectCatalogOptions = {
  projectTypes: (typeof PROJECT_TYPES)[number][];
  techOptions: string[];
};

export type ProjectCatalogSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type ProjectCatalogSummaryKey = "type" | "tech" | "status" | "sort";

export type ProjectCatalogSummary = {
  key: ProjectCatalogSummaryKey;
  label: string;
  removeLabel: string;
};

export const PROJECT_CATALOG_DEFAULT_STATE: ProjectCatalogState = {
  q: "",
  type: "all",
  tech: "All",
  status: "all",
  sort: "featured",
};

export const PROJECT_CATALOG_SORT_OPTIONS: {
  label: string;
  value: ProjectCatalogSort;
}[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Title", value: "title" },
];

type SearchParamsReader = {
  get(name: string): string | null;
};

const readSearchParam = (
  source: ProjectCatalogSearchParams | SearchParamsReader,
  key: string,
): string => {
  if ("get" in source && typeof source.get === "function") {
    return source.get(key) ?? "";
  }

  const value = (source as ProjectCatalogSearchParams)[key];
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
};

export const getProjectCatalogOptions = (
  projects: Project[],
): ProjectCatalogOptions => {
  const availableTypes = new Set(
    projects.map((project) => project.projectType),
  );

  return {
    projectTypes: PROJECT_TYPES.filter((projectType) =>
      availableTypes.has(projectType.value),
    ),
    techOptions: [
      "All",
      ...new Set(
        projects.flatMap((project) =>
          project.techStack.map((technology) => technology.label),
        ),
      ),
    ],
  };
};

export const parseProjectCatalogState = (
  searchParams: ProjectCatalogSearchParams | SearchParamsReader,
  options: ProjectCatalogOptions,
): ProjectCatalogState => {
  const typeValue = readSearchParam(searchParams, "type");
  const techValue = readSearchParam(searchParams, "tech");
  const statusValue = readSearchParam(searchParams, "status");
  const sortValue = readSearchParam(searchParams, "sort");

  const type = options.projectTypes.some(
    (projectType) => projectType.value === typeValue,
  )
    ? (typeValue as ProjectType)
    : "all";
  const tech = options.techOptions.includes(techValue) ? techValue : "All";
  const status = PROJECT_STATUSES.some(
    (projectStatus) => projectStatus.value === statusValue,
  )
    ? (statusValue as ProjectStatus)
    : "all";
  const sort = PROJECT_CATALOG_SORT_OPTIONS.some(
    (sortOption) => sortOption.value === sortValue,
  )
    ? (sortValue as ProjectCatalogSort)
    : "featured";

  return {
    q: readSearchParam(searchParams, "q"),
    type,
    tech,
    status,
    sort,
  };
};

export const serializeProjectCatalogState = (
  state: ProjectCatalogState,
): URLSearchParams => {
  const searchParams = new URLSearchParams();

  if (state.q.trim().length > 0) searchParams.set("q", state.q);
  if (state.type !== "all") searchParams.set("type", state.type);
  if (state.tech !== "All") searchParams.set("tech", state.tech);
  if (state.status !== "all") searchParams.set("status", state.status);
  if (state.sort !== "featured") searchParams.set("sort", state.sort);

  return searchParams;
};

export const filterAndSortProjects = (
  projects: Project[],
  state: ProjectCatalogState,
): Project[] => {
  const normalizedSearch = state.q.trim().toLowerCase();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      project.title.toLowerCase().includes(normalizedSearch) ||
      project.shortDescription.toLowerCase().includes(normalizedSearch) ||
      getProjectTypeLabel(project.projectType)
        .toLowerCase()
        .includes(normalizedSearch) ||
      project.techStack.some((technology) =>
        technology.label.toLowerCase().includes(normalizedSearch),
      );

    const matchesType =
      state.type === "all" || project.projectType === state.type;
    const matchesTechnology =
      state.tech === "All" ||
      project.techStack.some(
        (technology) => technology.label === state.tech,
      );
    const matchesStatus =
      state.status === "all" || project.status === state.status;

    return matchesSearch && matchesType && matchesTechnology && matchesStatus;
  });

  return [...filteredProjects].sort((first, second) => {
    if (state.sort === "featured") {
      if (first.featured !== second.featured) return first.featured ? -1 : 1;
      return first.sortOrder - second.sortOrder;
    }

    if (state.sort === "newest") {
      return compareProjectMonths(second.startDate, first.startDate);
    }

    if (state.sort === "oldest") {
      return compareProjectMonths(first.startDate, second.startDate);
    }

    return first.title.localeCompare(second.title);
  });
};

export const getActiveProjectFilterCount = (
  state: ProjectCatalogState,
): number =>
  Number(state.type !== "all") +
  Number(state.tech !== "All") +
  Number(state.status !== "all");

export const getProjectCatalogSummaries = (
  state: ProjectCatalogState,
): ProjectCatalogSummary[] => {
  const summaries: ProjectCatalogSummary[] = [];

  if (state.type !== "all") {
    const label = getProjectTypeLabel(state.type);
    summaries.push({
      key: "type",
      label: `Type: ${label}`,
      removeLabel: `Remove project type filter: ${label}`,
    });
  }

  if (state.tech !== "All") {
    summaries.push({
      key: "tech",
      label: `Technology: ${state.tech}`,
      removeLabel: `Remove technology filter: ${state.tech}`,
    });
  }

  if (state.status !== "all") {
    const label = getProjectStatusLabel(state.status);
    summaries.push({
      key: "status",
      label: `Status: ${label}`,
      removeLabel: `Remove project status filter: ${label}`,
    });
  }

  if (state.sort !== "featured") {
    const label =
      PROJECT_CATALOG_SORT_OPTIONS.find(
        (sortOption) => sortOption.value === state.sort,
      )?.label ?? state.sort;
    summaries.push({
      key: "sort",
      label: `Sort: ${label}`,
      removeLabel: `Reset sorting from ${label} to Featured`,
    });
  }

  return summaries;
};

export const removeProjectCatalogSummary = (
  state: ProjectCatalogState,
  key: ProjectCatalogSummaryKey,
): ProjectCatalogState => {
  if (key === "type") return { ...state, type: "all" };
  if (key === "tech") return { ...state, tech: "All" };
  if (key === "status") return { ...state, status: "all" };
  return { ...state, sort: "featured" };
};

export const resetProjectFiltersAndSort = (
  state: ProjectCatalogState,
): ProjectCatalogState => ({
  ...PROJECT_CATALOG_DEFAULT_STATE,
  q: state.q,
});

export const resetProjectCatalogState = (): ProjectCatalogState => ({
  ...PROJECT_CATALOG_DEFAULT_STATE,
});

export const hasActiveProjectCatalogState = (
  state: ProjectCatalogState,
): boolean =>
  state.q.trim().length > 0 ||
  getActiveProjectFilterCount(state) > 0 ||
  state.sort !== "featured";
