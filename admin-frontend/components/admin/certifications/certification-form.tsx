"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Controller,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
  useForm,
  useWatch,
} from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DynamicStringListInput } from "@/components/forms/dynamic-string-list-input";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { ImageUploader } from "@/components/forms/image-uploader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createCertification,
  replaceCertificationImage,
  updateCertification,
} from "@/lib/api/certifications";
import { deleteUploadedImage } from "@/lib/api/uploads";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "@/lib/toast";
import {
  createCertificationFormSchema,
  updateCertificationFormSchema,
  type CreateCertificationFormValues,
  type ParsedCreateCertificationFormValues,
  type ParsedUpdateCertificationFormValues,
  type UpdateCertificationFormValues,
} from "@/schemas/certification.schema";
import type {
  AdminCertification,
  CreateCertificationInput,
  UpdateCertificationInput,
} from "@/types/certification";
import type { ImageAsset } from "@/types/image-asset";

type CertificationFormProps =
  | {
      mode: "create";
      certification?: never;
      onCertificationUpdated?: never;
    }
  | {
      mode: "edit";
      certification: AdminCertification;
      onCertificationUpdated: (certification: AdminCertification) => void;
    };

type UploadedImageAsset = ImageAsset & { fileId: string };

const createDefaultValues: CreateCertificationFormValues = {
  title: "",
  provider: "",
  note: "",
  image: undefined,
  verifyUrl: "",
  credentialId: "",
  date: "",
  skills: [],
  isVisible: true,
};

const getMessage = (message: unknown) =>
  typeof message === "string" ? message : undefined;

const requireUploadedImage = (
  image: ImageAsset | undefined,
): UploadedImageAsset => {
  if (!image?.fileId) {
    throw new Error("Certification image is required.");
  }

  return image as UploadedImageAsset;
};

const toEditValues = (
  certification: AdminCertification,
): UpdateCertificationFormValues => ({
  title: certification.title,
  provider: certification.provider,
  note: certification.note,
  verifyUrl: certification.verifyUrl ?? "",
  credentialId: certification.credentialId ?? "",
  date: certification.date ?? "",
  skills: certification.skills ?? [],
});

const toCreateInput = (
  values: ParsedCreateCertificationFormValues,
): CreateCertificationInput => {
  const image = requireUploadedImage(values.image);

  return {
    title: values.title,
    provider: values.provider,
    note: values.note,
    image,
    ...(values.verifyUrl ? { verifyUrl: values.verifyUrl } : {}),
    ...(values.credentialId ? { credentialId: values.credentialId } : {}),
    ...(values.date ? { date: values.date } : {}),
    ...(values.skills.length ? { skills: values.skills } : {}),
    isVisible: values.isVisible,
  };
};

const toUpdateInput = (
  values: ParsedUpdateCertificationFormValues,
): UpdateCertificationInput => ({
  title: values.title,
  provider: values.provider,
  note: values.note,
  verifyUrl: values.verifyUrl,
  credentialId: values.credentialId,
  date: values.date,
  skills: values.skills,
});

function CertificationRootError({ message }: { message?: unknown }) {
  if (!message) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50 shadow-none">
      <CardContent className="flex gap-3 p-4 text-sm text-red-700">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {getMessage(message)}
      </CardContent>
    </Card>
  );
}

function CreateCertificationForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<
    CreateCertificationFormValues,
    unknown,
    ParsedCreateCertificationFormValues
  >({
    resolver: zodResolver(createCertificationFormSchema),
    defaultValues: createDefaultValues,
  });

  const image = useWatch({ control, name: "image" });
  const skills = useWatch({ control, name: "skills" }) ?? [];

  const cleanupUploadedImage = async (
    uploadedImage: ImageAsset | undefined,
    message: string,
  ) => {
    if (!uploadedImage?.fileId) {
      return;
    }

    try {
      await deleteUploadedImage(uploadedImage.fileId);
      showWarningToast(message);
    } catch {
      showWarningToast(
        "Certification was not created. The uploaded image may need manual cleanup.",
      );
    }
  };

  const createMutation = useMutation({
    mutationFn: createCertification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["certifications"] });
      showSuccessToast("Certification created successfully.");
      router.push("/admin/certifications");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Certification could not be created.");
    },
  });

  const onSubmit = async (values: ParsedCreateCertificationFormValues) => {
    let input: CreateCertificationInput;

    try {
      input = toCreateInput(values);
    } catch (error) {
      setError("image", { message: getToastErrorMessage(error) });
      showErrorToast(error);
      return;
    }

    try {
      await createMutation.mutateAsync(input);
    } catch {
      await cleanupUploadedImage(
        input.image,
        "Certification was not created. Uploaded image was cleaned up.",
      );
      setValue("image", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleImageUploaded = async (uploadedImage: ImageAsset) => {
    const previousImage = image;

    setValue("image", requireUploadedImage(uploadedImage), {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (previousImage?.fileId && previousImage.fileId !== uploadedImage.fileId) {
      await cleanupUploadedImage(
        previousImage,
        "Previous uploaded image was replaced and cleaned up.",
      );
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <AdminPageHeader
        title="New Certification"
        description="Create a credential record with its required certificate image."
        badge="Create"
      />

      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit, () => {
          showErrorToast(new Error("Fix the highlighted certification fields."));
        })}
      >
        <CertificationRootError message={errors.root?.message} />

        <CertificationMetadataFields
          errors={errors}
          register={register}
          skills={skills}
          onSkillsChange={(value) =>
            setValue("skills", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <FormSection
          title="Certificate Image"
          description="A certification image is required and will be sent with the certification record."
        >
          <ImageUploader
            folder="certifications"
            label="Certificate image"
            existingImage={image}
            replaceModeLabel="Replace uploaded image"
            successMessage="Certificate image uploaded successfully."
            onUploaded={(uploadedImage) => {
              void handleImageUploaded(uploadedImage);
            }}
          />
          <FieldError message={getMessage(errors.image?.message)} />
        </FormSection>

        <FormSection
          title="Visibility"
          description="Choose whether this certification appears on public routes immediately."
        >
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
                    Show this certification publicly after creation.
                  </span>
                </span>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Set certification visibility"
                />
              </label>
            )}
          />
        </FormSection>

        <FormActions
          cancelHref="/admin/certifications"
          submitLabel="Create Certification"
          isSubmitting={isSubmitting || createMutation.isPending}
        />
      </form>
    </section>
  );
}

function EditCertificationForm({
  certification,
  onCertificationUpdated,
}: {
  certification: AdminCertification;
  onCertificationUpdated: (certification: AdminCertification) => void;
}) {
  const queryClient = useQueryClient();
  const initializedCertificationIdRef = useRef<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
    control,
  } = useForm<
    UpdateCertificationFormValues,
    unknown,
    ParsedUpdateCertificationFormValues
  >({
    resolver: zodResolver(updateCertificationFormSchema),
    defaultValues: toEditValues(certification),
  });

  useEffect(() => {
    if (initializedCertificationIdRef.current === certification.id) {
      return;
    }

    reset(toEditValues(certification));
    initializedCertificationIdRef.current = certification.id;
  }, [certification, reset]);

  const skills = useWatch({ control, name: "skills" }) ?? [];

  const updateMutation = useMutation({
    mutationFn: (input: UpdateCertificationInput) =>
      updateCertification(certification.id, input),
    onSuccess: async (updatedCertification) => {
      onCertificationUpdated(updatedCertification);
      reset(toEditValues(updatedCertification));
      await queryClient.invalidateQueries({ queryKey: ["certifications"] });
      showSuccessToast("Certification metadata updated successfully.");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Certification metadata could not be updated.");
    },
  });

  const onSubmit = async (values: ParsedUpdateCertificationFormValues) => {
    try {
      await updateMutation.mutateAsync(toUpdateInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit, () => {
        showErrorToast(new Error("Fix the highlighted certification fields."));
      })}
    >
      <CertificationRootError message={errors.root?.message} />

      <CertificationMetadataFields
        errors={errors}
        register={register}
        skills={skills}
        onSkillsChange={(value) =>
          setValue("skills", value, {
            shouldDirty: true,
            shouldValidate: true,
          })
        }
      />

      <FormSection
        title="Publishing State"
        description="Visibility is controlled from the certification list."
      >
        <div className="flex flex-wrap gap-2">
          <Badge variant={certification.isVisible ? "green" : "neutral"}>
            {certification.isVisible ? "Visible" : "Hidden"}
          </Badge>
          <Badge variant="neutral">
            Display order {certification.displayOrder}
          </Badge>
        </div>
      </FormSection>

      <FormActions
        cancelHref="/admin/certifications"
        submitLabel="Save Metadata"
        isSubmitting={isSubmitting || updateMutation.isPending}
      />
    </form>
  );
}

type CertificationMetadataFieldsProps<TFormValues extends FieldValues> = {
  errors: FieldErrors<TFormValues>;
  register: UseFormRegister<TFormValues>;
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
};

function CertificationMetadataFields<TFormValues extends FieldValues>({
  errors,
  register,
  skills,
  onSkillsChange,
}: CertificationMetadataFieldsProps<TFormValues>) {
  const field = (name: string) => name as Path<TFormValues>;

  return (
    <>
      <FormSection
        title="Core Details"
        description="These fields identify the credential and how it appears publicly."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="title">
              Title <span className="text-red-700">*</span>
            </label>
            <Input id="title" className="mt-2" {...register(field("title"))} />
            <FieldError message={getMessage(errors.title?.message)} />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="provider"
            >
              Provider <span className="text-red-700">*</span>
            </label>
            <Input
              id="provider"
              className="mt-2"
              {...register(field("provider"))}
            />
            <FieldError message={getMessage(errors.provider?.message)} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="note">
            Note <span className="text-red-700">*</span>
          </label>
          <Textarea
            id="note"
            className="mt-2 min-h-28"
            {...register(field("note"))}
          />
          <FieldError message={getMessage(errors.note?.message)} />
        </div>
      </FormSection>

      <FormSection
        title="Verification"
        description="Optional metadata for credential lookup and external verification."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="verifyUrl"
            >
              Verify URL <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="verifyUrl"
              className="mt-2"
              placeholder="https://example.com/verify"
              {...register(field("verifyUrl"))}
            />
            <FieldError message={getMessage(errors.verifyUrl?.message)} />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="credentialId"
            >
              Credential ID <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="credentialId"
              className="mt-2"
              {...register(field("credentialId"))}
            />
            <FieldError message={getMessage(errors.credentialId?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="date">
              Date <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="date"
              type="date"
              className="mt-2"
              {...register(field("date"))}
            />
            <FieldError message={getMessage(errors.date?.message)} />
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Skills"
        description="Optional skill tags shown with the certification."
      >
        <DynamicStringListInput
          label="Skills"
          value={skills}
          onChange={onSkillsChange}
          placeholder="TypeScript"
          addLabel="Add skill"
          emptyMessage="No skills added yet."
        />
        <FieldError message={getMessage(errors.skills?.message)} />
      </FormSection>
    </>
  );
}

function CertificationImageReplacement({
  certification,
  onCertificationUpdated,
}: {
  certification: AdminCertification;
  onCertificationUpdated: (certification: AdminCertification) => void;
}) {
  const queryClient = useQueryClient();

  return (
    <FormSection
      title="Certificate Image"
      description="The image is required. Replace it here, or delete the whole certification from the list."
    >
      <ImageUploader
        key={`certification-${certification.image.fileId ?? certification.image.url}`}
        folder="certifications"
        label="Certificate image"
        existingImage={certification.image}
        replaceModeLabel="Replace certificate image"
        successMessage="Certificate image replaced successfully."
        uploadAction={async ({ file, alt }) => {
          const updatedCertification = await replaceCertificationImage({
            id: certification.id,
            file,
            alt,
          });

          onCertificationUpdated(updatedCertification);
          await queryClient.invalidateQueries({ queryKey: ["certifications"] });

          return updatedCertification.image;
        }}
        onUploaded={() => undefined}
      />
    </FormSection>
  );
}

export function CertificationForm(props: CertificationFormProps) {
  if (props.mode === "create") {
    return <CreateCertificationForm />;
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <AdminPageHeader
        title={props.certification.title}
        description="Edit certification metadata and replace its required certificate image."
        badge="Edit Certification"
      />
      <CertificationImageReplacement
        certification={props.certification}
        onCertificationUpdated={props.onCertificationUpdated}
      />
      <EditCertificationForm
        certification={props.certification}
        onCertificationUpdated={props.onCertificationUpdated}
      />
    </section>
  );
}
