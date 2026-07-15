import { randomUUID } from "node:crypto";
import path from "node:path";

import { toFile } from "@imagekit/nodejs";
import { APIError } from "@imagekit/nodejs";
import { imageSize } from "image-size";

import { imagekit } from "../../config/imagekit";
import type { ImageAsset } from "../../types/image-asset";
import { AppError } from "../../utils/app-error";
import {
  uploadFolderMap,
  type UploadFolderKey,
  type UploadImageInput,
  type UploadImagesInput,
} from "./uploads.types";

type ImageKitUploadResponse = Awaited<ReturnType<typeof imagekit.files.upload>>;
type CompleteImageKitUploadResponse = ImageKitUploadResponse & {
  url: string;
  fileId: string;
};

const sanitizeFileName = (fileName: string): string => {
  const parsed = path.parse(fileName);
  const safeBase = parsed.name
    .trim()
    .replace(/[^A-Za-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  const safeExtension = parsed.ext.toLowerCase();

  return `${safeBase || "image"}-${randomUUID()}${safeExtension}`;
};

const requireUploadResponse = (
  response: ImageKitUploadResponse,
): CompleteImageKitUploadResponse => {
  if (!response.url || !response.fileId) {
    throw new AppError(
      "ImageKit upload response was missing required asset data",
      502,
      "IMAGEKIT_UPLOAD_INVALID_RESPONSE",
    );
  }

  return response as CompleteImageKitUploadResponse;
};

const toImageAsset = (
  response: ImageKitUploadResponse,
  alt: string,
  fallbackName: string,
  localDimensions?: { width?: number; height?: number },
): ImageAsset => {
  const uploaded = requireUploadResponse(response);

  return {
    url: uploaded.url,
    fileId: uploaded.fileId,
    alt,
    ...(uploaded.width || localDimensions?.width
      ? { width: uploaded.width ?? localDimensions?.width }
      : {}),
    ...(uploaded.height || localDimensions?.height
      ? { height: uploaded.height ?? localDimensions?.height }
      : {}),
    ...(uploaded.name || fallbackName
      ? { name: uploaded.name ?? fallbackName }
      : {}),
  };
};

const getLocalDimensions = (
  file: Express.Multer.File,
): { width?: number; height?: number } => {
  const dimensions = imageSize(file.buffer);

  return {
    width: dimensions.width,
    height: dimensions.height,
  };
};

const normalizeImageKitError = (error: unknown, action: "upload" | "delete") => {
  if (error instanceof APIError) {
    const statusCode =
      typeof error.status === "number" && error.status >= 400
        ? error.status
        : 502;

    return new AppError(
      `ImageKit ${action} failed`,
      statusCode,
      action === "upload" ? "IMAGEKIT_UPLOAD_FAILED" : "IMAGEKIT_DELETE_FAILED",
    );
  }

  if (error instanceof AppError) {
    return error;
  }

  return new AppError(
    `ImageKit ${action} failed`,
    502,
    action === "upload" ? "IMAGEKIT_UPLOAD_FAILED" : "IMAGEKIT_DELETE_FAILED",
  );
};

export const getUploadFolderPath = (folder: UploadFolderKey): string => {
  return uploadFolderMap[folder];
};

export const uploadImage = async ({
  file,
  folder,
  alt,
}: UploadImageInput): Promise<ImageAsset> => {
  const fileName = sanitizeFileName(file.originalname);
  const dimensions = getLocalDimensions(file);

  try {
    const response = await imagekit.files.upload({
      file: await toFile(file.buffer, fileName, { type: file.mimetype }),
      fileName,
      folder: getUploadFolderPath(folder),
      useUniqueFileName: true,
    });

    return toImageAsset(response, alt, file.originalname, dimensions);
  } catch (error) {
    throw normalizeImageKitError(error, "upload");
  }
};

const parseAltTextList = (rawAlt: string, count: number): string[] => {
  const trimmedAlt = rawAlt.trim();

  if (trimmedAlt.startsWith("[")) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(trimmedAlt);
    } catch {
      throw new AppError(
        "Alt text array must be valid JSON",
        422,
        "INVALID_ALT_TEXT_ARRAY",
      );
    }

    if (
      !Array.isArray(parsed) ||
      parsed.length !== count ||
      parsed.some((item) => typeof item !== "string" || item.trim().length === 0)
    ) {
      throw new AppError(
        "Alt text array must contain one non-empty string per uploaded image",
        422,
        "INVALID_ALT_TEXT_ARRAY",
      );
    }

    return parsed.map((item) => item.trim());
  }

  if (count === 1) {
    return [trimmedAlt];
  }

  return Array.from({ length: count }, (_item, index) => `${trimmedAlt} ${index + 1}`);
};

export const uploadImages = async ({
  files,
  folder,
  alt,
}: UploadImagesInput): Promise<ImageAsset[]> => {
  const altTextList = parseAltTextList(alt, files.length);

  return Promise.all(
    files.map((file, index) =>
      uploadImage({
        file,
        folder,
        alt: altTextList[index],
      }),
    ),
  );
};

export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await imagekit.files.delete(fileId);
  } catch (error) {
    throw normalizeImageKitError(error, "delete");
  }
};
