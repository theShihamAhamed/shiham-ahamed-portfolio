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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { ReorderHandle } from "@/components/admin/reorder-handle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getToastErrorMessage } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/image-asset";

type GalleryManagerProps = {
  images: ImageAsset[];
  onDelete?: (image: ImageAsset) => void | Promise<void>;
  onReorder?: (images: ImageAsset[]) => void | Promise<void>;
  isReordering?: boolean;
  disabled?: boolean;
  confirmDelete?: boolean;
};

type SortableGalleryImageProps = {
  image: ImageAsset;
  index: number;
  canReorder: boolean;
  isReordering: boolean;
  isDeleting: boolean;
  onDelete?: (image: ImageAsset) => void;
};

function SortableGalleryImage({
  image,
  index,
  canReorder,
  isReordering,
  isDeleting,
  onDelete,
}: SortableGalleryImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: image.fileId ?? image.url,
    disabled: !canReorder || isReordering,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-gallery-image-id={image.fileId ?? image.url}
      className={cn(
        "rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3 transition-shadow",
        isDragging &&
          "relative z-10 border-[var(--admin-accent)] bg-[var(--admin-surface)] shadow-xl shadow-slate-900/10",
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--admin-surface)]">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--admin-text)]">
            {image.name ?? `Image ${index + 1}`}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--admin-muted)]">
            {image.alt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ReorderHandle
            aria-label={`Reorder gallery image ${index + 1}`}
            disabled={!canReorder || isReordering}
            isSaving={isReordering}
            {...attributes}
            {...listeners}
          />
          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-2"
            disabled={!onDelete || isDeleting || isReordering}
            onClick={() => onDelete?.(image)}
            aria-label={`Delete image ${index + 1}`}
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function GalleryManager({
  images,
  onDelete,
  onReorder,
  isReordering = false,
  disabled = false,
  confirmDelete = true,
}: GalleryManagerProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  const sortableIds = useMemo(
    () => images.map((image) => image.fileId ?? image.url),
    [images],
  );
  const hasMissingFileId = images.some((image) => !image.fileId);
  const canReorder =
    Boolean(onReorder) &&
    images.length > 1 &&
    !hasMissingFileId &&
    !isReordering &&
    !disabled;

  const handleDelete = async (image: ImageAsset) => {
    if (!onDelete) {
      return;
    }

    if (
      confirmDelete &&
      !window.confirm(
        `Remove ${image.name ?? "this gallery image"}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingFileId(image.fileId ?? image.url);
    setError(null);

    try {
      await onDelete(image);
    } catch (deleteError) {
      setError(getToastErrorMessage(deleteError));
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!canReorder || !onReorder) {
      return;
    }

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortableIds.indexOf(String(active.id));
    const newIndex = sortableIds.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    setError(null);

    try {
      await onReorder(arrayMove(images, oldIndex, newIndex));
    } catch (reorderError) {
      setError(getToastErrorMessage(reorderError));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-[var(--admin-text)]">Gallery</h3>
          <p className="mt-1 text-xs text-[var(--admin-muted)]">
            {hasMissingFileId
              ? "Gallery reorder needs every image to include an ImageKit fileId."
              : "Drag gallery images by their handles to update display order."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isReordering ? (
            <Badge variant="cyan">
              <Loader2 className="mr-1 size-3 animate-spin" aria-hidden="true" />
              Saving order
            </Badge>
          ) : null}
          <Badge variant="neutral">{images.length} images</Badge>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {hasMissingFileId ? (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Reorder is disabled because one or more gallery images are missing fileId.
        </div>
      ) : null}

      {images.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            void handleDragEnd(event);
          }}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            <div className="grid gap-3 md:grid-cols-2">
              {images.map((image, index) => (
                <SortableGalleryImage
                  key={image.fileId ?? `${image.url}-${index}`}
                  image={image}
                  index={index}
                  canReorder={canReorder}
                  isReordering={isReordering || disabled}
                  isDeleting={deletingFileId === (image.fileId ?? image.url)}
                  onDelete={(selectedImage) => {
                    void handleDelete(selectedImage);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-8 text-center text-sm text-[var(--admin-muted)]">
          No gallery images added yet.
        </div>
      )}
    </div>
  );
}
