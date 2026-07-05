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
