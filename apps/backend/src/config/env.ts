import dotenv from "dotenv";
import { z } from "zod";

import { parseOriginList } from "./origins";

dotenv.config();

const optionalEnvString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const booleanEnv = z.preprocess((value) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;
  return value;
}, z.boolean());

const urlEnv = (message: string) =>
  z.string().trim().url(message).refine((value) => {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  }, "URL must use http or https");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(5000),
  MONGO_URI: z.string().trim().min(1, "MONGO_URI is required"),
  ADMIN_FRONTEND_ORIGINS: z.string().trim().min(1, "ADMIN_FRONTEND_ORIGINS is required"),
  PUBLIC_FRONTEND_URL: urlEnv("PUBLIC_FRONTEND_URL must be a valid URL").default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().trim().email("ADMIN_EMAIL must be a valid email address"),
  ADMIN_PASSWORD_HASH: z.string().trim().min(1, "ADMIN_PASSWORD_HASH is required"),
  JWT_ACCESS_SECRET: z.string().trim().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().trim().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().trim().min(1).default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().trim().min(1).default("7d"),
  IMAGEKIT_PUBLIC_KEY: z.string().trim().min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z.string().trim().min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: urlEnv("IMAGEKIT_URL_ENDPOINT must be a valid URL"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().min(1).max(25).default(8),
  FRONTEND_REVALIDATE_URL: optionalEnvString,
  FRONTEND_REVALIDATE_SECRET: optionalEnvString,
  AUTH_COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  AUTH_COOKIE_SECURE: booleanEnv.default(false),
  AUTH_COOKIE_DOMAIN: optionalEnvString.refine(
    (value) => !value || /^[a-z\d.-]+$/i.test(value),
    "AUTH_COOKIE_DOMAIN must be a hostname without a protocol or path",
  ),
  TRUST_PROXY: booleanEnv.default(false),
});

export type BackendEnv = z.infer<typeof envSchema> & {
  ADMIN_FRONTEND_ORIGIN_LIST: string[];
};

export const parseBackendEnv = (input: NodeJS.ProcessEnv): BackendEnv => {
  const parsed = envSchema.safeParse(input);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  let originList: string[];
  try {
    originList = parseOriginList(parsed.data.ADMIN_FRONTEND_ORIGINS);
  } catch (error) {
    throw new Error(
      `Invalid environment configuration: ADMIN_FRONTEND_ORIGINS: ${
        error instanceof Error ? error.message : "invalid origin list"
      }`,
    );
  }

  if (
    parsed.data.NODE_ENV === "production" &&
    !parsed.data.AUTH_COOKIE_SECURE
  ) {
    throw new Error(
      "Invalid environment configuration: AUTH_COOKIE_SECURE must be true in production",
    );
  }

  if (parsed.data.AUTH_COOKIE_SAME_SITE === "none" && !parsed.data.AUTH_COOKIE_SECURE) {
    throw new Error(
      "Invalid environment configuration: AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAME_SITE is none",
    );
  }

  const revalidationPair = [
    parsed.data.FRONTEND_REVALIDATE_URL,
    parsed.data.FRONTEND_REVALIDATE_SECRET,
  ];
  if (revalidationPair.some(Boolean) && revalidationPair.some((value) => !value)) {
    throw new Error(
      "Invalid environment configuration: FRONTEND_REVALIDATE_URL and FRONTEND_REVALIDATE_SECRET must be configured together",
    );
  }

  return { ...parsed.data, ADMIN_FRONTEND_ORIGIN_LIST: originList };
};

export const env = parseBackendEnv(process.env);
export const isProduction = env.NODE_ENV === "production";
