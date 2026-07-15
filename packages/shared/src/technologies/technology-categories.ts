export const TECH_TAG_CATEGORIES = [
  "frontend", "backend", "database", "devops", "cloud", "testing",
  "ai-ml", "language", "tooling", "architecture", "auth", "payment",
  "storage", "ui", "mobile", "messaging", "observability", "other",
] as const;

export type TechTagCategory = (typeof TECH_TAG_CATEGORIES)[number];

export const TECH_TAG_CATEGORY_DEFINITIONS = [
  { value: "frontend", label: "Frontend" }, { value: "backend", label: "Backend" },
  { value: "database", label: "Database" }, { value: "devops", label: "DevOps" },
  { value: "cloud", label: "Cloud" }, { value: "testing", label: "Testing" },
  { value: "ai-ml", label: "AI / ML" }, { value: "language", label: "Language" },
  { value: "tooling", label: "Tooling" }, { value: "architecture", label: "Architecture" },
  { value: "auth", label: "Auth" }, { value: "payment", label: "Payment" },
  { value: "storage", label: "Storage" }, { value: "ui", label: "UI" },
  { value: "mobile", label: "Mobile" }, { value: "messaging", label: "Messaging" },
  { value: "observability", label: "Observability" }, { value: "other", label: "Other" },
] as const satisfies ReadonlyArray<{ value: TechTagCategory; label: string }>;

export const getTechTagCategoryLabel = (category: TechTagCategory) =>
  TECH_TAG_CATEGORY_DEFINITIONS.find((item) => item.value === category)?.label ?? category;
