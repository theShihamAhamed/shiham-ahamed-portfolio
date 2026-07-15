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
} from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createAchievement,
  updateAchievement,
} from "@/lib/api/achievements";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import {
  createAchievementFormSchema,
  updateAchievementFormSchema,
  type CreateAchievementFormValues,
  type ParsedCreateAchievementFormValues,
  type ParsedUpdateAchievementFormValues,
  type UpdateAchievementFormValues,
} from "@/schemas/achievement.schema";
import type {
  AdminAchievement,
  CreateAchievementInput,
  UpdateAchievementInput,
} from "@/types/achievement";

type AchievementFormProps =
  | {
      mode: "create";
      achievement?: never;
      onAchievementUpdated?: never;
    }
  | {
      mode: "edit";
      achievement: AdminAchievement;
      onAchievementUpdated: (achievement: AdminAchievement) => void;
    };

const createDefaultValues: CreateAchievementFormValues = {
  title: "",
  note: "",
  event: "",
  result: "",
  date: "",
  year: "",
  icon: "",
  isVisible: true,
};

const getMessage = (message: unknown) =>
  typeof message === "string" ? message : undefined;

const toEditValues = (achievement: AdminAchievement): UpdateAchievementFormValues => ({
  title: achievement.title,
  note: achievement.note,
  event: achievement.event ?? "",
  result: achievement.result ?? "",
  date: achievement.date ?? "",
  year: achievement.year ?? "",
  icon: achievement.icon ?? "",
});

const toCreateInput = (
  values: ParsedCreateAchievementFormValues,
): CreateAchievementInput => ({
  title: values.title,
  note: values.note,
  ...(values.event ? { event: values.event } : {}),
  ...(values.result ? { result: values.result } : {}),
  ...(values.date ? { date: values.date } : {}),
  ...(values.year ? { year: values.year } : {}),
  ...(values.icon ? { icon: values.icon } : {}),
  isVisible: values.isVisible,
});

const toUpdateInput = (
  values: ParsedUpdateAchievementFormValues,
): UpdateAchievementInput => ({
  title: values.title,
  note: values.note,
  event: values.event,
  result: values.result,
  date: values.date,
  year: values.year,
  icon: values.icon,
});

function AchievementRootError({ message }: { message?: unknown }) {
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

function CreateAchievementForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<
    CreateAchievementFormValues,
    unknown,
    ParsedCreateAchievementFormValues
  >({
    resolver: zodResolver(createAchievementFormSchema),
    defaultValues: createDefaultValues,
  });

  const createMutation = useMutation({
    mutationFn: createAchievement,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      showSuccessToast("Achievement created successfully.");
      router.push("/admin/achievements");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Achievement could not be created.");
    },
  });

  const onSubmit = async (values: ParsedCreateAchievementFormValues) => {
    try {
      await createMutation.mutateAsync(toCreateInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <AdminPageHeader
        title="New Achievement"
        description="Create an achievement with event context, result details, and visibility."
        badge="Create"
      />

      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit, () => {
          showErrorToast(new Error("Fix the highlighted achievement fields."));
        })}
      >
        <AchievementRootError message={errors.root?.message} />

        <AchievementMetadataFields errors={errors} register={register} />

        <FormSection
          title="Visibility"
          description="Choose whether this achievement appears on public routes immediately."
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
                    Show this achievement publicly after creation.
                  </span>
                </span>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Set achievement visibility"
                />
              </label>
            )}
          />
        </FormSection>

        <FormActions
          cancelHref="/admin/achievements"
          submitLabel="Create Achievement"
          isSubmitting={isSubmitting || createMutation.isPending}
        />
      </form>
    </section>
  );
}

function EditAchievementForm({
  achievement,
  onAchievementUpdated,
}: {
  achievement: AdminAchievement;
  onAchievementUpdated: (achievement: AdminAchievement) => void;
}) {
  const queryClient = useQueryClient();
  const initializedAchievementIdRef = useRef<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<
    UpdateAchievementFormValues,
    unknown,
    ParsedUpdateAchievementFormValues
  >({
    resolver: zodResolver(updateAchievementFormSchema),
    defaultValues: toEditValues(achievement),
  });

  useEffect(() => {
    if (initializedAchievementIdRef.current === achievement.id) {
      return;
    }

    reset(toEditValues(achievement));
    initializedAchievementIdRef.current = achievement.id;
  }, [achievement, reset]);

  const updateMutation = useMutation({
    mutationFn: (input: UpdateAchievementInput) =>
      updateAchievement(achievement.id, input),
    onSuccess: async (updatedAchievement) => {
      onAchievementUpdated(updatedAchievement);
      reset(toEditValues(updatedAchievement));
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      showSuccessToast("Achievement updated successfully.");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Achievement could not be updated.");
    },
  });

  const onSubmit = async (values: ParsedUpdateAchievementFormValues) => {
    try {
      await updateMutation.mutateAsync(toUpdateInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <AdminPageHeader
        title={achievement.title}
        description="Edit achievement metadata. Visibility stays on the list page."
        badge="Edit Achievement"
      />

      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit, () => {
          showErrorToast(new Error("Fix the highlighted achievement fields."));
        })}
      >
        <AchievementRootError message={errors.root?.message} />

        <AchievementMetadataFields errors={errors} register={register} />

        <FormSection
          title="Publishing State"
          description="Visibility is controlled from the achievement list."
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant={achievement.isVisible ? "green" : "neutral"}>
              {achievement.isVisible ? "Visible" : "Hidden"}
            </Badge>
            <Badge variant="neutral">
              Display order {achievement.displayOrder}
            </Badge>
          </div>
        </FormSection>

        <FormActions
          cancelHref="/admin/achievements"
          submitLabel="Save Achievement"
          isSubmitting={isSubmitting || updateMutation.isPending}
        />
      </form>
    </section>
  );
}

type AchievementMetadataFieldsProps<TFormValues extends FieldValues> = {
  errors: FieldErrors<TFormValues>;
  register: UseFormRegister<TFormValues>;
};

function AchievementMetadataFields<TFormValues extends FieldValues>({
  errors,
  register,
}: AchievementMetadataFieldsProps<TFormValues>) {
  const field = (name: string) => name as Path<TFormValues>;

  return (
    <>
      <FormSection
        title="Core Details"
        description="The required title and note define the achievement on public routes."
      >
        <div>
          <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="title">
            Title <span className="text-red-700">*</span>
          </label>
          <Input id="title" className="mt-2" {...register(field("title"))} />
          <FieldError message={getMessage(errors.title?.message)} />
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="note">
            Note <span className="text-red-700">*</span>
          </label>
          <Textarea id="note" className="mt-2 min-h-28" {...register(field("note"))} />
          <FieldError message={getMessage(errors.note?.message)} />
        </div>
      </FormSection>

      <FormSection
        title="Context"
        description="Optional event, outcome, timing, and display icon metadata."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="event">
              Event <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input id="event" className="mt-2" {...register(field("event"))} />
            <FieldError message={getMessage(errors.event?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="result">
              Result <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input id="result" className="mt-2" {...register(field("result"))} />
            <FieldError message={getMessage(errors.result?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="date">
              Date <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input id="date" type="date" className="mt-2" {...register(field("date"))} />
            <FieldError message={getMessage(errors.date?.message)} />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="year">
              Year <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="year"
              className="mt-2"
              placeholder="2026"
              {...register(field("year"))}
            />
            <FieldError message={getMessage(errors.year?.message)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="icon">
              Icon <span className="text-[var(--admin-muted)]">optional</span>
            </label>
            <Input
              id="icon"
              className="mt-2"
              placeholder="Trophy"
              {...register(field("icon"))}
            />
            <FieldError message={getMessage(errors.icon?.message)} />
          </div>
        </div>
      </FormSection>
    </>
  );
}

export function AchievementForm(props: AchievementFormProps) {
  if (props.mode === "create") {
    return <CreateAchievementForm />;
  }

  return (
    <EditAchievementForm
      achievement={props.achievement}
      onAchievementUpdated={props.onAchievementUpdated}
    />
  );
}
