import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { corsOptions } from "./config/cors";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
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

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/currently-building", currentlyBuildingRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/site-settings", siteSettingsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
