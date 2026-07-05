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
import {
  Edit,
  ExternalLink,
  GripVertical,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
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
  deleteCertification,
  getCertifications,
  reorderCertifications,
  toggleCertificationVisibility,
  type CertificationFilters,
} from "@/lib/api/certifications";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { AdminCertification } from "@/types/certification";

type VisibilityFilterValue = "all" | "visible" | "hidden";
type CertificationsQuerySnapshot = [
  QueryKey,
  AdminCertification[] | undefined,
][];

type MutationContext = {
  previousQueries: CertificationsQuerySnapshot;
};

const EMPTY_CERTIFICATIONS: AdminCertification[] = [];

const certificationsQueryKey = (filters: CertificationFilters) =>
  ["certifications", "list", filters] as const;

const updateCertificationInList = (
  certifications: AdminCertification[] | undefined,
  certification: AdminCertification,
) =>
  certifications?.map((currentCertification) =>
    currentCertification.id === certification.id
      ? certification
      : currentCertification,
  );

const removeCertificationFromList = (
  certifications: AdminCertification[] | undefined,
  certificationId: string,
) =>
  certifications?.filter(
    (certification) => certification.id !== certificationId,
  );

const formatDate = (date: string | undefined) => date || "Not set";

type SortableCertificationRowProps = {
  certification: AdminCertification;
  canReorder: boolean;
  isReordering: boolean;
  isVisibilityPending: boolean;
  onVisibilityChange: (isVisible: boolean) => void;
  onDelete: () => void;
};

function SortableCertificationRow({
  certification,
  canReorder,
  isReordering,
  isVisibilityPending,
  onVisibilityChange,
  onDelete,
}: SortableCertificationRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: certification.id,
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
      data-certification-id={certification.id}
      className={cn(isDragging && "relative z-10 bg-[rgba(92,126,143,0.08)] shadow-lg")}
    >
      <TableCell className="w-12 pr-0">
        <ReorderHandle
          aria-label={`Reorder ${certification.title}`}
          disabled={!canReorder || isReordering}
          isSaving={isReordering}
          {...attributes}
          {...listeners}
        />
      </TableCell>
      <TableCell>
        <div className="relative grid aspect-[4/3] w-28 place-items-center overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] text-[var(--admin-muted)]">
          {certification.image?.url ? (
            <Image
              src={certification.image.url}
              alt={certification.image.alt}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImageIcon className="size-6" aria-hidden="true" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="min-w-64">
          <p className="text-sm font-medium text-[var(--admin-text)]">{certification.title}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--admin-muted)]">
            {certification.note}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <p className="min-w-40 text-sm text-[var(--admin-text)]">
          {certification.provider}
        </p>
      </TableCell>
      <TableCell>
        <Badge variant={certification.date ? "cyan" : "neutral"}>
          {formatDate(certification.date)}
        </Badge>
      </TableCell>
      <TableCell>
        <p className="min-w-36 text-sm text-[var(--admin-muted)]">
          {certification.credentialId || "Not set"}
        </p>
      </TableCell>
      <TableCell>
        <div className="flex min-w-52 flex-wrap gap-1.5">
          {certification.skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="neutral">
              {skill}
            </Badge>
          ))}
          {certification.skills.length === 0 ? (
            <Badge variant="neutral">No skills</Badge>
          ) : null}
          {certification.skills.length > 3 ? (
            <Badge variant="neutral">+{certification.skills.length - 3}</Badge>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        {certification.verifyUrl ? (
          <a
            href={certification.verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--admin-accent)] transition-colors hover:bg-[var(--admin-accent-soft)]"
          >
            <ExternalLink className="size-3.5" aria-hidden="true" />
            Verify
          </a>
        ) : (
          <Badge variant="neutral">No URL</Badge>
        )}
      </TableCell>
      <TableCell>
        <VisibilityToggle
          checked={certification.isVisible}
          disabled={isVisibilityPending || isReordering}
          onCheckedChange={onVisibilityChange}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/admin/certifications/${certification.id}/edit`}
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

export function CertificationsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilterValue>("all");
  const [certificationToDelete, setCertificationToDelete] =
    useState<AdminCertification | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filters = useMemo<CertificationFilters>(() => {
    return {
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(visibility !== "all" ? { isVisible: visibility === "visible" } : {}),
    };
  }, [deferredSearch, visibility]);

  const hasActiveFilters = search.trim().length > 0 || visibility !== "all";

  const certificationsQuery = useQuery({
    queryKey: certificationsQueryKey(filters),
    queryFn: () => getCertifications(filters),
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

  const snapshotQueries = async (): Promise<CertificationsQuerySnapshot> => {
    await queryClient.cancelQueries({ queryKey: ["certifications"] });

    return [
      [
        ["certifications"],
        queryClient.getQueryData<AdminCertification[]>(["certifications"]),
      ],
      ...queryClient.getQueriesData<AdminCertification[]>({
        queryKey: ["certifications", "list"],
      }),
    ];
  };

  const restoreQueries = (snapshot?: CertificationsQuerySnapshot) => {
    snapshot?.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  const setCertificationAcrossCaches = (certification: AdminCertification) => {
    queryClient.setQueryData<AdminCertification[]>(
      ["certifications"],
      (currentCertifications) =>
        updateCertificationInList(currentCertifications, certification),
    );
    queryClient.setQueriesData<AdminCertification[]>(
      { queryKey: ["certifications", "list"] },
      (currentCertifications) =>
        updateCertificationInList(currentCertifications, certification),
    );
    queryClient.setQueryData(
      ["certifications", "detail", certification.id],
      certification,
    );
  };

  const setCertificationsAcrossCaches = (
    orderedCertifications: AdminCertification[],
  ) => {
    const orderIndex = new Map(
      orderedCertifications.map((certification, index) => [
        certification.id,
        index,
      ]),
    );

    queryClient.setQueryData(["certifications"], orderedCertifications);
    queryClient.setQueriesData<AdminCertification[]>(
      { queryKey: ["certifications", "list"] },
      (currentCertifications) => {
        if (!currentCertifications) {
          return currentCertifications;
        }

        return [...currentCertifications].sort(
          (firstCertification, secondCertification) => {
            const firstIndex =
              orderIndex.get(firstCertification.id) ?? Number.MAX_SAFE_INTEGER;
            const secondIndex =
              orderIndex.get(secondCertification.id) ?? Number.MAX_SAFE_INTEGER;

            return firstIndex - secondIndex;
          },
        );
      },
    );
  };

  const reorderMutation = useMutation<
    AdminCertification[],
    Error,
    AdminCertification[],
    MutationContext
  >({
    mutationFn: (orderedCertifications) =>
      reorderCertifications(
        orderedCertifications.map((certification) => certification.id),
      ),
    onMutate: async (orderedCertifications) => {
      const previousQueries = await snapshotQueries();

      setCertificationsAcrossCaches(orderedCertifications);

      return { previousQueries };
    },
    onError: (error, _orderedCertifications, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Certification order could not be saved.");
    },
    onSuccess: (orderedCertifications) => {
      setCertificationsAcrossCaches(orderedCertifications);
      showSuccessToast("Certification order saved successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });

  const visibilityMutation = useMutation<
    AdminCertification,
    Error,
    { id: string; isVisible: boolean },
    MutationContext
  >({
    mutationFn: ({ id, isVisible }) =>
      toggleCertificationVisibility(id, isVisible),
    onMutate: async ({ id, isVisible }) => {
      const previousQueries = await snapshotQueries();

      queryClient.setQueryData<AdminCertification[]>(
        ["certifications"],
        (currentCertifications) =>
          currentCertifications?.map((certification) =>
            certification.id === id
              ? { ...certification, isVisible }
              : certification,
          ),
      );
      queryClient.setQueriesData<AdminCertification[]>(
        { queryKey: ["certifications", "list"] },
        (currentCertifications) =>
          currentCertifications?.map((certification) =>
            certification.id === id
              ? { ...certification, isVisible }
              : certification,
          ),
      );

      return { previousQueries };
    },
    onError: (error, _variables, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Certification visibility could not be updated.");
    },
    onSuccess: (certification) => {
      setCertificationAcrossCaches(certification);
      showSuccessToast("Certification visibility updated.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });

  const deleteMutation = useMutation<void, Error, string, MutationContext>({
    mutationFn: deleteCertification,
    onMutate: async (id) => {
      const previousQueries = await snapshotQueries();

      queryClient.setQueryData<AdminCertification[]>(
        ["certifications"],
        (currentCertifications) =>
          removeCertificationFromList(currentCertifications, id),
      );
      queryClient.setQueriesData<AdminCertification[]>(
        { queryKey: ["certifications", "list"] },
        (currentCertifications) =>
          removeCertificationFromList(currentCertifications, id),
      );

      return { previousQueries };
    },
    onError: (error, _id, context) => {
      restoreQueries(context?.previousQueries);
      showErrorToast(error, "Certification could not be deleted.");
    },
    onSuccess: () => {
      setCertificationToDelete(null);
      showSuccessToast("Certification deleted successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["certifications"] });
    },
  });

  const certifications = certificationsQuery.data ?? EMPTY_CERTIFICATIONS;
  const certificationIds = useMemo(
    () => certifications.map((certification) => certification.id),
    [certifications],
  );
  const canReorder = !hasActiveFilters && certifications.length > 1;
  const visibilityPendingId = visibilityMutation.variables?.id;

  const emptyTitle = hasActiveFilters
    ? "No certifications match these filters"
    : "No certifications have been created yet";
  const emptyDescription = hasActiveFilters
    ? "Clear the current search and visibility filter to return to the full list."
    : "Create the first certification with its required certificate image.";

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

    const oldIndex = certifications.findIndex(
      (certification) => certification.id === active.id,
    );
    const newIndex = certifications.findIndex(
      (certification) => certification.id === over.id,
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    reorderMutation.mutate(arrayMove(certifications, oldIndex, newIndex));
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <AdminPageHeader
        title="Certifications"
        description="Manage certification records, images, verification links, visibility, and ordering."
        badge="Certifications"
        actions={
          <Link
            href="/admin/certifications/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Certification
          </Link>
        }
      />

      <AdminListToolbar
        searchValue={search}
        searchPlaceholder="Search certifications"
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
              ? "Clear filters to reorder the full certification list."
              : "Drag certification rows by their handles to update display order."}
          </span>
          {hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {certificationsQuery.isLoading ? (
        <LoadingState message="Loading certifications..." />
      ) : certificationsQuery.isError ? (
        <ErrorState
          title="Certifications unavailable"
          description={getToastErrorMessage(certificationsQuery.error)}
          onRetry={() => void certificationsQuery.refetch()}
        />
      ) : certifications.length === 0 ? (
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
                href="/admin/certifications/new"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-3 text-sm font-medium text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Certification
              </Link>
            )
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Certification Records</CardTitle>
                <CardDescription>
                  {certifications.length} certification
                  {certifications.length === 1 ? "" : "s"} in this view.
                </CardDescription>
              </div>
              {certificationsQuery.isFetching ? (
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
                items={certificationIds}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 pr-0">Order</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Credential ID</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Verify</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certifications.map((certification) => (
                      <SortableCertificationRow
                        key={certification.id}
                        certification={certification}
                        canReorder={canReorder}
                        isReordering={reorderMutation.isPending}
                        isVisibilityPending={
                          visibilityMutation.isPending &&
                          visibilityPendingId === certification.id
                        }
                        onVisibilityChange={(isVisible) =>
                          visibilityMutation.mutate({
                            id: certification.id,
                            isVisible,
                          })
                        }
                        onDelete={() => setCertificationToDelete(certification)}
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
        open={Boolean(certificationToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setCertificationToDelete(null);
          }
        }}
        title="Delete certification"
        description={
          certificationToDelete
            ? `Delete "${certificationToDelete.title}" and its certificate image?`
            : "Delete this certification?"
        }
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (certificationToDelete) {
            deleteMutation.mutate(certificationToDelete.id);
          }
        }}
      />
    </section>
  );
}
