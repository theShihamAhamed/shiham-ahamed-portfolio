import { z } from "zod";

const requiredTrimmedStringSchema = (message: string) =>
  z.string().trim().min(1, message);

const urlSchema = (message: string) =>
  z.string().trim().url(message);

const heroSchema = z
  .object({
    badge: requiredTrimmedStringSchema("Hero badge is required"),
    title: requiredTrimmedStringSchema("Hero title is required"),
    highlightedPhrase: requiredTrimmedStringSchema(
      "Hero highlighted phrase is required",
    ),
    description: requiredTrimmedStringSchema("Hero description is required"),
  })
  .strict();

const educationSchema = z
  .object({
    institution: requiredTrimmedStringSchema("Education institution is required"),
    degree: requiredTrimmedStringSchema("Education degree is required"),
    specialization: requiredTrimmedStringSchema(
      "Education specialization is required",
    ),
    expectedGraduation: requiredTrimmedStringSchema(
      "Expected graduation is required",
    ),
  })
  .strict();

export const updateSiteSettingsSchema = z
  .object({
    name: requiredTrimmedStringSchema("Name is required"),
    targetRole: requiredTrimmedStringSchema("Target role is required"),
    email: z.string().trim().email("Email must be valid"),
    githubUrl: urlSchema("GitHub URL must be valid"),
    linkedinUrl: urlSchema("LinkedIn URL must be valid"),
    resumeUrl: urlSchema("Resume URL must be valid"),
    hero: heroSchema,
    education: educationSchema,
  })
  .strict();

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
