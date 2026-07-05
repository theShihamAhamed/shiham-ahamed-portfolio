import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import {
  uploadMultipleImages as uploadMultipleImagesMiddleware,
  uploadSingleImage as uploadSingleImageMiddleware,
} from "../../middleware/upload.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  addGalleryImages,
  createAdminProject,
  deleteAdminProject,
  deleteArchitectureImage,
  deleteGalleryImage,
  getAdminProject,
  getProjectBySlug,
  listAdminProjects,
  listFeaturedProjects,
  listVisibleProjects,
  reorderAdminProjects,
  reorderGalleryImages,
  replaceArchitectureImage,
  replaceThumbnail,
  updateAdminProject,
  updateProjectFeatured,
  updateProjectVisibility,
} from "./project.controller";
import {
  adminProjectQuerySchema,
  architectureUploadBodySchema,
  createProjectSchema,
  galleryImageParamSchema,
  galleryReorderSchema,
  galleryUploadBodySchema,
  projectIdParamSchema,
  projectReorderSchema,
  projectSlugParamSchema,
  thumbnailUploadBodySchema,
  toggleFeaturedSchema,
  toggleVisibilitySchema,
  updateProjectSchema,
} from "./project.validation";

const router = Router();

router.get("/visible", listVisibleProjects);
router.get("/featured", listFeaturedProjects);
router.get("/slug/:slug", validate({ params: projectSlugParamSchema }), getProjectBySlug);

router.use(requireAuth);

router.patch(
  "/reorder",
  validate({ body: projectReorderSchema }),
  reorderAdminProjects,
);

router.get("/", validate({ query: adminProjectQuerySchema }), listAdminProjects);
router.post("/", validate({ body: createProjectSchema }), createAdminProject);

router.patch(
  "/:id/thumbnail",
  validate({ params: projectIdParamSchema }),
  uploadSingleImageMiddleware("file"),
  validate({ body: thumbnailUploadBodySchema }),
  replaceThumbnail,
);

router.patch(
  "/:id/architecture-image",
  validate({ params: projectIdParamSchema }),
  uploadSingleImageMiddleware("file"),
  validate({ body: architectureUploadBodySchema }),
  replaceArchitectureImage,
);

router.delete(
  "/:id/architecture-image",
  validate({ params: projectIdParamSchema }),
  deleteArchitectureImage,
);

router.post(
  "/:id/gallery",
  validate({ params: projectIdParamSchema }),
  uploadMultipleImagesMiddleware("files"),
  validate({ body: galleryUploadBodySchema }),
  addGalleryImages,
);

router.patch(
  "/:id/gallery/reorder",
  validate({ params: projectIdParamSchema, body: galleryReorderSchema }),
  reorderGalleryImages,
);

router.delete(
  "/:id/gallery/:imageFileId",
  validate({ params: galleryImageParamSchema }),
  deleteGalleryImage,
);

router.patch(
  "/:id/featured",
  validate({ params: projectIdParamSchema, body: toggleFeaturedSchema }),
  updateProjectFeatured,
);

router.patch(
  "/:id/visibility",
  validate({ params: projectIdParamSchema, body: toggleVisibilitySchema }),
  updateProjectVisibility,
);

router.get("/:id", validate({ params: projectIdParamSchema }), getAdminProject);
router.patch(
  "/:id",
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  updateAdminProject,
);
router.delete("/:id", validate({ params: projectIdParamSchema }), deleteAdminProject);

export default router;
