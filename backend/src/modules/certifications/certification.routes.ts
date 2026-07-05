import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { uploadSingleImage as uploadSingleImageMiddleware } from "../../middleware/upload.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAdminCertification,
  deleteAdminCertification,
  getAdminCertification,
  listAdminCertifications,
  listVisibleCertifications,
  reorderAdminCertifications,
  replaceAdminCertificationImage,
  updateAdminCertification,
  updateCertificationVisibility,
} from "./certification.controller";
import {
  adminCertificationQuerySchema,
  certificationIdParamSchema,
  certificationImageUploadBodySchema,
  certificationReorderSchema,
  createCertificationSchema,
  toggleCertificationVisibilitySchema,
  updateCertificationSchema,
} from "./certification.validation";

const router = Router();

router.get("/visible", listVisibleCertifications);

router.use(requireAuth);

router.patch(
  "/reorder",
  validate({ body: certificationReorderSchema }),
  reorderAdminCertifications,
);

router.get(
  "/",
  validate({ query: adminCertificationQuerySchema }),
  listAdminCertifications,
);

router.post(
  "/",
  validate({ body: createCertificationSchema }),
  createAdminCertification,
);

router.patch(
  "/:id/image",
  validate({ params: certificationIdParamSchema }),
  uploadSingleImageMiddleware("file"),
  validate({ body: certificationImageUploadBodySchema }),
  replaceAdminCertificationImage,
);

router.patch(
  "/:id/visibility",
  validate({
    params: certificationIdParamSchema,
    body: toggleCertificationVisibilitySchema,
  }),
  updateCertificationVisibility,
);

router.get(
  "/:id",
  validate({ params: certificationIdParamSchema }),
  getAdminCertification,
);

router.patch(
  "/:id",
  validate({
    params: certificationIdParamSchema,
    body: updateCertificationSchema,
  }),
  updateAdminCertification,
);

router.delete(
  "/:id",
  validate({ params: certificationIdParamSchema }),
  deleteAdminCertification,
);

export default router;
