"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FieldError } from "@/components/forms/field-error";
import { FormActions } from "@/components/forms/form-actions";
import { FormSection } from "@/components/forms/form-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSettings } from "@/lib/api/site-settings";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import {
  siteSettingsFormSchema,
  type ParsedSiteSettingsFormValues,
  type SiteSettingsFormValues,
} from "@/schemas/site-settings.schema";
import type {
  AdminSiteSettings,
  UpdateSiteSettingsInput,
} from "@/types/site-settings";

type SettingsFormProps = {
  settings: AdminSiteSettings;
};

const getMessage = (message: unknown) =>
  typeof message === "string" ? message : undefined;

const toFormValues = (settings: AdminSiteSettings): SiteSettingsFormValues => ({
  name: settings.name,
  targetRole: settings.targetRole,
  email: settings.email,
  githubUrl: settings.githubUrl,
  linkedinUrl: settings.linkedinUrl,
  resumeUrl: settings.resumeUrl,
  hero: {
    badge: settings.hero.badge,
    title: settings.hero.title,
    highlightedPhrase: settings.hero.highlightedPhrase,
    description: settings.hero.description,
  },
  education: {
    institution: settings.education.institution,
    degree: settings.education.degree,
    specialization: settings.education.specialization,
    expectedGraduation: settings.education.expectedGraduation,
  },
});

const toUpdateInput = (
  values: ParsedSiteSettingsFormValues,
): UpdateSiteSettingsInput => ({
  name: values.name,
  targetRole: values.targetRole,
  email: values.email,
  githubUrl: values.githubUrl,
  linkedinUrl: values.linkedinUrl,
  resumeUrl: values.resumeUrl,
  hero: {
    badge: values.hero.badge,
    title: values.hero.title,
    highlightedPhrase: values.hero.highlightedPhrase,
    description: values.hero.description,
  },
  education: {
    institution: values.education.institution,
    degree: values.education.degree,
    specialization: values.education.specialization,
    expectedGraduation: values.education.expectedGraduation,
  },
});

export function SettingsForm({ settings }: SettingsFormProps) {
  const queryClient = useQueryClient();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<
    SiteSettingsFormValues,
    unknown,
    ParsedSiteSettingsFormValues
  >({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: toFormValues(settings),
  });

  const updateMutation = useMutation({
    mutationFn: updateSiteSettings,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(["site-settings"], updatedSettings);
      reset(toFormValues(updatedSettings));
      showSuccessToast("Site settings updated successfully.");
    },
    onError: (error) => {
      setError("root", { message: getToastErrorMessage(error) });
      showErrorToast(error, "Site settings could not be updated.");
    },
  });

  const isSaving = isSubmitting || updateMutation.isPending;

  const onSubmit = async (values: ParsedSiteSettingsFormValues) => {
    try {
      await updateMutation.mutateAsync(toUpdateInput(values));
    } catch {
      // The mutation onError path sets the form error and toast.
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <AdminPageHeader
        title="Site Settings"
        description="Manage the public profile, hero copy, contact links, resume URL, and education summary used across the portfolio."
        badge="Settings"
        actions={
          <Link
            href={settings.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View Resume
          </Link>
        }
      />

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit, () => {
        showErrorToast(new Error("Fix the highlighted site settings fields."));
      })}>
        {errors.root?.message ? (
          <Card className="border-red-200 bg-red-50 shadow-none">
            <CardContent className="flex gap-3 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {getMessage(errors.root.message)}
            </CardContent>
          </Card>
        ) : null}

        <FormSection
          title="Profile"
          description="Primary identity and contact details shown on public pages."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="name">
                Name <span className="text-red-700">*</span>
              </label>
              <Input id="name" className="mt-2" disabled={isSaving} {...register("name")} />
              <FieldError message={getMessage(errors.name?.message)} />
            </div>
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="targetRole"
              >
                Target role <span className="text-red-700">*</span>
              </label>
              <Input
                id="targetRole"
                className="mt-2"
                disabled={isSaving}
                {...register("targetRole")}
              />
              <FieldError message={getMessage(errors.targetRole?.message)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--admin-text)]" htmlFor="email">
              Email <span className="text-red-700">*</span>
            </label>
            <Input
              id="email"
              type="email"
              className="mt-2"
              disabled={isSaving}
              {...register("email")}
            />
            <FieldError message={getMessage(errors.email?.message)} />
          </div>
        </FormSection>

        <FormSection
          title="Links"
          description="Public URLs for social actions and the resume button."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="githubUrl"
              >
                GitHub URL <span className="text-red-700">*</span>
              </label>
              <Input
                id="githubUrl"
                className="mt-2"
                disabled={isSaving}
                {...register("githubUrl")}
              />
              <FieldError message={getMessage(errors.githubUrl?.message)} />
            </div>
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="linkedinUrl"
              >
                LinkedIn URL <span className="text-red-700">*</span>
              </label>
              <Input
                id="linkedinUrl"
                className="mt-2"
                disabled={isSaving}
                {...register("linkedinUrl")}
              />
              <FieldError message={getMessage(errors.linkedinUrl?.message)} />
            </div>
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="resumeUrl"
            >
              Resume URL <span className="text-red-700">*</span>
            </label>
            <Input
              id="resumeUrl"
              className="mt-2"
              disabled={isSaving}
              {...register("resumeUrl")}
            />
            <FieldError message={getMessage(errors.resumeUrl?.message)} />
          </div>
        </FormSection>

        <FormSection
          title="Hero Copy"
          description="Homepage headline, badge, emphasis phrase, and supporting copy."
        >
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="heroBadge"
            >
              Badge <span className="text-red-700">*</span>
            </label>
            <Input
              id="heroBadge"
              className="mt-2"
              disabled={isSaving}
              {...register("hero.badge")}
            />
            <FieldError message={getMessage(errors.hero?.badge?.message)} />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="heroTitle"
            >
              Title <span className="text-red-700">*</span>
            </label>
            <Textarea
              id="heroTitle"
              className="mt-2 min-h-24"
              disabled={isSaving}
              {...register("hero.title")}
            />
            <FieldError message={getMessage(errors.hero?.title?.message)} />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="heroHighlightedPhrase"
            >
              Highlighted phrase <span className="text-red-700">*</span>
            </label>
            <Input
              id="heroHighlightedPhrase"
              className="mt-2"
              disabled={isSaving}
              {...register("hero.highlightedPhrase")}
            />
            <FieldError
              message={getMessage(errors.hero?.highlightedPhrase?.message)}
            />
          </div>
          <div>
            <label
              className="text-sm font-medium text-[var(--admin-text)]"
              htmlFor="heroDescription"
            >
              Description <span className="text-red-700">*</span>
            </label>
            <Textarea
              id="heroDescription"
              className="mt-2"
              disabled={isSaving}
              {...register("hero.description")}
            />
            <FieldError message={getMessage(errors.hero?.description?.message)} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="cyan">Hero</Badge>
            <Badge variant="neutral">Homepage</Badge>
          </div>
        </FormSection>

        <FormSection
          title="Education"
          description="Student profile information used by public about sections."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="educationInstitution"
              >
                Institution <span className="text-red-700">*</span>
              </label>
              <Input
                id="educationInstitution"
                className="mt-2"
                disabled={isSaving}
                {...register("education.institution")}
              />
              <FieldError
                message={getMessage(errors.education?.institution?.message)}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="educationDegree"
              >
                Degree <span className="text-red-700">*</span>
              </label>
              <Input
                id="educationDegree"
                className="mt-2"
                disabled={isSaving}
                {...register("education.degree")}
              />
              <FieldError message={getMessage(errors.education?.degree?.message)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="educationSpecialization"
              >
                Specialization <span className="text-red-700">*</span>
              </label>
              <Input
                id="educationSpecialization"
                className="mt-2"
                disabled={isSaving}
                {...register("education.specialization")}
              />
              <FieldError
                message={getMessage(errors.education?.specialization?.message)}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-[var(--admin-text)]"
                htmlFor="educationExpectedGraduation"
              >
                Expected graduation <span className="text-red-700">*</span>
              </label>
              <Input
                id="educationExpectedGraduation"
                className="mt-2"
                disabled={isSaving}
                {...register("education.expectedGraduation")}
              />
              <FieldError
                message={getMessage(
                  errors.education?.expectedGraduation?.message,
                )}
              />
            </div>
          </div>
        </FormSection>

        <FormActions
          cancelHref="/admin"
          submitLabel="Save Settings"
          isSubmitting={isSaving}
        />
      </form>
    </section>
  );
}
