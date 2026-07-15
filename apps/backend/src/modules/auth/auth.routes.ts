import { Router } from "express";

import { requireAuth } from "../../middleware/auth.middleware";
import {
  loginRateLimiter,
  refreshRateLimiter,
} from "../../middleware/rate-limit.middleware";
import { validate } from "../../middleware/validate.middleware";
import { login, logout, me, refresh } from "./auth.controller";
import { loginSchema, refreshTokenBodySchema } from "./auth.validation";

const router = Router();

router.post("/login", loginRateLimiter, validate({ body: loginSchema }), login);
router.post("/refresh", refreshRateLimiter, validate({ body: refreshTokenBodySchema }), refresh);
router.post("/logout", refreshRateLimiter, validate({ body: refreshTokenBodySchema }), logout);
router.get("/me", requireAuth, me);

export default router;
