import { Router } from "express";

import { isDatabaseReady } from "../db/connect";
import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, {
    status: "ok" as const,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", (_req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({
      success: false,
      error: {
        code: "NOT_READY",
        message: "Required services are not ready.",
      },
    });
  }

  return sendSuccess(res, {
    status: "ready" as const,
    timestamp: new Date().toISOString(),
  });
});

export default router;
