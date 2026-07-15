"use client";

import {
  getProjectStatus,
  isProjectType,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  type ProjectStatus,
  type ProjectType,
} from "@portfolio/shared";
import { CalendarDays, ExternalLink, Tags } from "lucide-react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { DynamicStringListInput } from "@/components/forms/dynamic-string-list-input";
import { CaseStudyEditorField } from "@/components/admin/projects/case-study-editor-field";
import { FieldError } from "@/components/forms/field-error";
import { FormSection } from "@/components/forms/form-section";
import { TechStackInput } from "@/components/forms/tech-stack-input";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProjectTechStackItem } from "@/types/project";

type FieldRegistration = UseFormRegisterReturn;

export type ProjectFormFieldErrors = Partial<{
  title: string;
  slug: string;
  projectType: string;
  status: string;
  startDate: string;
  endDate: string;
  shortDescription: string;
  description: string;
  videoUrl: string;
  videoPosterUrl: string;
  github: string;
  liveDemo: string;
  article: string;
  caseStudyMdx: string;
  techStack: string;
  overview: string;
  highlights: string;
  architectureSummary: string;
}>;

type ProjectFormFieldsProps = {
  mode: "create" | "edit";
  disabled?: boolean;
  registrations: {
    title: FieldRegistration;
    slug: FieldRegistration;
    startDate: FieldRegistration;
    endDate: FieldRegistration;
    shortDescription: FieldRegistration;
    description: FieldRegistration;
    videoUrl: FieldRegistration;
    videoPosterUrl: FieldRegistration;
    github: FieldRegistration;
    liveDemo: FieldRegistration;
    article: FieldRegistration;
    caseStudyMdx: FieldRegistration;
    architectureSummary: FieldRegistration;
  };
  errors: ProjectFormFieldErrors;
  projectType: ProjectType;
  status: ProjectStatus;
  startDate: string;
  onProjectTypeChange: (value: ProjectType) => void;
  onStatusChange: (value: ProjectStatus) => void;
  techStack: ProjectTechStackItem[];
  onTechStackChange: (value: ProjectTechStackItem[]) => void;
  onTechValidityChange: (isValid: boolean) => void;
  overview: string[];
  highlights: string[];
  challenges: string[];
  futureImprovements: string[];
  architecturePoints: string[];
  onListChange: (
    name:
      | "overview"
      | "highlights"
      | "challenges"
      | "futureImprovements"
      | "architecture.points",
    value: string[],
  ) => void;
  mediaSection?: ReactNode;
  publishingContent: ReactNode;
  caseStudyMdx: string;
  onCaseStudyMdxChange: (value: string) => void;
};

const describedBy = (id: string, hasError: boolean) =>
  `${id}-help${hasError ? ` ${id}-error` : ""}`;

export function ProjectFormFields({
  mode,
  disabled = false,
  registrations,
  errors,
  projectType,
  status,
  startDate,
  onProjectTypeChange,
  onStatusChange,
  techStack,
  onTechStackChange,
  onTechValidityChange,
  overview,
  highlights,
  challenges,
  futureImprovements,
  architecturePoints,
  onListChange,
  mediaSection,
  publishingContent,
  caseStudyMdx,
  onCaseStudyMdxChange,
}: ProjectFormFieldsProps) {
  const endRequired = status === "completed";
  const timelineHelp = endRequired
    ? "Completed projects require an end month."
    : status === "in-progress"
      ? "Leave the end month empty while work is ongoing."
      : "The end month is optional for planned work and may be an estimate.";

  return (
    <>
      <FormSection
        title="Basic Information"
        description="Core identity and concise copy used throughout the admin and public project views."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="title">
              Title <span className="text-red-700">*</span>
            </label>
            <Input
              id="title"
              className="mt-2"
              disabled={disabled}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "title-error" : undefined}
              {...registrations.title}
            />
            <FieldError id="title-error" message={errors.title} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="slug">
              Slug {mode === "create" ? (
                <span className="text-[var(--admin-muted)]">optional</span>
              ) : (
                <span className="text-red-700">*</span>
              )}
            </label>
            <Input
              id="slug"
              className="mt-2"
              disabled={disabled}
              placeholder="project-slug"
              aria-invalid={errors.slug ? true : undefined}
              aria-describedby={describedBy("slug", Boolean(errors.slug))}
              {...registrations.slug}
            />
            <p id="slug-help" className="mt-1 text-xs text-[var(--admin-muted)]">
              {mode === "create"
                ? "Leave empty to generate it from the title."
                : "Manual slug edits remain stable when the title changes."}
            </p>
            <FieldError id="slug-error" message={errors.slug} />
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-[var(--admin-text)]"
            htmlFor="shortDescription"
          >
            Card description <span className="text-red-700">*</span>
          </label>
          <Textarea
            id="shortDescription"
            className="mt-2 min-h-24"
            disabled={disabled}
            placeholder="A concise summary for project cards"
            aria-invalid={errors.shortDescription ? true : undefined}
            aria-describedby={describedBy(
              "shortDescription",
              Boolean(errors.shortDescription),
            )}
            {...registrations.shortDescription}
          />
          <p id="shortDescription-help" className="mt-1 text-xs text-[var(--admin-muted)]">
            Used on project cards and compact project lists.
          </p>
          <FieldError id="shortDescription-error" message={errors.shortDescription} />
        </div>

        <div>
          <label
            className="text-sm font-medium text-[var(--admin-text)]"
            htmlFor="description"
          >
            Detail introduction <span className="text-red-700">*</span>
          </label>
          <Textarea
            id="description"
            className="mt-2 min-h-28"
            disabled={disabled}
            placeholder="Introduce the project, problem, and outcome"
            aria-invalid={errors.description ? true : undefined}
            aria-describedby={describedBy("description", Boolean(errors.description))}
            {...registrations.description}
          />
          <p id="description-help" className="mt-1 text-xs text-[var(--admin-muted)]">
            Used as the opening text on the project detail page.
          </p>
          <FieldError id="description-error" message={errors.description} />
        </div>
      </FormSection>

      <FormSection
        title="Timeline and Classification"
        description="Use stable project classifications and month-level dates from the shared Phase 3 contract."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="projectType">
              Project type <span className="text-red-700">*</span>
            </label>
            <Select
              value={projectType}
              disabled={disabled}
              onValueChange={(value) => {
                if (isProjectType(value)) onProjectTypeChange(value);
              }}
            >
              <SelectTrigger
                id="projectType"
                className="mt-2"
                aria-invalid={errors.projectType ? true : undefined}
                aria-describedby={errors.projectType ? "projectType-error" : undefined}
              >
                <SelectValue placeholder="Select a project type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="projectType-error" message={errors.projectType} />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="projectStatus">
              Status <span className="text-red-700">*</span>
            </label>
            <Select
              value={status}
              disabled={disabled}
              onValueChange={(value) => {
                const selectedStatus = getProjectStatus(value);
                if (selectedStatus) onStatusChange(selectedStatus.value);
              }}
            >
              <SelectTrigger
                id="projectStatus"
                className="mt-2"
                aria-invalid={errors.status ? true : undefined}
                aria-describedby={errors.status ? "projectStatus-error" : undefined}
              >
                <SelectValue placeholder="Select a project status" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="projectStatus-error" message={errors.status} />
          </div>
        </div>

        <fieldset className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
          <legend className="px-1 text-sm font-semibold text-[var(--admin-text)]">
            Project timeline
          </legend>
          <p id="timeline-help" className="mb-4 text-xs leading-5 text-[var(--admin-muted)]">
            {timelineHelp} Dates are stored as year and month only.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="startDate">
                Start month <span className="text-red-700">*</span>
              </label>
              <div className="relative mt-2">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]"
                  aria-hidden="true"
                />
                <Input
                  id="startDate"
                  type="month"
                  required
                  disabled={disabled}
                  className="pl-10"
                  aria-invalid={errors.startDate ? true : undefined}
                  aria-describedby={`timeline-help${errors.startDate ? " startDate-error" : ""}`}
                  {...registrations.startDate}
                />
              </div>
              <FieldError id="startDate-error" message={errors.startDate} />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="endDate">
                End month {endRequired ? (
                  <span className="text-red-700">*</span>
                ) : (
                  <span className="text-[var(--admin-muted)]">optional</span>
                )}
              </label>
              <div className="relative mt-2">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]"
                  aria-hidden="true"
                />
                <Input
                  id="endDate"
                  type="month"
                  min={startDate || undefined}
                  required={endRequired}
                  disabled={disabled}
                  className="pl-10"
                  aria-invalid={errors.endDate ? true : undefined}
                  aria-describedby={`timeline-help${errors.endDate ? " endDate-error" : ""}`}
                  {...registrations.endDate}
                />
              </div>
              <FieldError id="endDate-error" message={errors.endDate} />
            </div>
          </div>
        </fieldset>
      </FormSection>

      <FormSection
        title="Description and Content"
        description="Organize the long-form project story without mixing it into classification or media controls."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <DynamicStringListInput
            label="Overview paragraphs"
            value={overview}
            onChange={(value) => onListChange("overview", value)}
            placeholder="Add an overview paragraph"
            minItems={1}
          />
          <DynamicStringListInput
            label="Highlights"
            value={highlights}
            onChange={(value) => onListChange("highlights", value)}
            placeholder="Add a project highlight"
            minItems={1}
          />
          <DynamicStringListInput
            label="Challenges"
            value={challenges}
            onChange={(value) => onListChange("challenges", value)}
            placeholder="Add an implementation challenge"
            emptyMessage="No challenges added yet."
          />
          <DynamicStringListInput
            label="Future improvements"
            value={futureImprovements}
            onChange={(value) => onListChange("futureImprovements", value)}
            placeholder="Add a future improvement"
            emptyMessage="No future improvements added yet."
          />
        </div>
        <FieldError message={errors.overview} />
        <FieldError message={errors.highlights} />
        <CaseStudyEditorField
          value={caseStudyMdx}
          registration={registrations.caseStudyMdx}
          error={errors.caseStudyMdx}
          disabled={disabled}
          onChange={onCaseStudyMdxChange}
        />
      </FormSection>

      <FormSection
        title="Technology Stack"
        description="Group manual technology entries now; Phase 5 can replace item controls without changing this section layout."
      >
        <div className="flex items-start gap-3 rounded-lg bg-[var(--admin-accent-soft)] p-3 text-xs leading-5 text-[var(--admin-muted)]">
          <Tags className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Group names, technology names, and color choices are saved only when entered—not from placeholders.
        </div>
        <TechStackInput
          value={techStack}
          onChange={onTechStackChange}
          onValidityChange={onTechValidityChange}
        />
        <FieldError message={errors.techStack} />
      </FormSection>

      {mediaSection}

      <FormSection
        title="Project Media Details"
        description="Optional video presentation and architecture copy; image uploads are managed in the dedicated media area."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="videoUrl">
              Demo video URL <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="videoUrl"
              className="mt-2"
              disabled={disabled}
              placeholder="https://youtube.com/watch?v=…"
              aria-invalid={errors.videoUrl ? true : undefined}
              aria-describedby={describedBy("videoUrl", Boolean(errors.videoUrl))}
              {...registrations.videoUrl}
            />
            <p id="videoUrl-help" className="mt-1 text-xs text-[var(--admin-muted)]">
              Use a YouTube watch, share, shorts, or embed URL.
            </p>
            <FieldError id="videoUrl-error" message={errors.videoUrl} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="videoPosterUrl">
              Video poster URL <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="videoPosterUrl"
              className="mt-2"
              disabled={disabled}
              placeholder="https://…/poster.webp"
              aria-invalid={errors.videoPosterUrl ? true : undefined}
              aria-describedby={describedBy(
                "videoPosterUrl",
                Boolean(errors.videoPosterUrl),
              )}
              {...registrations.videoPosterUrl}
            />
            <p id="videoPosterUrl-help" className="mt-1 text-xs text-[var(--admin-muted)]">
              Leave empty to use the project thumbnail.
            </p>
            <FieldError id="videoPosterUrl-error" message={errors.videoPosterUrl} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="architectureSummary"
            >
              Architecture summary <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Textarea
              id="architectureSummary"
              className="mt-2 min-h-28"
              disabled={disabled}
              placeholder="Explain the system design at a glance"
              aria-invalid={errors.architectureSummary ? true : undefined}
              aria-describedby={errors.architectureSummary ? "architectureSummary-error" : undefined}
              {...registrations.architectureSummary}
            />
            <FieldError id="architectureSummary-error" message={errors.architectureSummary} />
          </div>
          <DynamicStringListInput
            label="Architecture points"
            value={architecturePoints}
            onChange={(value) => onListChange("architecture.points", value)}
            placeholder="Add an architecture point"
            emptyMessage="No architecture points added yet."
          />
        </div>
      </FormSection>

      <FormSection title="Links" description="Optional external destinations for source, live access, and supporting content.">
        <div className="mb-1 flex items-center gap-2 text-xs text-[var(--admin-muted)]">
          <ExternalLink className="size-4" aria-hidden="true" />
          Only http and https destinations are accepted.
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {([
            ["github", "GitHub", registrations.github, errors.github, "https://github.com/…"],
            ["liveDemo", "Live demo", registrations.liveDemo, errors.liveDemo, "https://…"],
            ["article", "Supporting article", registrations.article, errors.article, "https://…"],
          ] as const).map(([id, label, registration, error, placeholder]) => (
            <div key={id}>
              <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor={id}>
                {label}
              </label>
              <Input
                id={id}
                className="mt-2"
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                {...registration}
              />
              <FieldError id={`${id}-error`} message={error} />
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection
        title={mode === "create" ? "Visibility and Featured Settings" : "Publishing State"}
        description={
          mode === "create"
            ? "Choose how the new project should appear after creation."
            : "Review current publishing settings; list-level actions remain the owner of visibility and featured toggles."
        }
      >
        {publishingContent}
      </FormSection>
    </>
  );
}
