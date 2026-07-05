"use client";

import { useQuery } from "@tanstack/react-query";

import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import { SettingsForm } from "@/components/admin/settings/settings-form";
import { getSiteSettings } from "@/lib/api/site-settings";
import { getToastErrorMessage } from "@/lib/toast";

export default function SettingsPage() {
  const settingsQuery = useQuery({
    queryKey: ["site-settings"],
    queryFn: getSiteSettings,
  });

  if (settingsQuery.isLoading) {
    return <LoadingState message="Loading site settings..." />;
  }

  if (settingsQuery.isError) {
    return (
      <ErrorState
        title="Site settings unavailable"
        description={getToastErrorMessage(settingsQuery.error)}
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  if (!settingsQuery.data) {
    return (
      <ErrorState
        title="Site settings unavailable"
        description="The settings response did not include editable settings."
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  return <SettingsForm settings={settingsQuery.data} />;
}
