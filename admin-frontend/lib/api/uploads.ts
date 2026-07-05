import { requestApi } from "@/lib/api/client";
import type { ImageAsset } from "@/types/image-asset";

export type UploadFolder =
  | "projects-thumbnails"
  | "projects-gallery"
  | "projects-architecture"
  | "certifications";

type UploadImageInput = {
  file: File;
  folder: UploadFolder;
  alt: string;
};

type UploadImagesInput = {
  files: File[];
  folder: UploadFolder;
  alt: string | string[];
};

type UploadImageResponse = {
  image: ImageAsset;
};

type UploadImagesResponse = {
  images: ImageAsset[];
};

export const uploadImage = async ({
  file,
  folder,
  alt,
}: UploadImageInput): Promise<ImageAsset> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("alt", alt);

  const response = await requestApi<UploadImageResponse>("/api/uploads/image", {
    method: "POST",
    body: formData,
  });

  return response.data.image;
};

export const uploadImages = async ({
  files,
  folder,
  alt,
}: UploadImagesInput): Promise<ImageAsset[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  formData.append("folder", folder);
  formData.append("alt", Array.isArray(alt) ? JSON.stringify(alt) : alt);

  const response = await requestApi<UploadImagesResponse>("/api/uploads/images", {
    method: "POST",
    body: formData,
  });

  return response.data.images;
};

export const deleteUploadedImage = async (fileId: string): Promise<void> => {
  await requestApi<{ deleted: boolean; fileId: string }>(
    `/api/uploads/image/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
    },
  );
};
