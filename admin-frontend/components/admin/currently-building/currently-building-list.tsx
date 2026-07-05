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
import { Edit, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
  deleteCurrentlyBuildingItem,
  getCurrentlyBuildingItems,
  reorderCurrentlyBuildingItems,
  toggleCurrentlyBuildingVisibility,
  type CurrentlyBuildingFilters,
} from "@/lib/api/currently-building";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { AdminCurrentlyBuildingItem } from "@/types/currently-building";

type VisibilityFilterValue = "all" | "visible" | "hidden";
type CurrentlyBuildingQuerySnapshot = [
  QueryKey,
  AdminCurrentlyBuildingItem[] | undefined,
][];

type MutationContext = {
  previousQueries: CurrentlyBuildingQuerySnapshot;
};

const EMPTY_ITEMS: AdminCurrentlyBuildingItem[] = [];

const currentlyBuildingQueryKey = (filters: CurrentlyBuildingFilters) =>
  ["currently-building", "list", filters] as const;

const updateItemInList = (
  items: AdminCurrentlyBuildingItem[] | undefined,
  item: AdminCurrentlyBuildingItem,
) =>
  items?.map((currentItem) =>
    currentItem.id === item.id ? item : currentItem,
  );

const removeItemFromList = (
  items: AdminCurrentlyBuildingItem[] | undefined,
  itemId: string,
) => items?.filter((item) => item.id !== itemId);

const statusBadgeVariant = (
  status: string,
): "green" | "cyan" | "amber" | "neutral" => {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("complete") ||
    normalizedStatus.includes("ship")
  ) {
    return "green";
  }

  if (
    normalizedStatus.includes("progress") ||
    normalizedStatus.includes("active")
  ) {
    return "cyan";
  }

  if (
    normalizedStatus.includes("plan") ||
    normalizedStatus.includes("pause") ||
    normalizedStatus.includes("hold")
  ) {
    return "amber";
  }

  return "neutral";
};

type SortableCurrentlyBuildingRowProps = {
  item: AdminCurrentlyBuildingItem;
  canReorder: boolean;
  isReordering: boolean;
  isVisibilityPending: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
  onDelete: () => void;
};

function SortableCurrentlyBuildingRow({
  item,
  canReorder,
  isReordering,
  isVisibilityPending,
  onVisibilityChange,
  onDelete,
}: SortableCurrentlyBuildingRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
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
      data-currently-building-id={item.id}
      className={cn(
        isDragging && "relative z-10 bg-[rgba(92,126,143,0.08)] shadow-lg",
      )}
    >
      <TableCell className="w-12 pr-0">
        <ReorderHandle
          aria-label={`Reorder ${item.title}`}
          disabled={!canReorder || isReordering}
          isSaving={isReordering}
          {...attributes}
          {...listeners}
        />
      </TableCell>
      <TableCell>
        <div className="min-w-72">
          <p className="text-sm font-medium text-[var(--admin-text)]">
            {item.title}
          </p>
          {item.link ? (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block truncate text-xs text-[var(--admin-accent)] hover:text-[var(--admin-accent-hover)]"
            >
              {item.link}
            </a>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <p className="line-clamp-2 min-w-72 text-sm leading-6 text-[var(--admin-muted)]">
          {item.description}
        </p>
      </TableCell>
      <TableCell>
        <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
      </TableCell>
      <TableCell>
        <p className="line-clamp-2 min-w-64 text-sm leading-6 text-[var(--admin-muted)]">
          {item.currentFocus}
        </p>
      </TableCell>
      <TableCell>
        <div className="flex min-w-56 flex-wrap gap-1.5">
          {item.techStack.slice(0, 4).map((tech) => (
            <Badge key={tech} variant="neutral">
              {tech}
            </Badge>
          ))}
          {item.techStack.length > 4 ? (
            <Badge variant="neutral">+{item.techStack.length - 4}</Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="neutral">{item.highlights.length} bullets</Badge>
      </TableCell>
      <TableCell>
        <VisibilityToggle
          checked={item.isVisible}
          disabled={isVisibilityPending || isReordering}
          onCheckedChange={onVisibilityChange}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/currently-building/${item.id}/edit`}
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

export function CurrentlyBuildingList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilterValue>("all");
  const [itemToDelete, setItemToDelete] =
    useState<AdminCurrentlyBuildingItem | null>(null);
  const deferredSearch = useDeferredValue(search);
  const deferredStatus = useDeferredValue(status);

  const filters = useMemo<CurrentlyBuildingFilters>(() => {
    return {
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(deferredStatus.trim() ? { status: deferredStatus.trim() } : {}),
      ...(visibility !== "all" ? { isVisible: visibility === "visible" } : {}),
    };
  }, [deferredSearch, deferredStatus, visibility]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    status.trim().length > 0 ||
    visibility !== "all";

  const itemsQuery = useQuery({
    queryKey: currentlyBuildingQueryKey(filters),
    queryFn: () => getCurrentlyBuildingItems(filters),
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

  const snapshotQueries = async (): Promise<CurrentlyBuildingQuerySnapshot> => {
    await queryClient.cancelQueries({ queryKey: ["currently-building"] });

    return [
      [
        ["currently-building"],
        queryClient.getQueryData<AdminCurrentlyBuildingItem[]>([
          "currently-building",
        ]),
      ],
      ...queryClient.getQueriesData<AdminCurrentlyBuildingItem[]>({
        queryKey: ["currently-building", "list"],
      }),
    ];
  };

  const restoreQueries = (snapshot?: CurrentlyBuildingQuerySnapshot) => {
    snapshot?.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  const setItemAcrossCaches = (item: AdminCurrentlyBuildingItem) => {
    queryClient.setQueryData<AdminCurrentlyBuildingItem[]>(
      ["currently-building"],
      (currentItems) => updateItemInList(currentItems, item),
    );
    queryClient.setQueriesData<AdminCurrentlyBuildingItem[]>(
      { queryKey: ["currently-building", "list"] },
      (currentItems) => updateItemInList(currentItems, item),
    );
    queryClient.setQueryData(["currently-building", "detail", item.id], item);
  };

  const setItemsAcrossCaches = (orderedItems: AdminCurrentlyBuildingItem[]) => {
    const orderIndex = new Map(
      orderedItems.map((item, index) => [item.id, index]),
    );

    queryClient.setQueryData(["currently-building"], orderedItems);
    queryClient.setQueriesData<AdminCurrentlyBuildingItem[]>(
      { queryKey: ["currently-building", "list"] },
      (currentItems) => {
        if (!currentItems) {
          return currentItems;
        }

        return [...currentItems].sort((firstItem, secondItem) => {
          const firstIndex =
            orderIndex.get(firstItem.id) ?? Number.MAX_SAFE_INTEGER;
          const secondIndex =
            orderIndex.get(secondItem.id) ?? Number.MAX_SAFE_INTEGER;

          return firstIndex - secondIndex;
        });
      },
    );
  };

  const reorderMutation = useMutation<
    AdminCurrentlyBuildingItem[],
    Error,
    AdminCurrentlyBuildingItem[],
    MutationContext
  >({
    mutationFn: (orderedItems) =>
      reorderCurrentlyBuildingItems(orderedItems.map((item) => item.id)),
    onMutate: async (orderedItems) => {
      const previousQueries = await snapshotQueries();

      setItemsAcrossCaches(orderedItems);

      return { previousQueries };
    },
    onError: (error, _orderedItems, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Currently-building order could not be saved.");
    },
    onSuccess: (orderedItems) => {
      setItemsAcrossCaches(orderedItems);
      showSuccessToast("Currently-building order saved successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["currently-building"] });
    },
  });

  const visibilityMutation = useMutation<
    AdminCurrentlyBuildingItem,
    Error,
    { id: string; isVisible: boolean },
    MutationContext
  >({
    mutationFn: ({ id, isVisible }) =>
      toggleCurrentlyBuildingVisibility(id, isVisible),
    onMutate: async ({ id, isVisible }) => {
      const previousQueries = await snapshotQueries();

      queryClient.setQueryData<AdminCurrentlyBuildingItem[]>(
        ["currently-building"],
        (currentItems) =>
          currentItems?.map((item) =>
            item.id === id ? { ...item, isVisible } : item,
          ),
      );
      queryClient.setQueriesData<AdminCurrentlyBuildingItem[]>(
        { queryKey: ["currently-building", "list"] },
        (currentItems) =>
          currentItems?.map((item) =>
            item.id === id ? { ...item, isVisible } : item,
          ),
      );

      return { previousQueries };
    },
    onError: (error, _variables, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(
        error,
        "Currently-building visibility could not be updated.",
      );
    },
    onSuccess: (item) => {
      setItemAcrossCaches(item);
      showSuccessToast("Currently-building visibility updated.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["currently-building"] });
    },
  });

  const deleteMutation = useMutation<void, Error, string, MutationContext>({
    mutationFn: deleteCurrentlyBuildingItem,
    onMutate: async (id) => {
      const previousQueries = await snapshotQueries();

      queryClient.setQueryData<AdminCurrentlyBuildingItem[]>(
        ["currently-building"],
        (currentItems) => removeItemFromList(currentItems, id),
      );
      queryClient.setQueriesData<AdminCurrentlyBuildingItem[]>(
        { queryKey: ["currently-building", "list"] },
        (currentItems) => removeItemFromList(currentItems, id),
      );

      return { previousQueries };
    },
    onError: (error, _id, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Currently-building item could not be deleted.");
    },
    onSuccess: () => {
      setItemToDelete(null);
      showSuccessToast("Currently-building item deleted successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["currently-building"] });
    },
  });

  const items = itemsQuery.data ?? EMPTY_ITEMS;
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);
  const canReorder = !hasActiveFilters && items.length > 1;
  const visibilityPendingId = visibilityMutation.variables?.id;

  const emptyTitle = hasActiveFilters
    ? "No currently-building items match these filters"
    : "No currently-building items have been created yet";
  const emptyDescription = hasActiveFilters
    ? "Clear the current search and filters to return to the full list."
    : "Create the first active-work item for the portfolio.";

  const clearFilters = () => {
    setSearch("");
    setStatus("");
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

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    reorderMutation.mutate(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <AdminPageHeader
        title="Currently Building"
        description="Manage active work, status, focus, stack, visibility, and ordering."
        badge="Currently Building"
        actions={
          <Link
            href="/admin/currently-building/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 text-sm font-medium !text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Item
          </Link>
        }
      />

      <AdminListToolbar
        searchValue={search}
        searchPlaceholder="Search currently building"
        onSearchChange={setSearch}
        filters={
          <>
            <Input
              value={status}
              placeholder="Status"
              className="w-40"
              onChange={(event) => setStatus(event.target.value)}
            />
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
          </>
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
              ? "Clear filters to reorder the full currently-building list."
              : "Drag currently-building rows by their handles to update display order."}
          </span>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {itemsQuery.isLoading ? (
        <LoadingState message="Loading currently-building items..." />
      ) : itemsQuery.isError ? (
        <ErrorState
          title="Currently-building items unavailable"
          description={getToastErrorMessage(itemsQuery.error)}
          onRetry={() => void itemsQuery.refetch()}
        />
      ) : items.length === 0 ? (
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
                href="/admin/currently-building/new"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-3 text-sm font-medium text-white! transition-colors hover:bg-[var(--admin-accent-hover)]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Item
              </Link>
            )
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Active Work Records</CardTitle>
                <CardDescription>
                  {items.length} item{items.length === 1 ? "" : "s"} in this
                  view.
                </CardDescription>
              </div>
              {itemsQuery.isFetching ? (
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
                items={itemIds}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 pr-0">Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Focus</TableHead>
                      <TableHead>Tech Stack</TableHead>
                      <TableHead>Highlights</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <SortableCurrentlyBuildingRow
                        key={item.id}
                        item={item}
                        canReorder={canReorder}
                        isReordering={reorderMutation.isPending}
                        isVisibilityPending={
                          visibilityMutation.isPending &&
                          visibilityPendingId === item.id
                        }
                        onVisibilityChange={(isVisible) =>
                          visibilityMutation.mutate({
                            id: item.id,
                            isVisible,
                          })
                        }
                        onDelete={() => setItemToDelete(item)}
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
        open={Boolean(itemToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setItemToDelete(null);
          }
        }}
        title="Delete currently-building item"
        description={
          itemToDelete
            ? `Delete "${itemToDelete.title}" from the currently-building backend?`
            : "Delete this item?"
        }
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (itemToDelete) {
            deleteMutation.mutate(itemToDelete.id);
          }
        }}
      />
    </section>
  );
}
