import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createAdminAchievement,
  deleteAdminAchievement,
  getAdminAchievement,
  listAdminAchievements,
  listVisibleAchievements,
  reorderAdminAchievements,
  updateAdminAchievement,
  updateAchievementVisibility,
} from "./achievement.controller";
import {
  achievementIdParamSchema,
  achievementReorderSchema,
  adminAchievementQuerySchema,
  createAchievementSchema,
  toggleAchievementVisibilitySchema,
  updateAchievementSchema,
} from "./achievement.validation";

const router = Router();

router.get("/visible", listVisibleAchievements);

router.use(requireAuth);

router.patch(
  "/reorder",
  validate({ body: achievementReorderSchema }),
  reorderAdminAchievements,
);

router.get(
  "/",
  validate({ query: adminAchievementQuerySchema }),
  listAdminAchievements,
);

router.post(
  "/",
  validate({ body: createAchievementSchema }),
  createAdminAchievement,
);

router.patch(
  "/:id/visibility",
  validate({
    params: achievementIdParamSchema,
    body: toggleAchievementVisibilitySchema,
  }),
  updateAchievementVisibility,
);

router.get(
  "/:id",
  validate({ params: achievementIdParamSchema }),
  getAdminAchievement,
);

router.patch(
  "/:id",
  validate({
    params: achievementIdParamSchema,
    body: updateAchievementSchema,
  }),
  updateAdminAchievement,
);

router.delete(
  "/:id",
  validate({ params: achievementIdParamSchema }),
  deleteAdminAchievement,
);

export default router;
