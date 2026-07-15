import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { uploadRateLimiter } from "../../middleware/rate-limit.middleware";
import {
  uploadMultipleImages as uploadMultipleImagesMiddleware,
  uploadSingleImage as uploadSingleImageMiddleware,
} from "../../middleware/upload.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  deleteUploadedImage,
  uploadMultipleImages,
  uploadSingleImage,
} from "./uploads.controller";
import {
  deleteImageParamsSchema,
  multipleUploadBodySchema,
  singleUploadBodySchema,
} from "./uploads.validation";

const router = Router();

router.use(requireAuth, uploadRateLimiter);

router.post(
  "/image",
  uploadSingleImageMiddleware("file"),
  validate({ body: singleUploadBodySchema }),
  uploadSingleImage,
);

router.post(
  "/images",
  uploadMultipleImagesMiddleware("files"),
  validate({ body: multipleUploadBodySchema }),
  uploadMultipleImages,
);

router.delete(
  "/image/:fileId",
  validate({ params: deleteImageParamsSchema }),
  deleteUploadedImage,
);

export default router;
