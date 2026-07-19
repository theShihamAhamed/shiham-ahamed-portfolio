import { z } from "zod";

import {
  projectMonthSchema,
  projectStatusSchema,
  projectTypeSchema,
} from "./api-schemas";
import { compareProjectMonths, isProjectMonth } from "./projects/project-dates";
import {
  projectArchitecturePointsSchema,
  projectArchitectureSummaryTextSchema,
  projectHighlightsSchema,
  projectOverviewSchema,
  projectShortDescriptionSchema,
} from "./projects/project-content";
import { projectTechnologySchema } from "./technologies/technology-schemas";
import { caseStudyMdxSchema } from "./case-study";

const emptyToUndefined = (value: unknown) => typeof value === "string" && value.trim().length === 0 ? undefined : value;
const required = (message: string) => z.string().trim().min(1, message);
const isHttpUrl = (value: string) => { try { const url = new URL(value); return url.protocol === "http:" || url.protocol === "https:"; } catch { return false; } };
const validYouTubeId = (value: string | null | undefined) => { const candidate = value?.trim().split(/[?&#]/)[0]; return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : undefined; };
const isYouTubeUrl = (value: string) => { try { const url = new URL(value); const host = url.hostname.toLowerCase(); const parts = url.pathname.split("/").filter(Boolean); if (url.protocol !== "http:" && url.protocol !== "https:") return false; if (host === "youtu.be") return Boolean(validYouTubeId(parts[0])); if (!["youtube.com", "www.youtube.com", "m.youtube.com"].includes(host)) return false; if (parts[0] === "watch") return Boolean(validYouTubeId(url.searchParams.get("v"))); if (parts[0] === "embed" || parts[0] === "shorts") return Boolean(validYouTubeId(parts[1])); return false; } catch { return false; } };
const optionalString = z.preprocess(emptyToUndefined, z.string().trim().min(1).optional());
const optionalHttpUrl = z.preprocess(emptyToUndefined, z.string().trim().url("Enter a valid URL.").refine(isHttpUrl, "Use an http or https URL.").optional());
const optionalYouTubeUrl = z.preprocess(emptyToUndefined, z.string().trim().url("Enter a valid YouTube URL.").refine(isHttpUrl, "Use an http or https URL.").refine(isYouTubeUrl, "Use a YouTube watch, share, shorts, or embed URL.").optional());
const clearableHttpUrl = z.string().trim().refine((value) => !value || isHttpUrl(value), "Use an http or https URL.");
const clearableYouTubeUrl = z.string().trim().refine((value) => !value || isHttpUrl(value), "Use an http or https URL.").refine((value) => !value || isYouTubeUrl(value), "Use a YouTube watch, share, shorts, or embed URL.");
const optionalProjectMonth = z.preprocess(
  emptyToUndefined,
  projectMonthSchema.optional(),
);
const clearableProjectMonth = z
  .string()
  .trim()
  .refine((value) => !value || isProjectMonth(value), "Use YYYY-MM format.");
const stringList = z.array(z.string()).transform((items) => items.map((item) => item.trim()).filter(Boolean));

export const imageAssetSchema = z.object({ url: z.string().url(), fileId: z.string().min(1), alt: z.string().trim().min(1), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), name: z.string().trim().min(1).optional() });
export const projectTechStackItemSchema = projectTechnologySchema;

export const createProjectFormSchema = z.object({
  title: required("Title is required."), slug: z.preprocess(emptyToUndefined, z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case.").optional()),
  shortDescription: projectShortDescriptionSchema, projectType: projectTypeSchema, status: projectStatusSchema,
  startDate: projectMonthSchema, endDate: optionalProjectMonth,
  videoUrl: optionalYouTubeUrl, videoPosterUrl: optionalHttpUrl, thumbnail: imageAssetSchema.optional().refine(Boolean, { message: "Thumbnail image is required." }),
  caseStudyMdx: caseStudyMdxSchema.default(""),
  gallery: z.array(imageAssetSchema).min(1, "At least one gallery image is required."), architecture: z.object({ image: imageAssetSchema.optional(), summary: z.preprocess(emptyToUndefined, projectArchitectureSummaryTextSchema.optional()), points: projectArchitecturePointsSchema }),
  links: z.object({ github: optionalHttpUrl, liveDemo: optionalHttpUrl, article: optionalHttpUrl }), techStack: z.array(projectTechStackItemSchema).min(1, "At least one tech stack item is required."),
  overview: projectOverviewSchema, highlights: projectHighlightsSchema, challenges: stringList, futureImprovements: stringList,
  isFeatured: z.boolean(), isVisible: z.boolean(),
}).superRefine((value, context) => {
  if (value.status === "completed" && !value.endDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date is required for completed projects." });
  }

  if (
    isProjectMonth(value.startDate) &&
    isProjectMonth(value.endDate) &&
    compareProjectMonths(value.endDate, value.startDate) < 0
  ) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be earlier than start date." });
  }
});

export const updateProjectFormSchema = z.object({
  title: required("Title is required."), slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case."),
  shortDescription: projectShortDescriptionSchema, projectType: projectTypeSchema, status: projectStatusSchema,
  startDate: projectMonthSchema, endDate: clearableProjectMonth, videoUrl: clearableYouTubeUrl, videoPosterUrl: clearableHttpUrl,
  caseStudyMdx: caseStudyMdxSchema.default(""),
  links: z.object({ github: clearableHttpUrl, liveDemo: clearableHttpUrl, article: clearableHttpUrl }), techStack: z.array(projectTechStackItemSchema).min(1, "At least one tech stack item is required."),
  overview: projectOverviewSchema, highlights: projectHighlightsSchema, architecture: z.object({ summary: projectArchitectureSummaryTextSchema, points: projectArchitecturePointsSchema }), challenges: stringList, futureImprovements: stringList,
}).superRefine((value, context) => {
  if (value.status === "completed" && !value.endDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date is required for completed projects." });
  }

  if (
    isProjectMonth(value.startDate) &&
    isProjectMonth(value.endDate) &&
    compareProjectMonths(value.endDate, value.startDate) < 0
  ) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date cannot be earlier than start date." });
  }
});

const clearableUrl = z.string().trim().refine((value) => { if (!value) return true; try { new URL(value); return true; } catch { return false; } }, "Enter a valid URL.");
const clearableDate = z.string().trim().refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), { message: "Use YYYY-MM-DD format." });
const uploadedImageSchema = z.object({ url: z.string().trim().url("Image URL must be valid."), fileId: required("Uploaded image fileId is required."), alt: required("Image alt text is required."), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), name: z.string().trim().optional() });
const certificationBase = z.object({ title: required("Title is required."), provider: required("Provider is required."), note: required("Note is required."), verifyUrl: clearableUrl, credentialId: z.string().trim(), date: clearableDate, skills: stringList });
export const createCertificationFormSchema = certificationBase.extend({ image: uploadedImageSchema.optional().superRefine((value, context) => { if (!value) context.addIssue({ code: "custom", message: "Certification image is required." }); }), isVisible: z.boolean() });
export const updateCertificationFormSchema = certificationBase;

const clearableYear = z.string().trim().refine((value) => !value || /^\d{4}$/.test(value), { message: "Year must be a four-digit string." });
const achievementBase = z.object({ title: required("Title is required."), note: required("Note is required."), event: z.string().trim(), result: z.string().trim(), date: clearableDate, year: clearableYear, icon: z.string().trim() });
export const createAchievementFormSchema = achievementBase.extend({ isVisible: z.boolean() });
export const updateAchievementFormSchema = achievementBase;

const currentlyBuildingBase = z.object({
  title: required("Title is required."),
  description: required("Description is required."),
  currentFocus: z.string().trim().default(""),
  techStack: stringList.default([]),
  highlights: stringList.default([]),
  link: clearableUrl.default(""),
});
export const createCurrentlyBuildingFormSchema = currentlyBuildingBase.extend({ isVisible: z.boolean() });
export const updateCurrentlyBuildingFormSchema = currentlyBuildingBase;

const formHeroSchema = z.object({ badge: required("Hero badge is required."), title: required("Hero title is required."), highlightedPhrase: required("Highlighted phrase is required."), description: required("Hero description is required.") });
const formEducationSchema = z.object({ institution: required("Institution is required."), degree: required("Degree is required."), specialization: required("Specialization is required."), expectedGraduation: required("Expected graduation is required.") });
export const siteSettingsFormSchema = z.object({ name: required("Name is required."), targetRole: required("Target role is required."), email: z.string().trim().email("Enter a valid email address."), githubUrl: z.string().trim().url("Enter a valid GitHub URL."), linkedinUrl: z.string().trim().url("Enter a valid LinkedIn URL."), resumeUrl: z.string().trim().url("Enter a valid resume URL."), hero: formHeroSchema, education: formEducationSchema });

export type CreateProjectFormValues = z.input<typeof createProjectFormSchema>;
export type ParsedCreateProjectFormValues = z.output<typeof createProjectFormSchema>;
export type UpdateProjectFormValues = z.input<typeof updateProjectFormSchema>;
export type ParsedUpdateProjectFormValues = z.output<typeof updateProjectFormSchema>;
export type CreateCertificationFormValues = z.input<typeof createCertificationFormSchema>;
export type ParsedCreateCertificationFormValues = z.output<typeof createCertificationFormSchema>;
export type UpdateCertificationFormValues = z.input<typeof updateCertificationFormSchema>;
export type ParsedUpdateCertificationFormValues = z.output<typeof updateCertificationFormSchema>;
export type CreateAchievementFormValues = z.input<typeof createAchievementFormSchema>;
export type ParsedCreateAchievementFormValues = z.output<typeof createAchievementFormSchema>;
export type UpdateAchievementFormValues = z.input<typeof updateAchievementFormSchema>;
export type ParsedUpdateAchievementFormValues = z.output<typeof updateAchievementFormSchema>;
export type CreateCurrentlyBuildingFormValues = z.input<typeof createCurrentlyBuildingFormSchema>;
export type ParsedCreateCurrentlyBuildingFormValues = z.output<typeof createCurrentlyBuildingFormSchema>;
export type UpdateCurrentlyBuildingFormValues = z.input<typeof updateCurrentlyBuildingFormSchema>;
export type ParsedUpdateCurrentlyBuildingFormValues = z.output<typeof updateCurrentlyBuildingFormSchema>;
export type SiteSettingsFormValues = z.input<typeof siteSettingsFormSchema>;
export type ParsedSiteSettingsFormValues = z.output<typeof siteSettingsFormSchema>;
