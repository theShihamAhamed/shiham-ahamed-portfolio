import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { corsOptions } from "./config/cors";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import { adminApiRateLimiter } from "./middleware/rate-limit.middleware";
import achievementRoutes from "./modules/achievements/achievement.routes";
import authRoutes from "./modules/auth/auth.routes";
import certificationRoutes from "./modules/certifications/certification.routes";
import currentlyBuildingRoutes from "./modules/currently-building/currently-building.routes";
import projectRoutes from "./modules/projects/project.routes";
import siteSettingsRoutes from "./modules/site-settings/site-settings.routes";
import uploadRoutes from "./modules/uploads/uploads.routes";
import healthRoutes from "./routes/health.routes";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));
app.use(cookieParser());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", adminApiRateLimiter, uploadRoutes);
app.use("/api/projects", adminApiRateLimiter, projectRoutes);
app.use("/api/currently-building", adminApiRateLimiter, currentlyBuildingRoutes);
app.use("/api/certifications", adminApiRateLimiter, certificationRoutes);
app.use("/api/achievements", adminApiRateLimiter, achievementRoutes);
app.use("/api/site-settings", adminApiRateLimiter, siteSettingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
