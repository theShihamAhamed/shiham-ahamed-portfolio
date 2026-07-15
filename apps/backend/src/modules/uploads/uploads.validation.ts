import { z } from "zod";

import { uploadFolderMap } from "./uploads.types";

export const uploadFolderSchema = z.enum(
  Object.keys(uploadFolderMap) as [
    keyof typeof uploadFolderMap,
    ...(keyof typeof uploadFolderMap)[],
  ],
);

export const singleUploadBodySchema = z.object({
  folder: uploadFolderSchema,
  alt: z.string().trim().min(1, "Alt text is required"),
});

export const multipleUploadBodySchema = z.object({
  folder: uploadFolderSchema,
  alt: z.string().trim().min(1, "Alt text is required"),
});

export const deleteImageParamsSchema = z.object({
  fileId: z
    .string()
    .trim()
    .min(1, "fileId is required")
    .max(256, "fileId is too long")
    .regex(/^[A-Za-z0-9_-]+$/, "fileId contains invalid characters"),
});
