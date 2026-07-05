"use client";

import { Images, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImages, type UploadFolder } from "@/lib/api/uploads";
import { getToastErrorMessage, showSuccessToast } from "@/lib/toast";
import type { ImageAsset } from "@/types/image-asset";

type MultiImageUploaderProps = {
  folder: UploadFolder;
  label?: string;
  successMessage?: string;
  uploadAction?: (input: {
    files: File[];
    folder: UploadFolder;
    alt: string | string[];
  }) => Promise<ImageAsset[]>;
  onUploaded: (images: ImageAsset[]) => void;
};

type PreviewImage = {
  file: File;
  url: string;
};

export function MultiImageUploader({
  folder,
  label = "Gallery images",
  successMessage = "Images uploaded successfully.",
  uploadAction = uploadImages,
  onUploaded,
}: MultiImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [baseAlt, setBaseAlt] = useState("");
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  const setSelectedFiles = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setAltTexts((currentAltTexts) =>
      selectedFiles.map((_, index) => currentAltTexts[index] ?? ""),
    );
    setPreviews((currentPreviews) => {
      currentPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));

      return selectedFiles.map((selectedFile) => ({
        file: selectedFile,
        url: URL.createObjectURL(selectedFile),
      }));
    });
  };

  const updateAltText = (index: number, value: string) => {
    setAltTexts(
      altTexts.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const resolveAltInput = () => {
    const trimmedAltTexts = altTexts.map((item) => item.trim());
    const hasEveryAlt = trimmedAltTexts.length === files.length &&
      trimmedAltTexts.every(Boolean);

    if (hasEveryAlt) {
      return trimmedAltTexts;
    }

    return baseAlt.trim();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Choose at least one image before uploading.");
      return;
    }

    const alt = resolveAltInput();

    if ((Array.isArray(alt) && alt.length === 0) || (!Array.isArray(alt) && !alt)) {
      setError("Base alt text or per-image alt text is required.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const images = await uploadAction({ files, folder, alt });
      onUploaded(images);
      showSuccessToast(successMessage);
      setSelectedFiles([]);
      setBaseAlt("");
    } catch (uploadError) {
      setError(getToastErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-[var(--admin-text)]">{label}</label>
        <span className="text-xs text-[var(--admin-muted)]">
          {files.length} selected
        </span>
      </div>

      <Input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
      />
      <Input
        value={baseAlt}
        placeholder="Base alt text"
        onChange={(event) => setBaseAlt(event.target.value)}
      />

      {previews.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {previews.map((preview, index) => (
            <div
              key={`${preview.file.name}-${index}`}
              className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] p-3"
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
              <p className="mt-2 truncate text-xs text-[var(--admin-muted)]">
                {preview.file.name}
              </p>
              <Input
                value={altTexts[index] ?? ""}
                placeholder={`Alt text ${index + 1}`}
                className="mt-2"
                onChange={(event) => updateAltText(index, event.target.value)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-32 place-items-center rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          <Images className="size-8" aria-hidden="true" />
        </div>
      )}

      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Upload className="size-4" aria-hidden="true" />
        )}
        {isUploading ? "Uploading" : "Upload images"}
      </Button>
    </div>
  );
}
