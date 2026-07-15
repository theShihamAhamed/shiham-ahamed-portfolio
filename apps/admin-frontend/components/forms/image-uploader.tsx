"use client";

import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage, type UploadFolder } from "@/lib/api/uploads";
import {
  formatFileSize,
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_MAX_SIZE_MB,
  validateImageFile,
} from "@/lib/image-upload";
import { getToastErrorMessage, showSuccessToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/image-asset";

type ImageUploaderProps = {
  folder: UploadFolder;
  label?: string;
  description?: string;
  existingImage?: ImageAsset;
  replaceModeLabel?: string;
  successMessage?: string;
  disabled?: boolean;
  uploadAction?: (input: {
    file: File;
    folder: UploadFolder;
    alt: string;
  }) => Promise<ImageAsset>;
  onUploaded: (image: ImageAsset) => void;
  onRemove?: () => void | Promise<void>;
  removeLabel?: string;
  confirmRemoveMessage?: string;
  onPendingChange?: (isPending: boolean) => void;
};

type UploadStatus = "idle" | "success" | "error";

export function ImageUploader({
  folder,
  label = "Image",
  description = "Upload a JPEG, PNG, or WebP image.",
  existingImage,
  replaceModeLabel = "Replace image",
  successMessage = "Image uploaded successfully.",
  disabled = false,
  uploadAction = uploadImage,
  onUploaded,
  onRemove,
  removeLabel = "Remove image",
  confirmRemoveMessage,
  onPendingChange,
}: ImageUploaderProps) {
  const id = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(existingImage?.alt ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const isPending = isUploading || isRemoving;

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    onPendingChange?.(isPending);

    return () => onPendingChange?.(false);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayImage = previewUrl ?? existingImage?.url;
  const buttonLabel = existingImage ? replaceModeLabel : "Upload image";
  const imageName = useMemo(
    () => file?.name ?? existingImage?.name,
    [existingImage?.name, file?.name],
  );

  const clearSelectedFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setSelectedFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      clearSelectedFile();
      return;
    }

    const validation = validateImageFile(selectedFile);

    if (!validation.valid) {
      setStatus("error");
      setMessage(validation.message);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setStatus("idle");
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setMessage("Choose an image before uploading.");
      return;
    }

    if (!alt.trim()) {
      setStatus("error");
      setMessage("Alt text is required.");
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsUploading(true);
    setStatus("idle");
    setMessage("Uploading image…");

    try {
      const image = await uploadAction({ file, folder, alt: alt.trim() });

      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      onUploaded(image);
      showSuccessToast(successMessage);
      clearSelectedFile();
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

  const handleRemove = async () => {
    if (file) {
      clearSelectedFile();
      return;
    }

    if (!existingImage || !onRemove) return;
    if (confirmRemoveMessage && !window.confirm(confirmRemoveMessage)) return;

    setIsRemoving(true);
    setStatus("idle");
    setMessage("Removing image…");

    try {
      await onRemove();
      if (!mountedRef.current) return;
      setAlt("");
      setStatus("success");
      setMessage("Image removed.");
    } catch (removeError) {
      if (!mountedRef.current) return;
      setStatus("error");
      setMessage(getToastErrorMessage(removeError));
    } finally {
      if (mountedRef.current) setIsRemoving(false);
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
            {description} Maximum {IMAGE_UPLOAD_MAX_SIZE_MB} MB.
          </p>
        </div>
        {imageName ? (
          <span className="max-w-full truncate text-xs text-[var(--admin-muted)] sm:max-w-64">
            {imageName}
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.75fr)_1fr]">
        <div className="relative grid aspect-video min-h-40 place-items-center overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={alt || existingImage?.alt || "Selected image preview"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="grid justify-items-center gap-2 text-center">
              <ImagePlus className="size-9" aria-hidden="true" />
              <span className="text-xs">Preview appears here</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Input
            ref={fileInputRef}
            id={`${id}-file`}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            disabled={disabled || isPending}
            className="sr-only"
            aria-label={`Choose ${label}`}
            aria-describedby={`${descriptionId} ${statusId}`}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            disabled={disabled || isPending}
            className={cn(
              "flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-5 py-6 text-center text-[var(--admin-muted)] transition-colors hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-55",
              isDragging && "border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]",
            )}
            aria-describedby={`${descriptionId} ${statusId}`}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!disabled && !isPending) setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (!disabled && !isPending) {
                setSelectedFile(event.dataTransfer.files[0] ?? null);
              }
            }}
          >
            <Upload className="size-7" aria-hidden="true" />
            <span className="text-sm font-semibold text-[var(--admin-text)]">
              {file ? "Choose a different image" : `Choose ${label.toLowerCase()}`}
            </span>
            <span className="text-xs">Click to browse or drag and drop</span>
            <span className="text-xs">JPEG, PNG, or WebP</span>
          </button>

          {file ? (
            <div className="flex flex-col gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-[var(--admin-muted)]">
                  {formatFileSize(file.size)} · {file.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={clearSelectedFile}
              >
                <X className="size-4" aria-hidden="true" />
                Clear selection
              </Button>
            </div>
          ) : null}

          <div>
            <label
              htmlFor={`${id}-alt`}
              className="text-sm font-medium text-[var(--admin-text)]"
            >
              Alt text <span className="text-red-700">*</span>
            </label>
            <Input
              id={`${id}-alt`}
              value={alt}
              disabled={disabled || isPending}
              placeholder="Describe the image for screen-reader users"
              className="mt-2"
              aria-invalid={status === "error" && !alt.trim() ? true : undefined}
              aria-describedby={statusId}
              onChange={(event) => setAlt(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              onClick={() => void handleUpload()}
              disabled={disabled || isPending || !file}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : existingImage ? (
                <RefreshCw className="size-4" aria-hidden="true" />
              ) : (
                <Upload className="size-4" aria-hidden="true" />
              )}
              {isUploading ? "Uploading…" : buttonLabel}
            </Button>
            {existingImage && onRemove && !file ? (
              <Button
                variant="danger"
                onClick={() => void handleRemove()}
                disabled={disabled || isPending}
              >
                {isRemoving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="size-4" aria-hidden="true" />
                )}
                {removeLabel}
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
      </div>
    </div>
  );
}
