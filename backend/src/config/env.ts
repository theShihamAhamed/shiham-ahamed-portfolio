import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const optionalEnvString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGO_URI: z.string().trim().min(1, "MONGO_URI is required"),
  CLIENT_ORIGIN: z
    .string()
    .trim()
    .min(1, "CLIENT_ORIGIN is required")
    .default("http://localhost:3000"),
  ADMIN_EMAIL: z
    .string()
    .trim()
    .email("ADMIN_EMAIL must be a valid email address"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .trim()
    .min(1, "ADMIN_PASSWORD_HASH is required"),
  JWT_ACCESS_SECRET: z
    .string()
    .trim()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .trim()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().trim().min(1).default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().trim().min(1).default("7d"),
  IMAGEKIT_PUBLIC_KEY: z
    .string()
    .trim()
    .min(1, "IMAGEKIT_PUBLIC_KEY is required"),
  IMAGEKIT_PRIVATE_KEY: z
    .string()
    .trim()
    .min(1, "IMAGEKIT_PRIVATE_KEY is required"),
  IMAGEKIT_URL_ENDPOINT: z
    .string()
    .trim()
    .url("IMAGEKIT_URL_ENDPOINT must be a valid URL"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(8),
  FRONTEND_REVALIDATE_URL: optionalEnvString,
  FRONTEND_REVALIDATE_SECRET: optionalEnvString,
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");

  throw new Error(`Invalid environment configuration: ${message}`);
}

export const env = parsedEnv.data;
export const isProduction = env.NODE_ENV === "production";
