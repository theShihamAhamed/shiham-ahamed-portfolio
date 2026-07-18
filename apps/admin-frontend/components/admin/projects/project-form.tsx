"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  ProjectFormFields,
  type ProjectFormFieldErrors,
} from "@/components/admin/projects/project-form-fields";
import {
  createProjectDefaultValues,
  getFirstFormErrorMessage,
  toCreateProjectInput,
} from "@/components/admin/projects/project-form.utils";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { GalleryManager } from "@/components/forms/gallery-manager";
import { ImageUploader } from "@/components/forms/image-uploader";
import { MultiImageUploader } from "@/components/forms/multi-image-uploader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { createProject } from "@/lib/api/projects";
import { deleteUploadedImage } from "@/lib/api/uploads";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/lib/toast";
import {
  createProjectFormSchema,
  type CreateProjectFormValues,
  type ParsedCreateProjectFormValues,
} from "@/schemas/project.schema";
import type { ImageAsset } from "@/types/image-asset";
import type {
  CreateProjectInput,
  ProjectTechStackItem,
} from "@/types/project";

type UploadedImageAsset = ImageAsset & { fileId: string };

const uniqueAssets = (assets: Array<ImageAsset | undefined>) => {
  const seen = new Set<string>();

  return assets.filter((asset): asset is UploadedImageAsset => {
    if (!asset?.fileId || seen.has(asset.fileId)) return false;
    seen.add(asset.fileId);
    return true;
  });
};

const requireUploadedImage = (image: ImageAsset): UploadedImageAsset => {
  if (!image.fileId) throw new Error("Uploaded image is missing its fileId.");

  return image as UploadedImageAsset;
};

type ProjectFormProps = { mode: "create" };

export function ProjectForm({ mode }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeUploads, setActiveUploads] = useState<Set<string>>(new Set());
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
  } = useForm<CreateProjectFormValues, unknown, ParsedCreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: createProjectDefaultValues(),
    shouldFocusError: true,
  });

  useUnsavedChanges(isDirty && !isSubmitting);

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
  const setGalleryPending = useCallback(
    (isPending: boolean) => setUploadPending("gallery", isPending),
    [setUploadPending],
  );
  const setArchitecturePending = useCallback(
    (isPending: boolean) => setUploadPending("architecture", isPending),
    [setUploadPending],
  );
  const hasActiveUploads = activeUploads.size > 0;

  const projectType = useWatch({ control, name: "projectType" });
  const status = useWatch({ control, name: "status" });
  const startDate = useWatch({ control, name: "startDate" });
  const shortDescription = useWatch({ control, name: "shortDescription" }) ?? "";
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const gallery = useWatch({ control, name: "gallery" }) ?? [];
  const architectureImage = useWatch({ control, name: "architecture.image" });
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
  const isVisible = useWatch({ control, name: "isVisible" });
  const isFeatured = useWatch({ control, name: "isFeatured" });

  const cleanupImage = async (image: ImageAsset, label: string) => {
    if (!image.fileId) return;

    try {
      await deleteUploadedImage(image.fileId);
    } catch {
      showWarningToast(`${label} was removed from the form, but cleanup failed.`);
    }
  };

  const removeGalleryImage = async (image: ImageAsset) => {
    setValue(
      "gallery",
      gallery.filter((item) => item.fileId !== image.fileId),
      { shouldDirty: true, shouldValidate: true },
    );
    await cleanupImage(image, "Gallery image");
  };

  const cleanupUploadedAssetsAfterFailure = async (input: CreateProjectInput) => {
    const assets = uniqueAssets([
      input.thumbnail,
      ...input.gallery,
      input.architecture?.image,
    ]);
    if (assets.length === 0) return;

    const cleanupResults = await Promise.allSettled(
      assets.map((asset) => deleteUploadedImage(asset.fileId)),
    );
    const failedCleanupCount = cleanupResults.filter(
      (result) => result.status === "rejected",
    ).length;

    if (failedCleanupCount > 0) {
      showWarningToast(
        "Project was not created. Some uploaded assets may need manual cleanup.",
      );
      return;
    }

    setValue("thumbnail", undefined, { shouldDirty: true, shouldValidate: true });
    setValue("gallery", [], { shouldDirty: true, shouldValidate: true });
    setValue("architecture.image", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
    showWarningToast("Project was not created. Uploaded assets were cleaned up.");
  };

  const onSubmit = async (values: ParsedCreateProjectFormValues) => {
    if (hasActiveUploads) {
      setError("root", {
        message: "Wait for active media uploads to finish before creating the project.",
      });
      return;
    }

    if (!isTechEditorValid) {
      setError("techStack", {
        message: "Name or remove every empty technology group before saving.",
      });
      showErrorToast(new Error("Finish the highlighted technology group."));
      return;
    }

    let input: CreateProjectInput;

    try {
      input = toCreateProjectInput(values);
    } catch (error) {
      showErrorToast(error);
      return;
    }

    try {
      await createProject(input);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      reset(createProjectDefaultValues());
      showSuccessToast("Project created successfully.");
      router.push("/admin/projects");
    } catch (error) {
      const message = getToastErrorMessage(error);
      setError("root", { message });
      showErrorToast(error, "Project could not be created.");
      await cleanupUploadedAssetsAfterFailure(input);
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

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <AdminPageHeader
        title={mode === "create" ? "New Project" : "Project"}
        description="Create a complete portfolio project with clear classification, structured content, and accessible media."
        badge="Create"
      />

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
          mode="create"
          disabled={isSubmitting}
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
          mediaSection={
            <FormSection
              title="Project Media"
              description="Upload the required thumbnail and gallery, plus an optional architecture diagram."
            >
              <ImageUploader
                folder="projects-thumbnails"
                label="Thumbnail image"
                description="Required card and project-cover image."
                existingImage={thumbnail}
                replaceModeLabel="Replace thumbnail"
                disabled={isSubmitting}
                onPendingChange={setThumbnailPending}
                onUploaded={(image) =>
                  setValue("thumbnail", requireUploadedImage(image), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onRemove={
                  thumbnail
                    ? async () => {
                        await cleanupImage(thumbnail, "Thumbnail");
                        setValue("thumbnail", undefined, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    : undefined
                }
                removeLabel="Remove thumbnail"
                confirmRemoveMessage="Remove this uploaded thumbnail? A thumbnail is required before the project can be created."
              />
              <FieldError message={getFirstFormErrorMessage(errors.thumbnail)} />

              <MultiImageUploader
                folder="projects-gallery"
                label="Gallery images"
                description="Required project-detail images; you can remove or reorder them before saving."
                disabled={isSubmitting}
                onPendingChange={setGalleryPending}
                onUploaded={(images) =>
                  setValue(
                    "gallery",
                    [...gallery, ...images.map(requireUploadedImage)],
                    { shouldDirty: true, shouldValidate: true },
                  )
                }
              />
              <FieldError message={getFirstFormErrorMessage(errors.gallery)} />
              <GalleryManager images={gallery} onDelete={removeGalleryImage} />

              <ImageUploader
                folder="projects-architecture"
                label="Architecture diagram"
                description="Optional image supporting the architecture summary and points."
                existingImage={architectureImage}
                replaceModeLabel="Replace architecture diagram"
                disabled={isSubmitting}
                onPendingChange={setArchitecturePending}
                onUploaded={(image) =>
                  setValue("architecture.image", requireUploadedImage(image), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                onRemove={
                  architectureImage
                    ? async () => {
                        await cleanupImage(architectureImage, "Architecture image");
                        setValue("architecture.image", undefined, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    : undefined
                }
                removeLabel="Remove architecture diagram"
                confirmRemoveMessage="Remove this uploaded architecture diagram?"
              />
            </FormSection>
          }
          publishingContent={
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
                <span>
                  <span className="block text-sm font-medium text-[var(--admin-text)]">Visible</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
                    Show this project on public routes.
                  </span>
                </span>
                <Switch
                  checked={isVisible}
                  disabled={isSubmitting}
                  onCheckedChange={(checked) =>
                    setValue("isVisible", checked, { shouldDirty: true })
                  }
                  aria-label="Set project visibility"
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
                <span>
                  <span className="block text-sm font-medium text-[var(--admin-text)]">Featured</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
                    Counts toward the six visible featured-project slots.
                  </span>
                </span>
                <Switch
                  checked={isFeatured}
                  disabled={isSubmitting}
                  onCheckedChange={(checked) =>
                    setValue("isFeatured", checked, { shouldDirty: true })
                  }
                  aria-label="Set project featured status"
                />
              </label>
              <Badge variant="neutral" className="md:col-span-2 md:w-fit">
                Backend enforces the visible featured limit.
              </Badge>
            </div>
          }
        />

        <FormActions
          cancelHref="/admin/projects"
          submitLabel="Create Project"
          isSubmitting={isSubmitting}
          isUploadPending={hasActiveUploads}
          isDirty={isDirty}
        />
      </form>
    </section>
  );
}
