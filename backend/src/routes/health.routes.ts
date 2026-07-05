import { Router } from "express";

import { sendSuccess } from "../utils/response";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, {
    status: "ok" as const,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
