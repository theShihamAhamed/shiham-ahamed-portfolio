"use client";

import { ImagePlus, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImage, type UploadFolder } from "@/lib/api/uploads";
import { getToastErrorMessage, showSuccessToast } from "@/lib/toast";
import type { ImageAsset } from "@/types/image-asset";

type ImageUploaderProps = {
  folder: UploadFolder;
  label?: string;
  existingImage?: ImageAsset;
  replaceModeLabel?: string;
  successMessage?: string;
  uploadAction?: (input: {
    file: File;
    folder: UploadFolder;
    alt: string;
  }) => Promise<ImageAsset>;
  onUploaded: (image: ImageAsset) => void;
};

export function ImageUploader({
  folder,
  label = "Image",
  existingImage,
  replaceModeLabel = "Replace image",
  successMessage = "Image uploaded successfully.",
  uploadAction = uploadImage,
  onUploaded,
}: ImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState(existingImage?.alt ?? "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayImage = previewUrl ?? existingImage?.url;
  const buttonLabel = existingImage ? replaceModeLabel : "Upload image";
  const imageName = useMemo(() => file?.name ?? existingImage?.name, [existingImage, file]);

  const setSelectedFile = (selectedFile: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setFile(selectedFile);
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Choose an image before uploading.");
      return;
    }

    if (!alt.trim()) {
      setError("Alt text is required.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const image = await uploadAction({ file, folder, alt: alt.trim() });
      onUploaded(image);
      showSuccessToast(successMessage);
      setSelectedFile(null);
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
        {imageName ? (
          <span className="text-xs text-[var(--admin-muted)]">{imageName}</span>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-[180px_1fr]">
        <div className="relative grid aspect-video place-items-center overflow-hidden rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)]">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={alt || existingImage?.alt || "Selected image preview"}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImagePlus className="size-8" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-3">
          <Input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <Input
            value={alt}
            placeholder="Alt text"
            onChange={(event) => setAlt(event.target.value)}
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="size-4" aria-hidden="true" />
            )}
            {isUploading ? "Uploading" : buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
