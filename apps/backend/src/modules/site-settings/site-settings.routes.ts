import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  getAdminSiteSettings,
  patchAdminSiteSettings,
} from "./site-settings.controller";
import { updateSiteSettingsSchema } from "./site-settings.validation";

const router = Router();

router.use(requireAuth);

router.get("/", getAdminSiteSettings);
router.patch("/", validate({ body: updateSiteSettingsSchema }), patchAdminSiteSettings);

export default router;
