import type { CorsOptions } from "cors";

import { env } from "./env";
import { parseOriginList } from "./origins";

export const allowedOrigins = env.ADMIN_FRONTEND_ORIGIN_LIST;

const VERCEL_PREVIEW_HOST_SUFFIX = ".vercel.app";

export const isVercelPreviewOrigin = (origin: string): boolean => {
  try {
    const parsed = new URL(origin);

    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.port &&
      parsed.pathname === "/" &&
      !parsed.search &&
      !parsed.hash &&
      parsed.origin === origin &&
      parsed.hostname !== "vercel.app" &&
      parsed.hostname.endsWith(VERCEL_PREVIEW_HOST_SUFFIX)
    );
  } catch {
    return false;
  }
};

type CorsPolicy = {
  origins?: readonly string[];
  allowVercelPreviewOrigins?: boolean;
};

export const createCorsOptions = ({
  origins = allowedOrigins,
  allowVercelPreviewOrigins = env.ALLOW_VERCEL_PREVIEW_ORIGINS,
}: CorsPolicy = {}): CorsOptions => ({
  origin(origin, callback) {
    if (
      !origin ||
      origins.includes(origin) ||
      (allowVercelPreviewOrigins && isVercelPreviewOrigin(origin))
    ) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin denied"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
});

export { parseOriginList };
export const corsOptions = createCorsOptions();
