export const PROJECT_STATUSES = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
  { value: "planned", label: "Planned" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"];
export type ProjectStatusDefinition = (typeof PROJECT_STATUSES)[number];

export const projectStatuses = PROJECT_STATUSES.map(
  ({ value }) => value,
) as [ProjectStatus, ...ProjectStatus[]];

export const getProjectStatus = (
  value: string,
): ProjectStatusDefinition | undefined =>
  PROJECT_STATUSES.find((status) => status.value === value);

const projectStatusLabels = Object.fromEntries(
  PROJECT_STATUSES.map(({ value, label }) => [value, label]),
) as Record<ProjectStatus, ProjectStatusDefinition["label"]>;

export const getProjectStatusLabel = (
  value: ProjectStatus,
): ProjectStatusDefinition["label"] =>
  projectStatusLabels[value];
