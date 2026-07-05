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
  ChevronDown,
  ChevronUp,
  Edit,
  GripVertical,
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
import { FeaturedToggle } from "@/components/admin/featured-toggle";
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
  deleteProject,
  getProjects,
  reorderProjects,
  toggleProjectFeatured,
  toggleProjectVisibility,
  type ProjectFilters,
} from "@/lib/api/projects";
import {
  getToastErrorMessage,
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { AdminProject, ProjectStatus } from "@/types/project";

type StatusFilterValue = "all" | ProjectStatus;
type FeaturedFilterValue = "all" | "featured" | "not-featured";
type VisibilityFilterValue = "all" | "visible" | "hidden";

type ProjectQuerySnapshot = [QueryKey, AdminProject[] | undefined][];

type MutationContext = {
  previousProjectQueries: ProjectQuerySnapshot;
};

const EMPTY_PROJECTS: AdminProject[] = [];

const statusLabels: Record<ProjectStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
};

const statusVariants: Record<ProjectStatus, "green" | "cyan" | "amber"> = {
  completed: "green",
  "in-progress": "cyan",
  planned: "amber",
};

const projectsQueryKey = (filters: ProjectFilters) =>
  ["projects", "list", filters] as const;

const updateProjectInList = (
  projects: AdminProject[] | undefined,
  project: AdminProject,
) => projects?.map((item) => (item.id === project.id ? project : item));

const removeProjectFromList = (
  projects: AdminProject[] | undefined,
  projectId: string,
) => projects?.filter((project) => project.id !== projectId);

function ProjectThumbnail({ project }: { project: AdminProject }) {
  return (
    <div className="relative size-14 overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)]">
      <Image
        src={project.thumbnail.url}
        alt={project.thumbnail.alt}
        fill
        unoptimized
        className="object-cover"
      />
    </div>
  );
}

function statusBadge(status: ProjectStatus) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}

type SortableProjectRowProps = {
  project: AdminProject;
  canReorder: boolean;
  isReordering: boolean;
  isFeaturedPending: boolean;
  isVisibilityPending: boolean;
  isAnyFeaturedMutationPending: boolean;
  isAnyVisibilityMutationPending: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onFeaturedChange: (isFeatured: boolean) => void;
  onVisibilityChange: (isVisible: boolean) => void;
  onDelete: () => void;
};

function SortableProjectRow({
  project,
  canReorder,
  isReordering,
  isFeaturedPending,
  isVisibilityPending,
  isAnyFeaturedMutationPending,
  isAnyVisibilityMutationPending,
  isExpanded,
  onToggleExpand,
  onFeaturedChange,
  onVisibilityChange,
  onDelete,
}: SortableProjectRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: project.id,
    disabled: !canReorder || isReordering,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const detailsId = `project-details-${project.id}`;

  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={style}
        data-project-id={project.id}
        className={cn(
          isDragging && "relative z-10 bg-[rgba(92,126,143,0.08)] shadow-lg",
        )}
      >
        <TableCell className="w-12 pr-0">
          <ReorderHandle
            aria-label={`Reorder ${project.title}`}
            disabled={!canReorder || isReordering}
            isSaving={isReordering}
            {...attributes}
            {...listeners}
          />
        </TableCell>
        <TableCell className="min-w-0 max-w-[32rem]">
          <div className="flex min-w-0 items-start gap-3">
            <ProjectThumbnail project={project} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-2">
                <div>
                  <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                    {project.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-[var(--admin-muted)] max-w-[45rem]">
                    {project.shortDescription}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {statusBadge(project.status)}
                  <span className="rounded-full bg-[var(--admin-surface-muted)] px-2 py-1 text-[var(--admin-text)]">
                    {project.year}
                  </span>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={onToggleExpand}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-2 text-xs font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-surface)]"
                  >
                    {isExpanded ? (
                      <ChevronUp className="size-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="size-4" aria-hidden="true" />
                    )}
                    {isExpanded ? "Hide details" : "Show details"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <FeaturedToggle
            checked={project.isFeatured}
            disabled={isFeaturedPending || isAnyVisibilityMutationPending}
            onCheckedChange={onFeaturedChange}
          />
        </TableCell>
        <TableCell>
          <VisibilityToggle
            checked={project.isVisible}
            disabled={isVisibilityPending || isAnyFeaturedMutationPending}
            onCheckedChange={onVisibilityChange}
          />
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Link
              href={`/admin/projects/${project.id}/edit`}
              className={cn(
                "inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 text-xs font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]",
              )}
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
      {isExpanded ? (
        <TableRow className="bg-[var(--admin-surface-muted)]">
          <TableCell colSpan={5} className="px-4 pb-3 pt-0">
            <div
              id={detailsId}
              className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 text-sm text-[var(--admin-text)] shadow-sm"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                    Slug
                  </p>
                  <code className="block max-w-full break-words rounded-md bg-[var(--admin-surface-muted)] px-2 py-1 text-xs text-[var(--admin-text)]">
                    {project.slug}
                  </code>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                    Type
                  </p>
                  <p className="max-w-full break-words text-sm text-[var(--admin-text)]">
                    {project.projectType}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                    Status
                  </p>
                  <div>{statusBadge(project.status)}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.12em] text-[var(--admin-muted)]">
                    Year
                  </p>
                  <span className="inline-flex rounded-full bg-[var(--admin-surface-muted)] px-2 py-1 text-sm text-[var(--admin-text)]">
                    {project.year}
                  </span>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

export function ProjectsList() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilterValue>("all");
  const [featured, setFeatured] = useState<FeaturedFilterValue>("all");
  const [visibility, setVisibility] = useState<VisibilityFilterValue>("all");
  const [projectToDelete, setProjectToDelete] = useState<AdminProject | null>(
    null,
  );
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(
    null,
  );
  const deferredSearch = useDeferredValue(search);

  const filters = useMemo<ProjectFilters>(() => {
    return {
      ...(deferredSearch.trim() ? { search: deferredSearch.trim() } : {}),
      ...(status !== "all" ? { status } : {}),
      ...(featured !== "all" ? { isFeatured: featured === "featured" } : {}),
      ...(visibility !== "all" ? { isVisible: visibility === "visible" } : {}),
    };
  }, [deferredSearch, featured, status, visibility]);

  const hasActiveFilters =
    search.trim().length > 0 ||
    status !== "all" ||
    featured !== "all" ||
    visibility !== "all";

  const projectsQuery = useQuery({
    queryKey: projectsQueryKey(filters),
    queryFn: () => getProjects(filters),
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

  const snapshotProjectQueries = async (): Promise<ProjectQuerySnapshot> => {
    await queryClient.cancelQueries({ queryKey: ["projects"] });

    return [
      [["projects"], queryClient.getQueryData<AdminProject[]>(["projects"])],
      ...queryClient.getQueriesData<AdminProject[]>({
        queryKey: ["projects", "list"],
      }),
    ];
  };

  const restoreProjectQueries = (snapshot?: ProjectQuerySnapshot) => {
    snapshot?.forEach(([queryKey, data]) => {
      queryClient.setQueryData(queryKey, data);
    });
  };

  const setProjectAcrossCaches = (project: AdminProject) => {
    queryClient.setQueryData<AdminProject[]>(["projects"], (currentProjects) =>
      updateProjectInList(currentProjects, project),
    );
    queryClient.setQueriesData<AdminProject[]>(
      { queryKey: ["projects", "list"] },
      (currentProjects) => updateProjectInList(currentProjects, project),
    );
  };

  const setProjectsAcrossCaches = (orderedProjects: AdminProject[]) => {
    const orderIndex = new Map(
      orderedProjects.map((project, index) => [project.id, index]),
    );

    queryClient.setQueryData(["projects"], orderedProjects);
    queryClient.setQueriesData<AdminProject[]>(
      { queryKey: ["projects", "list"] },
      (currentProjects) => {
        if (!currentProjects) {
          return currentProjects;
        }

        return [...currentProjects].sort((firstProject, secondProject) => {
          const firstIndex =
            orderIndex.get(firstProject.id) ?? Number.MAX_SAFE_INTEGER;
          const secondIndex =
            orderIndex.get(secondProject.id) ?? Number.MAX_SAFE_INTEGER;

          return firstIndex - secondIndex;
        });
      },
    );
  };

  const reorderMutation = useMutation<
    AdminProject[],
    Error,
    AdminProject[],
    MutationContext
  >({
    mutationFn: (orderedProjects) =>
      reorderProjects(orderedProjects.map((project) => project.id)),
    onMutate: async (orderedProjects) => {
      const previousProjectQueries = await snapshotProjectQueries();

      setProjectsAcrossCaches(orderedProjects);

      return { previousProjectQueries };
    },
    onError: (error, _orderedProjects, context) => {
      restoreProjectQueries(context?.previousProjectQueries);
      showErrorToast(error, "Project order could not be saved.");
    },
    onSuccess: (orderedProjects) => {
      setProjectsAcrossCaches(orderedProjects);
      showSuccessToast("Project order saved successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const featuredMutation = useMutation<
    AdminProject,
    Error,
    { id: string; isFeatured: boolean },
    MutationContext
  >({
    mutationFn: ({ id, isFeatured }) => toggleProjectFeatured(id, isFeatured),
    onMutate: async ({ id, isFeatured }) => {
      const previousProjectQueries = await snapshotProjectQueries();

      queryClient.setQueriesData<AdminProject[]>(
        { queryKey: ["projects", "list"] },
        (currentProjects) =>
          currentProjects?.map((project) =>
            project.id === id ? { ...project, isFeatured } : project,
          ),
      );
      queryClient.setQueryData<AdminProject[]>(
        ["projects"],
        (currentProjects) =>
          currentProjects?.map((project) =>
            project.id === id ? { ...project, isFeatured } : project,
          ),
      );

      return { previousProjectQueries };
    },
    onError: (error, _variables, context) => {
      restoreProjectQueries(context?.previousProjectQueries);
      showErrorToast(error, "Project featured status could not be updated.");
    },
    onSuccess: (project) => {
      setProjectAcrossCaches(project);
      showSuccessToast("Project featured status updated.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const visibilityMutation = useMutation<
    AdminProject,
    Error,
    { id: string; isVisible: boolean },
    MutationContext
  >({
    mutationFn: ({ id, isVisible }) => toggleProjectVisibility(id, isVisible),
    onMutate: async ({ id, isVisible }) => {
      const previousProjectQueries = await snapshotProjectQueries();

      queryClient.setQueriesData<AdminProject[]>(
        { queryKey: ["projects", "list"] },
        (currentProjects) =>
          currentProjects?.map((project) =>
            project.id === id ? { ...project, isVisible } : project,
          ),
      );
      queryClient.setQueryData<AdminProject[]>(
        ["projects"],
        (currentProjects) =>
          currentProjects?.map((project) =>
            project.id === id ? { ...project, isVisible } : project,
          ),
      );

      return { previousProjectQueries };
    },
    onError: (error, _variables, context) => {
      restoreProjectQueries(context?.previousProjectQueries);
      showErrorToast(error, "Project visibility could not be updated.");
    },
    onSuccess: (project) => {
      setProjectAcrossCaches(project);
      showSuccessToast("Project visibility updated.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation<void, Error, string, MutationContext>({
    mutationFn: deleteProject,
    onMutate: async (id) => {
      const previousProjectQueries = await snapshotProjectQueries();

      queryClient.setQueriesData<AdminProject[]>(
        { queryKey: ["projects", "list"] },
        (currentProjects) => removeProjectFromList(currentProjects, id),
      );
      queryClient.setQueryData<AdminProject[]>(
        ["projects"],
        (currentProjects) => removeProjectFromList(currentProjects, id),
      );

      return { previousProjectQueries };
    },
    onError: (error, _id, context) => {
      restoreProjectQueries(context?.previousProjectQueries);
      showErrorToast(error, "Project could not be deleted.");
    },
    onSuccess: () => {
      setProjectToDelete(null);
      showSuccessToast("Project deleted successfully.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const projects = projectsQuery.data ?? EMPTY_PROJECTS;
  const projectIds = useMemo(
    () => projects.map((project) => project.id),
    [projects],
  );
  const canReorder = !hasActiveFilters && projects.length > 1;
  const featuredPendingId = featuredMutation.variables?.id;
  const visibilityPendingId = visibilityMutation.variables?.id;
  const emptyTitle = hasActiveFilters
    ? "No projects match these filters"
    : "No projects have been created yet";
  const emptyDescription = hasActiveFilters
    ? "Clear the current search and filters to return to the full project list."
    : "Create your first portfolio project when Phase E2 adds the project form.";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setFeatured("all");
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

    const oldIndex = projects.findIndex((project) => project.id === active.id);
    const newIndex = projects.findIndex((project) => project.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    reorderMutation.mutate(arrayMove(projects, oldIndex, newIndex));
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <AdminPageHeader
        title="Projects"
        description="Manage portfolio projects, featured slots, visibility, and publishing state."
        badge="Projects"
        actions={
          <Link
            href="/admin/projects/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 text-sm font-medium !text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add Project
          </Link>
        }
      />

      <AdminListToolbar
        searchValue={search}
        searchPlaceholder="Search projects"
        onSearchChange={setSearch}
        filters={
          <>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilterValue)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={featured}
              onValueChange={(value) =>
                setFeatured(value as FeaturedFilterValue)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="not-featured">Not featured</SelectItem>
              </SelectContent>
            </Select>

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
              ? "Clear filters to reorder the full project list."
              : "Drag project rows by their handles to update display order."}
          </span>
          {hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="bg-[var(--admin-surface)] border-[var(--admin-border)] cursor-pointer text-[var(--admin-text)] hover:bg-[var(--admin-surface)]"
            >
              Clear filters
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {projectsQuery.isLoading ? (
        <LoadingState message="Loading projects..." />
      ) : projectsQuery.isError ? (
        <ErrorState
          title="Projects unavailable"
          description={getToastErrorMessage(projectsQuery.error)}
          onRetry={() => void projectsQuery.refetch()}
        />
      ) : projects.length === 0 ? (
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
                href="/admin/projects/new"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-3 text-sm font-medium text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add Project
              </Link>
            )
          }
        />
      ) : (
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Project Records</CardTitle>
                <CardDescription>
                  {projects.length} project{projects.length === 1 ? "" : "s"} in
                  this view.
                </CardDescription>
              </div>
              {projectsQuery.isFetching ? (
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
                items={projectIds}
                strategy={verticalListSortingStrategy}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 pr-0">Order</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => {
                      const isFeaturedPending =
                        featuredMutation.isPending &&
                        featuredPendingId === project.id;
                      const isVisibilityPending =
                        visibilityMutation.isPending &&
                        visibilityPendingId === project.id;

                      return (
                        <SortableProjectRow
                          key={project.id}
                          project={project}
                          canReorder={canReorder}
                          isReordering={reorderMutation.isPending}
                          isFeaturedPending={isFeaturedPending}
                          isVisibilityPending={isVisibilityPending}
                          isAnyFeaturedMutationPending={
                            featuredMutation.isPending
                          }
                          isAnyVisibilityMutationPending={
                            visibilityMutation.isPending
                          }
                          isExpanded={expandedProjectId === project.id}
                          onToggleExpand={() =>
                            setExpandedProjectId((current) =>
                              current === project.id ? null : project.id,
                            )
                          }
                          onFeaturedChange={(isFeatured) =>
                            featuredMutation.mutate({
                              id: project.id,
                              isFeatured,
                            })
                          }
                          onVisibilityChange={(isVisible) =>
                            visibilityMutation.mutate({
                              id: project.id,
                              isVisible,
                            })
                          }
                          onDelete={() => setProjectToDelete(project)}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      )}

      <ConfirmDeleteDialog
        open={Boolean(projectToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setProjectToDelete(null);
          }
        }}
        title="Delete project"
        description={
          projectToDelete
            ? `Delete "${projectToDelete.title}" from the portfolio backend?`
            : "Delete this project?"
        }
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          if (projectToDelete) {
            deleteMutation.mutate(projectToDelete.id);
          }
        }}
      />
    </section>
  );
}
