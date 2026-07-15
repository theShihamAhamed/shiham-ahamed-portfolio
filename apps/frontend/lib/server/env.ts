import "server-only";

import { z } from "zod";

const optionalEnvString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const envSchema = z.object({
  MONGO_URI: optionalEnvString,
  RESEND_API_KEY: optionalEnvString,
  CONTACT_TO_EMAIL: optionalEnvString,
  CONTACT_FROM_EMAIL: optionalEnvString,
  REVALIDATE_SECRET: optionalEnvString,
  NEXT_PUBLIC_SITE_URL: optionalEnvString,
  VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error("Invalid frontend server environment configuration.");
}

export const serverEnv = parsedEnv.data;

export const getMongoUri = () => {
  if (!serverEnv.MONGO_URI) {
    throw new Error("MONGO_URI is required for frontend server data access.");
  }

  return serverEnv.MONGO_URI;
};

export const getContactEmailConfig = () => {
  if (
    !serverEnv.RESEND_API_KEY ||
    !serverEnv.CONTACT_TO_EMAIL ||
    !serverEnv.CONTACT_FROM_EMAIL
  ) {
    throw new Error("Contact email configuration is incomplete.");
  }

  return {
    resendApiKey: serverEnv.RESEND_API_KEY,
    toEmail: serverEnv.CONTACT_TO_EMAIL,
    fromEmail: serverEnv.CONTACT_FROM_EMAIL,
  };
};

export const getRevalidateSecret = () => {
  if (!serverEnv.REVALIDATE_SECRET) {
    throw new Error("REVALIDATE_SECRET is required for cache revalidation.");
  }

  return serverEnv.REVALIDATE_SECRET;
};

export const getPublicSiteUrl = () => {
  const configuredUrl = serverEnv.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    if (serverEnv.VERCEL_ENV === "production") {
      throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
    }

    return new URL("http://localhost:3000");
  }

  const url = new URL(configuredUrl);

  if (
    (serverEnv.VERCEL_ENV === "production" && url.protocol !== "https:") ||
    (url.protocol !== "http:" && url.protocol !== "https:")
  ) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https.");
  }

  url.pathname = url.pathname.replace(/\/+$/, "");
  url.search = "";
  url.hash = "";

  return url;
};
