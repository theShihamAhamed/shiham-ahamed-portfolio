"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ImageOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import { DynamicStringListInput } from "@/components/forms/dynamic-string-list-input";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { GalleryManager } from "@/components/forms/gallery-manager";
import { ImageUploader } from "@/components/forms/image-uploader";
import { MultiImageUploader } from "@/components/forms/multi-image-uploader";
import { TechStackInput } from "@/components/forms/tech-stack-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  addProjectGalleryImages,
  deleteProjectArchitectureImage,
  deleteProjectGalleryImage,
  getProjectById,
  replaceProjectArchitectureImage,
  replaceProjectThumbnail,
  reorderProjectGallery,
  updateProject,
} from "@/lib/api/projects";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import {
  updateProjectFormSchema,
  type ParsedUpdateProjectFormValues,
  type UpdateProjectFormValues,
} from "@/schemas/project.schema";
import type { ImageAsset } from "@/types/image-asset";
import type {
  AdminProject,
  ProjectLinks,
  ProjectStatus,
  ProjectTechStackItem,
  UpdateProjectInput,
} from "@/types/project";

const projectDetailQueryKey = (projectId: string) =>
  ["projects", "detail", projectId] as const;

const statusLabels: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
};

const statusVariants: Record<ProjectStatus, "green" | "cyan" | "amber"> = {
  completed: "green",
  "in-progress": "cyan",
  planned: "amber",
};

const getMessage = (message: unknown) =>
  typeof message === "string" ? message : undefined;

const toProjectFormValues = (project: AdminProject): UpdateProjectFormValues => ({
  title: project.title,
  slug: project.slug,
  shortDescription: project.shortDescription,
  description: project.description,
  projectType: project.projectType,
  status: project.status,
  year: project.year,
  startDate: project.startDate ?? "",
  endDate: project.endDate ?? "",
  videoUrl: project.videoUrl ?? "",
  videoPosterUrl: project.videoPosterUrl ?? "",
  links: {
    github: project.links?.github ?? "",
    liveDemo: project.links?.liveDemo ?? "",
    article: project.links?.article ?? "",
  },
  techStack: project.techStack.map((item) => ({
    label: item.label,
    category: item.category ?? "",
    color: item.color ?? "",
    showOnCard: item.showOnCard ?? false,
  })),
  overview: project.overview,
  highlights: project.highlights,
  architecture: {
    summary: project.architecture?.summary ?? "",
    points: project.architecture?.points ?? [],
  },
  challenges: project.challenges ?? [],
  futureImprovements: project.futureImprovements ?? [],
});

const cleanTechStack = (items: ProjectTechStackItem[]) =>
  items.map((item) => ({
    label: item.label,
    ...(item.category?.trim() ? { category: item.category.trim() } : {}),
    ...(item.color?.trim() ? { color: item.color.trim() } : {}),
    showOnCard: item.showOnCard ?? false,
  }));

const toUpdateProjectInput = (
  values: ParsedUpdateProjectFormValues,
): UpdateProjectInput => ({
  title: values.title,
  slug: values.slug,
  shortDescription: values.shortDescription,
  description: values.description,
  projectType: values.projectType,
  status: values.status,
  year: values.year,
  ...(values.startDate ? { startDate: values.startDate } : {}),
  ...(values.endDate ? { endDate: values.endDate } : {}),
  videoUrl: values.videoUrl,
  videoPosterUrl: values.videoPosterUrl,
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

const updateProjectInList = (
  projects: AdminProject[] | undefined,
  project: AdminProject,
) => projects?.map((item) => (item.id === project.id ? project : item));

type ProjectCacheSync = (project: AdminProject) => void;

type GalleryReorderContext = {
  previousProject?: AdminProject;
};

function ProjectStateSummary({ project }: { project: AdminProject }) {
  return (
    <Card className="border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] shadow-none">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge variant={project.isVisible ? "green" : "neutral"}>
            {project.isVisible ? "Visible" : "Hidden"}
          </Badge>
          <Badge variant={project.isFeatured ? "cyan" : "neutral"}>
            {project.isFeatured ? "Featured" : "Not featured"}
          </Badge>
          <Badge variant={statusVariants[project.status]}>
            {statusLabels[project.status]}
          </Badge>
        </div>
        <p className="text-xs text-[var(--admin-muted)]">
          Display order {project.displayOrder}
        </p>
      </CardContent>
    </Card>
  );
}

function ProjectMetadataForm({
  project,
  onProjectUpdated,
}: {
  project: AdminProject;
  onProjectUpdated: ProjectCacheSync;
}) {
  const queryClient = useQueryClient();
  const initializedProjectIdRef = useRef<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<
    UpdateProjectFormValues,
    unknown,
    ParsedUpdateProjectFormValues
  >({
    resolver: zodResolver(updateProjectFormSchema),
    defaultValues: toProjectFormValues(project),
  });

  useEffect(() => {
    if (initializedProjectIdRef.current === project.id) {
      return;
    }

    reset(toProjectFormValues(project));
    initializedProjectIdRef.current = project.id;
  }, [project, reset]);

  const architecturePoints =
    useWatch({ control, name: "architecture.points" }) ?? [];
  const techStack =
    (useWatch({ control, name: "techStack" }) ?? []) as ProjectTechStackItem[];
  const overview = useWatch({ control, name: "overview" }) ?? [];
  const highlights = useWatch({ control, name: "highlights" }) ?? [];
  const challenges = useWatch({ control, name: "challenges" }) ?? [];
  const futureImprovements =
    useWatch({ control, name: "futureImprovements" }) ?? [];

  const metadataMutation = useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(project.id, input),
    onSuccess: (updatedProject) => {
      onProjectUpdated(updatedProject);
      reset(toProjectFormValues(updatedProject));
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccessToast("Project metadata updated successfully.");
    },
    onError: (error) => {
      const message = getToastErrorMessage(error);
      setError("root", { message });
      showErrorToast(error, "Project metadata could not be updated.");
    },
  });

  const setStringListValue = (
    name: "overview" | "highlights" | "challenges" | "futureImprovements",
    value: string[],
  ) => {
    setValue(name, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: ParsedUpdateProjectFormValues) => {
    try {
      await metadataMutation.mutateAsync(toUpdateProjectInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit, () => {
        showErrorToast(new Error("Fix the highlighted project fields."));
      })}
    >
      {errors.root?.message ? (
        <Card className="border-red-200 bg-red-50 shadow-none">
          <CardContent className="flex gap-3 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {errors.root.message}
          </CardContent>
        </Card>
      ) : null}

      <FormSection
        title="Basic Details"
        description="These fields power project cards and the project detail intro."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="title">
              Title <span className="text-red-700">*</span>
            </label>
            <Input id="title" className="mt-2" {...register("title")} />
            <FieldError message={getMessage(errors.title?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="slug">
              Slug <span className="text-red-700">*</span>
            </label>
            <Input id="slug" className="mt-2" {...register("slug")} />
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Manual edits are preserved when the title changes.
            </p>
            <FieldError message={getMessage(errors.slug?.message)} />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="projectType"
            >
              Project type <span className="text-red-700">*</span>
            </label>
            <Input id="projectType" className="mt-2" {...register("projectType")} />
            <FieldError message={getMessage(errors.projectType?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]">
              Status <span className="text-red-700">*</span>
            </label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={getMessage(errors.status?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="year">
              Year <span className="text-red-700">*</span>
            </label>
            <Input id="year" className="mt-2" {...register("year")} />
            <FieldError message={getMessage(errors.year?.message)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="startDate"
              >
                Start date <span className="text-[var(--admin-muted)]">optional</span>
              </label>
              <Input
                id="startDate"
                className="mt-2"
                placeholder="YYYY-MM"
                {...register("startDate")}
              />
              <FieldError message={getMessage(errors.startDate?.message)} />
            </div>
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="endDate"
              >
                End date <span className="text-[var(--admin-muted)]">optional</span>
              </label>
              <Input
                id="endDate"
                className="mt-2"
                placeholder="YYYY-MM"
                {...register("endDate")}
              />
              <FieldError message={getMessage(errors.endDate?.message)} />
            </div>
          </div>
        </div>

        <div>
          <label
            className="text-sm font-medium text-[var(--admin-text)]"
            htmlFor="shortDescription"
          >
            Card Description <span className="text-red-700">*</span>
          </label>
          <Textarea
            id="shortDescription"
            className="mt-2 min-h-24"
            {...register("shortDescription")}
          />
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            Used on project cards and compact project lists.
          </p>
          <FieldError message={getMessage(errors.shortDescription?.message)} />
        </div>

        <div>
          <label
            className="text-sm font-medium text-[var(--admin-text)]"
            htmlFor="description"
          >
            Detail Intro <span className="text-red-700">*</span>
          </label>
          <Textarea id="description" className="mt-2" {...register("description")} />
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            Used as the intro text on the project detail page.
          </p>
          <FieldError message={getMessage(errors.description?.message)} />
        </div>
      </FormSection>

      <FormSection title="Links" description="Optional external destinations.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="github">
              GitHub
            </label>
            <Input id="github" className="mt-2" {...register("links.github")} />
            <FieldError message={getMessage(errors.links?.github?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="liveDemo">
              Live demo
            </label>
            <Input id="liveDemo" className="mt-2" {...register("links.liveDemo")} />
            <FieldError message={getMessage(errors.links?.liveDemo?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="article">
              Case Study / MDX URL
            </label>
            <Input id="article" className="mt-2" {...register("links.article")} />
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Optional raw MDX or article URL used by the viewer-facing project
              detail page.
            </p>
            <FieldError message={getMessage(errors.links?.article?.message)} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Project Demo Video"
        description="Optional embedded video for the public project detail hero."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="videoUrl"
            >
              Project demo video URL{" "}
              <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input id="videoUrl" className="mt-2" {...register("videoUrl")} />
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Paste a YouTube unlisted video URL. YouTube is used for free
              project demo hosting and provides built-in quality and speed
              controls.
            </p>
            <FieldError message={getMessage(errors.videoUrl?.message)} />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="videoPosterUrl"
            >
              Video poster URL{" "}
              <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="videoPosterUrl"
              className="mt-2"
              {...register("videoPosterUrl")}
            />
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Optional preview image shown before the YouTube player loads. If
              empty, the project thumbnail is used.
            </p>
            <FieldError message={getMessage(errors.videoPosterUrl?.message)} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Tech Stack"
        description="Project tech stack requires at least one labeled item."
      >
        <TechStackInput
          value={techStack}
          onChange={(value) =>
            setValue("techStack", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
        <FieldError message={getMessage(errors.techStack?.message)} />
      </FormSection>

      <FormSection
        title="Overview"
        description="Add at least one overview paragraph. One paragraph is enough if the project only needs a short summary."
      >
        <DynamicStringListInput
          label="Overview paragraphs"
          value={overview}
          onChange={(value) => setStringListValue("overview", value)}
          minItems={1}
        />
        <FieldError message={getMessage(errors.overview?.message)} />
      </FormSection>

      <FormSection title="Highlights" description="Key feature bullets.">
        <DynamicStringListInput
          label="Highlights"
          value={highlights}
          onChange={(value) => setStringListValue("highlights", value)}
          minItems={1}
        />
        <FieldError message={getMessage(errors.highlights?.message)} />
      </FormSection>

      <FormSection
        title="Architecture Copy"
        description="Architecture summary and supporting points stay separate from image replacement."
      >
        <div>
          <label
            className="text-sm font-medium text-[var(--admin-text)]"
            htmlFor="architectureSummary"
          >
            Architecture summary <span className="text-[var(--admin-muted)]">optional</span>
          </label>
          <Textarea
            id="architectureSummary"
            className="mt-2"
            {...register("architecture.summary")}
          />
          <FieldError message={getMessage(errors.architecture?.summary?.message)} />
        </div>
        <DynamicStringListInput
          label="Architecture points"
          value={architecturePoints}
          onChange={(value) =>
            setValue("architecture.points", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          emptyMessage="No architecture points added yet."
        />
      </FormSection>

      <FormSection title="Challenges" description="Optional implementation notes.">
        <DynamicStringListInput
          label="Challenges"
          value={challenges}
          onChange={(value) => setStringListValue("challenges", value)}
          emptyMessage="No challenges added yet."
        />
      </FormSection>

      <FormSection
        title="Future Improvements"
        description="Optional ideas for what could come next."
      >
        <DynamicStringListInput
          label="Future improvements"
          value={futureImprovements}
          onChange={(value) => setStringListValue("futureImprovements", value)}
          emptyMessage="No future improvements added yet."
        />
      </FormSection>

      <FormSection
        title="Publishing State"
        description="Featured and visibility are controlled from the project list."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant={project.isVisible ? "green" : "neutral"}>
            {project.isVisible ? "Visible" : "Hidden"}
          </Badge>
          <Badge variant={project.isFeatured ? "cyan" : "neutral"}>
            {project.isFeatured ? "Featured" : "Not featured"}
          </Badge>
          <Badge variant="neutral">Display order {project.displayOrder}</Badge>
        </div>
      </FormSection>

      <FormActions
        cancelHref="/admin/projects"
        submitLabel="Save Metadata"
        isSubmitting={isSubmitting || metadataMutation.isPending}
      />
    </form>
  );
}

function ProjectMediaManagement({
  project,
  onProjectUpdated,
}: {
  project: AdminProject;
  onProjectUpdated: ProjectCacheSync;
}) {
  const queryClient = useQueryClient();

  const syncUpdatedProject = (updatedProject: AdminProject) => {
    onProjectUpdated(updatedProject);
    void queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const galleryReorderMutation = useMutation<
    AdminProject,
    Error,
    ImageAsset[],
    GalleryReorderContext
  >({
    mutationFn: (orderedImages) => {
      const orderedFileIds = orderedImages.map((image) => image.fileId);

      if (orderedFileIds.some((fileId) => !fileId)) {
        throw new Error("Every gallery image needs an ImageKit fileId to reorder.");
      }

      return reorderProjectGallery({
        id: project.id,
        orderedFileIds: orderedFileIds as string[],
      });
    },
    onMutate: async (orderedImages) => {
      await queryClient.cancelQueries({ queryKey: projectDetailQueryKey(project.id) });
      const previousProject =
        queryClient.getQueryData<AdminProject>(projectDetailQueryKey(project.id)) ??
        project;

      onProjectUpdated({
        ...project,
        gallery: orderedImages,
      });

      return { previousProject };
    },
    onError: (error, _orderedImages, context) => {
      if (context?.previousProject) {
        onProjectUpdated(context.previousProject);
      }

      showErrorToast(error, "Gallery order could not be saved.");
    },
    onSuccess: (updatedProject) => {
      syncUpdatedProject(updatedProject);
      showSuccessToast("Gallery order saved successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: projectDetailQueryKey(project.id),
      });
    },
  });

  const architectureDeleteMutation = useMutation({
    mutationFn: () => deleteProjectArchitectureImage(project.id),
    onSuccess: (updatedProject) => {
      syncUpdatedProject(updatedProject);
      showSuccessToast("Architecture image deleted successfully.");
    },
    onError: (error) => {
      showErrorToast(error, "Architecture image could not be deleted.");
    },
  });

  const addGalleryUploadAction = async ({
    files,
    alt,
  }: {
    files: File[];
    alt: string | string[];
  }) => {
    const previousFileIds = new Set(
      project.gallery.map((image) => image.fileId).filter(Boolean),
    );
    const updatedProject = await addProjectGalleryImages({
      id: project.id,
      files,
      alt,
    });
    const addedImages = updatedProject.gallery.filter(
      (image) => image.fileId && !previousFileIds.has(image.fileId),
    );

    syncUpdatedProject(updatedProject);

    return addedImages.length > 0
      ? addedImages
      : updatedProject.gallery.slice(-files.length);
  };

  const deleteGalleryImage = async (image: ImageAsset) => {
    if (!image.fileId) {
      throw new Error("Gallery image is missing its ImageKit fileId.");
    }

    try {
      const updatedProject = await deleteProjectGalleryImage({
        id: project.id,
        imageFileId: image.fileId,
      });
      syncUpdatedProject(updatedProject);
      showSuccessToast("Gallery image deleted successfully.");
    } catch (error) {
      showErrorToast(error, "Gallery image could not be deleted.");
      throw error;
    }
  };

  return (
    <FormSection
      title="Media"
      description="Thumbnail, architecture image, and gallery changes use project media endpoints."
    >
      <ImageUploader
        key={`thumbnail-${project.thumbnail.fileId ?? project.thumbnail.url}`}
        folder="projects-thumbnails"
        label="Thumbnail image"
        existingImage={project.thumbnail}
        replaceModeLabel="Replace thumbnail"
        successMessage="Thumbnail replaced successfully."
        uploadAction={async ({ file, alt }) => {
          const updatedProject = await replaceProjectThumbnail({
            id: project.id,
            file,
            alt,
          });
          syncUpdatedProject(updatedProject);

          return updatedProject.thumbnail;
        }}
        onUploaded={() => undefined}
      />

      <div className="space-y-3">
        <ImageUploader
          key={`architecture-${
            project.architecture?.image?.fileId ??
            project.architecture?.image?.url ??
            "empty"
          }`}
          folder="projects-architecture"
          label="Architecture image"
          existingImage={project.architecture?.image}
          replaceModeLabel="Replace architecture image"
          successMessage="Architecture image replaced successfully."
          uploadAction={async ({ file, alt }) => {
            const updatedProject = await replaceProjectArchitectureImage({
              id: project.id,
              file,
              alt,
            });
            syncUpdatedProject(updatedProject);

            if (!updatedProject.architecture?.image) {
              throw new Error("Architecture image was not returned by the API.");
            }

            return updatedProject.architecture.image;
          }}
          onUploaded={() => undefined}
        />

        {project.architecture?.image ? (
          <Button
            variant="danger"
            size="sm"
            disabled={architectureDeleteMutation.isPending}
            onClick={() => architectureDeleteMutation.mutate()}
          >
            {architectureDeleteMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ImageOff className="size-4" aria-hidden="true" />
            )}
            Delete architecture image
          </Button>
        ) : null}
      </div>

      <MultiImageUploader
        folder="projects-gallery"
        label="Add gallery images"
        successMessage="Gallery images added successfully."
        uploadAction={addGalleryUploadAction}
        onUploaded={() => undefined}
      />
      <GalleryManager
        images={project.gallery}
        onDelete={deleteGalleryImage}
        onReorder={async (orderedImages) => {
          await galleryReorderMutation.mutateAsync(orderedImages);
        }}
        isReordering={galleryReorderMutation.isPending}
      />
    </FormSection>
  );
}

export function ProjectEditPage({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const projectQuery = useQuery({
    queryKey: projectDetailQueryKey(projectId),
    queryFn: () => getProjectById(projectId),
    retry: false,
  });

  const syncProject = (project: AdminProject) => {
    queryClient.setQueryData(projectDetailQueryKey(project.id), project);
    queryClient.setQueryData<AdminProject[]>(["projects"], (projects) =>
      updateProjectInList(projects, project),
    );
    queryClient.setQueriesData<AdminProject[]>(
      { queryKey: ["projects", "list"] },
      (projects) => updateProjectInList(projects, project),
    );
  };

  if (projectQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <LoadingState message="Loading project editor..." />
      </section>
    );
  }

  if (projectQuery.isError || !projectQuery.data) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <AdminPageHeader
          title="Edit Project"
          description="The requested project could not be loaded."
          badge="Edit"
          actions={
            <Link
              href="/admin/projects"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Projects
            </Link>
          }
        />
        <ErrorState
          title="Project unavailable"
          description={getToastErrorMessage(projectQuery.error)}
          onRetry={() => void projectQuery.refetch()}
        />
      </section>
    );
  }

  const project = projectQuery.data;

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <AdminPageHeader
        title={project.title}
        description="Edit project metadata and manage project-owned media assets."
        badge="Edit Project"
        actions={
          <Link
            href="/admin/projects"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Projects
          </Link>
        }
      />

      <ProjectStateSummary project={project} />
      <ProjectMetadataForm project={project} onProjectUpdated={syncProject} />
      <ProjectMediaManagement project={project} onProjectUpdated={syncProject} />
    </section>
  );
}
