"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { getProjectStatusLabel } from "@portfolio/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import {
  ProjectFormFields,
  type ProjectFormFieldErrors,
} from "@/components/admin/projects/project-form-fields";
import {
  getFirstFormErrorMessage,
  toProjectFormValues,
  toUpdateProjectInput,
} from "@/components/admin/projects/project-form.utils";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { GalleryManager } from "@/components/forms/gallery-manager";
import { ImageUploader } from "@/components/forms/image-uploader";
import { MultiImageUploader } from "@/components/forms/multi-image-uploader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
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
  ProjectStatus,
  ProjectTechStackItem,
  UpdateProjectInput,
} from "@/types/project";

const projectDetailQueryKey = (projectId: string) =>
  ["projects", "detail", projectId] as const;

const statusVariants: Record<ProjectStatus, "green" | "cyan" | "amber"> = {
  completed: "green",
  "in-progress": "cyan",
  planned: "amber",
};

const updateProjectInList = (
  projects: AdminProject[] | undefined,
  project: AdminProject,
) => projects?.map((item) => (item.id === project.id ? project : item));

type ProjectCacheSync = (project: AdminProject) => void;
type GalleryReorderContext = { previousProject?: AdminProject };

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
            {getProjectStatusLabel(project.status)}
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
  const [isTechEditorValid, setIsTechEditorValid] = useState(true);
  const {
    control,
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    trigger,
  } = useForm<
    UpdateProjectFormValues,
    unknown,
    ParsedUpdateProjectFormValues
  >({
    resolver: zodResolver(updateProjectFormSchema),
    defaultValues: toProjectFormValues(project),
    shouldFocusError: true,
  });

  useUnsavedChanges(isDirty && !isSubmitting);

  useEffect(() => {
    if (initializedProjectIdRef.current === project.id) return;
    reset(toProjectFormValues(project));
    initializedProjectIdRef.current = project.id;
  }, [project, reset]);

  const projectType = useWatch({ control, name: "projectType" });
  const status = useWatch({ control, name: "status" });
  const startDate = useWatch({ control, name: "startDate" });
  const shortDescription = useWatch({ control, name: "shortDescription" }) ?? "";
  const architecturePoints =
    useWatch({ control, name: "architecture.points" }) ?? [];
  const watchedArchitectureSummary = useWatch({
    control,
    name: "architecture.summary",
  });
  const architectureSummary =
    typeof watchedArchitectureSummary === "string" ? watchedArchitectureSummary : "";
  const techStack =
    (useWatch({ control, name: "techStack" }) ?? []) as ProjectTechStackItem[];
  const overview = useWatch({ control, name: "overview" }) ?? [];
  const highlights = useWatch({ control, name: "highlights" }) ?? [];
  const challenges = useWatch({ control, name: "challenges" }) ?? [];
  const futureImprovements =
    useWatch({ control, name: "futureImprovements" }) ?? [];
  const caseStudyMdx = useWatch({ control, name: "caseStudyMdx" }) ?? "";

  const metadataMutation = useMutation({
    mutationFn: (input: UpdateProjectInput) => updateProject(project.id, input),
    onSuccess: (updatedProject) => {
      onProjectUpdated(updatedProject);
      reset(toProjectFormValues(updatedProject));
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccessToast("Project changes saved successfully.");
    },
    onError: (error) => {
      const message = getToastErrorMessage(error);
      setError("root", { message });
      showErrorToast(error, "Project changes could not be saved.");
    },
  });

  const onSubmit = async (values: ParsedUpdateProjectFormValues) => {
    if (!isTechEditorValid) {
      setError("techStack", {
        message: "Name or remove every empty technology group before saving.",
      });
      showErrorToast(new Error("Finish the highlighted technology group."));
      return;
    }

    try {
      await metadataMutation.mutateAsync(toUpdateProjectInput(values));
    } catch {
      // The mutation onError path owns the root message and toast.
    }
  };

  const fieldErrors: ProjectFormFieldErrors = {
    title: getFirstFormErrorMessage(errors.title),
    slug: getFirstFormErrorMessage(errors.slug),
    projectType: getFirstFormErrorMessage(errors.projectType),
    status: getFirstFormErrorMessage(errors.status),
    startDate: getFirstFormErrorMessage(errors.startDate),
    endDate: getFirstFormErrorMessage(errors.endDate),
    shortDescription: getFirstFormErrorMessage(errors.shortDescription),
    videoUrl: getFirstFormErrorMessage(errors.videoUrl),
    videoPosterUrl: getFirstFormErrorMessage(errors.videoPosterUrl),
    github: getFirstFormErrorMessage(errors.links?.github),
    liveDemo: getFirstFormErrorMessage(errors.links?.liveDemo),
    article: getFirstFormErrorMessage(errors.links?.article),
    caseStudyMdx: getFirstFormErrorMessage(errors.caseStudyMdx),
    techStack: getFirstFormErrorMessage(errors.techStack),
    overview: getFirstFormErrorMessage(errors.overview),
    highlights: getFirstFormErrorMessage(errors.highlights),
    architectureSummary: getFirstFormErrorMessage(errors.architecture?.summary),
    architecturePoints: getFirstFormErrorMessage(errors.architecture?.points),
  };
  const formBusy = isSubmitting || metadataMutation.isPending;

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={handleSubmit(onSubmit, () => {
        showErrorToast(new Error("Fix the highlighted project fields."));
      })}
    >
      {errors.root?.message ? (
        <Card className="border-red-200 bg-red-50 shadow-none" role="alert">
          <CardContent className="flex gap-3 p-4 text-sm text-red-700">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {errors.root.message}
          </CardContent>
        </Card>
      ) : null}

      <ProjectFormFields
        mode="edit"
        disabled={formBusy}
        registrations={{
          title: register("title"),
          slug: register("slug"),
          startDate: register("startDate"),
          endDate: register("endDate"),
          shortDescription: register("shortDescription"),
          videoUrl: register("videoUrl"),
          videoPosterUrl: register("videoPosterUrl"),
          github: register("links.github"),
          liveDemo: register("links.liveDemo"),
          article: register("links.article"),
          caseStudyMdx: register("caseStudyMdx"),
          architectureSummary: register("architecture.summary"),
        }}
        errors={fieldErrors}
        projectType={projectType}
        status={status}
        startDate={startDate}
        shortDescription={shortDescription}
        architectureSummary={architectureSummary}
        onProjectTypeChange={(value) =>
          setValue("projectType", value, { shouldDirty: true, shouldValidate: true })
        }
        onStatusChange={(value) => {
          setValue("status", value, { shouldDirty: true, shouldValidate: true });
          void trigger("endDate");
        }}
        techStack={techStack}
        onTechStackChange={(value) =>
          setValue("techStack", value, { shouldDirty: true, shouldValidate: true })
        }
        onTechValidityChange={setIsTechEditorValid}
        overview={overview}
        highlights={highlights}
        challenges={challenges}
        futureImprovements={futureImprovements}
        caseStudyMdx={caseStudyMdx}
        onCaseStudyMdxChange={(value) =>
          setValue("caseStudyMdx", value, { shouldDirty: true, shouldValidate: true })
        }
        architecturePoints={architecturePoints}
        onListChange={(name, value) =>
          setValue(name, value, { shouldDirty: true, shouldValidate: true })
        }
        publishingContent={
          <div className="flex flex-wrap gap-2">
            <Badge variant={project.isVisible ? "green" : "neutral"}>
              {project.isVisible ? "Visible" : "Hidden"}
            </Badge>
            <Badge variant={project.isFeatured ? "cyan" : "neutral"}>
              {project.isFeatured ? "Featured" : "Not featured"}
            </Badge>
            <Badge variant="neutral">Display order {project.displayOrder}</Badge>
          </div>
        }
      />

      <FormActions
        cancelHref="/admin/projects"
        submitLabel="Save Changes"
        isSubmitting={formBusy}
        isDirty={isDirty}
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
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());

  const setUploadPending = useCallback((key: string, isPending: boolean) => {
    setActiveUploads((current) => {
      const alreadyMatches = isPending ? current.has(key) : !current.has(key);
      if (alreadyMatches) return current;
      const next = new Set(current);
      if (isPending) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);
  const setThumbnailPending = useCallback(
    (isPending: boolean) => setUploadPending("thumbnail", isPending),
    [setUploadPending],
  );
  const setArchitecturePending = useCallback(
    (isPending: boolean) => setUploadPending("architecture", isPending),
    [setUploadPending],
  );
  const setGalleryPending = useCallback(
    (isPending: boolean) => setUploadPending("gallery", isPending),
    [setUploadPending],
  );
  const mediaBusy = activeUploads.size > 0;

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
        orderedFileIds: orderedFileIds.filter(
          (fileId): fileId is string => Boolean(fileId),
        ),
      });
    },
    onMutate: async (orderedImages) => {
      await queryClient.cancelQueries({ queryKey: projectDetailQueryKey(project.id) });
      const previousProject =
        queryClient.getQueryData<AdminProject>(projectDetailQueryKey(project.id)) ??
        project;
      onProjectUpdated({ ...project, gallery: orderedImages });
      return { previousProject };
    },
    onError: (error, _orderedImages, context) => {
      if (context?.previousProject) onProjectUpdated(context.previousProject);
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
      showSuccessToast("Architecture image removed successfully.");
    },
    onError: (error) => {
      showErrorToast(error, "Architecture image could not be removed.");
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
      title="Project Media"
      description="Replace the required thumbnail, manage the optional architecture diagram, and add, remove, or reorder gallery images."
    >
      <ImageUploader
        key={`thumbnail-${project.thumbnail.fileId ?? project.thumbnail.url}`}
        folder="projects-thumbnails"
        label="Thumbnail image"
        description="Required project cover; replacement uses the protected project media endpoint."
        existingImage={project.thumbnail}
        replaceModeLabel="Replace thumbnail"
        successMessage="Thumbnail replaced successfully."
        disabled={mediaBusy && !activeUploads.has("thumbnail")}
        onPendingChange={setThumbnailPending}
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

      <ImageUploader
        key={`architecture-${
          project.architecture?.image?.fileId ??
          project.architecture?.image?.url ??
          "empty"
        }`}
        folder="projects-architecture"
        label="Architecture diagram"
        description="Optional diagram supporting the architecture summary."
        existingImage={project.architecture?.image}
        replaceModeLabel="Replace architecture diagram"
        successMessage="Architecture diagram replaced successfully."
        disabled={mediaBusy && !activeUploads.has("architecture")}
        onPendingChange={setArchitecturePending}
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
        onRemove={
          project.architecture?.image
            ? async () => {
                await architectureDeleteMutation.mutateAsync();
              }
            : undefined
        }
        removeLabel="Remove architecture diagram"
        confirmRemoveMessage="Remove this architecture diagram from the project? This deletes the persisted media asset."
      />

      <MultiImageUploader
        folder="projects-gallery"
        label="Add gallery images"
        description="New images are appended to the gallery and can then be reordered."
        successMessage="Gallery images added successfully."
        disabled={mediaBusy && !activeUploads.has("gallery")}
        onPendingChange={setGalleryPending}
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
        disabled={mediaBusy}
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
        <LoadingState message="Loading project editor…" />
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
        description="Edit project information through the shared form and manage persisted media through protected media actions."
        badge="Edit Project"
      />

      <ProjectStateSummary project={project} />
      <ProjectMetadataForm project={project} onProjectUpdated={syncProject} />
      <ProjectMediaManagement project={project} onProjectUpdated={syncProject} />
    </section>
  );
}
