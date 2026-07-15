"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { Edit, GripVertical, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { LoadingState } from "@/components/admin/loading-state";
import { ReorderHandle } from "@/components/admin/reorder-handle";
import { VisibilityToggle } from "@/components/admin/visibility-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteAchievement,
  getAchievements,
  reorderAchievements,
  toggleAchievementVisibility,
  type AchievementFilters,
} from "@/lib/api/achievements";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { AdminAchievement } from "@/types/achievement";

type VisibilityFilterValue = "all" | "visible" | "hidden";
type AchievementsQuerySnapshot = [QueryKey, AdminAchievement[] | undefined][];

type MutationContext = {
  previousQueries: AchievementsQuerySnapshot;
};

const EMPTY_ACHIEVEMENTS: AdminAchievement[] = [];

const achievementsQueryKey = (filters: AchievementFilters) =>
  ["achievements", "list", filters] as const;

const updateAchievementInList = (
  achievements: AdminAchievement[] | undefined,
  achievement: AdminAchievement,
) =>
  achievements?.map((currentAchievement) =>
    currentAchievement.id === achievement.id
      ? achievement
      : currentAchievement,
  );

const removeAchievementFromList = (
  achievements: AdminAchievement[] | undefined,
  achievementId: string,
) =>
  achievements?.filter((achievement) => achievement.id !== achievementId);

const formatValue = (value: string | undefined) => value || "Not set";

type SortableAchievementRowProps = {
  achievement: AdminAchievement;
  canReorder: boolean;
  isReordering: boolean;
  isVisibilityPending: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
  onDelete: () => void;
};

function SortableAchievementRow({
  achievement,
  canReorder,
  isReordering,
  isVisibilityPending,
  onVisibilityChange,
  onDelete,
}: SortableAchievementRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: achievement.id,
    disabled: !canReorder || isReordering,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-achievement-id={achievement.id}
      className={cn(isDragging && "relative z-10 bg-[rgba(92,126,143,0.08)] shadow-lg")}
    >
      <TableCell className="w-12 pr-0">
        <ReorderHandle
          aria-label={`Reorder ${achievement.title}`}
          disabled={!canReorder || isReordering}
          isSaving={isReordering}
          {...attributes}
          {...listeners}
        />
      </TableCell>
      <TableCell>
        <div className="min-w-64">
          <p className="text-sm font-medium text-[var(--admin-text)]">{achievement.title}</p>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            Display order {achievement.displayOrder}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <p className="line-clamp-2 min-w-72 text-sm leading-6 text-[var(--admin-muted)]">
          {achievement.note}
        </p>
      </TableCell>
      <TableCell>
        <p className="min-w-44 text-sm text-[var(--admin-text)]">
          {formatValue(achievement.event)}
        </p>
      </TableCell>
      <TableCell>
        <p className="line-clamp-2 min-w-56 text-sm leading-6 text-[var(--admin-muted)]">
          {formatValue(achievement.result)}
        </p>
      </TableCell>
      <TableCell>
        <Badge variant={achievement.date ? "cyan" : "neutral"}>
          {formatValue(achievement.date)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant={achievement.year ? "amber" : "neutral"}>
          {formatValue(achievement.year)}
        </Badge>
      </TableCell>
      <TableCell>
        {achievement.icon ? (
          <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--admin-text)]">
            <Sparkles className="size-3.5 text-[var(--admin-accent)]" aria-hidden="true" />
            {achievement.icon}
          </span>
        ) : (
          <Badge variant="neutral">No icon</Badge>
        )}
      </TableCell>
      <TableCell>
        <VisibilityToggle
          checked={achievement.isVisible}
          disabled={isVisibilityPending || isReordering}
          onCheckedChange={onVisibilityChange}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/achievements/${achievement.id}/edit`}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
          >
            <Edit className="size-3.5" aria-hidden="true" />
            Edit
          </Link>
          <Button variant="danger" size="sm" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden="true" />
            Delete
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function AchievementsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilterValue>("all");
  const [achievementToDelete, setAchievementToDelete] =
    useState<AdminAchievement | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filters = useMemo<AchievementFilters>(() => {
    return {
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(visibility !== "all" ? { isVisible: visibility === "visible" } : {}),
    };
  }, [deferredSearch, visibility]);

  const hasActiveFilters = search.trim().length > 0 || visibility !== "all";

  const achievementsQuery = useQuery({
    queryKey: achievementsQueryKey(filters),
    queryFn: () => getAchievements(filters),
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const snapshotQueries = async (): Promise<AchievementsQuerySnapshot> => {
    await queryClient.cancelQueries({ queryKey: ["achievements"] });

    return [
      [
        ["achievements"],
        queryClient.getQueryData<AdminAchievement[]>(["achievements"]),
      ],
      ...queryClient.getQueriesData<AdminAchievement[]>({
        queryKey: ["achievements", "list"],
      }),
    ];
  };

  const restoreQueries = (snapshot?: AchievementsQuerySnapshot) => {
    snapshot?.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  const setAchievementAcrossCaches = (achievement: AdminAchievement) => {
    queryClient.setQueryData<AdminAchievement[]>(
      ["achievements"],
      (currentAchievements) =>
        updateAchievementInList(currentAchievements, achievement),
    );
    queryClient.setQueriesData<AdminAchievement[]>(
      { queryKey: ["achievements", "list"] },
      (currentAchievements) =>
        updateAchievementInList(currentAchievements, achievement),
    );
    queryClient.setQueryData(["achievements", "detail", achievement.id], achievement);
  };

  const setAchievementsAcrossCaches = (
    orderedAchievements: AdminAchievement[],
  ) => {
    const orderIndex = new Map(
      orderedAchievements.map((achievement, index) => [achievement.id, index]),
    );

    queryClient.setQueryData(["achievements"], orderedAchievements);
    queryClient.setQueriesData<AdminAchievement[]>(
      { queryKey: ["achievements", "list"] },
      (currentAchievements) => {
        if (!currentAchievements) {
          return currentAchievements;
        }

        return [...currentAchievements].sort((firstAchievement, secondAchievement) => {
          const firstIndex =
            orderIndex.get(firstAchievement.id) ?? Number.MAX_SAFE_INTEGER;
          const secondIndex =
            orderIndex.get(secondAchievement.id) ?? Number.MAX_SAFE_INTEGER;

          return firstIndex - secondIndex;
        });
      },
    );
  };

  const reorderMutation = useMutation<
    AdminAchievement[],
    Error,
    AdminAchievement[],
    MutationContext
  >({
    mutationFn: (orderedAchievements) =>
      reorderAchievements(
        orderedAchievements.map((achievement) => achievement.id),
      ),
    onMutate: async (orderedAchievements) => {
      const previousQueries = await snapshotQueries();

      setAchievementsAcrossCaches(orderedAchievements);

      return { previousQueries };
    },
    onError: (error, _orderedAchievements, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Achievement order could not be saved.");
    },
    onSuccess: (orderedAchievements) => {
      setAchievementsAcrossCaches(orderedAchievements);
      showSuccessToast("Achievement order saved successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const visibilityMutation = useMutation<
    AdminAchievement,
    Error,
    { id: string; isVisible: boolean },
    MutationContext
  >({
    mutationFn: ({ id, isVisible }) =>
      toggleAchievementVisibility(id, isVisible),
    onMutate: async ({ id, isVisible }) => {
      const previousQueries = await snapshotQueries();

      queryClient.setQueryData<AdminAchievement[]>(
        ["achievements"],
        (currentAchievements) =>
          currentAchievements?.map((achievement) =>
            achievement.id === id ? { ...achievement, isVisible } : achievement,
          ),
      );
      queryClient.setQueriesData<AdminAchievement[]>(
        { queryKey: ["achievements", "list"] },
        (currentAchievements) =>
          currentAchievements?.map((achievement) =>
            achievement.id === id ? { ...achievement, isVisible } : achievement,
          ),
      );

      return { previousQueries };
    },
    onError: (error, _variables, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Achievement visibility could not be updated.");
    },
    onSuccess: (achievement) => {
      setAchievementAcrossCaches(achievement);
      showSuccessToast("Achievement visibility updated.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const deleteMutation = useMutation<void, Error, string, MutationContext>({
    mutationFn: deleteAchievement,
    onMutate: async (id) => {
      const previousQueries = await snapshotQueries();

      queryClient.setQueryData<AdminAchievement[]>(
        ["achievements"],
        (currentAchievements) =>
          removeAchievementFromList(currentAchievements, id),
      );
      queryClient.setQueriesData<AdminAchievement[]>(
        { queryKey: ["achievements", "list"] },
        (currentAchievements) =>
          removeAchievementFromList(currentAchievements, id),
      );

      return { previousQueries };
    },
    onError: (error, _id, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Achievement could not be deleted.");
    },
    onSuccess: () => {
      setAchievementToDelete(null);
      showSuccessToast("Achievement deleted successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  const achievements = achievementsQuery.data ?? EMPTY_ACHIEVEMENTS;
  const achievementIds = useMemo(
    () => achievements.map((achievement) => achievement.id),
    [achievements],
  );
  const canReorder = !hasActiveFilters && achievements.length > 1;
  const visibilityPendingId = visibilityMutation.variables?.id;

  const emptyTitle = hasActiveFilters
    ? "No achievements match these filters"
    : "No achievements have been created yet";
  const emptyDescription = hasActiveFilters
    ? "Clear the current search and visibility filter to return to the full list."
    : "Create the first achievement for the portfolio.";

  const clearFilters = () => {
    setSearch("");
    setVisibility("all");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canReorder || reorderMutation.isPending) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = achievements.findIndex(
      (achievement) => achievement.id === active.id,
    );
    const newIndex = achievements.findIndex(
      (achievement) => achievement.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    reorderMutation.mutate(arrayMove(achievements, oldIndex, newIndex));
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <AdminPageHeader
        title="Achievements"
        description="Manage achievement titles, notes, event metadata, visibility, and ordering."
        badge="Achievements"
        actions={
          <Link
            href="/admin/achievements/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Achievement
          </Link>
        }
      />

      <AdminListToolbar
        searchValue={search}
        searchPlaceholder="Search achievements"
        onSearchChange={setSearch}
        filters={
          <Select
            value={visibility}
            onValueChange={(value) =>
              setVisibility(value as VisibilityFilterValue)
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="visible">Visible</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        }
        actions={
          <Button variant="secondary" disabled>
            {reorderMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <GripVertical className="size-4" aria-hidden="true" />
            )}
            {reorderMutation.isPending
              ? "Saving order..."
              : hasActiveFilters
                ? "Reorder disabled"
                : "Drag to reorder"}
          </Button>
        }
      />

      <Card className="border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] shadow-none">
        <CardContent className="flex flex-col gap-2 p-4 text-sm text-[var(--admin-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>
            {hasActiveFilters
              ? "Clear filters to reorder the full achievement list."
              : "Drag achievement rows by their handles to update display order."}
          </span>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {achievementsQuery.isLoading ? (
        <LoadingState message="Loading achievements..." />
      ) : achievementsQuery.isError ? (
        <ErrorState
          title="Achievements unavailable"
          description={getToastErrorMessage(achievementsQuery.error)}
          onRetry={() => void achievementsQuery.refetch()}
        />
      ) : achievements.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Link
                href="/admin/achievements/new"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-3 text-sm font-medium text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Achievement
              </Link>
            )
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Achievement Records</CardTitle>
                <CardDescription>
                  {achievements.length} achievement
                  {achievements.length === 1 ? "" : "s"} in this view.
                </CardDescription>
              </div>
              {achievementsQuery.isFetching ? (
                <Badge variant="cyan">Refreshing</Badge>
              ) : (
                <Badge variant="neutral">Admin data</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={achievementIds}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 pr-0">Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {achievements.map((achievement) => (
                      <SortableAchievementRow
                        key={achievement.id}
                        achievement={achievement}
                        canReorder={canReorder}
                        isReordering={reorderMutation.isPending}
                        isVisibilityPending={
                          visibilityMutation.isPending &&
                          visibilityPendingId === achievement.id
                        }
                        onVisibilityChange={(isVisible) =>
                          visibilityMutation.mutate({
                            id: achievement.id,
                            isVisible,
                          })
                        }
                        onDelete={() => setAchievementToDelete(achievement)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        open={Boolean(achievementToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setAchievementToDelete(null);
          }
        }}
        title="Delete achievement"
        description={
          achievementToDelete
            ? `Delete "${achievementToDelete.title}" from the achievements backend?`
            : "Delete this achievement?"
        }
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (achievementToDelete) {
            deleteMutation.mutate(achievementToDelete.id);
          }
        }}
      />
    </section>
  );
}
