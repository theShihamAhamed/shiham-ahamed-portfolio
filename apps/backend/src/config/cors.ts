import type { CorsOptions } from "cors";

import { env } from "./env";
import { parseOriginList } from "./origins";

export const allowedOrigins = env.ADMIN_FRONTEND_ORIGIN_LIST;

export const createCorsOptions = (origins: string[] = allowedOrigins): CorsOptions => ({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) {
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
