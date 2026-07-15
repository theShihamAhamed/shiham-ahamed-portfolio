import type { ImageAsset } from "../../types/image-asset";

export const uploadFolderMap = {
  "projects-thumbnails": "/portfolio/projects/thumbnails",
  "projects-gallery": "/portfolio/projects/gallery",
  "projects-architecture": "/portfolio/projects/architecture",
  certifications: "/portfolio/certifications",
} as const;

export type UploadFolderKey = keyof typeof uploadFolderMap;

export type UploadImageInput = {
  file: Express.Multer.File;
  folder: UploadFolderKey;
  alt: string;
};

export type UploadImagesInput = {
  files: Express.Multer.File[];
  folder: UploadFolderKey;
  alt: string;
};

export type UploadedImageAsset = ImageAsset;
