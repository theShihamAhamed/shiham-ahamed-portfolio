import { z } from "zod";

const requiredTrimmedString = (message: string) =>
  z.string().trim().min(1, message);

const urlString = (message: string) => z.string().trim().url(message);

const heroSchema = z.object({
  badge: requiredTrimmedString("Hero badge is required."),
  title: requiredTrimmedString("Hero title is required."),
  highlightedPhrase: requiredTrimmedString("Highlighted phrase is required."),
  description: requiredTrimmedString("Hero description is required."),
});

const educationSchema = z.object({
  institution: requiredTrimmedString("Institution is required."),
  degree: requiredTrimmedString("Degree is required."),
  specialization: requiredTrimmedString("Specialization is required."),
  expectedGraduation: requiredTrimmedString("Expected graduation is required."),
});

export const siteSettingsFormSchema = z.object({
  name: requiredTrimmedString("Name is required."),
  targetRole: requiredTrimmedString("Target role is required."),
  email: z.string().trim().email("Enter a valid email address."),
  githubUrl: urlString("Enter a valid GitHub URL."),
  linkedinUrl: urlString("Enter a valid LinkedIn URL."),
  resumeUrl: urlString("Enter a valid resume URL."),
  hero: heroSchema,
  education: educationSchema,
});

export type SiteSettingsFormValues = z.input<typeof siteSettingsFormSchema>;
export type ParsedSiteSettingsFormValues = z.output<
  typeof siteSettingsFormSchema
>;
