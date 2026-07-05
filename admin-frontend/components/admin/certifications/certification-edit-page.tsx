"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CertificationForm } from "@/components/admin/certifications/certification-form";
import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import { getCertificationById } from "@/lib/api/certifications";
import { getToastErrorMessage } from "@/lib/toast";
import type { AdminCertification } from "@/types/certification";

const certificationDetailQueryKey = (certificationId: string) =>
  ["certifications", "detail", certificationId] as const;

const updateCertificationInList = (
  certifications: AdminCertification[] | undefined,
  certification: AdminCertification,
) =>
  certifications?.map((item) =>
    item.id === certification.id ? certification : item,
  );

export function CertificationEditPage({
  certificationId,
}: {
  certificationId: string;
}) {
  const queryClient = useQueryClient();
  const certificationQuery = useQuery({
    queryKey: certificationDetailQueryKey(certificationId),
    queryFn: () => getCertificationById(certificationId),
    retry: false,
  });

  const syncCertification = (certification: AdminCertification) => {
    queryClient.setQueryData(
      certificationDetailQueryKey(certification.id),
      certification,
    );
    queryClient.setQueryData<AdminCertification[]>(
      ["certifications"],
      (certifications) =>
        updateCertificationInList(certifications, certification),
    );
    queryClient.setQueriesData<AdminCertification[]>(
      { queryKey: ["certifications", "list"] },
      (certifications) =>
        updateCertificationInList(certifications, certification),
    );
  };

  if (certificationQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <LoadingState message="Loading certification editor..." />
      </section>
    );
  }

  if (certificationQuery.isError || !certificationQuery.data) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <AdminPageHeader
          title="Edit Certification"
          description="The requested certification could not be loaded."
          badge="Edit"
          actions={
            <Link
              href="/admin/certifications"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Certifications
            </Link>
          }
        />
        <ErrorState
          title="Certification unavailable"
          description={getToastErrorMessage(certificationQuery.error)}
          onRetry={() => void certificationQuery.refetch()}
        />
      </section>
    );
  }

  return (
    <CertificationForm
      mode="edit"
      certification={certificationQuery.data}
      onCertificationUpdated={syncCertification}
    />
  );
}
