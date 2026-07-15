"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CurrentlyBuildingForm } from "@/components/admin/currently-building/currently-building-form";
import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import { getCurrentlyBuildingItemById } from "@/lib/api/currently-building";
import { getToastErrorMessage } from "@/lib/toast";

export function CurrentlyBuildingEditPage({ itemId }: { itemId: string }) {
  const itemQuery = useQuery({
    queryKey: ["currently-building", "detail", itemId],
    queryFn: () => getCurrentlyBuildingItemById(itemId),
    retry: false,
  });

  if (itemQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <LoadingState message="Loading currently-building editor..." />
      </section>
    );
  }

  if (itemQuery.isError || !itemQuery.data) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <AdminPageHeader
          title="Edit Currently Building"
          description="The requested currently-building item could not be loaded."
          badge="Edit"
          actions={
            <Link
              href="/admin/currently-building"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Items
            </Link>
          }
        />
        <ErrorState
          title="Currently-building item unavailable"
          description={getToastErrorMessage(itemQuery.error)}
          onRetry={() => void itemQuery.refetch()}
        />
      </section>
    );
  }

  return <CurrentlyBuildingForm mode="edit" item={itemQuery.data} />;
}
