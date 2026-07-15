import type { RequestHandler } from "express";
import multer from "multer";

import { env } from "../config/env";
import { AppError } from "../utils/app-error";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSizeBytes = Math.floor(env.MAX_UPLOAD_SIZE_MB * 1024 * 1024);

const multerUploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
  },
  fileFilter(_req, file, callback) {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError(
          "Only JPEG, PNG, and WebP image uploads are allowed",
          415,
          "UNSUPPORTED_FILE_TYPE",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

const handleMulterMiddleware =
  (middleware: RequestHandler): RequestHandler =>
  (req, res, next) => {
    middleware(req, res, (error: unknown) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof AppError) {
        next(error);
        return;
      }

      if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
          next(
            new AppError(
              `Image upload cannot exceed ${env.MAX_UPLOAD_SIZE_MB}MB`,
              413,
              "FILE_TOO_LARGE",
            ),
          );
          return;
        }

        next(new AppError(error.message, 400, error.code));
        return;
      }

      next(error);
    });
  };

export const uploadSingleImage = (fieldName = "file"): RequestHandler => {
  return handleMulterMiddleware(multerUploader.single(fieldName));
};

export const uploadMultipleImages = (
  fieldName = "files",
  maxCount = 20,
): RequestHandler => {
  return handleMulterMiddleware(multerUploader.array(fieldName, maxCount));
};
