"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormRegister,
  type UseFormSetValue,
  useForm,
  useWatch,
} from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DynamicStringListInput } from "@/components/forms/dynamic-string-list-input";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createCurrentlyBuildingItem,
  updateCurrentlyBuildingItem,
} from "@/lib/api/currently-building";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import {
  createCurrentlyBuildingFormSchema,
  updateCurrentlyBuildingFormSchema,
  type CreateCurrentlyBuildingFormValues,
  type ParsedCreateCurrentlyBuildingFormValues,
  type ParsedUpdateCurrentlyBuildingFormValues,
  type UpdateCurrentlyBuildingFormValues,
} from "@/schemas/currently-building.schema";
import type {
  AdminCurrentlyBuildingItem,
  CreateCurrentlyBuildingInput,
  UpdateCurrentlyBuildingInput,
} from "@/types/currently-building";

type CurrentlyBuildingFormProps =
  | {
      mode: "create";
      item?: never;
    }
  | {
      mode: "edit";
      item: AdminCurrentlyBuildingItem;
    };

const createDefaultValues: CreateCurrentlyBuildingFormValues = {
  title: "",
  description: "",
  currentFocus: "",
  techStack: [],
  highlights: [],
  link: "",
  isVisible: true,
};

const getMessage = (message: unknown) =>
  typeof message === "string" ? message : undefined;

const toEditValues = (
  item: AdminCurrentlyBuildingItem,
): UpdateCurrentlyBuildingFormValues => ({
  title: item.title,
  description: item.description,
  currentFocus: item.currentFocus ?? "",
  techStack: item.techStack ?? [],
  highlights: item.highlights ?? [],
  link: item.link ?? "",
});

const toCreateInput = (
  values: ParsedCreateCurrentlyBuildingFormValues,
): CreateCurrentlyBuildingInput => ({
  title: values.title,
  description: values.description,
  ...(values.currentFocus ? { currentFocus: values.currentFocus } : {}),
  ...(values.techStack.length ? { techStack: values.techStack } : {}),
  ...(values.highlights.length ? { highlights: values.highlights } : {}),
  ...(values.link ? { link: values.link } : {}),
  isVisible: values.isVisible,
});

const toUpdateInput = (
  values: ParsedUpdateCurrentlyBuildingFormValues,
): UpdateCurrentlyBuildingInput => ({
  title: values.title,
  description: values.description,
  currentFocus: values.currentFocus,
  techStack: values.techStack,
  highlights: values.highlights,
  link: values.link,
});

function CreateCurrentlyBuildingForm() {
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
    CreateCurrentlyBuildingFormValues,
    unknown,
    ParsedCreateCurrentlyBuildingFormValues
  >({
    resolver: zodResolver(createCurrentlyBuildingFormSchema),
    defaultValues: createDefaultValues,
  });

  const techStack = useWatch({ control, name: "techStack" }) ?? [];
  const highlights = useWatch({ control, name: "highlights" }) ?? [];

  const createMutation = useMutation({
    mutationFn: createCurrentlyBuildingItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currently-building"] });
      showSuccessToast("Currently-building item created successfully.");
      router.push("/admin/currently-building");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Currently-building item could not be created.");
    },
  });

  const onSubmit = async (values: ParsedCreateCurrentlyBuildingFormValues) => {
    try {
      await createMutation.mutateAsync(toCreateInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <CurrentlyBuildingFormShell
      mode="create"
      control={control}
      errors={errors}
      isSubmitting={isSubmitting || createMutation.isPending}
      onSubmit={handleSubmit(onSubmit, () => {
        showErrorToast(new Error("Fix the highlighted currently-building fields."));
      })}
      register={register}
      setValue={setValue}
      techStack={techStack}
      highlights={highlights}
    />
  );
}

function EditCurrentlyBuildingForm({ item }: { item: AdminCurrentlyBuildingItem }) {
  const queryClient = useQueryClient();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
    setValue,
  } = useForm<
    UpdateCurrentlyBuildingFormValues,
    unknown,
    ParsedUpdateCurrentlyBuildingFormValues
  >({
    resolver: zodResolver(updateCurrentlyBuildingFormSchema),
    defaultValues: toEditValues(item),
  });

  const techStack = useWatch({ control, name: "techStack" }) ?? [];
  const highlights = useWatch({ control, name: "highlights" }) ?? [];

  const updateMutation = useMutation({
    mutationFn: (input: UpdateCurrentlyBuildingInput) =>
      updateCurrentlyBuildingItem(item.id, input),
    onSuccess: async (updatedItem) => {
      queryClient.setQueryData(
        ["currently-building", "detail", updatedItem.id],
        updatedItem,
      );
      await queryClient.invalidateQueries({ queryKey: ["currently-building"] });
      reset(toEditValues(updatedItem));
      showSuccessToast("Currently-building item updated successfully.");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Currently-building item could not be updated.");
    },
  });

  const onSubmit = async (values: ParsedUpdateCurrentlyBuildingFormValues) => {
    try {
      await updateMutation.mutateAsync(toUpdateInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <CurrentlyBuildingFormShell
      mode="edit"
      item={item}
      control={control}
      errors={errors}
      isSubmitting={isSubmitting || updateMutation.isPending}
      onSubmit={handleSubmit(onSubmit, () => {
        showErrorToast(new Error("Fix the highlighted currently-building fields."));
      })}
      register={register}
      setValue={setValue}
      techStack={techStack}
      highlights={highlights}
    />
  );
}

type CurrentlyBuildingFormShellProps = {
  mode: "create" | "edit";
  item?: AdminCurrentlyBuildingItem;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues> & { root?: { message?: unknown } };
  isSubmitting: boolean;
  onSubmit: () => void;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  techStack: string[];
  highlights: string[];
};

function CurrentlyBuildingFormShell<TFormValues extends FieldValues>({
  mode,
  item,
  control,
  errors,
  isSubmitting,
  onSubmit,
  register,
  setValue,
  techStack,
  highlights,
}: Omit<
  CurrentlyBuildingFormShellProps,
  "control" | "errors" | "register" | "setValue"
> & {
  control: Control<TFormValues>;
  errors: FieldErrors<TFormValues> & { root?: { message?: unknown } };
  register: UseFormRegister<TFormValues>;
  setValue: UseFormSetValue<TFormValues>;
}) {
  const field = (name: string) => name as Path<TFormValues>;
  const setStringListValue = (name: "techStack" | "highlights", value: string[]) => {
    const path = field(name);

    setValue(path, value as PathValue<TFormValues, typeof path>, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <AdminPageHeader
        title={mode === "create" ? "New Currently Building" : item?.title ?? "Edit Item"}
        description={
          mode === "create"
            ? "Create an active-work entry. Only the title and description are required."
            : "Edit active-work content. Visibility stays on the list page."
        }
        badge={mode === "create" ? "Create" : "Edit"}
      />

      <form className="space-y-5" onSubmit={onSubmit}>
        {errors.root?.message ? (
          <Card className="border-red-200 bg-red-50 shadow-none">
            <CardContent className="flex gap-3 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {getMessage(errors.root.message)}
            </CardContent>
          </Card>
        ) : null}

        <FormSection
          title="Core Details"
          description="Describe what is actively being built and add optional supporting details."
        >
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
              htmlFor="description"
            >
              Description <span className="text-red-700">*</span>
            </label>
            <Textarea
              id="description"
              className="mt-2"
              {...register(field("description"))}
            />
            <FieldError message={getMessage(errors.description?.message)} />
          </div>

          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="currentFocus"
            >
              Current focus <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Textarea
              id="currentFocus"
              className="mt-2"
              {...register(field("currentFocus"))}
            />
            <FieldError message={getMessage(errors.currentFocus?.message)} />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="link">
              Link <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="link"
              className="mt-2"
              placeholder="https://example.com"
              {...register(field("link"))}
            />
            <FieldError message={getMessage(errors.link?.message)} />
          </div>
        </FormSection>

        <FormSection
          title="Topics"
          description="Add optional topics such as technologies, platforms, development areas, engineering concepts, or project categories."
        >
          <DynamicStringListInput
            label="Topics"
            value={techStack}
            onChange={(value) => setStringListValue("techStack", value)}
            placeholder="React Native"
            addLabel="Add topic"
            emptyMessage="No topics added yet."
          />
          <FieldError message={getMessage(errors.techStack?.message)} />
        </FormSection>

        <FormSection
          title="Highlights"
          description="Add optional short highlights about this active work."
        >
          <DynamicStringListInput
            label="Highlights"
            value={highlights}
            onChange={(value) => setStringListValue("highlights", value)}
            emptyMessage="No highlights added yet."
          />
          <FieldError message={getMessage(errors.highlights?.message)} />
        </FormSection>

        {mode === "create" ? (
          <FormSection
            title="Visibility"
            description="Choose whether this item appears on public routes immediately."
          >
            <Controller
              control={control}
              name={field("isVisible")}
              render={({ field }) => (
                <label className="flex items-center justify-between gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
                  <span>
                    <span className="block text-sm font-medium text-[var(--admin-text)]">
                      Visible
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--admin-muted)]">
                      Show this active-work item publicly after creation.
                    </span>
                  </span>
                  <Switch
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                    aria-label="Set currently-building visibility"
                  />
                </label>
              )}
            />
          </FormSection>
        ) : (
          <FormSection
            title="Publishing State"
            description="Visibility is controlled from the list page."
          >
            <div className="flex flex-wrap gap-2">
              <Badge variant={item?.isVisible ? "green" : "neutral"}>
                {item?.isVisible ? "Visible" : "Hidden"}
              </Badge>
              <Badge variant="neutral">Display order {item?.displayOrder}</Badge>
            </div>
          </FormSection>
        )}

        <FormActions
          cancelHref="/admin/currently-building"
          submitLabel={mode === "create" ? "Create Item" : "Save Changes"}
          isSubmitting={isSubmitting}
        />
      </form>
    </section>
  );
}

export function CurrentlyBuildingForm(props: CurrentlyBuildingFormProps) {
  if (props.mode === "create") {
    return <CreateCurrentlyBuildingForm />;
  }

  return <EditCurrentlyBuildingForm item={props.item} />;
}
