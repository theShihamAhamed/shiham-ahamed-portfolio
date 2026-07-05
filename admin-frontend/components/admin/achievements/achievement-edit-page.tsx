"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AchievementForm } from "@/components/admin/achievements/achievement-form";
import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import { getAchievementById } from "@/lib/api/achievements";
import { getToastErrorMessage } from "@/lib/toast";
import type { AdminAchievement } from "@/types/achievement";

const achievementDetailQueryKey = (achievementId: string) =>
  ["achievements", "detail", achievementId] as const;

const updateAchievementInList = (
  achievements: AdminAchievement[] | undefined,
  achievement: AdminAchievement,
) =>
  achievements?.map((item) =>
    item.id === achievement.id ? achievement : item,
  );

export function AchievementEditPage({ achievementId }: { achievementId: string }) {
  const queryClient = useQueryClient();
  const achievementQuery = useQuery({
    queryKey: achievementDetailQueryKey(achievementId),
    queryFn: () => getAchievementById(achievementId),
    retry: false,
  });

  const syncAchievement = (achievement: AdminAchievement) => {
    queryClient.setQueryData(
      achievementDetailQueryKey(achievement.id),
      achievement,
    );
    queryClient.setQueryData<AdminAchievement[]>(
      ["achievements"],
      (achievements) => updateAchievementInList(achievements, achievement),
    );
    queryClient.setQueriesData<AdminAchievement[]>(
      { queryKey: ["achievements", "list"] },
      (achievements) => updateAchievementInList(achievements, achievement),
    );
  };

  if (achievementQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <LoadingState message="Loading achievement editor..." />
      </section>
    );
  }

  if (achievementQuery.isError || !achievementQuery.data) {
    return (
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <AdminPageHeader
          title="Edit Achievement"
          description="The requested achievement could not be loaded."
          badge="Edit"
          actions={
            <Link
              href="/admin/achievements"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Achievements
            </Link>
          }
        />
        <ErrorState
          title="Achievement unavailable"
          description={getToastErrorMessage(achievementQuery.error)}
          onRetry={() => void achievementQuery.refetch()}
        />
      </section>
    );
  }

  return (
    <AchievementForm
      mode="edit"
      achievement={achievementQuery.data}
      onAchievementUpdated={syncAchievement}
    />
  );
}
