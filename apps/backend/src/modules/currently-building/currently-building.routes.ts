import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAdminCurrentlyBuildingItem,
  deleteAdminCurrentlyBuildingItem,
  getAdminCurrentlyBuildingItem,
  listAdminCurrentlyBuildingItems,
  listVisibleCurrentlyBuildingItems,
  reorderAdminCurrentlyBuildingItems,
  updateAdminCurrentlyBuildingItem,
  updateCurrentlyBuildingVisibility,
} from "./currently-building.controller";
import {
  adminCurrentlyBuildingQuerySchema,
  createCurrentlyBuildingSchema,
  currentlyBuildingIdParamSchema,
  currentlyBuildingReorderSchema,
  toggleCurrentlyBuildingVisibilitySchema,
  updateCurrentlyBuildingSchema,
} from "./currently-building.validation";

const router = Router();

router.get("/visible", listVisibleCurrentlyBuildingItems);

router.use(requireAuth);

router.patch(
  "/reorder",
  validate({ body: currentlyBuildingReorderSchema }),
  reorderAdminCurrentlyBuildingItems,
);

router.get(
  "/",
  validate({ query: adminCurrentlyBuildingQuerySchema }),
  listAdminCurrentlyBuildingItems,
);

router.post(
  "/",
  validate({ body: createCurrentlyBuildingSchema }),
  createAdminCurrentlyBuildingItem,
);

router.patch(
  "/:id/visibility",
  validate({
    params: currentlyBuildingIdParamSchema,
    body: toggleCurrentlyBuildingVisibilitySchema,
  }),
  updateCurrentlyBuildingVisibility,
);

router.get(
  "/:id",
  validate({ params: currentlyBuildingIdParamSchema }),
  getAdminCurrentlyBuildingItem,
);

router.patch(
  "/:id",
  validate({
    params: currentlyBuildingIdParamSchema,
    body: updateCurrentlyBuildingSchema,
  }),
  updateAdminCurrentlyBuildingItem,
);

router.delete(
  "/:id",
  validate({ params: currentlyBuildingIdParamSchema }),
  deleteAdminCurrentlyBuildingItem,
);

export default router;
