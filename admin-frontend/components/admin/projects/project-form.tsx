"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ImageOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { GalleryManager } from "@/components/forms/gallery-manager";
import { ImageUploader } from "@/components/forms/image-uploader";
import { MultiImageUploader } from "@/components/forms/multi-image-uploader";
import { DynamicStringListInput } from "@/components/forms/dynamic-string-list-input";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  ProjectArchitecture,
  ProjectLinks,
  ProjectTechStackItem,
} from "@/types/project";

const currentYear = new Date().getFullYear().toString();

const defaultValues: CreateProjectFormValues = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  projectType: "",
  status: "completed",
  year: currentYear,
  startDate: "",
  endDate: "",
  videoUrl: "",
  videoPosterUrl: "",
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
};

const getMessage = (message: unknown) =>
  typeof message === "string" ? message : undefined;

const omitEmptyObject = <T extends Record<string, unknown>>(object: T) => {
  const entries = Object.entries(object).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== undefined && value !== "";
  });

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

const toCreateProjectInput = (
  values: ParsedCreateProjectFormValues,
): CreateProjectInput => {
  if (!values.thumbnail) {
    throw new Error("Thumbnail image is required.");
  }

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
    year: values.year,
    ...(values.startDate ? { startDate: values.startDate } : {}),
    ...(values.endDate ? { endDate: values.endDate } : {}),
    ...(values.videoUrl ? { videoUrl: values.videoUrl } : {}),
    ...(values.videoPosterUrl ? { videoPosterUrl: values.videoPosterUrl } : {}),
    thumbnail: values.thumbnail,
    gallery: values.gallery,
    ...(architecture ? { architecture } : {}),
    ...(links ? { links } : {}),
    techStack: values.techStack.map((item) => ({
      label: item.label,
      ...(item.category?.trim() ? { category: item.category.trim() } : {}),
      ...(item.color?.trim() ? { color: item.color.trim() } : {}),
      showOnCard: item.showOnCard ?? false,
    })),
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

type UploadedImageAsset = ImageAsset & { fileId: string };

const uniqueAssets = (assets: Array<ImageAsset | undefined>) => {
  const seen = new Set<string>();

  return assets.filter((asset): asset is UploadedImageAsset => {
    if (!asset?.fileId || seen.has(asset.fileId)) {
      return false;
    }

    seen.add(asset.fileId);
    return true;
  });
};

const requireUploadedImage = (image: ImageAsset): UploadedImageAsset => {
  if (!image.fileId) {
    throw new Error("Uploaded image is missing its fileId.");
  }

  return image as UploadedImageAsset;
};

type ProjectFormProps = {
  mode: "create";
};

export function ProjectForm({ mode }: ProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<CreateProjectFormValues, unknown, ParsedCreateProjectFormValues>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues,
  });

  const thumbnail = useWatch({ control, name: "thumbnail" });
  const gallery = useWatch({ control, name: "gallery" }) ?? [];
  const architectureImage = useWatch({ control, name: "architecture.image" });
  const architecturePoints =
    useWatch({ control, name: "architecture.points" }) ?? [];
  const techStack =
    (useWatch({ control, name: "techStack" }) ?? []) as ProjectTechStackItem[];
  const overview = useWatch({ control, name: "overview" }) ?? [];
  const highlights = useWatch({ control, name: "highlights" }) ?? [];
  const challenges = useWatch({ control, name: "challenges" }) ?? [];
  const futureImprovements =
    useWatch({ control, name: "futureImprovements" }) ?? [];

  const setStringListValue = (
    name: "overview" | "highlights" | "challenges" | "futureImprovements",
    value: string[],
  ) => {
    setValue(name, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const cleanupImage = async (image: ImageAsset, label: string) => {
    if (!image.fileId) {
      return;
    }

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

  const clearArchitectureImage = async () => {
    if (architectureImage) {
      await cleanupImage(architectureImage, "Architecture image");
    }

    setValue("architecture.image", undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const cleanupUploadedAssetsAfterFailure = async (input: CreateProjectInput) => {
    const assets = uniqueAssets([
      input.thumbnail,
      ...input.gallery,
      input.architecture?.image,
    ]);

    if (assets.length === 0) {
      return;
    }

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
      showSuccessToast("Project created successfully.");
      router.push("/admin/projects");
    } catch (error) {
      const message = getToastErrorMessage(error);
      setError("root", { message });
      showErrorToast(error, "Project could not be created.");
      await cleanupUploadedAssetsAfterFailure(input);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <AdminPageHeader
        title={mode === "create" ? "New Project" : "Project"}
        description="Create a complete portfolio project with media, case-study copy, links, and publishing controls."
        badge="Create"
      />

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
          description="These fields power project cards and the detail-page introduction."
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
                Slug <span className="text-[var(--admin-muted)]">optional</span>
              </label>
              <Input id="slug" className="mt-2" {...register("slug")} />
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                Leave empty to auto-generate from title.
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
              <Input
                id="projectType"
                className="mt-2"
                placeholder="Full-stack app"
                {...register("projectType")}
              />
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
              <Input id="year" className="mt-2" placeholder="2026" {...register("year")} />
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
            <Textarea
              id="description"
              className="mt-2"
              {...register("description")}
            />
            <p className="mt-1 text-xs text-[var(--admin-muted)]">
              Used as the intro text on the project detail page.
            </p>
            <FieldError message={getMessage(errors.description?.message)} />
          </div>
        </FormSection>

        <FormSection
          title="Media"
          description="Upload the thumbnail and at least one gallery image before submitting."
        >
          <ImageUploader
            folder="projects-thumbnails"
            label="Thumbnail image"
            existingImage={thumbnail}
            replaceModeLabel="Replace thumbnail"
            onUploaded={(image) =>
              setValue("thumbnail", requireUploadedImage(image), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <FieldError message={getMessage(errors.thumbnail?.message)} />

          <MultiImageUploader
            folder="projects-gallery"
            label="Gallery images"
            onUploaded={(images) =>
              setValue("gallery", [...gallery, ...images.map(requireUploadedImage)], {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          <FieldError message={getMessage(errors.gallery?.message)} />
          <GalleryManager images={gallery} onDelete={removeGalleryImage} />

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
                Optional preview image shown before the YouTube player loads.
                If empty, the project thumbnail is used.
              </p>
              <FieldError message={getMessage(errors.videoPosterUrl?.message)} />
            </div>
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

        <FormSection title="Tech Stack" description="Project tech stack requires at least one labeled item.">
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
          title="Architecture"
          description="Optional architecture image, summary, and supporting points."
        >
          <ImageUploader
            folder="projects-architecture"
            label="Architecture image"
            existingImage={architectureImage}
            replaceModeLabel="Replace architecture image"
            onUploaded={(image) =>
              setValue("architecture.image", requireUploadedImage(image), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          {architectureImage ? (
            <Button variant="secondary" size="sm" onClick={() => void clearArchitectureImage()}>
              <ImageOff className="size-4" aria-hidden="true" />
              Clear architecture image
            </Button>
          ) : null}
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
            <FieldError
              message={getMessage(errors.architecture?.summary?.message)}
            />
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
            onChange={(value) =>
              setStringListValue("futureImprovements", value)
            }
            emptyMessage="No future improvements added yet."
          />
        </FormSection>

        <FormSection
          title="Visibility"
          description="Control public visibility and featured placement."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Controller
              control={control}
              name="isVisible"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
                  <span>
                    <span className="block text-sm font-medium text-[var(--admin-text)]">
                      Visible
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
                      Show this project on public routes.
                    </span>
                  </span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Set project visibility"
                  />
                </label>
              )}
            />
            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
                  <span>
                    <span className="block text-sm font-medium text-[var(--admin-text)]">
                      Featured
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
                      Counts toward the 6 visible featured project slots.
                    </span>
                  </span>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Set project featured status"
                  />
                </label>
              )}
            />
          </div>
          <Badge variant="neutral">
            Backend enforces the visible featured limit.
          </Badge>
        </FormSection>

        <FormActions
          cancelHref="/admin/projects"
          submitLabel="Create Project"
          isSubmitting={isSubmitting}
        />
      </form>
    </section>
  );
}
