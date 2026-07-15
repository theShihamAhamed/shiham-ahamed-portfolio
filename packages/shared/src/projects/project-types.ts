export const PROJECT_TYPES = [
  { value: "full-stack-web-app", label: "Full-stack Web App" },
  { value: "backend-api-service", label: "Backend API Service" },
  { value: "frontend-ui-experience", label: "Frontend UI Experience" },
  { value: "ecommerce-platform", label: "E-commerce Platform" },
  {
    value: "marketplace-booking-platform",
    label: "Marketplace / Booking Platform",
  },
  { value: "microservices-system", label: "Microservices System" },
  { value: "devops-cloud-project", label: "DevOps / Cloud Project" },
  { value: "ai-ml-prototype", label: "AI / ML Prototype" },
  {
    value: "academic-coursework-project",
    label: "Academic Coursework Project",
  },
  { value: "developer-tool", label: "Developer Tool" },
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number]["value"];
export type ProjectTypeDefinition = (typeof PROJECT_TYPES)[number];

export const PROJECT_TYPE_VALUES = PROJECT_TYPES.map(
  ({ value }) => value,
) as [ProjectType, ...ProjectType[]];

export const isProjectType = (value: unknown): value is ProjectType =>
  typeof value === "string" &&
  PROJECT_TYPE_VALUES.some((projectType) => projectType === value);

export const getProjectType = (
  value: string,
): ProjectTypeDefinition | undefined =>
  PROJECT_TYPES.find((projectType) => projectType.value === value);

export const getProjectTypeLabel = (value: ProjectType): string =>
  getProjectType(value)?.label ?? value;
