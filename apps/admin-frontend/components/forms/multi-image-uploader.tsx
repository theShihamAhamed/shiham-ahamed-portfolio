"use client";

import { CheckCircle2, Images, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImages, type UploadFolder } from "@/lib/api/uploads";
import {
  formatFileSize,
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_MAX_FILES,
  IMAGE_UPLOAD_MAX_SIZE_MB,
  removeItemAt,
  replaceItemAt,
  validateImageFiles,
} from "@/lib/image-upload";
import { getToastErrorMessage, showSuccessToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/image-asset";

type MultiImageUploaderProps = {
  folder: UploadFolder;
  label?: string;
  description?: string;
  successMessage?: string;
  disabled?: boolean;
  uploadAction?: (input: {
    files: File[];
    folder: UploadFolder;
    alt: string | string[];
  }) => Promise<ImageAsset[]>;
  onUploaded: (images: ImageAsset[]) => void;
  onPendingChange?: (isPending: boolean) => void;
};

type PreviewImage = { file: File; url: string };
type UploadStatus = "idle" | "success" | "error";

export function MultiImageUploader({
  folder,
  label = "Gallery images",
  description = "Add images in the order they should initially appear.",
  successMessage = "Images uploaded successfully.",
  disabled = false,
  uploadAction = uploadImages,
  onUploaded,
  onPendingChange,
}: MultiImageUploaderProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const previewsRef = useRef<PreviewImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [baseAlt, setBaseAlt] = useState("");
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    onPendingChange?.(isUploading);
    return () => onPendingChange?.(false);
  }, [isUploading, onPendingChange]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () =>
      previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, []);

  const clearSelection = () => {
    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    setFiles([]);
    setAltTexts([]);
    setPreviews([]);
    setStatus("idle");
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const setSelectedFiles = (selectedFiles: File[]) => {
    const validation = validateImageFiles(selectedFiles);

    if (!validation.valid) {
      setStatus("error");
      setMessage(validation.message);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    previewsRef.current.forEach((preview) => URL.revokeObjectURL(preview.url));
    setFiles(selectedFiles);
    setAltTexts(selectedFiles.map(() => ""));
    setPreviews(
      selectedFiles.map((selectedFile) => ({
        file: selectedFile,
        url: URL.createObjectURL(selectedFile),
      })),
    );
    setStatus("idle");
    setMessage(null);
  };

  const removeSelectedFile = (index: number) => {
    const removedPreview = previewsRef.current[index];
    if (removedPreview) URL.revokeObjectURL(removedPreview.url);
    setFiles((current) => removeItemAt(current, index));
    setAltTexts((current) => removeItemAt(current, index));
    setPreviews((current) => removeItemAt(current, index));
  };

  const resolveAltInput = () => {
    const trimmedAltTexts = altTexts.map((item) => item.trim());
    return trimmedAltTexts.length === files.length && trimmedAltTexts.every(Boolean)
      ? trimmedAltTexts
      : baseAlt.trim();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setStatus("error");
      setMessage("Choose at least one image before uploading.");
      return;
    }

    const alt = resolveAltInput();

    if ((Array.isArray(alt) && alt.length === 0) || (!Array.isArray(alt) && !alt)) {
      setStatus("error");
      setMessage("Add base alt text or describe every selected image.");
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsUploading(true);
    setStatus("idle");
    setMessage(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);

    try {
      const images = await uploadAction({ files, folder, alt });
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      onUploaded(images);
      showSuccessToast(successMessage);
      clearSelection();
      setBaseAlt("");
      setStatus("success");
      setMessage(successMessage);
    } catch (uploadError) {
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setStatus("error");
      setMessage(getToastErrorMessage(uploadError));
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setIsUploading(false);
      }
    }
  };

  const descriptionId = `${id}-description`;
  const statusId = `${id}-status`;

  return (
    <div className="space-y-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4 sm:p-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">{label}</h3>
          <p id={descriptionId} className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">
            {description} JPEG, PNG, or WebP; maximum {IMAGE_UPLOAD_MAX_SIZE_MB} MB each and {IMAGE_UPLOAD_MAX_FILES} files per upload.
          </p>
        </div>
        <span className="text-xs text-[var(--admin-muted)]">
          {files.length} selected
        </span>
      </div>

      <Input
        ref={inputRef}
        id={`${id}-files`}
        type="file"
        multiple
        accept={IMAGE_UPLOAD_ACCEPT}
        disabled={disabled || isUploading}
        className="sr-only"
        aria-label={`Choose ${label}`}
        aria-describedby={`${descriptionId} ${statusId}`}
        onChange={(event) =>
          setSelectedFiles(Array.from(event.target.files ?? []))
        }
      />
      <button
        type="button"
        disabled={disabled || isUploading}
        className={cn(
          "flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-7 text-center text-[var(--admin-muted)] transition-colors hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-55",
          isDragging && "border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]",
        )}
        aria-describedby={`${descriptionId} ${statusId}`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled && !isUploading) {
            setSelectedFiles(Array.from(event.dataTransfer.files));
          }
        }}
      >
        <Images className="size-8" aria-hidden="true" />
        <span className="text-sm font-semibold text-[var(--admin-text)]">
          Choose gallery images
        </span>
        <span className="text-xs">Click to browse or drag and drop</span>
      </button>

      <div>
        <label
          htmlFor={`${id}-base-alt`}
          className="text-sm font-medium text-[var(--admin-text)]"
        >
          Shared alt text
        </label>
        <Input
          id={`${id}-base-alt`}
          value={baseAlt}
          disabled={disabled || isUploading}
          placeholder="Fallback description for selected gallery images"
          className="mt-2"
          aria-describedby={`${id}-base-alt-help`}
          onChange={(event) => setBaseAlt(event.target.value)}
        />
        <p id={`${id}-base-alt-help`} className="mt-1 text-xs text-[var(--admin-muted)]">
          Used only when one or more per-image descriptions are empty.
        </p>
      </div>

      {previews.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${preview.file.lastModified}-${index}`}
              className="min-w-0 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3"
            >
              <div className="relative grid aspect-video place-items-center overflow-hidden rounded-lg bg-[var(--admin-surface-muted)] text-[var(--admin-muted)]">
                <Image
                  src={preview.url}
                  alt={altTexts[index] || baseAlt || "Selected image preview"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--admin-text)]">
                    {preview.file.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--admin-muted)]">
                    {formatFileSize(preview.file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  disabled={isUploading}
                  aria-label={`Remove selected image ${index + 1}`}
                  onClick={() => removeSelectedFile(index)}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <label
                htmlFor={`${id}-alt-${index}`}
                className="mt-3 block text-xs font-medium text-[var(--admin-text)]"
              >
                Image {index + 1} alt text
              </label>
              <Input
                id={`${id}-alt-${index}`}
                value={altTexts[index] ?? ""}
                placeholder="Describe this image"
                className="mt-1.5"
                disabled={isUploading}
                onChange={(event) =>
                  setAltTexts((current) =>
                    replaceItemAt(current, index, event.target.value),
                  )
                }
              />
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          onClick={() => void handleUpload()}
          disabled={disabled || isUploading || files.length === 0}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="size-4" aria-hidden="true" />
          )}
          {isUploading ? "Uploading…" : "Upload selected images"}
        </Button>
        {files.length > 0 ? (
          <Button
            variant="secondary"
            onClick={clearSelection}
            disabled={isUploading}
          >
            <X className="size-4" aria-hidden="true" />
            Clear selection
          </Button>
        ) : null}
      </div>

      <div
        id={statusId}
        role={status === "error" ? "alert" : "status"}
        aria-live="polite"
        className={cn(
          "min-h-5 text-sm",
          status === "error" && "text-red-700",
          status === "success" && "text-emerald-700",
          status === "idle" && "text-[var(--admin-muted)]",
        )}
      >
        {status === "success" ? (
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {message}
          </span>
        ) : (
          message
        )}
      </div>
    </div>
  );
}
